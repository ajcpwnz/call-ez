import React, { FC, useState } from 'react'
import styled, { css } from 'styled-components'
import { colors } from '../../utils/colors'
import { Text } from '../../shared/Text'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'

const LargeText = styled.h2`
  color: ${colors.accent};
  font-size: 42px;
  max-width: 500px;
  text-align: center;
  line-height: 1.45;
  font-weight: 700;
`

const Display = styled.video.attrs(() => ({ autoPlay: true, playsInline: true }))<{ modest?: boolean, show: boolean }>`
  border: 3px solid ${colors.accent};
  border-radius: 1rem;
  display: block;
  height: auto;
  transition: width .3s ease;
  ${({modest}) => modest ? css`
    width: 150px;
    position: fixed;
    bottom: 1rem;
    right: 1rem;
  ` : css`width: 55vw; margin: 5vh 0;` }
  ${({ show }) => show ? '' : css`
    width: 0;
    height: 0;
    opacity: 0`
  }
`

export const Video: FC<{ modest?: boolean }> = ({ modest }) => {
  const [ready, setReady] = useState(false)
  const cameraEnabled = useSelector((state: RootState) => state.streamingClient.sources.local.cameraEnabled);

  return <>
    <Display modest={modest} onCanPlay={() => setReady(true)} id={`localvideo`} show={ready && cameraEnabled} muted/>
    {ready ? null : <Text>Connecting</Text>}
    {cameraEnabled ? null : <Text>Camera disabled</Text>}
  </>
}
