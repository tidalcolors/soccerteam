import React, { useState, useRef, useCallback } from 'react'

// Type definitions
interface Position {
  x: number // 0-100 percentage
  y: number // 0-100 percentage
}

interface Player {
  id: string
  name: string
  technical: number
  mental: number
  physical: number
  primaryPosition: string
  secondaryPositions: string[]
  overall: number
}

interface DraggablePlayerProps {
  player: Player
  position: Position
  jerseyNumber: number
  isTeamA: boolean
  onPlayerMove?: (playerId: string, newPosition: Position) => void
  isDragging: boolean
  setIsDragging: (isDragging: boolean) => void
}

interface EnhancedFootballFieldProps {
  team: Player[]
  isTeamA: boolean
  onPlayerMove?: (playerId: string, newPosition: Position) => void
}

// Exact position coordinates - FIXED by user
const EXACT_POSITIONS: Record<string, Position> = {
  'GK': { x: 51, y: 95 }, // Fixed GK position
  'SW': { x: 51, y: 89 },
  'LB': { x: 18, y: 72 },
  'LCB': { x: 35, y: 78 },
  'CB': { x: 51, y: 80 },
  'RCB': { x: 67, y: 78 },
  'RB': { x: 84, y: 72 },
  'LWB': { x: 18, y: 68 },
  'CDM': { x: 51, y: 68 },
  'RWB': { x: 84, y: 68 },
  'LM': { x: 18, y: 55 },
  'LCM': { x: 35, y: 55 },
  'CM': { x: 51, y: 50 },
  'RCM': { x: 67, y: 55 },
  'RM': { x: 84, y: 55 },
  'LW': { x: 18, y: 40 },
  'CAM': { x: 51, y: 40 },
  'RW': { x: 84, y: 40 },
  'SS': { x: 51, y: 20 },
  'CF': { x: 35, y: 18 },
  'ST': { x: 67, y: 18 }
}

// Get jersey number for position - improved logic
const getJerseyNumber = (position: string, usedNumbers: Set<number>): number => {
  // Primary assignments
  const primaryNumbers: Record<string, number> = {
    'GK': 1,
    'RWB': 2,
    'LWB': 3,
    'RCB': 4,
    'RB': 4,
    'CM': 5,
    'LCB': 6,
    'LB': 6,
    'RM': 7,
    'RW': 7,
    'RCM': 8,
    'SS': 9,
    'LCM': 10,
    'LM': 11,
    'LW': 11
  }
  
  // Secondary assignments (fallbacks)
  const secondaryNumbers: Record<string, number[]> = {
    'CM': [5, 10], // CM can be 5 or 10
    'LCM': [10, 5], // LCM prefers 10, fallback to 5
    'RCM': [8, 10], // RCM prefers 8, fallback to 10
    'RCB': [4, 6], // RCB prefers 4, fallback to 6
    'RB': [4, 2], // RB prefers 4, fallback to 2
    'LCB': [6, 4], // LCB prefers 6, fallback to 4
    'LB': [6, 3], // LB prefers 6, fallback to 3
    'RM': [7, 8], // RM prefers 7, fallback to 8
    'RW': [7, 11], // RW prefers 7, fallback to 11
    'LM': [11, 10], // LM prefers 11, fallback to 10
    'LW': [11, 7] // LW prefers 11, fallback to 7
  }
  
  // Try primary number first
  const primary = primaryNumbers[position]
  if (primary && !usedNumbers.has(primary)) {
    return primary
  }
  
  // Try secondary numbers
  const secondaries = secondaryNumbers[position]
  if (secondaries) {
    for (const num of secondaries) {
      if (!usedNumbers.has(num)) {
        return num
      }
    }
  }
  
  // Find any available number from 1-99
  for (let i = 1; i <= 99; i++) {
    if (!usedNumbers.has(i)) {
      return i
    }
  }
  return 99 // ultimate fallback
}

