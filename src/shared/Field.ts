import styled from 'styled-components'
import { colors } from '../utils/colors'

export const Field = styled.input`
  border: 3px solid ${colors.accent};
  padding: .5rem;
  font-size: 24px;
  font-weight: 700;
  background: transparent;
  color: ${colors.accent};
  border-radius: .5rem;
  
  &:focus {
    background: ${colors.body};
    color: ${colors.main};
    outline: none;
  }
`
