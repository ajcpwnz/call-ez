import { Janus, SubscriptionHandle } from 'janus-gateway'
import { store } from '../../store'
import { attachRemote, toggleSimulcast } from '../../features/streaming/client'
import { streamingClient } from './client'

export class Feed {
  key: string
  stream: MediaStream
  handle: SubscriptionHandle

  private isSimulcastEnabled = false

  constructor(stream: MediaStream, id: string) {
    Janus.debug(' ::: Got a remote stream :::', stream)
    this.key = id
    this.stream = stream;
    this.handle = streamingClient.subscriptions[id];

    store.dispatch(attachRemote(this.key))
  }

  set simulcastEnabled(bool: boolean) {
    this.isSimulcastEnabled = bool;
    store.dispatch(toggleSimulcast({id: this.key, value: bool}))
  }

  get simulcastEnabled() {
    return this.isSimulcastEnabled
  }

  public display = (ref: HTMLVideoElement) => {
    Janus.attachMediaStream(ref, this.stream)
    var videoTracks = this.stream.getVideoTracks();
    console.warn(videoTracks, 'aaaa')
    if (!videoTracks || videoTracks.length === 0) {
      // TODO: Handle cases when there is no video;
    }
  }

  public configure = (type: 'substream' | 'temporal', value: number) => {
    this.handle.send({ message: { request: "configure", [type]: value }})
  }
}