// Formation templates based on team size - corrected according to user specifications
const getFormationTemplate = (teamSize: number): string[] => {
  const formations: Record<number, string[]> = {
    1: ['GK'],
    2: ['GK', 'CB'],
    3: ['GK', 'CB', 'CM'],
    4: ['GK', 'LB', 'RB', 'CM'],
    5: ['GK', 'LB', 'CB', 'RB', 'CM'],
    6: ['GK', 'LB', 'RB', 'LW', 'RW', 'SS'], // 2-2-1
    7: ['GK', 'LB', 'RB', 'CM', 'LW', 'RW', 'SS'], // 2-3-1
    8: ['GK', 'LB', 'CB', 'RB', 'CM', 'LW', 'RW', 'SS'], // 3-3-1
    9: ['GK', 'LB', 'CB', 'RB', 'CM', 'LW', 'RW', 'SS', 'ST'], // 3-3-2
    10: ['GK', 'LB', 'CB', 'RB', 'LCM', 'RCM', 'LW', 'RW', 'SS', 'ST'], // 3-4-2
    11: ['GK', 'LB', 'LCB', 'RCB', 'RB', 'CM', 'LW', 'RW', 'CAM', 'SS', 'ST'], // 4-4-2 style
    12: ['GK', 'LB', 'LCB', 'RCB', 'RB', 'LCM', 'RCM', 'LW', 'RW', 'CAM', 'SS', 'ST'],
    13: ['GK', 'LB', 'LCB', 'CB', 'RCB', 'RB', 'LCM', 'RCM', 'LW', 'RW', 'CAM', 'SS', 'ST'],
    14: ['GK', 'LB', 'LCB', 'CB', 'RCB', 'RB', 'CDM', 'LCM', 'RCM', 'LW', 'RW', 'CAM', 'SS', 'ST'],
    15: ['GK', 'LB', 'LCB', 'CB', 'RCB', 'RB', 'CDM', 'LCM', 'CM', 'RCM', 'LW', 'RW', 'CAM', 'SS', 'ST']
  }
  
  return formations[Math.min(teamSize, 15)] || formations[11]
}

// Position categories for Football Manager-style algorithm
const POSITION_CATEGORIES = {
  forward: ['SS', 'ST', 'CF'],
  midfield: ['LM', 'LCM', 'CM', 'RCM', 'RM', 'CAM', 'LW', 'RW'],
  defense: ['LB', 'LCB', 'CB', 'RCB', 'RB', 'SW', 'CDM', 'RWB', 'LWB'],
  goalkeeper: ['GK']
}

// Player priority lists for each position type (Football Manager style)
const PLAYER_PRIORITIES = {
  forward: [
    ['SS', 'ST', 'CF'], // Primary: Natural forwards
    ['CAM', 'RW', 'LW'], // Secondary: Attacking midfielders/wingers
    ['LM', 'LCM', 'CM', 'RCM', 'RM'], // Tertiary: Central midfielders
    [] // Fallback: Any remaining player
  ],
  midfield: [
    ['LM', 'LCM', 'CM', 'RCM', 'RM'], // Primary: Natural midfielders
    ['CAM', 'RW', 'LW'], // Secondary: Attacking midfielders/wingers
    ['SS', 'CF', 'ST'], // Tertiary: Forwards who can drop back
    [] // Fallback: Any remaining player
  ],
  defense: [
    ['LB', 'LCB', 'CB', 'RCB', 'RB', 'SW', 'CDM', 'RWB', 'LWB'], // Primary: Natural defenders
    ['LM', 'LCM', 'CM', 'RCM', 'RM'], // Secondary: Midfielders who can defend
    ['LW', 'CAM', 'RW'], // Tertiary: Wingers who can track back
    [] // Fallback: Any remaining player
  ]
}

// Get best player for a position category using priority system
const getBestPlayerForCategory = (
  categoryType: 'forward' | 'midfield' | 'defense',
  availablePlayers: Player[]
): Player | null => {
  if (availablePlayers.length === 0) return null
  
  const priorities = PLAYER_PRIORITIES[categoryType]
  
  // Go through priority levels
  for (const priorityLevel of priorities) {
    if (priorityLevel.length === 0) {
      // Fallback: return best overall player
      return availablePlayers.reduce((best, current) => {
        const bestScore = best.technical + best.mental + best.physical
        const currentScore = current.technical + current.mental + current.physical
        return currentScore > bestScore ? current : best
      })
    }
    
    // Find players in this priority level
    const playersInLevel = availablePlayers.filter(p => 
      priorityLevel.includes(p.primaryPosition) || 
      p.secondaryPositions.some(pos => priorityLevel.includes(pos))
    )
    
    if (playersInLevel.length > 0) {
      // Return best player from this priority level
      return playersInLevel.reduce((best, current) => {
        // Prefer primary position match
        const bestPrimaryMatch = priorityLevel.includes(best.primaryPosition)
        const currentPrimaryMatch = priorityLevel.includes(current.primaryPosition)
        
        if (currentPrimaryMatch && !bestPrimaryMatch) return current
        if (bestPrimaryMatch && !currentPrimaryMatch) return best
        
        // If same priority level, use overall rating
        const bestScore = best.technical + best.mental + best.physical
        const currentScore = current.technical + current.mental + current.physical
        return currentScore > bestScore ? current : best
      })
    }
  }
  
  return availablePlayers[0] // Ultimate fallback
}

