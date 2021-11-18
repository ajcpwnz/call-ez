import { EvtMessage, FeedPublisher, Janus, JSEP, Message, PluginHandle, SubscriptionHandle } from 'janus-gateway'
import { action, ActionTypes, dispatch } from '../stub/dispatch'
import { single } from '../singleton'
import { attachLocal, attachRemote, connect, detachRemote, detachVideo, initialize } from '../../features/streaming/client'
import { store } from '../../store'
import { iceServers } from '../consts'
import { noop } from '../flow'
import { Feed } from './feed'
import cuid from 'cuid'

export class WebRTCClient {
  public id: string;
  public client: Janus
  public videoroom?: PluginHandle
  public roomId: number
  public opaqueId: string
  public initialized: boolean = false
  public ready: boolean = false
  public subscriptions: Record<string, SubscriptionHandle> = {}
  public feeds: Record<string, Feed> = {};

  public username: string = 'default'

  private privateId?: number

  constructor(server: string) {
    this.roomId = 4321
    this.id = cuid();
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

  connect = (username: string) => {
    if (!this.ready) return
    this.username = username;
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
        setTimeout(() => store.dispatch(attachLocal()), 600)
      },
      onremotestream: noop,
      webrtcState: (on) => {
        Janus.log('Janus says our WebRTC PeerConnection is ' + (on ? 'up' : 'down') + ' now')
        // this.videoroom!.send({ message: { request: "configure", bitrate: 300 }})
      },
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
    });

    store.dispatch(connect())
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
        simulcast: true,
        simulcast1: true,
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
        onremotestream: (stream) => {
          const feed = new Feed(stream, publisher.id);
          this.feeds[feed.key] = feed;
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
      if(msg.unpublished) {
        store.dispatch(detachRemote(`${msg.unpublished}`))
      }
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

  private onRemoteMessage = (publisherId: string) => (msg: any, jsep?: JSEP) => {
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
        let {substream, temporal} = msg;
        if((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
          this.feeds[publisherId].simulcastEnabled = true;
        }
        if(msg.unpublished) {
          store.dispatch(detachRemote(`${msg.unpublished}`))
        }
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
// @ts-ignore
window.sc = streamingClient;
