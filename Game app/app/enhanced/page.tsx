"use client"

import { useState } from "react"
import EnhancedLoginScreen from "../../components/enhanced-login-form"
import GameScreen from "../../components/game-screen"
import DiceRollScreen from "../../components/dice-roll-screen"
import type { GameState } from "../../types/game-types"
import { useGameMaster } from "../../hooks/use-game-master"
import GameMaster from "../../components/game-master"

export default function EnhancedGamePage() {
  const { commentary, isLoading, getCommentary } = useGameMaster()

  // Initialize game state
  const [gameState, setGameState] = useState<GameState>({
    currentPlayer: {
      name: "",
      team: null,
    },
    currentRound: 1,
    totalRounds: 10,
    topics: [
      "London",
      "https://???.conducttr.app/MEL",
      "Conference date",
      "Last week's security word",
      "Company Results Date",
      "King's birthday - 2025",
      "Design District",
      "Cybersecurity",
      "Team Building",
      "Future Technology",
    ],
    teams: {
      1: {
        name: "Ruby Team",
        responses: [],
        color: "team-1",
        players: 0,
        points: 0,
        matches: 0,
        hasMatches: false,
        diceRoll: null,
      },
      2: {
        name: "Coral Team",
        responses: [],
        color: "team-2",
        players: 0,
        matches: 0,
        points: 0,
        hasMatches: false,
        diceRoll: null,
      },
      3: {
        name: "Crimson Team",
        responses: [],
        color: "team-3",
        players: 0,
        points: 0,
        matches: 0,
        hasMatches: false,
        diceRoll: null,
      },
      4: {
        name: "Scarlet Team",
        responses: [],
        color: "team-4",
        players: 0,
        points: 0,
        matches: 0,
        hasMatches: false,
        diceRoll: null,
      },
    },
    simulatedPlayers: [
      { name: "Alex", team: 1 },
      { name: "Jamie", team: 1 },
      { name: "Taylor", team: 1 },
      { name: "Jordan", team: 2 },
      { name: "Casey", team: 2 },
      { name: "Riley", team: 2 },
      { name: "Morgan", team: 3 },
      { name: "Quinn", team: 3 },
      { name: "Avery", team: 3 },
      { name: "Sam", team: 4 },
      { name: "Drew", team: 4 },
      { name: "Blake", team: 4 },
    ],
    simulatedResponses: {
      London: ["Big Ben", "Queen", "Thames", "Red Bus", "Rain", "Tea", "Tower Bridge"],
      "https://???.conducttr.app/MEL": ["Link", "Website", "URL", "MEL", "Conducttr", "App", "Portal"],
      "Conference date": ["June 15", "May 2025", "Next month", "October", "September 10", "December", "Q3"],
      "Last week's security word": ["Firewall", "Secure", "Password", "Protect", "Shield", "Guard", "Sentinel"],
      "Company Results Date": ["Q4", "End of year", "December", "January", "Next quarter", "Fiscal year end", "Q2"],
      "King's birthday - 2025": ["May", "June", "April", "Royal", "Holiday", "Celebration", "Charles"],
      "Design District": ["Creative", "Art", "Innovation", "Hub", "Center", "Studios", "Gallery"],
      Cybersecurity: ["Firewall", "Hacker", "Encryption", "Password", "Protection", "Virus", "Breach"],
      "Team Building": ["Collaboration", "Trust", "Activities", "Retreat", "Workshop", "Games", "Communication"],
      "Future Technology": ["AI", "Robots", "Quantum", "Virtual Reality", "Blockchain", "Automation", "Space"],
    },
    timer: {
      duration: 10,
      remaining: 10,
      interval: null,
    },
    eligibleTeams: [],
    roundWinners: [],
    winner: null,
    currentScreen: "login" as "login" | "game" | "diceRoll",
    connectedPlayers: [],
  })

  // Initialize team counts
  useState(() => {
    const updatedTeams = { ...gameState.teams }

    // Distribute simulated players
    gameState.simulatedPlayers.forEach((player) => {
      updatedTeams[player.team].players++
    })

    setGameState((prevState) => ({
      ...prevState,
      teams: updatedTeams,
    }))
  })

  const handleJoinGame = (playerName: string, teamId: number) => {
    const updatedTeams = { ...gameState.teams }
    updatedTeams[teamId].players++

    setGameState((prevState) => ({
      ...prevState,
      currentPlayer: {
        name: playerName,
        team: teamId,
      },
      teams: updatedTeams,
      currentScreen: "game",
      connectedPlayers: [...prevState.connectedPlayers, { playerName, teamId }],
    }))

    setTimeout(() => {
      getCommentary(gameState, "round-start")
    }, 1000)
  }

  const handleSubmitAnswer = (answer: string) => {
    // Implementation omitted for brevity
    console.log(`Answer submitted: ${answer}`)
  }

  const handleNextRound = () => {
    // Implementation omitted for brevity
    console.log("Next round")
  }

  const handleRollDice = (teamId: number) => {
    const roll = Math.floor(Math.random() * 6) + 1
    return roll
  }

  const handleDetermineWinner = (winningTeamId: number) => {
    setGameState((prevState) => ({
      ...prevState,
      winner: winningTeamId,
    }))

    setTimeout(() => {
      getCommentary(gameState, "winner")
    }, 1000)
  }

  const handlePlayAgain = () => {
    window.location.reload()
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-md">
        {gameState.currentScreen === "login" && (
          <EnhancedLoginScreen teams={gameState.teams} onJoinGame={handleJoinGame} />
        )}

        {gameState.currentScreen === "game" && (
          <GameScreen gameState={gameState} onSubmitAnswer={handleSubmitAnswer} onNextRound={handleNextRound} />
        )}

        {gameState.currentScreen === "diceRoll" && (
          <DiceRollScreen
            gameState={gameState}
            onRollDice={handleRollDice}
            onDetermineWinner={handleDetermineWinner}
            onPlayAgain={handlePlayAgain}
          />
        )}

        <GameMaster commentary={commentary} isLoading={isLoading} />
      </div>
    </main>
  )
}
