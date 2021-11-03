import { Janus } from 'janus-gateway'

export class WebRTCClient {
  public initialized: boolean

  public client: Janus

  constructor(server: string) {
    Janus.init({
      debug: !!process.env.JANUS_DEBUG,
      // eslint-disable-next-line react-hooks/rules-of-hooks
      dependencies: Janus.useDefaultDependencies(),
      callback: function () {
        Janus.debug('Janus initialized')
      }
    })
    this.client = new Janus({ server })

    this.initialized = false
  }

  connect() {
    this.initialized = true
  }
}


export const streamingClient = new WebRTCClient(process.env.WEBRTC_SERVER)
