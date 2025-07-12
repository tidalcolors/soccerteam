'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface PlayerGroup {
  id: string
  name: string
  description?: string
  _count?: {
    players: number
    matches: number
  }
}

export default function MatchesPage() {
  const [playerGroups, setPlayerGroups] = useState<PlayerGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlayerGroups()
  }, [])

  const fetchPlayerGroups = async () => {
    try {
      const response = await fetch('/api/player-groups')
      if (response.ok) {
        const data = await response.json()
        setPlayerGroups(data)
      }
    } catch (error) {
      console.error('Error fetching player groups:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-green-600">
                ⚽ Soccer Team Manager
              </Link>
              <div className="ml-8 flex space-x-4">
                <Link href="/dashboard" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md">
                  Dashboard
                </Link>
                <Link href="/players" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md">
                  Players
                </Link>
                <Link href="/matches" className="text-green-600 font-medium px-3 py-2 rounded-md">
                  Matches
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Match Center</h1>
            <p className="text-gray-600 mt-2">
              Create balanced teams for fair and competitive matches.
            </p>
          </div>
          <Link
            href="/matches/create"
            className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 flex items-center"
          >
            <span className="mr-2">⚽</span>
            Create New Match
          </Link>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">🏆 Intelligent Team Balancing</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-2">Smart Algorithm</h3>
              <p className="text-sm opacity-90">Advanced balancing considers player attributes, positions, and team chemistry</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚖️</div>
              <h3 className="font-semibold mb-2">3 Scenarios</h3>
              <p className="text-sm opacity-90">Get 3 different balanced team options to choose from</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🏟️</div>
              <h3 className="font-semibold mb-2">Formation View</h3>
              <p className="text-sm opacity-90">See teams arranged in tactical formations on the field</p>
            </div>
          </div>
        </div>

        {/* Quick Create Options */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🚀 Quick Start</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p>Loading player groups...</p>
            </div>
          ) : playerGroups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Player Groups</h3>
              <p className="text-gray-600 mb-6">
                Create a player group first to start making matches.
              </p>
              <Link 
                href="/players"
                className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
              >
                Create Player Group
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playerGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{group.name}</h4>
                    <div className="text-sm text-gray-500">
                      {group._count?.players || 0} players
                    </div>
                  </div>
                  
                  {group.description && (
                    <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                  )}

                  <div className="flex gap-3">
                    <Link
                      href={`/matches/create?groupId=${group.id}`}
                      className="flex-1 bg-green-500 text-white text-center py-2 px-4 rounded-md hover:bg-green-600 text-sm"
                    >
                      Create Match
                    </Link>
                    <Link
                      href={`/players/${group.id}`}
                      className="flex-1 bg-gray-500 text-white text-center py-2 px-4 rounded-md hover:bg-gray-600 text-sm"
                    >
                      Manage Players
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow p-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">🔥 Balancing Features</h3>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">⚡ Smart Algorithm</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Balances overall player ratings
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Considers Technical, Mental, Physical attributes
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Ensures positional variety in each team
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                  Optimizes for competitive fairness
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">📊 Balance Metrics</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Balance Score (0-100%)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Attribute difference analysis
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Formation compatibility
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  Team strength comparison
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Pro Tip</h4>
            <p className="text-blue-700 text-sm">
              For best results, ensure you have players in different positions (defenders, midfielders, forwards) 
              and try to have at least 8-16 players for more balanced team options.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}