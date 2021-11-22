import { RemoteVideo } from './RemoteVideo'
import { Video } from './Video'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'
import { Text, TextVariants } from '../../shared/Text'
import styled from 'styled-components'
import { IconButton } from '../../shared/IconButton'
import { streamingClient } from '../../utils/webrtc/client'
import { useScreensize } from '../../utils/hooks/useScreensize'

const Outer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`


const LocalControls = () => {
  const muted = useSelector((state: RootState) => state.streamingClient.sources.local.muted)
  const cameraEnabled = useSelector((state: RootState) => state.streamingClient.sources.local.cameraEnabled)

  const toggleMute = useCallback(() => {
    streamingClient.toggleMute(muted)
  }, [muted])

  const toggleVideo = useCallback(() => {
    streamingClient.toggleVideo(cameraEnabled)
  }, [cameraEnabled])

  return <div className="flex flex-grow items-center justify-center my-4">
    <IconButton variant={!cameraEnabled ? 'light' : 'base'} i="camera" buttonProps={{ onClick: toggleVideo }}/>
    <IconButton variant={muted ? 'light' : 'base'} i="mic" buttonProps={{ onClick: toggleMute }}/>
    <IconButton variant="danger" i="close" buttonProps={{ onClick: streamingClient.disconnectLocal }}/>
  </div>
}

export const Feeds = () => {
  const feeds = useSelector((state: RootState) => {
    const f = Object.values(state.streamingClient.sources.remote)[0]

    return f ? [f,f,f,f,f] : []
  })

  const { width, height } = useScreensize()
  const bottomBar = useRef<HTMLDivElement>(null)

  const { cellWidth, cellHeight } = useMemo(() => {
    let cellWidth = 0
    let cellHeight = 0
    if (feeds.length) {
      const renderWidth = width
      const renderHeight = height - ((bottomBar.current?.clientHeight || 0) * 2)
      const rows = Math.ceil(feeds.length / 2)

      cellHeight = renderHeight / rows
      cellWidth = Math.min((cellHeight * 1.7777777777777777), renderWidth / 2)

    }
    return { cellWidth, cellHeight: cellHeight }

  }, [feeds, bottomBar, width, height])

  return <Outer>
    {feeds.length ? null : <>
      <Text variant={TextVariants.title}>Looks like no one else is here.</Text>
      <Text>Waiting for people to join.</Text>
    </>}
    <div className="flex flex-grow flex-row flex-wrap w-full items-start justify-center">
      {
        feeds.map((feed, idx) => (
          <div className="p-4" style={{ width: cellWidth, height: cellHeight }}>
            <RemoteVideo key={idx /*feed.key*/} lookup={feed.key} display={feed}/>
          </div>
        ))
      }
    </div>
    <div ref={bottomBar} className={`${!!feeds.length ? 'fix-bottom flex flex-row-reverse itemst-center justify-between' : 'flex flex-col justify-center items-center'}`}>
      <Video modest={!!feeds.length}/>
      <LocalControls/>
    </div>
  </Outer>
}
