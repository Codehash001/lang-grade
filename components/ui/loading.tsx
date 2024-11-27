"use client"

import React from 'react'

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <p className="text-sm text-gray-600">Loading authentication page. Please wait...</p>
    </div>
  )
}
