import { Janus, SubscriptionHandle } from 'janus-gateway'
import { store } from '../../store'
import { attachRemote, detachRemote, toggleSimulcast, updateRemote } from '../../features/streaming/client'
import { streamingClient } from './client'

export class Feed {
  key: string
  stream: MediaStream
  handle: SubscriptionHandle
  displayHandle: string = '';

  private isSimulcastEnabled = false

  constructor(stream: MediaStream, id: string) {
    Janus.debug(' ::: Got a remote stream :::', stream)
    this.key = id
    this.stream = stream
    this.handle = streamingClient.subscriptions[id]

    store.dispatch(attachRemote({ key: this.key, state: this.getState() }))
  }

  set simulcastEnabled(bool: boolean) {
    this.isSimulcastEnabled = bool
    store.dispatch(toggleSimulcast({ id: this.key, value: bool }))
  }

  get simulcastEnabled() {
    return this.isSimulcastEnabled
  }

  public display = (ref: HTMLVideoElement) => {
    Janus.attachMediaStream(ref, this.stream)
    var videoTracks = this.stream.getVideoTracks()
    if (!videoTracks || videoTracks.length === 0) {
      // TODO: Handle cases when there is no video;
    }
  }

  public detach = () => {
    this.handle.detach()
    store.dispatch(detachRemote(`${this.key}`))
  }

  public configure = (type: 'substream' | 'temporal', value: number) => {
    this.handle.send({ message: { request: 'configure', [type]: value } })
  }

  public setDisplay = (display: string) => {
    this.displayHandle = display

    this.update()
  }

  private getState = () => ({
    key: this.key,
    simulcastEnabled: this.isSimulcastEnabled,
    displayHandle: this.displayHandle,
  })

  private update = () => {
    store.dispatch(updateRemote({
      key: `${this.key}`,
      newState: this.getState()
    }))
  }
}
