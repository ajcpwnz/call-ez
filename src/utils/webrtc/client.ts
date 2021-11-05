import { EvtMessage, FeedPublisher, Janus, JSEP, Message, PluginHandle, SubscriptionHandle } from 'janus-gateway'
import { action, ActionTypes, dispatch } from '../stub/dispatch'
import { single } from '../singleton'
import { attachVideo, detachVideo, initialize } from '../../features/streaming/client'
import { store } from '../../store'
import { iceServers } from '../consts'
import { noop } from '../flow'

export class WebRTCClient {
  public client: Janus
  public videoroom?: PluginHandle
  public roomId: number
  public opaqueId: string
  public initialized: boolean = false
  public ready: boolean = false
  private subscriptions: Record<string, SubscriptionHandle> = {}
  public username: string = 'Alex'

  private privateId?: number

  constructor(server: string) {
    this.roomId = 4321
    this.opaqueId = 'ckvlch20g00003c5gr2c42pfd'//cuid()

    Janus.init({
      debug: !!process.env.JANUS_DEBUG,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      dependencies: Janus.useDefaultDependencies(),
      callback: function () {
        Janus.debug('Janus initialized')
      }
    })

    this.client = new Janus({
      server,
      iceServers,
      success: () => {
        this.ready = true
        store.dispatch(initialize())
      },
      error: this.onError,
      destroyed: () => {
        dispatch(action(ActionTypes.JANUS_DESTROYED))()
      }
    })
  }

  connect = () => {
    if (!this.ready) return

    this.connectLocal()
    this.initialized = true
  }

