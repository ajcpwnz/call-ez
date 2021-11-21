import { useEffect, useState } from 'react'

export const useScreensize = () => {
  const el = document.querySelector('#dn')
  const [width, setWidth] = useState(0)
  const [height, setHeight] = useState(0)

  const observer = new window.ResizeObserver((entries: any) => {
    setWidth(entries[0].contentRect.width)
    setHeight(entries[0].contentRect.height)
  })

  useEffect(() => {
    if(!!el) {
      // @ts-ignore
      observer?.observe(el)
    }
  }, [el])

  return {
    width, height
  }
}
