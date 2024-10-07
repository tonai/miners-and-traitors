import { RefObject, useEffect, useRef, useState } from "react"

export function useRatio<E extends HTMLElement>(): [RefObject<E>, number] {
  const [ratio, setRatio] = useState(1)
  const ref = useRef<E>(null)

  useEffect(() => {
    if (ref.current) {
      setRatio(
        Math.min(
          window.innerWidth / ref.current.scrollWidth,
          window.innerHeight / ref.current.scrollHeight,
          1
        )
      )
    }
  }, [])

  useEffect(() => {
    function resize() {
      if (ref.current) {
        setRatio(
          Math.min(
            window.innerWidth / ref.current.scrollWidth,
            window.innerHeight / ref.current.scrollHeight,
            1
          )
        )
      }
    }
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  return [ref, ratio]
}
