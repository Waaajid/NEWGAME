export interface Player {
  name: string
  team: number | null
}

export interface ConnectedPlayer {
  playerName: string
  teamId: number
}

export interface Response {
  player: string
  answer: string
}

export interface Team {
  name: string
  responses: Response[]
  color: string
  players: number
  points: number
  matches: number
  hasMatches: boolean
  diceRoll: number | null
}

export interface Timer {
  duration: number
  remaining: number
  interval: NodeJS.Timeout | null
}

export type SimulatedResponse = Record<string, string[]>

export interface GameState {
  currentPlayer: Player
  currentRound: number
  totalRounds: number
  topics: string[]
  teams: Record<number, Team>
  simulatedPlayers: { name: string; team: number }[]
  simulatedResponses: Record<string, string[]>
  timer: Timer
  eligibleTeams: number[]
  roundWinners: number[]
  winner: number | null
  currentScreen: "login" | "game" | "diceRoll"
  connectedPlayers: ConnectedPlayer[]
}

export type CommentaryType = "round-start" | "round-end" | "match-found" | "dice-roll" | "winner"
