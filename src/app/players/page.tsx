'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface PlayerGroup {
  id: string
  name: string
  description?: string
  players?: Array<{
    id: string
    name: string
    primaryPosition: string
    technical: number
    mental: number
    physical: number
  }>
  _count?: {
    players: number
    matches: number
  }
  createdAt: string
}

export default function PlayersPage() {
  const [playerGroups, setPlayerGroups] = useState<PlayerGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newGroupData, setNewGroupData] = useState({
    name: '',
    description: ''
  })
  const [creating, setCreating] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchPlayerGroups()
  }, [])

  const fetchPlayerGroups = async () => {
    try {
      const response = await fetch('/api/player-groups')
      if (response.ok) {
        const data = await response.json()
        setPlayerGroups(data)
      } else {
        console.error('Failed to fetch player groups')
      }
    } catch (error) {
      console.error('Failed to fetch player groups:', error)
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
        body: JSON.stringify(newGroupData)
      })

      if (response.ok) {
        const newGroup = await response.json()
        setPlayerGroups(prev => [newGroup, ...prev])
        setShowCreateForm(false)
        setNewGroupData({ name: '', description: '' })
        alert(`Group "${newGroup.name}" created successfully!`)
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

  const handleDeleteGroup = async (groupId: string) => {
    setDeleting(true)

    try {
      const response = await fetch(`/api/player-groups/${groupId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPlayerGroups(prev => prev.filter(group => group.id !== groupId))
        setDeleteConfirm(null)
        alert('Group deleted successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete group')
      }
    } catch (error) {
      console.error('Failed to delete group:', error)
      alert('Failed to delete group')
    } finally {
      setDeleting(false)
    }
  }

  const confirmDelete = (groupId: string, groupName: string) => {
    setDeleteConfirm(groupId)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading player groups...</p>
        </div>
      </div>
    )
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
                <Link href="/players" className="text-green-600 font-medium px-3 py-2 rounded-md">
                  Players
                </Link>
                <Link href="/matches" className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md">
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
            <h1 className="text-3xl font-bold text-gray-900">Player Groups</h1>
            <p className="text-gray-600 mt-2">
              Manage your soccer player groups and their attributes.
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
          >
            <span className="mr-2">+</span>
            Create New Group
          </button>
        </div>

        {/* Create Group Modal */}
        {showCreateForm && (
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
                    value={newGroupData.name}
                    onChange={(e) => setNewGroupData(prev => ({ ...prev, name: e.target.value }))}
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
                    value={newGroupData.description}
                    onChange={(e) => setNewGroupData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-green-500"
                    rows={3}
                    placeholder="Optional description..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
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

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-red-700">Delete Player Group</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this group? This action cannot be undone and will also delete all players in the group.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteGroup(deleteConfirm)}
                  disabled={deleting}
                  className="flex-1 py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Player Groups List */}
        {playerGroups.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Player Groups Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first player group to start managing players and creating balanced teams.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600"
            >
              Create Your First Group
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {playerGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm text-gray-500">
                        <div>{group._count?.players || (group.players?.length || 0)} players</div>
                        <div>{group._count?.matches || 0} matches</div>
                      </div>
                      <button
                        onClick={() => confirmDelete(group.id, group.name)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Delete group"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {group.description && (
                    <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                  )}

                  {/* Recent Players Preview */}
                  {group.players && group.players.length > 0 ? (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Players:</h4>
                      <div className="space-y-1">
                        {group.players.slice(0, 3).map((player) => (
                          <div key={player.id} className="flex justify-between items-center text-sm">
                            <span className="font-medium">{player.name}</span>
                            <span className="text-xs text-gray-500">
                              {Math.round((player.technical + player.mental + player.physical) / 3)}
                            </span>
                          </div>
                        ))}
                        {group.players.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{group.players.length - 3} more players
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 text-center py-4 bg-gray-50 rounded">
                      <div className="text-gray-400 text-sm">No players yet</div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        console.log('Navigating to:', `/players/${group.id}`)
                        window.location.href = `/players/${group.id}`
                      }}
                      className="flex-1 bg-blue-500 text-white text-center py-2 px-4 rounded-md hover:bg-blue-600 text-sm"
                    >
                      Manage Players
                    </button>
                    <Link
                      href={`/matches/create?groupId=${group.id}`}
                      className="flex-1 bg-green-500 text-white text-center py-2 px-4 rounded-md hover:bg-green-600 text-sm"
                    >
                      Create Match
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}