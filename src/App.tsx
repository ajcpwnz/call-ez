import React from 'react'

import { useStreamingClient } from './utils/webrtc/hooks'
import './App.css'


function App() {
  const rts = useStreamingClient()

  return (
    <div className="App">
      <span>da</span>
    </div>
  )
}

export default App