  private connectLocal = () => {
    const { opaqueId } = this

    this.client.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId,
      success: (videoroom) => {
        this.videoroom = videoroom
        this.attemptJoin()
      },
      error: this.onError,
      consentDialog: (on) => {/*TODO*/
      },
      onmessage: this.onLocalMessage,
      onlocalstream: (stream) => {
        Janus.attachMediaStream(document.querySelector('#localvideo')!, stream)
        setTimeout(() => store.dispatch(attachVideo('local')), 600)
      },
      onremotestream: (stream) => {
        Janus.debug(' ::: Got a remote stream :::', stream)
        Janus.attachMediaStream(document.querySelector('#remotevideo')!, stream)
        setTimeout(() => store.dispatch(attachVideo('remote')), 600)
      },
      webrtcState: (on) => {
        Janus.log('Janus says our WebRTC PeerConnection is ' + (on ? 'up' : 'down') + ' now')
        // this.videoroom!.send({ message: { request: "configure", bitrate: 300 }})
      },
    })
  }

  private subscribeToRemote = () => {
    const { opaqueId } = this

    this.client.attach({
      plugin: 'janus.plugin.videoroom',
      opaqueId,
      success: (videoroom) => {
        this.videoroom = videoroom
        this.attemptJoin()
      },
      error: this.onError,
      consentDialog: (on) => {/*TODO*/},
      onmessage: this.onLocalMessage,
      onlocalstream: (stream) => {
        Janus.attachMediaStream(document.querySelector('#localvideo')!, stream)
      },
      onremotestream: (stream) => {
        Janus.debug(' ::: Got a remote stream :::', stream)
        Janus.attachMediaStream(document.querySelector('#remotevideo')!, stream)
        console.warn('.', stream.getVideoTracks())
      },
      webrtcState: this.onState('rtc'),
      iceState: this.onState('ice'),
    })
  }

  private attemptJoin = () => {
    this.videoroom!.send({
      message: {
        request: 'exists',
        room: this.roomId,
      },
      success: (result: any) => {
        if (result.exists) {
          this.joinRoom()
        } else {
          this.createRoom()
        }
      }
    })
  }

  private joinRoom = () => {
    this.videoroom!.send({
      message: {
        request: 'join',
        ptype: 'publisher',
        room: this.roomId,
        display: this.username
      }
    })
    console.warn('aaa')
  }

  private createRoom = () => {
    this.videoroom!.send({
      message: {
        request: 'create',
        room: this.roomId,
        fir_freq: 10,
        publishers: 4,
      },
      success: (result: any) => {
        Janus.debug(`Event: ${result.videoroom}`)
        if (result.videoroom) {
          this.joinRoom()
        }
      },
    })
  }

  private attemptPublish = () => {
    this.videoroom!.createOffer(
      {
        media: { audioRecv: false, videoRecv: false, audioSend: true, videoSend: true },
        success: (jsep: any) => {
          this.videoroom!.send({
            message: { request: 'configure', audio: true, video: false },
            jsep: jsep
          })
        },
        error: this.onError
      })
  }

  private connectPublishers = (msg: { publishers?: FeedPublisher[] }) => {
    msg.publishers?.forEach(publisher => {
      publisher.id = `${publisher.id}`

      this.attemptSubscribe(publisher)
    })
  }

  private attemptSubscribe = (publisher: FeedPublisher) => {
    const { opaqueId, roomId, privateId } = this
    let { id, video_codec } = publisher

    const subscribeRequest = {
      request: 'join',
      room: roomId,
      ptype: 'subscriber',
      feed: Number(id),
      private_id: privateId,
      offer_video: true,
    }

    this.client.attach(
      {
        plugin: 'janus.plugin.videoroom',
        opaqueId,
        success: (feed: SubscriptionHandle) => {
          Janus.log(`Subscribed to plugin ${feed.getPlugin()}, publisher ${feed.getId()}`)

          if (
            Janus.webRTCAdapter.browserDetails.browser === 'safari'
            && (video_codec === 'vp9' || (video_codec === 'vp8' && !Janus.safariVp8))
          ) {
            if (video_codec) video_codec = video_codec.toUpperCase()
            console.warn(`Remote is posting ${video_codec} but we can't play it, disabling video`)
            subscribeRequest.offer_video = false
          }

          feed.videoCodec = video_codec

          feed.send({ message: subscribeRequest })

          this.subscriptions[publisher.id] = feed
        },
        error: this.onError,
        onmessage: this.onRemoteMessage(publisher.id),
        iceState: this.onState('ice', publisher.id),
        webrtcState: this.onState('rtc', publisher.id),
        onlocalstream: noop,
        onremotestream: function (stream) {
          console.warn('aaaaa')
          Janus.attachMediaStream(document.querySelector('#remotevideo')!, stream)
          setTimeout(() => store.dispatch(attachVideo('remote')), 600)
          var videoTracks = stream.getVideoTracks();

          if (!videoTracks || videoTracks.length === 0) {
            // TODO: Handle cases when there is no video;
          }
        },
        oncleanup: () => {
          setTimeout(() => store.dispatch(detachVideo('remote')), 600)
          this.subscriptions = Object.entries(this.subscriptions)
            .reduce<Record<string, SubscriptionHandle>>((obj, [key, feed]) => {
              if (key !== publisher.id) {
                obj[key] = feed
              }

              return obj
            }, {})
        }
      })
  }

  private onLocalMessage = (msg: any, jsep: any) => {
    console.warn(msg)
    const event = msg.videoroom

    if (event === 'joined') {
      this.privateId = msg.private_id
      this.attemptPublish()
    } else if (event === 'event') {

    }
    if (msg.error) {
      console.error(msg)
    }

    if (msg.publishers) {
      this.connectPublishers(msg)
    }

    if (jsep) {
      this.videoroom!.handleRemoteJsep({ jsep })
    }
  }

  private onRemoteMessage = (publisherId: string) => (msg: EvtMessage, jsep?: JSEP) => {
    const feed = this.subscriptions[publisherId];

    if (!feed) {
      console.error(`Looking for nonexistent feed, ${publisherId}`)
      return
    }
    const event = msg.videoroom

    console.warn(msg, feed)

    if (msg.error) {
      this.onError(msg.error)
      return
    }

    if (event) {
      if (event === 'attached') {
        feed.rfid = msg.id
        feed.rfdisplay = msg.display

        Janus.log(`Attached feed ${feed.rfid} (${feed.rfdisplay}) in ${this.roomId}`)
      } else if (event === 'event') {
        // TODO: handle remote simulcast
      }
    }

    if (jsep) {
      var stereo = (jsep.sdp.indexOf('stereo=1') !== -1);

      feed.createAnswer(
        {
          jsep: jsep,
          media: { audioSend: false, videoSend: false },
          customizeSdp: (jsep: JSEP) => {
            if (stereo && jsep.sdp.indexOf('stereo=1') == -1) {
              jsep.sdp = jsep.sdp.replace('useinbandfec=1', 'useinbandfec=1;stereo=1')
            }
          },
          success: (jsep: JSEP) => {
            Janus.debug('Got SDP!', jsep)
            var body = { request: 'start', room: this.roomId }
            feed.send({ message: body, jsep: jsep })
          },
          error: this.onError
        })
    }
  }

  private onError = (error: any) => {
    console.error(error)
  }

  private onState = (kind: 'ice' | 'rtc', id?: string) => (state: any) => {
    console.warn(`${kind} state${id ? ` of ${id} ` : ' '}is now ${typeof state === 'string' ? state : state ? 'up' : 'down'}`)
  }
}

export const streamingClient = single<WebRTCClient>(
  () => new WebRTCClient(process.env.WEBRTC_SERVER)
)
