"use client"

import { useState } from "react"
import type { GameState } from "@/types/game-types"
import { createConfetti } from "@/utils/game-utils"
import { Trophy } from "lucide-react"

interface DiceRollScreenProps {
  gameState: GameState
  onRollDice: (teamId: number) => number
  onDetermineWinner: (teamId: number) => void
  onPlayAgain: () => void
}

export default function DiceRollScreen({ gameState, onRollDice, onDetermineWinner, onPlayAgain }: DiceRollScreenProps) {
  const [rolledTeams, setRolledTeams] = useState<number[]>([])
  const [winner, setWinner] = useState<number | null>(null)
  const [tiedTeams, setTiedTeams] = useState<number[]>([])
  const [isTieBreaker, setIsTieBreaker] = useState(false)

  const handleRollDice = (teamId: number) => {
    const roll = onRollDice(teamId)

    // Create mini confetti for this team
    const diceElement = document.getElementById(`team-${teamId}-dice`)
    if (diceElement) {
      createConfetti(20, diceElement.getBoundingClientRect())
    }

    setRolledTeams((prev) => [...prev, teamId])
  }

  const handleRollAllDice = () => {
    // Roll dice for each eligible team with a delay between teams
    let delay = 0

    gameState.eligibleTeams.forEach((teamId) => {
      setTimeout(() => {
        handleRollDice(teamId)
      }, delay)

      delay += 1000 // 1 second between team rolls
    })

    // After all rolls, determine the winner
    setTimeout(() => {
      determineWinner()
    }, delay + 1000)
  }

  const handleTieBreaker = () => {
    // Reset dice rolls for tied teams
    setRolledTeams([])
    setIsTieBreaker(true)

    // Roll dice again for tied teams
    let delay = 0
    tiedTeams.forEach((teamId) => {
      setTimeout(() => {
        handleRollDice(teamId)
      }, delay)

      delay += 1000
    })

    // After all rolls, determine the winner again
    setTimeout(() => {
      determineWinner(true)
    }, delay + 1000)
  }

  const determineWinner = (isTieBreaker = false) => {
    if (gameState.eligibleTeams.length === 0) {
      return
    }

    // Find the highest roll
    let highestRoll = 0
    let winningTeams: number[] = []

    const teamsToCheck = isTieBreaker ? tiedTeams : gameState.eligibleTeams

    teamsToCheck.forEach((teamId) => {
      const roll = gameState.teams[teamId].diceRoll
      if (roll !== null) {
        if (roll > highestRoll) {
          highestRoll = roll
          winningTeams = [teamId]
        } else if (roll === highestRoll) {
          winningTeams.push(teamId)
        }
      }
    })

    // If there's a tie, prepare for tie breaker
    if (winningTeams.length > 1) {
      setTiedTeams(winningTeams)
    } else if (winningTeams.length === 1) {
      // We have a single winner
      const winningTeamId = winningTeams[0]
      setWinner(winningTeamId)
      onDetermineWinner(winningTeamId)

      // Add winner badge
      const winnerArea = document.getElementById(`team-${winningTeamId}-dice-area`)
      if (winnerArea) {
        const winnerBadge = document.createElement("div")
        winnerBadge.className = "winner-badge"
        winnerBadge.innerHTML = "🏆"
        winnerArea.appendChild(winnerBadge)
      }

      // Create big confetti for the winner
      createConfetti(200)
    }
  }

  const createDiceFace = (value: number | null) => {
    if (value === null) return null

    const dots = []
    for (let i = 0; i < value; i++) {
      dots.push(<span key={i} className="dot"></span>)
    }

    return <div className={`dice-face dice-${value}`}>{dots}</div>
  }

  const renderEligibleTeams = () => {
    if (gameState.eligibleTeams.length === 0) {
      return (
        <div className="text-center p-6">
          <p className="text-lg">No teams are eligible to roll the dice.</p>
          <p className="text-gray-600 mt-2">Better luck next game!</p>
        </div>
      )
    }

    return gameState.eligibleTeams.map((teamId) => {
      const team = gameState.teams[teamId]
      const hasRolled = rolledTeams.includes(teamId)

      return (
        <div key={teamId} className="p-4 border rounded-lg relative" id={`team-${teamId}-dice-area`}>
          <h4 className="font-medium flex items-center justify-center mb-4">
            <span className={`team-badge ${team.color} mr-2`}>{team.name}</span>
            <span>{team.points} Points</span>
          </h4>

          <div className="flex justify-center dice-roll-area">
            <div className="dice-container" id={`team-${teamId}-dice`}>
              <div
                className="dice"
                style={{
                  transform: hasRolled
                    ? `rotateX(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg)`
                    : undefined,
                }}
              >
                {hasRolled ? (
                  createDiceFace(team.diceRoll)
                ) : (
                  <div className="dice-face dice-1">
                    <span className="dot"></span>
                  </div>
                )}
              </div>
              <span className="dice-result">{hasRolled && team.diceRoll !== null ? team.diceRoll : "?"}</span>
            </div>
          </div>

          <div className="text-center mt-4">
            <button
              className={`dice-roll-btn ${hasRolled ? "opacity-50" : ""}`}
              onClick={() => handleRollDice(teamId)}
              disabled={hasRolled}
            >
              Roll Dice
            </button>
          </div>
        </div>
      )
    })
  }

  const renderLeaderboard = () => {
    // Sort teams by points and winner status
    const sortedTeams = Object.entries(gameState.teams)
      .map(([id, team]) => ({ id: Number.parseInt(id), ...team }))
      .sort((a, b) => {
        // If we have a winner
        if (winner) {
          if (a.id === winner) return -1
          if (b.id === winner) return 1
        }

        // Otherwise sort by points
        return b.points - a.points
      })

    return sortedTeams.map((team, index) => {
      let rankClass = ""
      if (index === 0) rankClass = "leaderboard-1st"
      else if (index === 1) rankClass = "leaderboard-2nd"
      else if (index === 2) rankClass = "leaderboard-3rd"

      // Add dice roll result if available
      let diceRollInfo = ""
      if (team.diceRoll !== null) {
        diceRollInfo = `<span class="ml-2 text-sm bg-gray-100 px-2 py-1 rounded">Dice: ${team.diceRoll}</span>`
      }

      // Add winner indicator
      let winnerIndicator = ""
      if (winner && team.id === winner) {
        winnerIndicator = `<span class="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Winner!</span>`
      }

      return (
        <div
          key={team.id}
          className={`flex items-center justify-between p-3 border rounded-lg leaderboard-item ${rankClass}`}
        >
          <div className="flex items-center">
            <div className={`mr-3 font-bold text-lg ${index === 0 ? "text-yellow-500" : ""}`}>#{index + 1}</div>
            <span className={`team-badge ${team.color} mr-2`}>{team.name}</span>
            <span className="font-medium">{team.points} points</span>
            <span
              className="ml-2 text-sm bg-gray-100 px-2 py-1 rounded"
              dangerouslySetInnerHTML={{ __html: diceRollInfo }}
            ></span>
            <span dangerouslySetInnerHTML={{ __html: winnerIndicator }}></span>
          </div>
          <div className="text-sm text-gray-500">{team.matches} matching answers</div>
        </div>
      )
    })
  }

  const renderWinnerAnnouncement = () => {
    if (!winner) return null

    const team = gameState.teams[winner]

    return (
      <div
        className="card p-6 mb-6"
        style={{
          background: "linear-gradient(135deg, var(--color-primary-light), var(--color-primary))",
          color: "white",
        }}
      >
        <div className="text-center py-6">
          <div className="trophy mb-6">
            <Trophy className="w-24 h-24 mx-auto" style={{ color: "gold" }} />
          </div>
          <h2 className="text-4xl font-bold mb-4">CHAMPION!</h2>
          <div className="mb-4 inline-block">
            <span className={`team-badge ${team.color} text-lg px-6 py-2`}>{team.name}</span>
          </div>
          <p className="text-2xl font-bold mb-2">Winning Roll: {team.diceRoll}</p>
          <p className="text-xl">Congratulations on your victory!</p>
        </div>
      </div>
    )
  }

  const renderGameStats = () => {
    // Calculate total responses
    const totalResponses = Object.values(gameState.teams).reduce((total, team) => total + team.responses.length, 0)

    // Calculate total matches
    const totalMatches = Object.values(gameState.teams).reduce((total, team) => total + team.matches, 0)

    return (
      <div className="card p-6 mb-6">
        <h3 className="text-xl font-bold mb-4">Game Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
              {gameState.currentRound}
            </div>
            <div className="text-gray-500 text-sm">Rounds Played</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
              {totalResponses}
            </div>
            <div className="text-gray-500 text-sm">Total Responses</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
              {totalMatches}
            </div>
            <div className="text-gray-500 text-sm">Matching Answers</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg text-center">
            <div className="text-4xl font-bold" style={{ color: "var(--color-primary)" }}>
              {gameState.eligibleTeams.length}
            </div>
            <div className="text-gray-500 text-sm">Teams in Final</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id="dice-roll-screen">
      <div className="card p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: "var(--color-primary)" }}>
          Final Dice Rolls
        </h2>

        {/* Update the instructions text */}
        <div className="text-center mb-6">
          {gameState.eligibleTeams.length === 0 ? (
            <p className="text-lg">No teams won any rounds!</p>
          ) : (
            <p className="text-lg">Only teams that won rounds get to roll the dice!</p>
          )}
          <p className="text-gray-600 mt-2">
            {gameState.eligibleTeams.length === 0
              ? "No one gets to roll the dice this time."
              : "The team with the highest roll will be the winner."}
          </p>
        </div>

        <div className="space-y-8">{renderEligibleTeams()}</div>

        {tiedTeams.length > 1 && !isTieBreaker && (
          <div className="mt-8 p-4 border rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-center">Tie Breaker!</h3>
            <p className="text-center mb-6">We have a tie! The following teams will roll again:</p>
            <div className="flex justify-center flex-wrap gap-3 mb-6">
              {tiedTeams.map((id) => (
                <span key={id} className={`team-badge ${gameState.teams[id].color} px-4 py-2`}>
                  {gameState.teams[id].name}
                </span>
              ))}
            </div>
            <div className="text-center">
              <button className="btn-primary px-6 py-2 font-medium rounded-lg" onClick={handleTieBreaker}>
                Roll Tie Breaker
              </button>
            </div>
          </div>
        )}

        {gameState.eligibleTeams.length > 0 && tiedTeams.length === 0 && !winner && (
          <div className="text-center mt-8">
            <button
              className="btn-primary px-8 py-3 font-medium rounded-lg"
              onClick={handleRollAllDice}
              disabled={rolledTeams.length > 0}
            >
              Roll All Dice
            </button>
          </div>
        )}
      </div>

      {renderWinnerAnnouncement()}

      {winner && renderGameStats()}

      {/* Final Leaderboard */}
      <div className="card p-6 mb-6">
        <h3 className="text-xl font-bold mb-4 text-center">Final Leaderboard</h3>
        <div className="space-y-3">{renderLeaderboard()}</div>
      </div>

      {/* Play Again Button */}
      <div className="text-center">
        <button className="btn-primary px-8 py-3 font-medium rounded-lg" onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  )
}
