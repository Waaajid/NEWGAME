"use server"

import { revalidatePath } from "next/cache"

// Helper function to safely access gameEvents
const trackGameEvent = (eventType: string, data: any) => {
  // Check if we're in a Node.js environment where global exists
  if (typeof global !== "undefined" && "gameEvents" in global) {
    const gameEvents = (global as any).gameEvents

    if (eventType === "answer" && gameEvents.trackAnswer) {
      gameEvents.trackAnswer(data.teamId, data.playerName, data.answer)
    } else if (eventType === "roundStart" && gameEvents.trackRoundStart) {
      gameEvents.trackRoundStart(data.roundNumber, data.topic)
    } else if (eventType === "matchFound" && gameEvents.trackMatchFound) {
      gameEvents.trackMatchFound(data.teamId, data.answer, data.count)
    } else if (eventType === "gameComplete" && gameEvents.trackGameComplete) {
      gameEvents.trackGameComplete(data.winningTeam, data.rounds)
    }
  }
}

export async function submitAnswer(teamId: number, playerName: string, answer: string) {
  // Validate input
  if (!answer.trim()) {
    return { success: false, error: "Answer cannot be empty" }
  }

  // Process the answer (in a real app, this would interact with a database)
  console.log(`Player ${playerName} from team ${teamId} submitted answer: ${answer}`)

  // Track the event using instrumentation if available
  trackGameEvent("answer", { teamId, playerName, answer })

  // Revalidate the game state path to update UI
  revalidatePath("/game")

  return {
    success: true,
    message: "Answer submitted successfully",
    data: { teamId, playerName, answer },
  }
}

export async function completeRound(currentRound: number, nextRound: number, roundWinners: number[]) {
  // Process the round completion
  console.log(`Round ${currentRound} completed. Winners: ${roundWinners.join(", ")}`)

  // Track the event using instrumentation if available
  trackGameEvent("roundStart", {
    roundNumber: nextRound,
    topic: `Topic for round ${nextRound}`,
  })

  // Revalidate the game state path to update UI
  revalidatePath("/game")

  return {
    success: true,
    data: { nextRound, roundWinners },
  }
}
