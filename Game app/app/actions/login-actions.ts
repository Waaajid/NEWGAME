"use server"

export async function joinGame(prevState: any, formData: FormData) {
  const playerName = formData.get("playerName") as string
  const teamId = Number.parseInt(formData.get("teamId") as string)

  if (!playerName || !teamId) {
    return {
      error: !playerName ? "Please enter your name" : "Please select a team",
      success: false,
    }
  }

  // Simulate a delay to show loading state
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return {
    playerName,
    teamId,
    success: true,
  }
}
