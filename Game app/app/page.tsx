import TeamSyncGame from "../components/team-sync-game"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-md">
        <div className="mb-4 text-center">
          <Link
            href="/enhanced"
            className="inline-block bg-gradient-to-r from-red-500 to-red-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:from-red-600 hover:to-red-900 transition-colors"
          >
            Try Next.js 15 Enhanced Version
          </Link>
        </div>
        <TeamSyncGame />
      </div>
    </main>
  )
}
