import React from 'react'
import styled from 'styled-components'
import { useSelector } from 'react-redux'
import { colors } from './utils/colors'
import { RootState } from './store'
import { Text, TextVariants } from './shared/Text'
import { Join } from './features/streaming/Join'
import { Feeds } from './features/streaming/Feeds'

const Outer = styled.div`
  width: 100vw;
  height: 100vh;
  padding: 1rem;
  background-color: ${colors.main};
  display: flex;
  align-items: center;
  justify-content: center;
`

function App() {
  const { initialized, connected } = useSelector((state: RootState) => ({
    initialized: state.streamingClient.initialized,
    connected: state.streamingClient.connected,
  }));

  return (
    <Outer>
      {
        initialized
          ? connected
            ? <Feeds />
            : <Join />
          : <div>
            <Text>Loading</Text>
          </div>
      }
    </Outer>
  )
}

export default App
