import React, { useEffect } from 'react'
import styled from 'styled-components'
import { streamingClient } from './utils/webrtc/client';
import { Video } from './features/streaming/Video'
import { colors } from './utils/colors'

const Outer = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: ${colors.main};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

function App() {
  useEffect(() => {
    console.warn(streamingClient)
  }, [])
  return (
    <Outer>
        <div style={{display: 'flex', justifyContent: 'center', flexGrow: 1}}><Video source="local"/></div>
        <div style={{display: 'flex', justifyContent: 'center', flexGrow: 1}}><Video source="remote"/></div>
    </Outer>
  )
}

export default App
