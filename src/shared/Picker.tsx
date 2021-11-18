import React, { useState } from 'react'
import styled, { css } from 'styled-components'
import { colors } from '../utils/colors'

const PickerItem = styled.span`
  cursor: pointer;
  color: ${colors.body};
  
  &:hover .--option {
    background-color: ${colors.highlight};
  }
  &:hover .--cell:after {
    height: 4px;top: calc(50% - 2px);
  }
`
const PickerLabel = styled.span`
  display: inline-block;
  margin-right: .5rem;
  padding: .25rem;
  color: ${colors.body};
`
const PickerOption = styled.span<{active: boolean}>`
  display: inline-block;
  padding: .25rem;
  min-width: 1.5rem;
  text-align: center;
  font-size: 14px;
  border-radius: 4px;
  line-height: 1.25;
  ${({active}) => active ? css`font-weight: 700`: ''};
`

const PickerCell = styled.span<{active: boolean}>`
  display: inline-block;
  width: 100%;
  height: .5rem;
  position: relative;

  &:after {
    content: '';
    display: block;
    width: 100%;
    position: absolute;
    ${({active}) => active ? css`height: 4px;top: calc(50% - 2px);` : css`height: 2px; top: calc(50% - 1px);`}
    background: ${colors.accent};
    
  }
`

interface PickerProps {
  label: string
  options: (string | number)[],
  defaultValue: string | number
  onChange: (val: string | number) => void
}


export const Picker = ({ options, defaultValue, onChange, label }: PickerProps) => {
  const [value, setValue] = useState(defaultValue)

  return <div>
    <div className="flex items-center justify-start">
      <PickerLabel>{label}</PickerLabel>
      {options.map(opt => (
        <PickerItem className="flex flex-col" key={opt} onClick={() => {
          setValue(opt);
          onChange(opt);
        }}>
          <PickerOption className="--option" active={value === opt}>{opt}</PickerOption>
          <PickerCell className="--cell" active={value === opt}/>
        </PickerItem>
      ))}
    </div>
  </div>
}
