import { streamingClient } from './client'

export const useStreamingClient = () => {
  if (!streamingClient.initialized) {
    streamingClient.connect()
  }

  return streamingClient
}
