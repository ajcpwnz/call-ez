import React, { FC, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import styled, { css } from 'styled-components'
import { colors } from '../../utils/colors'
import { RootState } from '../../store'
import { streamingClient } from '../../utils/webrtc/client'
import { Picker } from '../../shared/Picker'
import { RemoteFeedState } from './client'
import { Text } from '../../shared/Text'

const LargeText = styled.h2`
  color: ${colors.accent};
  font-size: 42px;
  max-width: 500px;
  text-align: center;
  line-height: 1.45;
  font-weight: 700;
`

const Display = styled.video.attrs(() => ({ autoPlay: true, playsInline: true }))<{ show: boolean }>`
  display: block;
  border-radius: 1rem;
  ${({ show }) => show ? '' : css`
    width: 0;
    height: 0;
    opacity: 0`
  }
`

const VideoBox = styled.div`
  width: 100%;
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  overflow: hidden;
  border-radius: 1rem;
  border: 3px solid ${colors.accent};
  background: ${colors.highlight};
  display: flex;
  & > video {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    margin: auto;
    width: 100%;
    height: auto;
  }
`

export const RemoteVideo: FC<{ lookup: string, display: RemoteFeedState }> = ({ lookup, display }) => {
  const ref = useRef<HTMLVideoElement>(null)
  const outer = useRef<HTMLDivElement>(null)
  const [feed, setFeed] = useState(streamingClient.feeds[lookup])

  useEffect(() => {
    setFeed(streamingClient.feeds[lookup])
    if (!!feed && !!ref.current) {
      feed.display(ref.current)
    }
  }, [ref, feed])


  return <div className="flex flex-col" ref={outer}>
    {/*<div className="flex items-center justify-between">*/}
    {/*  <Text>{display.displayHandle}</Text>*/}
    {/*  <div className="flex">*/}
    {/*    <Picker label="bitrate" options={[1, 2, 3]} defaultValue={3} onChange={(val) => feed.configure('temporal', val as number)}/>*/}
    {/*    <Picker label="quality" options={[0, 1, 2]} defaultValue={2} onChange={(val) => feed.configure('substream', val as number)}/>*/}
    {/*  </div>*/}
    {/*</div>*/}

    <VideoBox>
      <Display ref={ref} id={`remote-video-${lookup}`} show/>
    </VideoBox>
  </div>
}
