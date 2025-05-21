"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { GameState } from "@/types/game-types"

interface GameScreenProps {
  gameState: GameState
  onSubmitAnswer: (answer: string) => void
  onNextRound: () => void
}

export default function GameScreen({ gameState, onSubmitAnswer, onNextRound }: GameScreenProps) {
  const [answer, setAnswer] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(gameState.timer.duration)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const timerProgressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Start timer
    startTimer()

    return () => {
      // Clear timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameState.currentRound])

  const startTimer = () => {
    // Reset timer animation
    if (timerProgressRef.current) {
      timerProgressRef.current.classList.remove("countdown-animation")
      void timerProgressRef.current.offsetWidth // Force reflow
      timerProgressRef.current.classList.add("countdown-animation")
    }

    // Reset timer state
    setTimeRemaining(gameState.timer.duration)
    setIsSubmitted(false)

    // Clear any existing interval
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Start new interval
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1

        if (newTime <= 0) {
          // Clear interval
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }

          // Auto-submit if not submitted yet
          if (!isSubmitted) {
            if (answer.trim()) {
              handleSubmitAnswer()
            } else {
              setIsSubmitted(true)
              // Auto-progress to next round after 3 seconds
              setTimeout(() => {
                handleNextRound()
              }, 3000)
            }
          }
        }

        return newTime
      })
    }, 1000)
  }

  const handleSubmitAnswer = () => {
    if (!answer.trim()) {
      const input = document.getElementById("answer-input")
      if (input) {
        input.classList.add("shake")
        setTimeout(() => input.classList.remove("shake"), 500)
      }
      return
    }

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Submit answer
    onSubmitAnswer(answer)
    setIsSubmitted(true)
  }

  const handleNextRound = () => {
    setAnswer("")
    setIsSubmitted(false)
    if (gameState.currentRound < gameState.totalRounds) {
      // This will trigger the round-end commentary in the parent component
      onNextRound()
    } else {
      onNextRound()
    }
  }

  const renderTeamResponses = () => {
    return Object.entries(gameState.teams).map(([id, team]) => (
      <div key={id} className="team-responses">
        <h4 className="font-medium flex items-center">
          <span className={`team-badge ${team.color} mr-2`}>{team.name}</span>
          <span>Responses</span>
        </h4>
        <ul className="mt-2 pl-4 list-disc">
          {team.responses.map((response, index) => (
            <li key={index}>
              {response.player}: {response.answer}
            </li>
          ))}
        </ul>
      </div>
    ))
  }

  const renderMatchingAnswers = () => {
    const matchingTeams = Object.entries(gameState.teams)
      .filter(([_, team]) => team.hasMatches)
      .map(([id, team]) => {
        const teamId = Number.parseInt(id)
        return { teamId, team }
      })

    if (matchingTeams.length === 0) {
      return <p className="text-gray-500 text-center py-4">No matching answers yet</p>
    }

    return matchingTeams.map(({ teamId, team }) => {
      // Group responses by answer
      const answerCounts: Record<string, number> = {}
      team.responses.forEach((response) => {
        const answer = response.answer.toLowerCase()
        if (!answerCounts[answer]) {
          answerCounts[answer] = 1
        } else {
          answerCounts[answer]++
        }
      })

      // Filter for answers with 3+ matches
      const matchingAnswers = Object.entries(answerCounts)
        .filter(([_, count]) => count >= 3)
        .map(([answer, count]) => ({ answer, count }))

      return (
        <div key={teamId} className="p-3 border rounded-lg">
          <h4 className="font-medium flex items-center">
            <span className={`team-badge ${team.color} mr-2`}>{team.name}</span>
            <span>Matching Answers</span>
          </h4>
          <ul className="mt-2 pl-4 list-disc">
            {matchingAnswers.map((match, index) => (
              <li key={index}>
                "{match.answer}" - {match.count} players
              </li>
            ))}
          </ul>
        </div>
      )
    })
  }

  const renderLeaderboard = () => {
    // Sort teams by points
    const sortedTeams = Object.entries(gameState.teams)
      .map(([id, team]) => ({ id: Number.parseInt(id), ...team }))
      .sort((a, b) => b.points - a.points)

    return sortedTeams.map((team, index) => (
      <div key={team.id} className="flex items-center justify-between p-3 border rounded-lg leaderboard-item">
        <div className="flex items-center">
          <div className={`mr-3 font-bold text-lg ${index === 0 ? "text-yellow-500" : ""}`}>#{index + 1}</div>
          <span className={`team-badge ${team.color} mr-2`}>{team.name}</span>
          <span className="font-medium">{team.points} points</span>
        </div>
        <div className="text-sm text-gray-500">{team.matches} matching answers</div>
      </div>
    ))
  }

  const renderRoundWinners = () => {
    if (gameState.roundWinners.length === 0) {
      return <p className="text-gray-500 text-center py-2">No winners yet</p>
    }

    // Count occurrences of each team in roundWinners
    const winCounts: Record<number, number> = {}
    gameState.roundWinners.forEach((teamId) => {
      winCounts[teamId] = (winCounts[teamId] || 0) + 1
    })

    return (
      <div className="space-y-2">
        {Object.entries(winCounts).map(([teamId, count]) => {
          const team = gameState.teams[Number(teamId)]
          return (
            <div key={teamId} className="flex items-center justify-between">
              <span className={`team-badge ${team.color}`}>{team.name}</span>
              <span className="font-medium">
                {count} {count === 1 ? "win" : "wins"}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  const currentTopic = gameState.topics[gameState.currentRound - 1]
  const teamId = gameState.currentPlayer.team!
  const team = gameState.teams[teamId]

  return (
    <div id="game-screen">
      <div className="card p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="font-medium">
              {gameState.currentPlayer.name} - <span className={`team-badge ${team.color}`}>{team.name}</span>
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-500">
              Round: <span>{gameState.currentRound}</span>/{gameState.totalRounds}
            </span>
            <div className="timer text-sm font-medium mt-1">
              Time: <span className={`font-bold ${timeRemaining <= 3 ? "text-red-600" : ""}`}>{timeRemaining}</span>s
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="progress-bar">
            <div
              ref={timerProgressRef}
              className={`progress-fill countdown-animation ${timeRemaining <= 3 ? "urgent" : ""}`}
              style={{ width: "100%" }}
            ></div>
          </div>
        </div>

        <div className="text-center py-6">
          <h2 className="text-2xl font-bold mb-2">Topic:</h2>
          <div className="text-4xl font-bold mb-6 pulse" style={{ color: "var(--color-primary)" }}>
            {currentTopic}
          </div>

          <p className="text-gray-600 mb-4">What's the first thing that comes to mind?</p>

          <input
            type="text"
            id="answer-input"
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${timeRemaining <= 0 ? "bg-gray-100 cursor-not-allowed" : ""}`}
            style={{ "--tw-ring-color": "var(--color-primary)" } as React.CSSProperties}
            placeholder="Type your answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isSubmitted || timeRemaining <= 0}
            onKeyPress={(e) => e.key === "Enter" && !isSubmitted && timeRemaining > 0 && handleSubmitAnswer()}
          />

          <button
            className={`btn-primary px-6 py-3 font-medium rounded-lg mt-4 ${isSubmitted || timeRemaining <= 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleSubmitAnswer}
            disabled={isSubmitted || timeRemaining <= 0}
          >
            {isSubmitted ? "Answer Submitted" : timeRemaining <= 0 ? "Time's Up!" : "Submit Answer"}
          </button>
          {timeRemaining <= 0 && !isSubmitted && (
            <div className="mt-4 text-red-600 animate-pulse">Time's up! Moving to next round...</div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Team Leaderboard</h3>
          <div
            style={{ backgroundColor: "rgba(244, 144, 145, 0.2)", color: "var(--color-primary-dark)" }}
            className="text-xs font-medium px-2.5 py-0.5 rounded-full"
          >
            LIVE
          </div>
        </div>
        <div className="space-y-3">{renderLeaderboard()}</div>
      </div>

      {/* Round Winners Panel */}
      <div className="card p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Round Winners</h3>
          <div
            style={{ backgroundColor: "rgba(244, 144, 145, 0.2)", color: "var(--color-primary-dark)" }}
            className="text-xs font-medium px-2.5 py-0.5 rounded-full"
          >
            TRACKING
          </div>
        </div>
        <div className="space-y-3">{renderRoundWinners()}</div>
      </div>

      {/* Admin Panel (For demo purposes) */}
      <div className="card p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Admin View - Team Responses</h3>

        <div className="space-y-4">{renderTeamResponses()}</div>
      </div>

      {/* Matching Answers Panel */}
      <div className="card p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Teams with Matching Answers</h3>
        <div className="space-y-3">{renderMatchingAnswers()}</div>
      </div>

      {/* Next Round Button */}
      <div className="text-center">
        <button
          className="btn-primary px-8 py-3 font-medium rounded-lg"
          onClick={handleNextRound}
          disabled={!isSubmitted}
        >
          Next Round
        </button>
      </div>
    </div>
  )
}
