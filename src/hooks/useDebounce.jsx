import { useState, useEffect } from 'react'
export default function useDebounce(value, delayMS) {
  const [debounceVal, setDebounceVal] = useState(value)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebounceVal(value)
    }, delayMS)
    return () => {
      clearTimeout(timeoutId)
    }
  }, [value, delayMS])
  return debounceVal
}