// Football Manager-style assignment algorithm
const assignPlayerPositions = (team: Player[]): { positions: Record<string, Position>, jerseys: Record<string, number> } => {
  const positions: Record<string, Position> = {}
  const jerseys: Record<string, number> = {}
  const usedNumbers = new Set<number>()
  
  // Get formation template for team size
  const formationPositions = getFormationTemplate(team.length)
  let availablePlayers = [...team]
  
  // Categorize formation positions
  const formationByCategory = {
    forward: formationPositions.filter(pos => POSITION_CATEGORIES.forward.includes(pos)),
    midfield: formationPositions.filter(pos => POSITION_CATEGORIES.midfield.includes(pos)),
    defense: formationPositions.filter(pos => POSITION_CATEGORIES.defense.includes(pos)),
    goalkeeper: formationPositions.filter(pos => POSITION_CATEGORIES.goalkeeper.includes(pos))
  }
  
  console.log('Formation breakdown:', formationByCategory)
  
  // STEP 1: Place forwards first
  for (const forwardPosition of formationByCategory.forward) {
    const bestPlayer = getBestPlayerForCategory('forward', availablePlayers)
    if (bestPlayer) {
      positions[bestPlayer.id] = EXACT_POSITIONS[forwardPosition]
      jerseys[bestPlayer.id] = getJerseyNumber(forwardPosition, usedNumbers)
      usedNumbers.add(jerseys[bestPlayer.id])
      availablePlayers = availablePlayers.filter(p => p.id !== bestPlayer.id)
      console.log(`Forward: Assigned ${bestPlayer.name} (${bestPlayer.primaryPosition}) to ${forwardPosition}`)
    }
  }
  
  // STEP 2: Place midfielders second
  for (const midfieldPosition of formationByCategory.midfield) {
    const bestPlayer = getBestPlayerForCategory('midfield', availablePlayers)
    if (bestPlayer) {
      positions[bestPlayer.id] = EXACT_POSITIONS[midfieldPosition]
      jerseys[bestPlayer.id] = getJerseyNumber(midfieldPosition, usedNumbers)
      usedNumbers.add(jerseys[bestPlayer.id])
      availablePlayers = availablePlayers.filter(p => p.id !== bestPlayer.id)
      console.log(`Midfield: Assigned ${bestPlayer.name} (${bestPlayer.primaryPosition}) to ${midfieldPosition}`)
    }
  }
  
  // STEP 3: Place defenders third
  for (const defensePosition of formationByCategory.defense) {
    const bestPlayer = getBestPlayerForCategory('defense', availablePlayers)
    if (bestPlayer) {
      positions[bestPlayer.id] = EXACT_POSITIONS[defensePosition]
      jerseys[bestPlayer.id] = getJerseyNumber(defensePosition, usedNumbers)
      usedNumbers.add(jerseys[bestPlayer.id])
      availablePlayers = availablePlayers.filter(p => p.id !== bestPlayer.id)
      console.log(`Defense: Assigned ${bestPlayer.name} (${bestPlayer.primaryPosition}) to ${defensePosition}`)
    }
  }
  
  // STEP 4: Place goalkeeper last
  for (const gkPosition of formationByCategory.goalkeeper) {
    // Find best goalkeeper
    const goalkeepers = availablePlayers.filter(p => p.primaryPosition === 'GK')
    const bestGK = goalkeepers.length > 0 
      ? goalkeepers.reduce((best, current) => current.mental > best.mental ? current : best)
      : availablePlayers.reduce((best, current) => current.mental > best.mental ? current : best)
    
    if (bestGK) {
      positions[bestGK.id] = EXACT_POSITIONS[gkPosition]
      jerseys[bestGK.id] = getJerseyNumber(gkPosition, usedNumbers)
      usedNumbers.add(jerseys[bestGK.id])
      availablePlayers = availablePlayers.filter(p => p.id !== bestGK.id)
      console.log(`Goalkeeper: Assigned ${bestGK.name} (${bestGK.primaryPosition}) to ${gkPosition}`)
    }
  }
  
  // Handle any remaining players (shouldn't happen)
  for (const remainingPlayer of availablePlayers) {
    console.warn(`Warning: Player ${remainingPlayer.name} could not be assigned`)
    positions[remainingPlayer.id] = { x: 51, y: 55 }
    jerseys[remainingPlayer.id] = getJerseyNumber('CM', usedNumbers)
    usedNumbers.add(jerseys[remainingPlayer.id])
  }
  
  return { positions, jerseys }
}

