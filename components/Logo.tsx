import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  }

  const isWhite = className.includes('text-white')
  const textColor = isWhite ? 'text-white' : 'text-gray-900'
  const subtitleColor = isWhite ? 'text-blue-100' : 'text-gray-500'

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Orange abstract symbol */}
      <div className={`${sizeClasses[size]} w-auto flex-shrink-0`}>
        <svg viewBox="0 0 40 40" className="w-full h-full">
          <path
            d="M8 12 L20 8 L32 12 L32 28 L20 32 L8 28 Z"
            fill="#FF6B35"
            stroke="#FF6B35"
            strokeWidth="2"
          />
          <path
            d="M12 16 L20 12 L28 16 L28 24 L20 28 L12 24 Z"
            fill="none"
            stroke="#FF6B35"
            strokeWidth="2"
          />
        </svg>
      </div>
      
      {/* Text */}
      <div className="flex flex-col">
        <span className={`font-bold ${textColor} ${
          size === 'sm' ? 'text-lg' : 
          size === 'md' ? 'text-xl' : 
          'text-2xl'
        }`}>
          Mark.0
        </span>
        <span className={`${subtitleColor} ${
          size === 'sm' ? 'text-xs' : 
          size === 'md' ? 'text-sm' : 
          'text-base'
        }`}>
          by Zapie
        </span>
      </div>
    </div>
  )
}
