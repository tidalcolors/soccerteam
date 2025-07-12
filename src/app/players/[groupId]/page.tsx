'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface PositionOption {
  value: string
  label: string
}

// Categorized soccer positions for better organization
const POSITION_CATEGORIES: Record<string, PositionOption[]> = {
  goalkeeper: [
    { value: 'GK', label: 'Goalkeeper' }
  ],
  defensive: [
    { value: 'SW', label: 'Sweeper' },
    { value: 'LB', label: 'Left Back' },
    { value: 'LCB', label: 'Left Center Back' },
    { value: 'CB', label: 'Center Back' },
    { value: 'RCB', label: 'Right Center Back' },
    { value: 'RB', label: 'Right Back' },
    { value: 'LWB', label: 'Left Wing Back' },
    { value: 'RWB', label: 'Right Wing Back' }
  ],
  midfield: [
    { value: 'CDM', label: 'Central Defensive Midfielder' },
    { value: 'LM', label: 'Left Midfielder' },
    { value: 'LCM', label: 'Left Central Midfielder' },
    { value: 'CM', label: 'Central Midfielder' },
    { value: 'RCM', label: 'Right Central Midfielder' },
    { value: 'RM', label: 'Right Midfielder' },
    { value: 'CAM', label: 'Central Attacking Midfielder' }
  ],
  forward: [
    { value: 'LW', label: 'Left Winger' },
    { value: 'RW', label: 'Right Winger' },
    { value: 'SS', label: 'Second Striker' },
    { value: 'CF', label: 'Centre Forward' },
    { value: 'ST', label: 'Striker' }
  ]
}

// All positions for primary position dropdown
const ALL_POSITIONS: PositionOption[] = [
  ...POSITION_CATEGORIES.goalkeeper,
  ...POSITION_CATEGORIES.defensive,
  ...POSITION_CATEGORIES.midfield,
  ...POSITION_CATEGORIES.forward
]

// Detailed attributes structure
const DETAILED_ATTRIBUTES = {
  technical: [
    { key: 'corners', label: 'Corners' },
    { key: 'crossing', label: 'Crossing' },
    { key: 'dribbling', label: 'Dribbling' },
    { key: 'finishing', label: 'Finishing' },
    { key: 'firstTouch', label: 'First Touch' },
    { key: 'freeKickTaking', label: 'Free Kick Taking' },
    { key: 'heading', label: 'Heading' },
    { key: 'longShots', label: 'Long Shots' },
    { key: 'longThrows', label: 'Long Throws' },
    { key: 'marking', label: 'Marking' },
    { key: 'passing', label: 'Passing' },
    { key: 'penaltyTaking', label: 'Penalty Taking' },
    { key: 'tackling', label: 'Tackling' },
    { key: 'technique', label: 'Technique' }
  ],
  mental: [
    { key: 'aggression', label: 'Aggression' },
    { key: 'anticipation', label: 'Anticipation' },
    { key: 'bravery', label: 'Bravery' },
    { key: 'composure', label: 'Composure' },
    { key: 'concentration', label: 'Concentration' },
    { key: 'decisions', label: 'Decisions' },
    { key: 'determination', label: 'Determination' },
    { key: 'flair', label: 'Flair' },
    { key: 'leadership', label: 'Leadership' },
    { key: 'offTheBall', label: 'Off the Ball' },
    { key: 'positioning', label: 'Positioning' },
    { key: 'teamwork', label: 'Teamwork' },
    { key: 'vision', label: 'Vision' },
    { key: 'workRate', label: 'Work Rate' }
  ],
  physical: [
    { key: 'acceleration', label: 'Acceleration' },
    { key: 'agility', label: 'Agility' },
    { key: 'balance', label: 'Balance' },
    { key: 'jumpingReach', label: 'Jumping Reach' },
    { key: 'naturalFitness', label: 'Natural Fitness' },
    { key: 'pace', label: 'Pace' },
    { key: 'stamina', label: 'Stamina' },
    { key: 'strength', label: 'Strength' }
  ]
}

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
  // Include all detailed attributes as optional
  [key: string]: any
}

interface PlayerFormData {
  name: string
  technical: number
  mental: number
  physical: number
  primaryPosition: string
  secondaryPositions: string[]
  height: string
  weight: string
  age: string
  // Detailed attributes with defaults
  [key: string]: any
}

const createInitialDetailedAttributes = () => {
  const attributes: any = {}
  
  // Initialize all detailed attributes to 50
  DETAILED_ATTRIBUTES.technical.forEach(attr => attributes[attr.key] = 50)
  DETAILED_ATTRIBUTES.mental.forEach(attr => attributes[attr.key] = 50)
  DETAILED_ATTRIBUTES.physical.forEach(attr => attributes[attr.key] = 50)
  
  return attributes
}

