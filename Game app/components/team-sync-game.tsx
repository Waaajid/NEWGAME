"use client"

import { useState, useEffect } from "react"
import LoginScreen from "./login-screen"
import GameScreen from "./game-screen"
import DiceRollScreen from "./dice-roll-screen"
import type { Team, GameState } from "../types/game-types"
import { createConfetti, showNotification } from "../utils/game-utils"
import { useSocket } from "../hooks/use-socket"
import { useGameMaster } from "../hooks/use-game-master"
import GameMaster from "./game-master"
import { submitAnswer, completeRound } from "../app/actions/game-actions"

export default function TeamSyncGame() {
  const { socket, isConnected } = useSocket()
  const { commentary, isLoading, getCommentary } = useGameMaster()

  // Update the initial state with new topics and roundWinners array
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
        points: 0,
        matches: 0,
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

  useEffect(() => {
    // Initialize team counts
    initializeTeamCounts()
  }, [])

  useEffect(() => {
    if (!socket || !isConnected) return

    // Listen for player join events
    socket.on("player-joined", (data) => {
      setGameState((prevState) => {
        const updatedTeams = { ...prevState.teams }
        updatedTeams[data.teamId].players++

        return {
          ...prevState,
          teams: updatedTeams,
          connectedPlayers: [...prevState.connectedPlayers, data],
        }
      })

      showNotification(`${data.playerName} joined ${gameState.teams[data.teamId].name}!`, "info")
    })

    // Listen for team selection events
    socket.on("team-selected", (data) => {
      setGameState((prevState) => {
        const updatedTeams = { ...prevState.teams }

        // If player was already on a team, decrement that team's count
        if (data.previousTeam) {
          updatedTeams[data.previousTeam].players--
        }

        // Increment the new team's count
        updatedTeams[data.teamId].players++

        return {
          ...prevState,
          teams: updatedTeams,
        }
      })
    })

    // Listen for answer submission events
    socket.on("answer-submitted", (data) => {
      setGameState((prevState) => {
        const updatedTeams = { ...prevState.teams }

        // Add the player's response
        updatedTeams[data.teamId].responses.push({
          player: data.playerName,
          answer: data.answer,
        })

        return {
          ...prevState,
          teams: updatedTeams,
        }
      })
    })

    // Listen for round completion events
    socket.on("round-completed", (data) => {
      setGameState((prevState) => {
        const updatedTeams = { ...prevState.teams }

        // Reset responses for next round
        Object.values(updatedTeams).forEach((team) => {
          team.responses = []
        })

        return {
          ...prevState,
          currentRound: data.nextRound,
          teams: updatedTeams,
          roundWinners: data.roundWinners,
        }
      })

      showNotification(`Round ${data.nextRound} starting! Topic: ${gameState.topics[data.nextRound - 1]}`, "info")
    })

    // Listen for dice roll events
    socket.on("dice-rolled", (data) => {
      setGameState((prevState) => {
        const updatedTeams = { ...prevState.teams }
        updatedTeams[data.teamId].diceRoll = data.roll

        return {
          ...prevState,
          teams: updatedTeams,
        }
      })
    })

    // Listen for game reset events
    socket.on("game-reset", () => {
      window.location.reload()
    })

    return () => {
      socket.off("player-joined")
      socket.off("team-selected")
      socket.off("answer-submitted")
      socket.off("round-completed")
      socket.off("dice-rolled")
      socket.off("game-reset")
    }
  }, [socket, isConnected, gameState.teams, gameState.topics])

  const initializeTeamCounts = () => {
    const updatedTeams = { ...gameState.teams }

    // Distribute simulated players
    gameState.simulatedPlayers.forEach((player) => {
      updatedTeams[player.team].players++
    })

    setGameState((prevState) => ({
      ...prevState,
      teams: updatedTeams,
    }))
  }

  const handleJoinGame = (playerName: string, teamId: number) => {
    const updatedTeams = { ...gameState.teams }
    updatedTeams[teamId].players++

    // Emit player join event to all connected clients
    if (socket && isConnected) {
      socket.emit("player-join", {
        playerName,
        teamId,
      })
    }

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

    showNotification(`Welcome to Team Sync, ${playerName}! You joined ${updatedTeams[teamId].name}`, "success")

    setTimeout(() => {
      triggerGameMasterCommentary("round-start")
    }, 1000)
  }

  const handleTeamSelect = (teamId: number) => {
    if (!gameState.currentPlayer.team) return

    const previousTeam = gameState.currentPlayer.team

    // Emit team selection event to all connected clients
    if (socket && isConnected) {
      socket.emit("team-select", {
        playerName: gameState.currentPlayer.name,
        teamId,
        previousTeam,
      })
    }

    const updatedTeams = { ...gameState.teams }
    updatedTeams[previousTeam].players--
    updatedTeams[teamId].players++

    setGameState((prevState) => ({
      ...prevState,
      currentPlayer: {
        ...prevState.currentPlayer,
        team: teamId,
      },
      teams: updatedTeams,
    }))
  }

  const handleSubmitAnswer = async (answer: string) => {
    const teamId = gameState.currentPlayer.team!
    const updatedTeams = { ...gameState.teams }

    // Add player's response if there's an answer
    if (answer.trim()) {
      // Call the server action
      const result = await submitAnswer(teamId, gameState.currentPlayer.name, answer)

      if (result.success) {
        updatedTeams[teamId].responses.push({
          player: gameState.currentPlayer.name,
          answer: answer,
        })

        // Emit answer submission event to all connected clients
        if (socket && isConnected) {
          socket.emit("answer-submit", {
            playerName: gameState.currentPlayer.name,
            teamId,
            answer,
          })
        }
      }
    }

    // Add simulated responses
    addSimulatedResponses(updatedTeams)

    // Find matching answers
    findMatchingAnswers(updatedTeams)

    setGameState((prevState) => ({
      ...prevState,
      teams: updatedTeams,
    }))

    const hasMatches = Object.values(updatedTeams).some((team) => team.hasMatches)
    if (hasMatches) {
      triggerGameMasterCommentary("match-found")
    }

    if (answer.trim()) {
      showNotification("Answer submitted successfully!", "success")
    }
  }

  const addSimulatedResponses = (teams: Record<number, Team>) => {
    const currentTopic = gameState.topics[gameState.currentRound - 1]
    const possibleResponses = gameState.simulatedResponses[currentTopic]

    gameState.simulatedPlayers.forEach((player) => {
      // Skip if player is in the same team as current player
      if (player.team === gameState.currentPlayer.team) {
        return
      }

      // 50% chance to match with another player in the same team
      let answer
      if (Math.random() < 0.5) {
        // Find existing team responses
        const teamResponses = teams[player.team].responses
        if (teamResponses.length > 0) {
          answer = teamResponses[Math.floor(Math.random() * teamResponses.length)].answer
        } else {
          answer = possibleResponses[Math.floor(Math.random() * possibleResponses.length)]
        }
      } else {
        answer = possibleResponses[Math.floor(Math.random() * possibleResponses.length)]
      }

      teams[player.team].responses.push({
        player: player.name,
        answer: answer,
      })
    })
  }

  // Update the findMatchingAnswers function to track round winners
  const findMatchingAnswers = (teams: Record<number, Team>) => {
    const matchingAnswers: Record<number, { answer: string; count: number }[]> = {}
    let highestMatches = 0
    let roundWinners: number[] = []

    // Count answers by team
    for (let teamId = 1; teamId <= 4; teamId++) {
      const answers: Record<string, number> = {}
      let teamMatches = 0

      teams[teamId].responses.forEach((response) => {
        const answer = response.answer.toLowerCase()
        if (!answers[answer]) {
          answers[answer] = 1
        } else {
          answers[answer]++
        }
      })

      // Find answers with 3+ matches
      for (const answer in answers) {
        if (answers[answer] >= 3) {
          if (!matchingAnswers[teamId]) {
            matchingAnswers[teamId] = []
          }
          matchingAnswers[teamId].push({
            answer: answer,
            count: answers[answer],
          })

          // Add points based on matches
          teamMatches += answers[answer]

          // Mark team as having matches
          teams[teamId].hasMatches = true
        }
      }

      // Update team matches
      teams[teamId].matches = teamMatches

      // Add points for this round
      if (matchingAnswers[teamId]) {
        teams[teamId].points += matchingAnswers[teamId].length * 10
      }

      // Track team with highest matches for this round
      if (teamMatches > highestMatches) {
        highestMatches = teamMatches
        roundWinners = [teamId]
      } else if (teamMatches === highestMatches && teamMatches > 0) {
        roundWinners.push(teamId)
      }
    }

    // Update round winners
    if (roundWinners.length > 0) {
      setGameState((prevState) => ({
        ...prevState,
        roundWinners: [...prevState.roundWinners, ...roundWinners],
      }))
    }
  }

  // Update the handleNextRound function to prepare for dice roll with round winners
  const handleNextRound = async () => {
    const nextRound = gameState.currentRound + 1

    if (nextRound > gameState.totalRounds) {
      triggerGameMasterCommentary("dice-roll")
      // Use round winners as eligible teams
      const uniqueWinners = [...new Set(gameState.roundWinners)]

      setGameState((prevState) => ({
        ...prevState,
        eligibleTeams: uniqueWinners.length > 0 ? uniqueWinners : [],
        currentScreen: "diceRoll",
      }))

      return
    }

    // Reset for next round
    const updatedTeams = { ...gameState.teams }
    Object.values(updatedTeams).forEach((team) => {
      team.responses = []
    })

    // Call the server action
    await completeRound(gameState.currentRound, nextRound, gameState.roundWinners)

    // Emit round completion event to all connected clients
    if (socket && isConnected) {
      socket.emit("round-complete", {
        nextRound,
        roundWinners: gameState.roundWinners,
      })
    }

    setGameState((prevState) => ({
      ...prevState,
      currentRound: nextRound,
      teams: updatedTeams,
    }))

    showNotification(`Round ${nextRound} starting! Topic: ${gameState.topics[nextRound - 1]}`, "info")

    setTimeout(() => {
      triggerGameMasterCommentary("round-start")
    }, 1000)
  }

  const handleRollDice = (teamId: number) => {
    const roll = Math.floor(Math.random() * 6) + 1
    const updatedTeams = { ...gameState.teams }
    updatedTeams[teamId].diceRoll = roll

    // Emit dice roll event to all connected clients
    if (socket && isConnected) {
      socket.emit("dice-roll", {
        teamId,
        roll,
      })
    }

    setGameState((prevState) => ({
      ...prevState,
      teams: updatedTeams,
    }))

    return roll
  }

  const handleDetermineWinner = (winningTeamId: number) => {
    setGameState((prevState) => ({
      ...prevState,
      winner: winningTeamId,
    }))

    createConfetti(200)

    setTimeout(() => {
      triggerGameMasterCommentary("winner")
    }, 1000)
  }

  const handlePlayAgain = () => {
    // Emit game reset event to all connected clients
    if (socket && isConnected) {
      socket.emit("game-reset")
    }

    window.location.reload()
  }

  // Format date function without using date-fns
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const triggerGameMasterCommentary = async (
    type: "round-start" | "round-end" | "match-found" | "dice-roll" | "winner",
  ) => {
    await getCommentary(gameState, type)
  }

  return (
    <>
      {isConnected && (
        <div className="fixed top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">Live</div>
      )}

      {gameState.currentScreen === "login" && <LoginScreen teams={gameState.teams} onJoinGame={handleJoinGame} />}

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
    </>
  )
}
