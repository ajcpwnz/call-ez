import styled, { css, FlattenSimpleInterpolation, ThemedCssFunction } from 'styled-components'
import { colors } from '../utils/colors'

export enum TextVariants {
  base = 'base',
  title = 'title',
}

interface TextProps {
  variant?: TextVariants
}

const variantStyles: Record<TextVariants, FlattenSimpleInterpolation> = {
  base: css`
    color: ${colors.body};
    font-size: 24px;
    line-height: 1.45;
    font-weight: 700;
  `,
  title: css`
    color: ${colors.accent};
    font-size: 42px;
    line-height: 1.45;
    font-weight: 700;
    margin: 0;
  `,
}

export const Text = styled.p<TextProps>`
  ${({variant}) => variant ? variantStyles[variant] : variantStyles.base};
`
