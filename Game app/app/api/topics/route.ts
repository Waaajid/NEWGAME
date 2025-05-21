import { type NextRequest, NextResponse } from "next/server"

// This route handler is not cached by default in Next.js 15
export async function GET(request: NextRequest) {
  const topics = [
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
  ]

  // You can use the unstable_after API to execute code after the response is sent
  const { unstable_after } = NextResponse

  const response = NextResponse.json({ topics })

  // Execute code after the response is sent
  unstable_after(() => {
    console.log("Topics were fetched at:", new Date().toISOString())
  })

  return response
}
