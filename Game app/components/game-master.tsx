"use client"

import { useState, useEffect } from "react"
import { MessageCircle } from "lucide-react"

interface GameMasterProps {
  commentary: string
  isLoading: boolean
}

export default function GameMaster({ commentary, isLoading }: GameMasterProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [animation, setAnimation] = useState("")

  useEffect(() => {
    if (commentary) {
      setIsVisible(true)
      setAnimation("animate-in")

      // Hide after 10 seconds
      const timer = setTimeout(() => {
        setAnimation("animate-out")
        setTimeout(() => setIsVisible(false), 500)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [commentary])

  if (!isVisible && !isLoading) return null

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg p-4 z-50 transition-all duration-500 ${
        animation === "animate-in" ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
      style={{
        borderLeft: "4px solid var(--color-primary)",
        maxWidth: "calc(100% - 2rem)",
      }}
    >
      <div className="flex items-start">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3"
          style={{ backgroundColor: "var(--color-primary-light)" }}
        >
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-sm mb-1" style={{ color: "var(--color-primary)" }}>
            Game Master
          </h4>
          <div className="text-sm text-gray-700">
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-pulse mr-2">Thinking</div>
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            ) : (
              commentary
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
