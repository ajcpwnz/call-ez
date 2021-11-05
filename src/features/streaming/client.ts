import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface StreamingClientState {
  initialized: boolean
  sources: {
    local: { hasVideo: boolean },
    remote: { hasVideo: boolean },
  }
}

const initialState: StreamingClientState = {
  initialized: false,
  sources: {
    local: { hasVideo: false },
    remote: { hasVideo: false },
  }
}

export const streamingClientSlice = createSlice({
  name: 'streamingClient',
  initialState,
  reducers: {
    initialize: (state) => {
      state.initialized = true
    },
    attachVideo: (state, action: PayloadAction<'local' | 'remote'>) => {
      state.sources[action.payload].hasVideo = true
    },
    detachVideo: (state, action: PayloadAction<'local' | 'remote'>) => {
      state.sources[action.payload].hasVideo = false
    }
  },
})

// Action creators are generated for each case reducer function
export const { initialize, attachVideo, detachVideo } = streamingClientSlice.actions

export default streamingClientSlice.reducer
