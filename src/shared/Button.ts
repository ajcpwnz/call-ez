import styled from 'styled-components'
import { colors } from '../utils/colors'

export const Button = styled.button`
  border: 3px solid ${colors.accent};
  padding: .5rem 1.25rem;
  font-size: 24px;
  font-weight: 700;
  background: ${colors.accent};
  color: ${colors.body};
  border-radius: .5rem;
  text-transform: uppercase;
  cursor: pointer;
  
  &:hover {
    background: ${colors.body};
    border-color: ${colors.accent};
    color: ${colors.accent};
  }
`
