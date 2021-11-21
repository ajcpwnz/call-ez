import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface RemoteFeedState {
  key: string,
  simulcastEnabled: boolean,
  displayHandle: string
}

export interface StreamingClientState {
  initialized: boolean
  connected: boolean
  sources: {
    local: { hasVideo: boolean, muted: boolean, cameraEnabled: boolean },
    // simple reactivity for videos;
    remote: Record<string, RemoteFeedState>,
  }
}

const initialState: StreamingClientState = {
  initialized: false,
  connected: false,
  sources: {
    local: { hasVideo: false, muted: false, cameraEnabled: true },
    remote: {},
  }
}

export const streamingClientSlice = createSlice({
  name: 'streamingClient',
  initialState,
  reducers: {
    initialize: (state) => {
      state.initialized = true
    },
    connect: (state) => {
      state.connected = true
    },
    disconnect: (state) => {
      state.connected = false
    },
    attachLocal: (state) => {
      state.sources.local.hasVideo = true
    },
    attachRemote: (state, action: PayloadAction<{ key: string, state: RemoteFeedState }>) => {
      state.sources.remote[action.payload.key] = action.payload.state
    },
    updateRemote: (state, action: PayloadAction<{ key: string, newState: RemoteFeedState }>) => {
      state.sources.remote[action.payload.key] = action.payload.newState
    },
    detachRemote: (state, action: PayloadAction<string>) => {
      const ret = Object.entries(state.sources.remote).reduce<Record<string, RemoteFeedState>>((obj, [key, value]) => {
        if (key !== action.payload) {
          obj[key] = value
        }
        return obj
      }, {})

      state.sources.remote = ret
    },
    toggleSimulcast: (state, action: PayloadAction<{ id: string, value: boolean }>) => {
      state.sources.remote[action.payload.id].simulcastEnabled = action.payload.value
    },
    toggleLocalMute: (state, action: PayloadAction<boolean>) => {
      state.sources.local.muted = action.payload
    },
    toggleLocalVideo: (state, action: PayloadAction<boolean>) => {
      state.sources.local.cameraEnabled = action.payload
    },
    detachVideo: (state, action: PayloadAction<'local' | 'remote'>) => {
      state.sources[action.payload].hasVideo = false
    }
  },
})

// Action creators are generated for each case reducer function
export const {
  initialize,
  connect,
  disconnect,
  attachLocal,
  attachRemote,
  updateRemote,
  detachVideo,
  detachRemote,
  toggleLocalMute,
  toggleLocalVideo,
  toggleSimulcast
} = streamingClientSlice.actions

export default streamingClientSlice.reducer
