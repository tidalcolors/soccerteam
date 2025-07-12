// REPLACE the entire content of src/app/api/teams/generate/route.ts with this:

import { NextResponse } from 'next/server'

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

interface PositionalRatings {
  defensive: number
  midfield: number
  attacking: number
}

interface TeamAnalysis {
  players: Player[]
  totalRating: number
  technicalAvg: number
  mentalAvg: number
  physicalAvg: number
  positionalRatings: PositionalRatings
  positionDistribution: {
    defensive: number
    midfield: number
    attacking: number
  }
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

// Position categories for balancing
const POSITION_CATEGORIES = {
  defensive: ['GK', 'SW', 'LB', 'LCB', 'CB', 'RCB', 'RB', 'LWB', 'RWB', 'CDM'],
  midfield: ['LM', 'LCM', 'CM', 'RCM', 'RM', 'CAM', 'LW', 'RW'],
  attacking: ['SS', 'CF', 'ST']
}

// Attribute weights by position type
const ATTRIBUTE_WEIGHTS = {
  defensive: { physical: 0.4, mental: 0.35, technical: 0.25 },
  midfield: { technical: 0.4, mental: 0.35, physical: 0.25 },
  attacking: { technical: 0.45, physical: 0.3, mental: 0.25 }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { players } = body

    if (!players || !Array.isArray(players)) {
      return NextResponse.json({ error: 'Players array is required' }, { status: 400 })
    }

    if (players.length < 2 || players.length % 2 !== 0) {
      return NextResponse.json({ error: 'Even number of players required (minimum 2)' }, { status: 400 })
    }

    // Generate advanced balanced team scenarios
    const scenarios = generateAdvancedBalancedTeams(players)

    return NextResponse.json({
      scenarios,
      totalPlayers: players.length,
      playersPerTeam: players.length / 2
    })

  } catch (error) {
    console.error('Team generation error:', error)
    return NextResponse.json({ error: 'Failed to generate teams' }, { status: 500 })
  }
}

// Get position category for a player
function getPositionCategory(player: Player): 'defensive' | 'midfield' | 'attacking' {
  if (POSITION_CATEGORIES.defensive.includes(player.primaryPosition)) return 'defensive'
  if (POSITION_CATEGORIES.midfield.includes(player.primaryPosition)) return 'midfield'
  if (POSITION_CATEGORIES.attacking.includes(player.primaryPosition)) return 'attacking'
  
  // Check secondary positions
  for (const pos of player.secondaryPositions) {
    if (POSITION_CATEGORIES.defensive.includes(pos)) return 'defensive'
    if (POSITION_CATEGORIES.midfield.includes(pos)) return 'midfield'
    if (POSITION_CATEGORIES.attacking.includes(pos)) return 'attacking'
  }
  
  return 'midfield' // Default fallback
}

// Calculate position-specific rating for a player
function getPositionalRating(player: Player, category: 'defensive' | 'midfield' | 'attacking'): number {
  const weights = ATTRIBUTE_WEIGHTS[category]
  return (
    player.technical * weights.technical +
    player.mental * weights.mental +
    player.physical * weights.physical
  )
}

// Analyze team composition and balance
function analyzeTeam(players: Player[]): TeamAnalysis {
  const teamSize = players.length
  
  // Group players by position category
  const defensivePlayers = players.filter(p => getPositionCategory(p) === 'defensive')
  const midfieldPlayers = players.filter(p => getPositionCategory(p) === 'midfield')
  const attackingPlayers = players.filter(p => getPositionCategory(p) === 'attacking')
  
  // Calculate positional ratings
  const defensiveRating = defensivePlayers.length > 0 
    ? defensivePlayers.reduce((sum, p) => sum + getPositionalRating(p, 'defensive'), 0) / defensivePlayers.length
    : 0
  
  const midfieldRating = midfieldPlayers.length > 0
    ? midfieldPlayers.reduce((sum, p) => sum + getPositionalRating(p, 'midfield'), 0) / midfieldPlayers.length
    : 0
  
  const attackingRating = attackingPlayers.length > 0
    ? attackingPlayers.reduce((sum, p) => sum + getPositionalRating(p, 'attacking'), 0) / attackingPlayers.length
    : 0
  
  // Calculate overall attributes
  const totalRating = players.reduce((sum, p) => sum + p.overall, 0)
  const technicalSum = players.reduce((sum, p) => sum + p.technical, 0)
  const mentalSum = players.reduce((sum, p) => sum + p.mental, 0)
  const physicalSum = players.reduce((sum, p) => sum + p.physical, 0)
  
  return {
    players,
    totalRating,
    technicalAvg: technicalSum / teamSize,
    mentalAvg: mentalSum / teamSize,
    physicalAvg: physicalSum / teamSize,
    positionalRatings: {
      defensive: defensiveRating,
      midfield: midfieldRating,
      attacking: attackingRating
    },
    positionDistribution: {
      defensive: defensivePlayers.length,
      midfield: midfieldPlayers.length,
      attacking: attackingPlayers.length
    }
  }
}

