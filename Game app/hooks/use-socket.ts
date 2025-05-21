"use client"

import { useEffect, useState } from "react"
import io, { type Socket } from "socket.io-client"

let socket: Socket | null = null

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      await fetch("/api/socket")

      if (!socket) {
        socket = io()

        socket.on("connect", () => {
          console.log("Socket connected")
          setIsConnected(true)
        })

        socket.on("disconnect", () => {
          console.log("Socket disconnected")
          setIsConnected(false)
        })
      }
    }

    initSocket().catch(console.error)

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  return { socket, isConnected }
}
