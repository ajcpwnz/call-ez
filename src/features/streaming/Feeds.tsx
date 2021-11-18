import { RemoteVideo } from './RemoteVideo'
import { Video } from './Video'
import React from 'react'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'
import { Text, TextVariants } from '../../shared/Text'
import styled from 'styled-components'

const Outer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
`


export const Feeds = () => {
  const feeds = useSelector((state: RootState) => Object.values(state.streamingClient.sources.remote));

  return <Outer>
    <div className="flex flex-grow flex-row flex-wrap w-full items-center justify-center">
      {
        feeds.map(feed => (
          <div className={
            `${feeds.length === 1
              ? 'w-4/5'
              : `w-1/${feeds.length === 3 ? 2 : 2}`} p-2`
          }>
            <RemoteVideo key={feed.key} lookup={feed.key}/>
          </div>
        ))
      }
    </div>
    <div className="pt-8">
      <Video modest={!!feeds.length}/>
    </div>
    {feeds.length ? null : <>
      <Text variant={TextVariants.title}>Looks like no one else is here.</Text>
      <Text>Waiting for people to join.</Text>
    </>}
  </Outer>
}
