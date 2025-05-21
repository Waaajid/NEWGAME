export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      // Import and register your Node.js instrumentation libraries
      const { registerGameEvents } = await import("./lib/instrumentation/game-events")
      registerGameEvents()
    } catch (error) {
      console.error("Failed to register instrumentation:", error)
    }
  }
}
