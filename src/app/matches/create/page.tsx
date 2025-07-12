'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import EnhancedFootballField from '@/components/EnhancedFootballField'

interface Player {
  id: string
  name: string
  technical: number
  mental: number
  physical: number
  primaryPosition: string
  secondaryPositions: string[]
  height?: number
  weight?: number
  age?: number
  overall: number
}

interface PlayerGroup {
  id: string
  name: string
  description?: string
}

interface BalancedTeam {
  players: Player[]
  formation: string
  totalRating: number
  technicalAvg: number
  mentalAvg: number
  physicalAvg: number
  positions: { [position: string]: Player[] }
}

interface TeamScenario {
  id: number
  teamA: BalancedTeam
  teamB: BalancedTeam
  balanceScore: number
}

export default function CreateMatch() {
  const searchParams = useSearchParams()
  const groupId = searchParams.get('groupId')

  const [playerGroups, setPlayerGroups] = useState<PlayerGroup[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groupId || '')
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [teamScenarios, setTeamScenarios] = useState<TeamScenario[]>([])
  const [activeScenario, setActiveScenario] = useState<number>(0)
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

  useEffect(() => {
    fetchPlayerGroups()
  }, [])

  useEffect(() => {
    if (selectedGroupId) {
      fetchPlayers(selectedGroupId)
    }
  }, [selectedGroupId])

  const fetchPlayerGroups = async () => {
    try {
      const response = await fetch('/api/player-groups')
      if (response.ok) {
        const data = await response.json()
        setPlayerGroups(data)
      }
    } catch (error) {
      console.error('Error fetching player groups:', error)
    }
  }

  const fetchPlayers = async (groupId: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/players?groupId=${groupId}`)
      if (response.ok) {
        const data = await response.json()
        const playersWithOverall = data.map((player: any) => ({
          ...player,
          overall: Math.round((player.technical + player.mental + player.physical) / 3)
        }))
        setAvailablePlayers(playersWithOverall)
      }
    } catch (error) {
      console.error('Error fetching players:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePlayerSelection = (player: Player) => {
    setSelectedPlayers(prev => {
      const isSelected = prev.find(p => p.id === player.id)
      if (isSelected) {
        return prev.filter(p => p.id !== player.id)
      } else {
        return [...prev, player]
      }
    })
  }

  const selectAllPlayers = () => {
    if (selectedPlayers.length === availablePlayers.length) {
      setSelectedPlayers([])
    } else {
      setSelectedPlayers([...availablePlayers])
    }
  }

  const generateBalancedTeams = async () => {
    if (selectedPlayers.length < 2 || selectedPlayers.length % 2 !== 0) {
      alert('Please select an even number of players (minimum 2)')
      return
    }

    setGenerating(true)
    try {
      const response = await fetch('/api/teams/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          players: selectedPlayers,
          groupId: selectedGroupId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTeamScenarios(data.scenarios)
        setActiveScenario(0)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to generate teams')
      }
    } catch (error) {
      console.error('Error generating teams:', error)
      alert('Failed to generate teams')
    } finally {
      setGenerating(false)
    }
  }

const getPositionLabel = (position: string): string => {
  const labels: Record<string, string> = {
    'GK': 'GK',
    'SW': 'SW',
    'LB': 'LB',
    'LCB': 'LCB',
    'CB': 'CB',
    'RCB': 'RCB',
    'RB': 'RB',
    'LWB': 'LWB',
    'RWB': 'RWB',
    'CDM': 'CDM',
    'LM': 'LM',
    'LCM': 'LCM',
    'CM': 'CM',
    'RCM': 'RCM',
    'RM': 'RM',
    'CAM': 'CAM',
    'LW': 'LW',
    'RW': 'RW',
    'SS': 'SS',
    'CF': 'CF',
    'ST': 'ST'
  }
  return labels[position] || position
}

const getPositionColor = (position: string): string => {
  if (position === 'GK') return 'bg-yellow-100 text-yellow-800'
  if (['SW', 'LB', 'LCB', 'CB', 'RCB', 'RB', 'LWB', 'RWB'].includes(position)) return 'bg-blue-100 text-blue-800'
  if (['CDM', 'LM', 'LCM', 'CM', 'RCM', 'RM', 'CAM'].includes(position)) return 'bg-green-100 text-green-800'
  if (['LW', 'RW', 'SS', 'CF', 'ST'].includes(position)) return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
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
        <div className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Link href="/matches" className="hover:text-gray-700">Matches</Link>
            <span className="mx-2">→</span>
            <span>Create Match</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Balanced Teams</h1>
          <p className="text-gray-600 mt-2">
            Select players and generate 3 different balanced team scenarios.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Player Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">🎯 Select Players</h3>
              
              {/* Group Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Player Group
                </label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-green-500"
                >
                  <option value="">Select a player group...</option>
                  {playerGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Player List */}
              {selectedGroupId && (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm text-gray-600">
                      {selectedPlayers.length} of {availablePlayers.length} players selected
                      {selectedPlayers.length > 0 && selectedPlayers.length % 2 !== 0 && (
                        <span className="text-red-500 ml-2">(Select even number)</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllPlayers}
                        className="text-sm bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                      >
                        {selectedPlayers.length === availablePlayers.length ? 'Deselect All' : 'Select All'}
                      </button>
                      <button
                        onClick={generateBalancedTeams}
                        disabled={selectedPlayers.length < 2 || selectedPlayers.length % 2 !== 0 || generating}
                        className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-600 disabled:bg-gray-400 text-sm"
                      >
                        {generating ? 'Generating...' : 'Generate Teams'}
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                      <p>Loading players...</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {availablePlayers.map((player) => {
                        const isSelected = selectedPlayers.find(p => p.id === player.id)
                        return (
                          <div
                            key={player.id}
                            onClick={() => togglePlayerSelection(player)}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="font-medium text-sm">{player.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-1 rounded text-xs ${getPositionColor(player.primaryPosition)}`}>
                                    {getPositionLabel(player.primaryPosition)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Overall: {player.overall}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs space-y-1">
                                  <div className="text-blue-600">T:{player.technical}</div>
                                  <div className="text-purple-600">M:{player.mental}</div>
                                  <div className="text-green-600">P:{player.physical}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Team Scenarios */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">⚽ Team Scenarios</h3>
              
              {teamScenarios.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🏆</div>
                  <p className="text-sm">Select players and generate teams to see balanced scenarios here.</p>
                </div>
              ) : (
                <>
                  {/* Scenario Tabs */}
                  <div className="flex space-x-2 mb-4">
                    {teamScenarios.map((scenario, index) => (
                      <button
                        key={scenario.id}
                        onClick={() => setActiveScenario(index)}
                        className={`px-3 py-2 rounded text-sm font-medium ${
                          activeScenario === index
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Scenario {scenario.id}
                      </button>
                    ))}
                  </div>

                  {/* Active Scenario Display */}
                  {teamScenarios[activeScenario] && (
                    <div className="space-y-4">
                      {/* Balance Score */}
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <div className="text-sm font-medium text-green-800">
                          Balance Score: {teamScenarios[activeScenario].balanceScore.toFixed(1)}%
                        </div>
                        <div className="text-xs text-green-600">
                          Higher is more balanced
                        </div>
                      </div>

                      {/* Team A */}
                      <div className="border border-blue-200 rounded p-3">
                        <h4 className="font-medium text-blue-800 mb-2">🔵 Team A</h4>
                        <div className="text-xs space-y-1 mb-3">
                          <div>Overall: {teamScenarios[activeScenario].teamA.totalRating.toFixed(1)}</div>
                          <div className="flex space-x-4">
                            <span>T: {teamScenarios[activeScenario].teamA.technicalAvg.toFixed(1)}</span>
                            <span>M: {teamScenarios[activeScenario].teamA.mentalAvg.toFixed(1)}</span>
                            <span>P: {teamScenarios[activeScenario].teamA.physicalAvg.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {teamScenarios[activeScenario].teamA.players.map((player) => (
                            <div key={player.id} className="flex justify-between items-center text-sm">
                              <span>{player.name}</span>
                              <span className={`px-2 py-1 rounded text-xs ${getPositionColor(player.primaryPosition)}`}>
                                {getPositionLabel(player.primaryPosition)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Team B */}
                      <div className="border border-red-200 rounded p-3">
                        <h4 className="font-medium text-red-800 mb-2">🔴 Team B</h4>
                        <div className="text-xs space-y-1 mb-3">
                          <div>Overall: {teamScenarios[activeScenario].teamB.totalRating.toFixed(1)}</div>
                          <div className="flex space-x-4">
                            <span>T: {teamScenarios[activeScenario].teamB.technicalAvg.toFixed(1)}</span>
                            <span>M: {teamScenarios[activeScenario].teamB.mentalAvg.toFixed(1)}</span>
                            <span>P: {teamScenarios[activeScenario].teamB.physicalAvg.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {teamScenarios[activeScenario].teamB.players.map((player) => (
                            <div key={player.id} className="flex justify-between items-center text-sm">
                              <span>{player.name}</span>
                              <span className={`px-2 py-1 rounded text-xs ${getPositionColor(player.primaryPosition)}`}>
                                {getPositionLabel(player.primaryPosition)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Football Field Visualization */}
        {teamScenarios.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">🏟️ Team Formation - Scenario {teamScenarios[activeScenario].id}</h3>
              <div className="text-sm text-gray-600">
                Balance Score: <span className="font-semibold text-green-600">{teamScenarios[activeScenario].balanceScore.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Team A Field */}
              <div>
                <h4 className="font-medium text-blue-800 mb-4 text-center">🔵 Team A - Rating: {teamScenarios[activeScenario].teamA.totalRating.toFixed(1)}</h4>
                <EnhancedFootballField 
                  team={teamScenarios[activeScenario].teamA.players}
                  isTeamA={true}
                  onPlayerClick={setSelectedPlayer}
                  onPlayerMove={(playerId: string, newPosition: number) => {
                    console.log(`Player ${playerId} moved to grid square ${newPosition}`)
                    // You can implement additional logic here to save formations
                  }}
                />
              </div>

              {/* Team B Field */}
              <div>
                <h4 className="font-medium text-red-800 mb-4 text-center">🔴 Team B - Rating: {teamScenarios[activeScenario].teamB.totalRating.toFixed(1)}</h4>
                <EnhancedFootballField 
                  team={teamScenarios[activeScenario].teamB.players}
                  isTeamA={false}
                  onPlayerClick={setSelectedPlayer}
                  onPlayerMove={(playerId: string, newPosition: number) => {
                    console.log(`Player ${playerId} moved to grid square ${newPosition}`)
                    // You can implement additional logic here to save formations
                  }}
                />
              </div>
            </div>

            {/* Player Details Modal */}
            {selectedPlayer && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{selectedPlayer.name}</h3>
                    <button
                      onClick={() => setSelectedPlayer(null)}
                      className="text-gray-400 hover:text-gray-600 text-xl"
                    >
                      ×
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Position:</span>
                      <span className={`px-2 py-1 rounded text-xs ${getPositionColor(selectedPlayer.primaryPosition)}`}>
                        {selectedPlayer.primaryPosition.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overall Rating:</span>
                      <span className="font-bold">{selectedPlayer.overall}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-blue-600 font-semibold">{selectedPlayer.technical}</div>
                        <div className="text-xs text-gray-500">Technical</div>
                      </div>
                      <div>
                        <div className="text-purple-600 font-semibold">{selectedPlayer.mental}</div>
                        <div className="text-xs text-gray-500">Mental</div>
                      </div>
                      <div>
                        <div className="text-green-600 font-semibold">{selectedPlayer.physical}</div>
                        <div className="text-xs text-gray-500">Physical</div>
                      </div>
                    </div>
                    {(selectedPlayer.age || selectedPlayer.height || selectedPlayer.weight) && (
                      <div className="border-t pt-3">
                        <div className="grid grid-cols-3 gap-4 text-center text-sm">
                          {selectedPlayer.age && (
                            <div>
                              <div className="font-semibold">{selectedPlayer.age}</div>
                              <div className="text-xs text-gray-500">Age</div>
                            </div>
                          )}
                          {selectedPlayer.height && (
                            <div>
                              <div className="font-semibold">{selectedPlayer.height}cm</div>
                              <div className="text-xs text-gray-500">Height</div>
                            </div>
                          )}
                          {selectedPlayer.weight && (
                            <div>
                              <div className="font-semibold">{selectedPlayer.weight}kg</div>
                              <div className="text-xs text-gray-500">Weight</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Comparison */}
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded p-4">
                <h5 className="font-medium mb-2">Overall Rating</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Team A:</span>
                    <span className="font-medium">{teamScenarios[activeScenario].teamA.totalRating.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Team B:</span>
                    <span className="font-medium">{teamScenarios[activeScenario].teamB.totalRating.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Difference:</span>
                    <span className="font-medium">
                      {Math.abs(teamScenarios[activeScenario].teamA.totalRating - teamScenarios[activeScenario].teamB.totalRating).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-4">
                <h5 className="font-medium mb-2">Technical</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Team A:</span>
                    <span className="font-medium">{teamScenarios[activeScenario].teamA.technicalAvg.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Team B:</span>
                    <span className="font-medium">{teamScenarios[activeScenario].teamB.technicalAvg.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Difference:</span>
                    <span className="font-medium">
                      {Math.abs(teamScenarios[activeScenario].teamA.technicalAvg - teamScenarios[activeScenario].teamB.technicalAvg).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-4">
                <h5 className="font-medium mb-2">Physical</h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Team A:</span>
                    <span className="font-medium">{teamScenarios[activeScenario].teamA.physicalAvg.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Team B:</span>
                    <span className="font-medium">{teamScenarios[activeScenario].teamB.physicalAvg.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Difference:</span>
                    <span className="font-medium">
                      {Math.abs(teamScenarios[activeScenario].teamA.physicalAvg - teamScenarios[activeScenario].teamB.physicalAvg).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}