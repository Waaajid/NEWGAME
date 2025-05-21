export function registerGameEvents() {
  // This is where you would register your instrumentation
  console.log("Game events instrumentation registered")

  // Example of tracking game events
  global.gameEvents = {
    trackRoundStart: (roundNumber: number, topic: string) => {
      console.log(`Round ${roundNumber} started with topic: ${topic}`)
      // Here you could send this data to an analytics service
    },
    trackAnswer: (teamId: number, playerName: string, answer: string) => {
      console.log(`Player ${playerName} from team ${teamId} answered: ${answer}`)
    },
    trackMatchFound: (teamId: number, answer: string, count: number) => {
      console.log(`Team ${teamId} found ${count} matches for answer: ${answer}`)
    },
    trackGameComplete: (winningTeam: number, rounds: number) => {
      console.log(`Game completed after ${rounds} rounds. Team ${winningTeam} won!`)
    },
  }
}

// Add TypeScript declaration
declare global {
  var gameEvents: {
    trackRoundStart: (roundNumber: number, topic: string) => void
    trackAnswer: (teamId: number, playerName: string, answer: string) => void
    trackMatchFound: (teamId: number, answer: string, count: number) => void
    trackGameComplete: (winningTeam: number, rounds: number) => void
  }
}