// Advanced team balancing algorithm
function generateAdvancedBalancedTeams(players: Player[]): TeamScenario[] {
  const teamSize = players.length / 2
  const scenarios: TeamScenario[] = []
  
  // Strategy 1: Snake Draft by Overall Rating
  const snakeDraftTeams = snakeDraftAssignment(players)
  scenarios.push(createScenario(1, snakeDraftTeams.teamA, snakeDraftTeams.teamB))
  
  // Strategy 2: Positional Balance Priority
  const positionalBalanceTeams = positionalBalanceAssignment(players)
  scenarios.push(createScenario(2, positionalBalanceTeams.teamA, positionalBalanceTeams.teamB))
  
  // Strategy 3: Attribute Balance Priority
  const attributeBalanceTeams = attributeBalanceAssignment(players)
  scenarios.push(createScenario(3, attributeBalanceTeams.teamA, attributeBalanceTeams.teamB))
  
  // Sort scenarios by balance score
  scenarios.sort((a, b) => b.balanceScore - a.balanceScore)
  
  return scenarios
}

// Snake draft assignment (alternating picks)
function snakeDraftAssignment(players: Player[]): { teamA: Player[], teamB: Player[] } {
  const sortedPlayers = [...players].sort((a, b) => b.overall - a.overall)
  const teamA: Player[] = []
  const teamB: Player[] = []
  
  let pickForTeamA = true
  
  for (let i = 0; i < sortedPlayers.length; i++) {
    if (pickForTeamA) {
      teamA.push(sortedPlayers[i])
    } else {
      teamB.push(sortedPlayers[i])
    }
    
    // Snake pattern: A, B, B, A, A, B, B, A...
    if ((i + 1) % 2 === 0) {
      pickForTeamA = !pickForTeamA
    }
  }
  
  return { teamA, teamB }
}

// Positional balance assignment
function positionalBalanceAssignment(players: Player[]): { teamA: Player[], teamB: Player[] } {
  const defensivePlayers = players.filter(p => getPositionCategory(p) === 'defensive')
  const midfieldPlayers = players.filter(p => getPositionCategory(p) === 'midfield')
  const attackingPlayers = players.filter(p => getPositionCategory(p) === 'attacking')
  
  const teamA: Player[] = []
  const teamB: Player[] = []
  
  // Distribute each position category evenly
  const distributeCategory = (categoryPlayers: Player[]) => {
    const sorted = [...categoryPlayers].sort((a, b) => b.overall - a.overall)
    let assignToA = true
    
    for (const player of sorted) {
      if (assignToA) {
        teamA.push(player)
      } else {
        teamB.push(player)
      }
      assignToA = !assignToA
    }
  }
  
  distributeCategory(defensivePlayers)
  distributeCategory(midfieldPlayers)
  distributeCategory(attackingPlayers)
  
  return { teamA, teamB }
}

// Attribute balance assignment
function attributeBalanceAssignment(players: Player[]): { teamA: Player[], teamB: Player[] } {
  const teamA: Player[] = []
  const teamB: Player[] = []
  
  // Sort players by different attributes
  const technicalSorted = [...players].sort((a, b) => b.technical - a.technical)
  const physicalSorted = [...players].sort((a, b) => b.physical - a.physical)
  const mentalSorted = [...players].sort((a, b) => b.mental - a.mental)
  
  const assigned = new Set<string>()
  
  // Round-robin assignment prioritizing different attributes
  const playerSets = [technicalSorted, physicalSorted, mentalSorted]
  let setIndex = 0
  let assignToA = true
  
  while (assigned.size < players.length) {
    const currentSet = playerSets[setIndex % playerSets.length]
    const availablePlayer = currentSet.find(p => !assigned.has(p.id))
    
    if (availablePlayer) {
      if (assignToA) {
        teamA.push(availablePlayer)
      } else {
        teamB.push(availablePlayer)
      }
      assigned.add(availablePlayer.id)
      assignToA = !assignToA
    }
    
    setIndex++
  }
  
  return { teamA, teamB }
}

