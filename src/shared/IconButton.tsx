import styled, { css } from 'styled-components'
import { colors } from '../utils/colors'

const variants = {
  base: css`
    background-color: ${colors.body};
    color: ${colors.accent};

    &:hover {
      transition: border-color .3s ease;
      border-color: rgba(255, 164, 0, .5);
    }
  `,
  light: css`
    background-color: ${colors.highlight};
    color: ${colors.body};

    &:hover {
      transition: border-color .3s ease;
      border-color: rgba(255, 164, 0, .5);
    }
  `,
  danger: css`
    background-color: ${colors.accent};
    color: ${colors.body};

    &:hover {
      transition: border-color .3s ease;
      border-color: rgba(255, 255, 255, .5);
    }
  `
}

interface IconButtonProps {
  i: string;
  variant?: keyof typeof variants,
  buttonProps?: Record<string, any>
  iconProps?: Record<string, any>
}

const Outer = styled.button.attrs(() => ({
  type: 'button'
}))<{ variant: keyof typeof variants }>`
  font-size: 2rem;
  border-radius: 50%;
  line-height: 1;
  width: 3rem;
  height: 3rem;
  text-align: center;
  margin: .25rem;
  cursor: pointer;
  border: 3px solid transparent;
  box-sizing: border-box;
  ${({ variant }) => variants[variant]}
`

interface IconProps {
  i: string

  [index: string]: any
}

const Icon = styled.span.attrs<IconProps>(({ className, i, color }) => ({
  className: `${className} jam jam-${i}`
}))<IconProps>`
  ${({ color }) => color ? css`color: ${color}` : ''};
`

export const IconButton = ({ variant, i, buttonProps, iconProps }: IconButtonProps) =>
  <Outer variant={variant || 'base'} {...(buttonProps || {})}>
    <Icon i={i} {...(iconProps || {})} />
  </Outer>
