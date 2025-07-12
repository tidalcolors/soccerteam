'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardStats {
  teamsCount: number
  hasAttributes: boolean
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    teamsCount: 0,
    hasAttributes: false
  })
  const [loading, setLoading] = useState(true)
  const [showCreateGroupForm, setShowCreateGroupForm] = useState(false)
  const [groupFormData, setGroupFormData] = useState({
    name: '',
    description: ''
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    // Allow guest access - don't redirect if not signed in
    fetchDashboardData()
  }, [session, status])

  const fetchDashboardData = async () => {
    try {
      // We'll implement these APIs later
      setStats({
        teamsCount: 0,
        hasAttributes: false
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

const handleCreateGroup = async (e: React.FormEvent) => {
  e.preventDefault()
  setCreating(true)

  try {
    const response = await fetch('/api/player-groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupFormData)
    })

    if (response.ok) {
      const newGroup = await response.json()
      alert(`Group "${groupFormData.name}" created successfully!`)
      setShowCreateGroupForm(false)
      setGroupFormData({ name: '', description: '' })
      
      // Redirect to the specific group's player management page
      router.push(`/players/${newGroup.id}`)
    } else {
      const error = await response.json()
      alert(error.error || 'Failed to create group')
    }
  } catch (error) {
    console.error('Failed to create group:', error)
    alert('Failed to create group')
  } finally {
    setCreating(false)
  }
}

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
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
                <Link href="/matches" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md">
                  Matches
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <span className="text-gray-700">Hello, {session.user.name}</span>
                  <button
                    onClick={() => signOut()}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Sign In (Optional)
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Soccer Team Manager ⚽
          </h1>
          <p className="text-gray-600 mt-2">
            Create fair and balanced teams for your weekly soccer matches.
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold mb-2">1. Add Players</h3>
              <p className="text-sm opacity-90">Define your group with player attributes and positions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚽</div>
              <h3 className="font-semibold mb-2">2. Create Match</h3>
              <p className="text-sm opacity-90">Select even number of players for fair teams</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold mb-2">3. Get Balanced Teams</h3>
              <p className="text-sm opacity-90">See 3 different fair team scenarios</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">👥</span>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Player Groups</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.teamsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">⚽</span>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Total Players</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">🏆</span>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Matches Created</p>
                <p className="text-2xl font-semibold text-gray-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🚀 Quick Start
            </h3>
            <p className="text-gray-600 mb-4">
              Start by creating your first player group and adding players.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateGroupForm(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                Create Group
              </button>
              <Link 
                href="/players"
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Manage Players
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              ⚽ Create Match
            </h3>
            <p className="text-gray-600 mb-4">
              Select players and generate balanced teams for your next game.
            </p>
            <Link 
              href="/matches/create"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 inline-block"
            >
              Create Match
            </Link>
          </div>
        </div>

        {/* Guest Mode Info */}
        {!session && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              💡 Guest Mode
            </h3>
            <p className="text-blue-700 mb-4">
              You're using Soccer Team Manager in guest mode. Your data will be temporary. 
              Sign up for a free account to save your player groups and match history.
            </p>
            <Link 
              href="/auth/signup"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 inline-block"
            >
              Create Free Account
            </Link>
          </div>
        )}
      </main>

      {/* Create Group Modal */}
      {showCreateGroupForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Player Group</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  value={groupFormData.name}
                  onChange={(e) => setGroupFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-green-500"
                  placeholder="e.g., Wednesday Soccer Group"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={groupFormData.description}
                  onChange={(e) => setGroupFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-green-500"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateGroupForm(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}