// Create scenario with balance scoring
function createScenario(id: number, teamA: Player[], teamB: Player[]): TeamScenario {
  const analysisA = analyzeTeam(teamA)
  const analysisB = analyzeTeam(teamB)
  
  const balanceScore = calculateAdvancedBalanceScore(analysisA, analysisB)
  
  return {
    id,
    teamA: {
      players: teamA,
      formation: determineFormation(teamA),
      totalRating: analysisA.totalRating,
      technicalAvg: analysisA.technicalAvg,
      mentalAvg: analysisA.mentalAvg,
      physicalAvg: analysisA.physicalAvg,
      positions: groupPlayersByPosition(teamA)
    },
    teamB: {
      players: teamB,
      formation: determineFormation(teamB),
      totalRating: analysisB.totalRating,
      technicalAvg: analysisB.technicalAvg,
      mentalAvg: analysisB.mentalAvg,
      physicalAvg: analysisB.physicalAvg,
      positions: groupPlayersByPosition(teamB)
    },
    balanceScore
  }
}

// Advanced balance scoring
function calculateAdvancedBalanceScore(teamA: TeamAnalysis, teamB: TeamAnalysis): number {
  // Overall rating balance (20%)
  const overallDiff = Math.abs(teamA.totalRating - teamB.totalRating)
  const overallScore = Math.max(0, 100 - (overallDiff * 0.5))
  
  // Attribute balance (30%)
  const techDiff = Math.abs(teamA.technicalAvg - teamB.technicalAvg)
  const mentalDiff = Math.abs(teamA.mentalAvg - teamB.mentalAvg)
  const physicalDiff = Math.abs(teamA.physicalAvg - teamB.physicalAvg)
  const attributeScore = Math.max(0, 100 - ((techDiff + mentalDiff + physicalDiff) * 2))
  
  // Positional rating balance (40%)
  const defDiff = Math.abs(teamA.positionalRatings.defensive - teamB.positionalRatings.defensive)
  const midDiff = Math.abs(teamA.positionalRatings.midfield - teamB.positionalRatings.midfield)
  const attDiff = Math.abs(teamA.positionalRatings.attacking - teamB.positionalRatings.attacking)
  const positionalScore = Math.max(0, 100 - ((defDiff + midDiff + attDiff) * 1.5))
  
  // Position distribution balance (10%)
  const posDistDiff = Math.abs(teamA.positionDistribution.defensive - teamB.positionDistribution.defensive) +
                     Math.abs(teamA.positionDistribution.midfield - teamB.positionDistribution.midfield) +
                     Math.abs(teamA.positionDistribution.attacking - teamB.positionDistribution.attacking)
  const distributionScore = Math.max(0, 100 - (posDistDiff * 10))
  
  // Weighted final score
  const finalScore = (
    overallScore * 0.2 +
    attributeScore * 0.3 +
    positionalScore * 0.4 +
    distributionScore * 0.1
  )
  
  return Math.round(finalScore * 100) / 100
}

// Helper functions
function determineFormation(players: Player[]): string {
  const defensive = players.filter(p => getPositionCategory(p) === 'defensive').length
  const midfield = players.filter(p => getPositionCategory(p) === 'midfield').length
  const attacking = players.filter(p => getPositionCategory(p) === 'attacking').length
  
  if (defensive > 0 && midfield > 0 && attacking > 0) {
    return `${defensive}-${midfield}-${attacking}`
  }
  
  return 'Flexible'
}

function groupPlayersByPosition(players: Player[]): { [position: string]: Player[] } {
  const positions: { [position: string]: Player[] } = {}
  
  players.forEach(player => {
    const pos = player.primaryPosition
    if (!positions[pos]) positions[pos] = []
    positions[pos].push(player)
  })
  
  return positions
}