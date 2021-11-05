import React, { FC } from 'react'
import { useSelector } from 'react-redux'
import styled, { css } from 'styled-components'
import { colors } from '../../utils/colors'
import { RootState } from '../../store'

const LargeText = styled.h2`
  color: ${colors.accent};
  font-size: 42px;
  max-width: 500px;
  text-align: center;
  line-height: 1.45;
  font-weight: 700;
`

const Display = styled.video.attrs(() => ({ autoPlay: true, playsInline: true }))<{ show: boolean }>`
  border: 5px solid ${colors.accent};
  border-radius: 1rem;
  display: block;
  ${({ show }) => show ? '' : css`
    width: 0;
    height: 0;
    opacity: 0` 
  }
`

export const Video: FC<{ source: 'local' | 'remote' }> = ({ source }) => {
  const hasVideo = useSelector((state: RootState) => state.streamingClient.sources[source].hasVideo)

  return <>
    {
      (source  === 'local' && !hasVideo)
        ? <LargeText>Connecting you to remote session <br /><br /> Please give the browser access to your recording devices</LargeText>
      : null
    }
    {
      (source  === 'remote' && !hasVideo)
        ? <LargeText>Looks like you're the only one here yet</LargeText>
      : null
    }
    <Display id={`${source}video`} show={!!hasVideo}/>
  </>
}
