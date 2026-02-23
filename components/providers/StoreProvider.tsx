'use client'

import { type FC, type ReactNode, useEffect, useState } from 'react'

const StoreProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  if (!hydrated) {
    return null
  }

  return <>{children}</>
}

export default StoreProvider
