import type React from "react"
export default function EnhancedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="enhanced-layout">
      <div className="bg-gradient-to-r from-red-500 to-red-800 text-white p-2 text-center text-sm">
        Next.js 15 Enhanced Version
      </div>
      {children}
    </div>
  )
}
