'use client'

import { useState, useEffect } from 'react'

export default function StagingBanner() {
  const [isStaging, setIsStaging] = useState(false)

  useEffect(() => {
    // Check if we're on staging environment
    const isStagingEnv = 
      process.env.NODE_ENV === 'production' && 
      typeof window !== 'undefined' && 
      (window.location.hostname.includes('staging') || 
       window.location.hostname.includes('deploy-preview'))
    
    setIsStaging(isStagingEnv)
  }, [])

  if (!isStaging) {
    return null
  }

  return (
    <div className="bg-yellow-500 text-black text-center py-2 px-4 font-medium">
      🧪 STAGING ENVIRONMENT - This is a test version
    </div>
  )
}