const DraggablePlayer: React.FC<DraggablePlayerProps> = ({ 
  player, 
  position, 
  jerseyNumber,
  isTeamA, 
  onPlayerMove,
  isDragging,
  setIsDragging 
}) => {
  const playerRef = useRef<HTMLDivElement>(null)
  const [currentPosition, setCurrentPosition] = useState<Position>(position)
  const dragRef = useRef<{
    isDragging: boolean
    hasActuallyMoved: boolean
    startMouseX: number
    startMouseY: number
    fieldRect: DOMRect | null
  }>({
    isDragging: false,
    hasActuallyMoved: false,
    startMouseX: 0,
    startMouseY: 0,
    fieldRect: null
  })

  const jerseyColor = isTeamA ? 'bg-blue-500' : 'bg-red-500'
  const jerseyColorHover = isTeamA ? 'hover:bg-blue-600' : 'hover:bg-red-600'
  const firstName = player.name.split(' ')[0]

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!playerRef.current) return
    
    const fieldElement = playerRef.current.closest('.football-field') as HTMLElement
    if (!fieldElement) return

    const fieldRect = fieldElement.getBoundingClientRect()
    
    dragRef.current = {
      isDragging: true,
      hasActuallyMoved: false,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      fieldRect: fieldRect
    }
    
    setIsDragging(true)
    
    // Add event listeners directly to document for immediate response
    document.addEventListener('mousemove', handleMouseMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp, { passive: false })
    
    // Prevent text selection and other default behaviors
    document.body.style.userSelect = 'none'
    document.body.style.pointerEvents = 'none'
    if (playerRef.current) {
      playerRef.current.style.pointerEvents = 'auto'
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current.isDragging || !dragRef.current.fieldRect || !playerRef.current) return
    
    // Check if mouse has actually moved (minimum threshold to prevent accidental micro-movements)
    const deltaX = Math.abs(e.clientX - dragRef.current.startMouseX)
    const deltaY = Math.abs(e.clientY - dragRef.current.startMouseY)
    const minMovement = 3 // pixels
    
    if (!dragRef.current.hasActuallyMoved && (deltaX < minMovement && deltaY < minMovement)) {
      return // Don't move until mouse actually moves
    }
    
    // Mark that we've actually moved
    dragRef.current.hasActuallyMoved = true
    
    // DIRECT DOM manipulation - like paint apps!
    const fieldRect = dragRef.current.fieldRect
    const x = ((e.clientX - fieldRect.left) / fieldRect.width) * 100
    const y = ((e.clientY - fieldRect.top) / fieldRect.height) * 100
    
    // Constrain to boundaries
    const constrainedX = Math.max(2, Math.min(98, x))
    const constrainedY = Math.max(2, Math.min(98, y))
    
    // Update DOM directly - NO REACT STATE during drag!
    playerRef.current.style.left = `${constrainedX}%`
    playerRef.current.style.top = `${constrainedY}%`
  }

  const handleMouseUp = (e: MouseEvent) => {
    if (!dragRef.current.isDragging || !dragRef.current.fieldRect || !playerRef.current) return
    
    // Only update position if we actually moved
    if (dragRef.current.hasActuallyMoved) {
      // Calculate final position
      const fieldRect = dragRef.current.fieldRect
      const x = ((e.clientX - fieldRect.left) / fieldRect.width) * 100
      const y = ((e.clientY - fieldRect.top) / fieldRect.height) * 100
      
      const finalPosition = {
        x: Math.max(2, Math.min(98, x)),
        y: Math.max(2, Math.min(98, y))
      }
      
      // Update React state only once at the end
      setCurrentPosition(finalPosition)
      
      // Notify parent
      if (onPlayerMove) {
        onPlayerMove(player.id, finalPosition)
      }
    }
    
    // Clean up
    dragRef.current.isDragging = false
    dragRef.current.hasActuallyMoved = false
    setIsDragging(false)
    
    // Remove event listeners
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    
    // Restore document styles
    document.body.style.userSelect = ''
    document.body.style.pointerEvents = ''
  }

  // Update position when prop changes (for external updates)
  React.useEffect(() => {
    if (!dragRef.current.isDragging) {
      setCurrentPosition(position)
    }
  }, [position])

  return (
    <div 
      ref={playerRef}
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move select-none ${isDragging ? 'z-50 scale-110' : 'z-10 hover:scale-105'} transition-transform duration-150`}
      style={{ 
        left: `${currentPosition.x}%`, 
        top: `${currentPosition.y}%`
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Player Jersey Circle with all info inside */}
      <div className={`w-16 h-16 ${jerseyColor} ${jerseyColorHover} rounded-full flex flex-col items-center justify-center text-white font-bold shadow-xl border-2 border-white ring-2 ring-black/20 relative overflow-hidden`}>
        {/* Jersey Number - top */}
        <div className="text-xs leading-tight">#{jerseyNumber}</div>
        {/* Player Name - middle - truncate if too long */}
        <div className="text-xs leading-tight font-semibold truncate max-w-full px-1">{firstName}</div>
        {/* Position - bottom */}
        <div className="text-xs leading-tight">{player.primaryPosition}</div>
      </div>
      
      {/* Drag indicator */}
      {isDragging && (
        <div className="absolute inset-0 rounded-full bg-white/30 animate-pulse scale-125 pointer-events-none"></div>
      )}
    </div>
  )
}

const EnhancedFootballField: React.FC<EnhancedFootballFieldProps> = ({ 
  team, 
  isTeamA, 
  onPlayerMove 
}) => {
  const [playerData, setPlayerData] = useState<{
    positions: Record<string, Position>
    jerseys: Record<string, number>
  }>(() => assignPlayerPositions(team))

  // Recalculate positions when team changes
  React.useEffect(() => {
    setPlayerData(assignPlayerPositions(team))
  }, [team])

  const [dragState, setDragState] = useState<{ isDragging: boolean; playerId: string | null }>({ 
    isDragging: false, 
    playerId: null 
  })

  const handlePlayerMove = (playerId: string, newPosition: Position) => {
    setPlayerData(prev => ({
      ...prev,
      positions: {
        ...prev.positions,
        [playerId]: newPosition
      }
    }))
    
    if (onPlayerMove) {
      onPlayerMove(playerId, newPosition)
    }
  }

  const setIsDragging = (isDragging: boolean, playerId: string | null = null) => {
    setDragState({ isDragging, playerId })
  }

  return (
    <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-xl football-field">
      {/* Football Field Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/football-field.png')`
        }}
      >
        <div className="absolute inset-0 bg-black/5"></div>
      </div>

      {/* Players */}
      {team.map((player) => {
        const position = playerData.positions[player.id] || { x: 50, y: 50 }
        const jerseyNumber = playerData.jerseys[player.id] || 99
        
        return (
          <DraggablePlayer
            key={player.id}
            player={player}
            position={position}
            jerseyNumber={jerseyNumber}
            isTeamA={isTeamA}
            onPlayerMove={handlePlayerMove}
            isDragging={dragState.isDragging && dragState.playerId === player.id}
            setIsDragging={(isDragging) => setIsDragging(isDragging, player.id)}
          />
        )
      })}

      {/* Team Name */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg border border-white/20">
        {isTeamA ? '🔵 Team A' : '🔴 Team B'}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-xs shadow-lg border border-white/20">
        🎯 Football Manager algorithm • Forwards → Midfield → Defense → GK
      </div>
    </div>
  )
}

export default EnhancedFootballField