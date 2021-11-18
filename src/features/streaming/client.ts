import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface StreamingClientState {
  initialized: boolean
  connected: boolean
  sources: {
    local: { hasVideo: boolean },
    // simple reactivity for videos;
    remote: Record<string, { key: string, simulcastEnabled: boolean }>,
  }
}

const initialState: StreamingClientState = {
  initialized: false,
  connected: false,
  sources: {
    local: { hasVideo: false },
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
    attachLocal: (state) => {
      state.sources.local.hasVideo = true
    },
    attachRemote: (state, action: PayloadAction<string>) => {
      state.sources.remote[action.payload] = { key: action.payload, simulcastEnabled: false }
    },
    detachRemote: (state, action: PayloadAction<string>) => {
      const ret =  Object.entries(state.sources.remote).reduce<Record<string, { key: string, simulcastEnabled: boolean }>>((obj, [key, value]) => {
        if(key !== action.payload) {
          obj[key] = value
        }
        return obj;
      }, {})

      state.sources.remote = ret;
    },
    toggleSimulcast: (state, action: PayloadAction<{id: string, value: boolean}>) => {
      state.sources.remote[action.payload.id].simulcastEnabled =  action.payload.value;
    },
    detachVideo: (state, action: PayloadAction<'local' | 'remote'>) => {
      state.sources[action.payload].hasVideo = false
    }
  },
})

// Action creators are generated for each case reducer function
export const { initialize, connect, attachLocal, attachRemote, detachVideo, detachRemote, toggleSimulcast } = streamingClientSlice.actions

export default streamingClientSlice.reducer
