// src/app/api/players/import/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

// Valid position codes
const VALID_POSITIONS = [
  'GK',
  'SW', 'LB', 'LCB', 'CB', 'RCB', 'RB', 'LWB', 'RWB',
  'CDM',
  'LM', 'LCM', 'CM', 'RCM', 'RM',
  'CAM',
  'LW', 'RW',
  'SS', 'CF', 'ST'
]
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const groupId = formData.get('groupId') as string

    if (!file || !groupId) {
      return NextResponse.json({ error: 'File and group ID are required' }, { status: 400 })
    }

    // Check if group exists
    const group = await prisma.playerGroup.findUnique({
      where: { id: groupId }
    })

    if (!group) {
      return NextResponse.json({ error: 'Player group not found' }, { status: 404 })
    }

    // Read the Excel file
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const workbook = XLSX.read(buffer, { type: 'buffer' })

    // Get the first worksheet (Players sheet)
    const worksheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[worksheetName]

    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet)

    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json({ error: 'No data found in Excel file' }, { status: 400 })
    }

    const errors: string[] = []
    const validPlayers: any[] = []

    // Process each row
    jsonData.forEach((row: any, index: number) => {
      const rowNumber = index + 2 // Excel row number (header is row 1)
      
      try {
        // Required fields validation
        if (!row['Player Name'] || typeof row['Player Name'] !== 'string') {
          errors.push(`Row ${rowNumber}: Player Name is required`)
          return
        }

        if (!row['Primary Position'] || !VALID_POSITIONS.includes(row['Primary Position'])) {
          errors.push(`Row ${rowNumber}: Valid Primary Position is required. Got: "${row['Primary Position']}"`)
          return
        }

        // Summary attributes validation (required)
        const technical = parseInt(row['Technical']) || 50
        const mental = parseInt(row['Mental']) || 50
        const physical = parseInt(row['Physical']) || 50

        if (technical < 0 || technical > 100 || mental < 0 || mental > 100 || physical < 0 || physical > 100) {
          errors.push(`Row ${rowNumber}: Technical, Mental, and Physical attributes must be between 0-100`)
          return
        }

        // Process secondary positions
        let secondaryPositions: string[] = []
        if (row['Secondary Positions'] && typeof row['Secondary Positions'] === 'string') {
          const positions = row['Secondary Positions'].split(',').map((p: string) => p.trim()).filter(Boolean)
          const invalidPositions = positions.filter((p: string) => !VALID_POSITIONS.includes(p))
          
          if (invalidPositions.length > 0) {
            errors.push(`Row ${rowNumber}: Invalid secondary positions: ${invalidPositions.join(', ')}`)
            return
          }
          
          secondaryPositions = positions
        }

        // Helper function to validate and parse attribute
        const parseAttribute = (value: any, defaultValue: number = 50): number => {
          if (value === undefined || value === null || value === '') return defaultValue
          const num = parseInt(value)
          if (isNaN(num)) return defaultValue
          return Math.min(100, Math.max(0, num))
        }

        // Build player data
        const playerData = {
          name: row['Player Name'].trim(),
          playerGroupId: groupId,
          primaryPosition: row['Primary Position'],
          secondaryPositions,
          
          // Basic info (optional)
          age: row['Age'] ? parseInt(row['Age']) || undefined : undefined,
          height: row['Height (cm)'] ? parseInt(row['Height (cm)']) || undefined : undefined,
          weight: row['Weight (kg)'] ? parseInt(row['Weight (kg)']) || undefined : undefined,
          
          // Summary attributes (required)
          technical,
          mental,
          physical,
          
          // Detailed Technical Attributes
          corners: parseAttribute(row['Corners']),
          crossing: parseAttribute(row['Crossing']),
          dribbling: parseAttribute(row['Dribbling']),
          finishing: parseAttribute(row['Finishing']),
          firstTouch: parseAttribute(row['First Touch']),
          freeKickTaking: parseAttribute(row['Free Kick Taking']),
          heading: parseAttribute(row['Heading']),
          longShots: parseAttribute(row['Long Shots']),
          longThrows: parseAttribute(row['Long Throws']),
          marking: parseAttribute(row['Marking']),
          passing: parseAttribute(row['Passing']),
          penaltyTaking: parseAttribute(row['Penalty Taking']),
          tackling: parseAttribute(row['Tackling']),
          technique: parseAttribute(row['Technique']),
          
          // Detailed Mental Attributes
          aggression: parseAttribute(row['Aggression']),
          anticipation: parseAttribute(row['Anticipation']),
          bravery: parseAttribute(row['Bravery']),
          composure: parseAttribute(row['Composure']),
          concentration: parseAttribute(row['Concentration']),
          decisions: parseAttribute(row['Decisions']),
          determination: parseAttribute(row['Determination']),
          flair: parseAttribute(row['Flair']),
          leadership: parseAttribute(row['Leadership']),
          offTheBall: parseAttribute(row['Off the Ball']),
          positioning: parseAttribute(row['Positioning']),
          teamwork: parseAttribute(row['Teamwork']),
          vision: parseAttribute(row['Vision']),
          workRate: parseAttribute(row['Work Rate']),
          
          // Detailed Physical Attributes
          acceleration: parseAttribute(row['Acceleration']),
          agility: parseAttribute(row['Agility']),
          balance: parseAttribute(row['Balance']),
          jumpingReach: parseAttribute(row['Jumping Reach']),
          naturalFitness: parseAttribute(row['Natural Fitness']),
          pace: parseAttribute(row['Pace']),
          stamina: parseAttribute(row['Stamina']),
          strength: parseAttribute(row['Strength'])
        }

        validPlayers.push(playerData)

      } catch (error) {
        errors.push(`Row ${rowNumber}: Error processing row - ${error}`)
      }
    })

    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json({ 
        error: 'Validation errors found',
        details: errors,
        validPlayersCount: validPlayers.length,
        totalRowsProcessed: jsonData.length
      }, { status: 400 })
    }

    // If no valid players, return error
    if (validPlayers.length === 0) {
      return NextResponse.json({ error: 'No valid players found in the file' }, { status: 400 })
    }

    // Create players in database
    const createdPlayers = await prisma.player.createMany({
      data: validPlayers,
      skipDuplicates: true
    })

    return NextResponse.json({ 
      message: 'Players imported successfully',
      importedCount: createdPlayers.count,
      processedRows: jsonData.length
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ 
      error: 'Failed to import players',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}