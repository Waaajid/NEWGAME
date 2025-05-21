"use client"

import { useState } from "react"
import type { GameState } from "../types/game-types"

type CommentaryType = "round-start" | "round-end" | "match-found" | "dice-roll" | "winner"

export function useGameMaster() {
  const [commentary, setCommentary] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const getCommentary = async (gameState: GameState, commentaryType: CommentaryType) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/game-master", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameState,
          commentaryType,
        }),
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.fallback) {
        console.log("Using fallback commentary")
      }

      setCommentary(data.commentary)
      return data.commentary
    } catch (err) {
      console.error("Error fetching game master commentary:", err)
      // Set a default commentary instead of showing an error
      const defaultCommentary = getDefaultCommentary(commentaryType)
      setCommentary(defaultCommentary)
      setError("Failed to get commentary from AI")
      return defaultCommentary
    } finally {
      setIsLoading(false)
    }
  }

  // Provide default commentary for each type in case of errors
  const getDefaultCommentary = (type: CommentaryType): string => {
    switch (type) {
      case "round-start":
        return "Let's start this round! Think of your answers and try to match with your teammates!"
      case "round-end":
        return "Round complete! Let's see which teams found matching answers."
      case "match-found":
        return "Great job! Some teams found matching answers!"
      case "dice-roll":
        return "Time for the final dice roll! Only teams that won rounds get to roll."
      case "winner":
        return "Congratulations to the winning team! Well played everyone!"
      default:
        return "Let's keep the game going!"
    }
  }

  return {
    commentary,
    isLoading,
    error,
    getCommentary,
  }
}