const initialPlayerData: PlayerFormData = {
  name: '',
  technical: 50,
  mental: 50,
  physical: 50,
  primaryPosition: 'CM', // Changed from 'CENTER_MIDFIELDER'
  secondaryPositions: [],
  height: '',
  weight: '',
  age: '',
  ...createInitialDetailedAttributes()
}

export default function PlayerGroupDetail() {
  const params = useParams()
  const groupId = params.groupId as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)
  const [playerFormData, setPlayerFormData] = useState<PlayerFormData>(initialPlayerData)
  const [saving, setSaving] = useState(false)
  const [showDetailedAttributes, setShowDetailedAttributes] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)

  useEffect(() => {
    if (groupId) {
      fetchPlayers()
    }
  }, [groupId])

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`/api/players?groupId=${groupId}`)
      if (response.ok) {
        const data = await response.json()
        setPlayers(data)
      } else {
        console.error('Failed to fetch players')
      }
    } catch (error) {
      console.error('Error fetching players:', error)
    } finally {
      setLoading(false)
    }
  }

  // Download Sample Excel Template
  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true)
    try {
      const response = await fetch(`/api/players/template?groupId=${groupId}`, {
        method: 'GET',
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = 'soccer_players_template.xlsx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Failed to download template')
      }
    } catch (error) {
      console.error('Error downloading template:', error)
      alert('Failed to download template')
    } finally {
      setDownloadingTemplate(false)
    }
  }

  // Handle File Upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Please upload an Excel file (.xlsx or .xls)')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('groupId', groupId)

    try {
      const response = await fetch('/api/players/import', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        alert(`Successfully imported ${result.importedCount} players!`)
        await fetchPlayers() // Refresh the players list
        if (fileInputRef.current) {
          fileInputRef.current.value = '' // Clear the file input
        }
      } else {
        alert(`Import failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleOpenPlayerForm = (player?: Player) => {
    if (player) {
      setEditingPlayer(player)
      const formData = {
        name: player.name,
        technical: player.technical,
        mental: player.mental,
        physical: player.physical,
        primaryPosition: player.primaryPosition,
        secondaryPositions: player.secondaryPositions,
        height: player.height?.toString() || '',
        weight: player.weight?.toString() || '',
        age: player.age?.toString() || '',
        ...createInitialDetailedAttributes()
      }

      // Override with existing detailed attributes if they exist
      DETAILED_ATTRIBUTES.technical.forEach(attr => {
        if (player[attr.key] !== undefined) formData[attr.key] = player[attr.key]
      })
      DETAILED_ATTRIBUTES.mental.forEach(attr => {
        if (player[attr.key] !== undefined) formData[attr.key] = player[attr.key]
      })
      DETAILED_ATTRIBUTES.physical.forEach(attr => {
        if (player[attr.key] !== undefined) formData[attr.key] = player[attr.key]
      })

      setPlayerFormData(formData)
    } else {
      setEditingPlayer(null)
      setPlayerFormData({ ...initialPlayerData, ...createInitialDetailedAttributes() })
    }
    setShowPlayerForm(true)
    setShowDetailedAttributes(false)
  }

  const handleClosePlayerForm = () => {
    setShowPlayerForm(false)
    setEditingPlayer(null)
    setPlayerFormData({ ...initialPlayerData, ...createInitialDetailedAttributes() })
    setShowDetailedAttributes(false)
  }

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const playerData = {
        ...playerFormData,
        playerGroupId: groupId,
        height: playerFormData.height ? parseInt(playerFormData.height) : undefined,
        weight: playerFormData.weight ? parseInt(playerFormData.weight) : undefined,
        age: playerFormData.age ? parseInt(playerFormData.age) : undefined,
      }

      let response
      if (editingPlayer) {
        response = await fetch('/api/players', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingPlayer.id, ...playerData })
        })
      } else {
        response = await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playerData)
        })
      }

      if (response.ok) {
        await fetchPlayers()
        handleClosePlayerForm()
        alert(editingPlayer ? 'Player updated successfully!' : 'Player added successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save player')
      }
    } catch (error) {
      console.error('Error saving player:', error)
      alert('Failed to save player')
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (confirm(`Are you sure you want to delete ${playerName}?`)) {
      try {
        const response = await fetch(`/api/players?id=${playerId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await fetchPlayers()
          alert('Player deleted successfully!')
        } else {
          alert('Failed to delete player')
        }
      } catch (error) {
        console.error('Error deleting player:', error)
        alert('Failed to delete player')
      }
    }
  }

  const getPositionLabel = (position: string): string => {
    const pos = ALL_POSITIONS.find(p => p.value === position)
    return pos ? pos.label : position
  }

  const handleSecondaryPositionToggle = (position: string) => {
    setPlayerFormData(prev => ({
      ...prev,
      secondaryPositions: prev.secondaryPositions.includes(position)
        ? prev.secondaryPositions.filter(p => p !== position)
        : [...prev.secondaryPositions, position]
    }))
  }

  // Enhanced Attribute Slider Component with drag support and text input
  const AttributeSlider = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string
    value: number
    onChange: (value: number) => void
  }) => (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center space-x-3">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`
          }}
        />
        <input
          type="number"
          min="0"
          max="100"
          value={value}
          onChange={(e) => {
            const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
            onChange(val)
          }}
          className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:border-green-500 text-center"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  )

  // Detailed Attribute Component
  const DetailedAttributeSection = ({ 
    title, 
    attributes, 
    categoryKey 
  }: { 
    title: string
    attributes: any[]
    categoryKey: string
  }) => (
    <div className="mb-6">
      <h5 className="text-md font-medium text-gray-800 mb-4">{title}</h5>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attributes.map((attr) => (
          <AttributeSlider
            key={attr.key}
            label={attr.label}
            value={playerFormData[attr.key] || 50}
            onChange={(value) => setPlayerFormData(prev => ({ ...prev, [attr.key]: value }))}
          />
        ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading players...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add custom CSS for slider styling */}
      <style jsx global>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>

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
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <Link href="/players" className="hover:text-gray-700">Players</Link>
            <span className="mx-2">→</span>
            <span>Group Players</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manage Players</h1>
              <p className="text-gray-600 mt-1">
                {players.length} players in this group
              </p>
            </div>
            <div className="flex gap-3">
              {/* Excel Import/Export Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadTemplate}
                  disabled={downloadingTemplate}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center text-sm disabled:bg-gray-400"
                >
                  {downloadingTemplate ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📥</span>
                      Download Template
                    </>
                  )}
                </button>
                
                <label className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 flex items-center text-sm cursor-pointer">
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📤</span>
                      Import Excel
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
              
              <button
                onClick={() => handleOpenPlayerForm()}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
              >
                <span className="mr-2">+</span>
                Add Player
              </button>
              <Link
                href={`/matches/create?groupId=${groupId}`}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                Create Match
              </Link>
            </div>
          </div>
        </div>

        {/* Instructions for Excel Import */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">📊 Excel Import Instructions</h3>
          <div className="text-sm text-blue-700">
            <p className="mb-2"><strong>Step 1:</strong> Click "Download Template" to get the Excel template</p>
            <p className="mb-2"><strong>Step 2:</strong> Fill in player information (Name and Primary Position are required)</p>
            <p><strong>Step 3:</strong> Click "Import Excel" to upload your completed file</p>
          </div>
        </div>

        {/* Players List */}
        {players.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">⚽</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Players Yet</h3>
            <p className="text-gray-600 mb-6">
              Add your first player manually or import from Excel.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleOpenPlayerForm()}
                className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600"
              >
                Add Your First Player
              </button>
              <button
                onClick={handleDownloadTemplate}
                className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
              >
                Download Excel Template
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attributes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overall
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Physical
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {players.map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{player.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getPositionLabel(player.primaryPosition)}</div>
                        {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                          <div className="text-xs text-gray-500">
                            +{player.secondaryPositions.length} other{player.secondaryPositions.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-3 text-xs">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            T: {player.technical}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            M: {player.mental}
                          </span>
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                            P: {player.physical}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {Math.round((player.technical + player.mental + player.physical) / 3)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {player.age && <div>Age: {player.age}</div>}
                          {player.height && <div>{player.height}cm</div>}
                          {player.weight && <div>{player.weight}kg</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenPlayerForm(player)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePlayer(player.id, player.name)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enhanced Player Form Modal */}
        {showPlayerForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {editingPlayer ? 'Edit Player' : 'Add New Player'}
                </h3>
                <button
                  onClick={handleClosePlayerForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <form onSubmit={handleSavePlayer}>
                {/* Basic Info */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-4">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Player Name *
                      </label>
                      <input
                        type="text"
                        value={playerFormData.name}
                        onChange={(e) => setPlayerFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Primary Position *
                      </label>
                      <select
                        value={playerFormData.primaryPosition}
                        onChange={(e) => setPlayerFormData(prev => ({ ...prev, primaryPosition: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-green-500"
                        required
                      >
                        {ALL_POSITIONS.map((position) => (
                          <option key={position.value} value={position.value}>
                            {position.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age
                      </label>
                      <input
                        type="number"
                        value={playerFormData.age}
                        onChange={(e) => setPlayerFormData(prev => ({ ...prev, age: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-green-500"
                        min="16"
                        max="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        value={playerFormData.height}
                        onChange={(e) => setPlayerFormData(prev => ({ ...prev, height: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-green-500"
                        min="150"
                        max="220"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={playerFormData.weight}
                        onChange={(e) => setPlayerFormData(prev => ({ ...prev, weight: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-green-500"
                        min="50"
                        max="120"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Attributes - REQUIRED */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-4">Summary Attributes * (Required)</h4>
                  <div className="grid md:grid-cols-3 gap-6">
                    <AttributeSlider
                      label="Technical"
                      value={playerFormData.technical}
                      onChange={(value) => setPlayerFormData(prev => ({ ...prev, technical: value }))}
                    />
                    <AttributeSlider
                      label="Mental"
                      value={playerFormData.mental}
                      onChange={(value) => setPlayerFormData(prev => ({ ...prev, mental: value }))}
                    />
                    <AttributeSlider
                      label="Physical"
                      value={playerFormData.physical}
                      onChange={(value) => setPlayerFormData(prev => ({ ...prev, physical: value }))}
                    />
                  </div>
                </div>

                {/* Detailed Attributes Toggle */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium">Detailed Attributes (Optional)</h4>
                    <button
                      type="button"
                      onClick={() => setShowDetailedAttributes(!showDetailedAttributes)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-sm"
                    >
                      {showDetailedAttributes ? 'Hide Detailed' : 'Show Detailed'}
                    </button>
                  </div>
                  
                  {showDetailedAttributes && (
                    <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                      <DetailedAttributeSection
                        title="⚽ Technical Attributes"
                        attributes={DETAILED_ATTRIBUTES.technical}
                        categoryKey="technical"
                      />
                      
                      <DetailedAttributeSection
                        title="🧠 Mental Attributes"
                        attributes={DETAILED_ATTRIBUTES.mental}
                        categoryKey="mental"
                      />
                      
                      <DetailedAttributeSection
                        title="💪 Physical Attributes"
                        attributes={DETAILED_ATTRIBUTES.physical}
                        categoryKey="physical"
                      />
                    </div>
                  )}
                </div>

                {/* Enhanced Secondary Positions with Categories */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-4">Secondary Positions (Optional)</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Defensive Positions */}
                    <div>
                      <h5 className="font-medium text-blue-700 mb-3 flex items-center">
                        🛡️ Defensive
                      </h5>
                      <div className="space-y-2">
                        {POSITION_CATEGORIES.defensive
                          .filter((p: PositionOption) => p.value !== playerFormData.primaryPosition)
                          .map((position: PositionOption) => (
                          <label key={position.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={playerFormData.secondaryPositions.includes(position.value)}
                              onChange={() => handleSecondaryPositionToggle(position.value)}
                              className="mr-2 text-blue-600"
                            />
                            <span className="text-sm">{position.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Midfield Positions */}
                    <div>
                      <h5 className="font-medium text-green-700 mb-3 flex items-center">
                        ⚽ Midfield
                      </h5>
                      <div className="space-y-2">
                        {POSITION_CATEGORIES.midfield
                          .filter((p: PositionOption) => p.value !== playerFormData.primaryPosition)
                          .map((position: PositionOption) => (
                          <label key={position.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={playerFormData.secondaryPositions.includes(position.value)}
                              onChange={() => handleSecondaryPositionToggle(position.value)}
                              className="mr-2 text-green-600"
                            />
                            <span className="text-sm">{position.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Forward Positions */}
                    <div>
                      <h5 className="font-medium text-red-700 mb-3 flex items-center">
                        🔥 Forward
                      </h5>
                      <div className="space-y-2">
                        {POSITION_CATEGORIES.forward
                          .filter((p: PositionOption) => p.value !== playerFormData.primaryPosition)
                          .map((position: PositionOption) => (
                          <label key={position.value} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={playerFormData.secondaryPositions.includes(position.value)}
                              onChange={() => handleSecondaryPositionToggle(position.value)}
                              className="mr-2 text-red-600"
                            />
                            <span className="text-sm">{position.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleClosePlayerForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400"
                  >
                    {saving ? 'Saving...' : (editingPlayer ? 'Update Player' : 'Add Player')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}