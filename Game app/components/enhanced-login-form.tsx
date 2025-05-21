"use client"

import type React from "react"

import { useState } from "react"
import { InfoIcon, Users } from "lucide-react"
import type { Team } from "../types/game-types"

interface EnhancedLoginScreenProps {
  teams: Record<number, Team>
  onJoinGame: (playerName: string, teamId: number) => void
}

export default function EnhancedLoginScreen({ teams, onJoinGame }: EnhancedLoginScreenProps) {
  const [playerName, setPlayerName] = useState("")
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)

  const handleTeamSelect = (teamId: number) => {
    // Check if team is full
    if (teams[teamId].players >= 5) {
      return
    }
    setSelectedTeam(teamId)
  }

  const handleJoinGame = () => {
    if (!playerName.trim()) {
      return
    }

    if (!selectedTeam) {
      return
    }

    onJoinGame(playerName, selectedTeam)
  }

  return (
    <div id="login-screen" className="card p-6">
      <h1 className="text-3xl font-bold text-center mb-2">Team Sync</h1>
      <p className="text-center text-gray-600 mb-6">Quick team game where matching answers win!</p>

      <div
        style={{ backgroundColor: "rgba(244, 144, 145, 0.2)", borderLeft: "4px solid var(--color-primary)" }}
        className="p-4 mb-6 rounded-md"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <InfoIcon className="h-5 w-5" style={{ color: "var(--color-primary)" }} />
          </div>
          <div className="ml-3">
            <p className="text-sm" style={{ color: "var(--color-primary-dark)" }}>
              <span className="font-bold">INSTRUCTIONS:</span> There are no right or wrong answers - the team with the
              most common answers wins! Only teams that win in a round will get to roll the dice in the final stage.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="player-name" className="block text-sm font-medium text-gray-700 mb-1">
          Your Name
        </label>
        <input
          type="text"
          id="player-name"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": "var(--color-primary)" } as React.CSSProperties}
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Your Team (5 players max per team)
        </label>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(teams).map(([id, team]) => {
            const teamId = Number.parseInt(id)
            const isFull = team.players >= 5
            const isSelected = selectedTeam === teamId

            return (
              <button
                key={teamId}
                type="button"
                className={`team-select p-4 border rounded-lg flex flex-col items-center justify-center relative ${isFull ? "team-full" : ""} ${isSelected ? "ring-2" : ""}`}
                style={isSelected ? ({ "--tw-ring-color": "var(--color-primary)" } as React.CSSProperties) : undefined}
                onClick={() => handleTeamSelect(teamId)}
                disabled={isFull}
              >
                <span className={`team-badge ${team.color} mb-2`}>{team.name}</span>
                <span className="player-count" style={{ backgroundColor: isFull ? "#9ca3af" : undefined }}>
                  {team.players}/5
                </span>
                <div className="team-capacity">
                  <div
                    className={`team-capacity-fill ${team.color}-fill`}
                    style={{ width: `${(team.players / 5) * 100}%` }}
                  ></div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-2">
          <Users className="h-5 w-5 mr-2 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700">Live Players</h3>
        </div>
        <div className="text-sm text-gray-600">
          {Object.entries(teams).map(([id, team]) => {
            const teamId = Number.parseInt(id)
            if (team.players > 0) {
              return (
                <div key={teamId} className="flex items-center justify-between py-1">
                  <span className={`team-badge ${team.color}`}>{team.name}</span>
                  <span>
                    {team.players} {team.players === 1 ? "player" : "players"}
                  </span>
                </div>
              )
            }
            return null
          })}
        </div>
      </div>

      <button className="btn-primary w-full py-3 font-medium rounded-lg" onClick={handleJoinGame}>
        Join Game
      </button>
    </div>
  )
}
