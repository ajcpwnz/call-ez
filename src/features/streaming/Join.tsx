import { Text, TextVariants } from '../../shared/Text'
import React from 'react'
import styled from 'styled-components'
import { SubmitHandler, useForm } from 'react-hook-form'
import { Field } from '../../shared/Field'
import { Button } from '../../shared/Button'
import { streamingClient } from '../../utils/webrtc/client'
import { Picker } from '../../shared/Picker'

const Outer = styled.div`
  min-width: 300px;
  display: flex;
  flex-direction: column;
`

export const Join = () => {
  const { register, handleSubmit } = useForm()

  const onSubmit: SubmitHandler<{ name: string }> = ({ name }) => {
    streamingClient.connect(name)
  }

  return <Outer>
    <Text variant={TextVariants.title}>Almost there</Text>
    <Text>Enter a name so other people can identify you</Text>
    <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
      <Field type="text" {...register('name')}/>
      <Button className="ml-2" type="submit">join</Button>
    </form>
  </Outer>
}
