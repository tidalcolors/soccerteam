import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch players for a specific group
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    const players = await prisma.player.findMany({
      where: {
        playerGroupId: groupId
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(players)
  } catch (error) {
    console.error('Get players error:', error)
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}

// POST - Create new player
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      playerGroupId,
      technical,
      mental,
      physical,
      primaryPosition,
      secondaryPositions = [],
      height,
      weight,
      age,
      // Detailed Technical Attributes
      corners = 50,
      crossing = 50,
      dribbling = 50,
      finishing = 50,
      firstTouch = 50,
      freeKickTaking = 50,
      heading = 50,
      longShots = 50,
      longThrows = 50,
      marking = 50,
      passing = 50,
      penaltyTaking = 50,
      tackling = 50,
      technique = 50,
      // Detailed Mental Attributes
      aggression = 50,
      anticipation = 50,
      bravery = 50,
      composure = 50,
      concentration = 50,
      decisions = 50,
      determination = 50,
      flair = 50,
      leadership = 50,
      offTheBall = 50,
      positioning = 50,
      teamwork = 50,
      vision = 50,
      workRate = 50,
      // Detailed Physical Attributes
      acceleration = 50,
      agility = 50,
      balance = 50,
      jumpingReach = 50,
      naturalFitness = 50,
      pace = 50,
      stamina = 50,
      strength = 50
    } = body

    // Validation for required fields
    if (!name || !playerGroupId || !primaryPosition) {
      return NextResponse.json({ 
        error: 'Name, player group, and primary position are required' 
      }, { status: 400 })
    }

    if (technical === undefined || mental === undefined || physical === undefined) {
      return NextResponse.json({ 
        error: 'Technical, Mental, and Physical attributes are required' 
      }, { status: 400 })
    }

    const player = await prisma.player.create({
      data: {
        name,
        playerGroupId,
        technical,
        mental,
        physical,
        primaryPosition,
        secondaryPositions,
        height,
        weight,
        age,
        // Detailed Technical Attributes
        corners,
        crossing,
        dribbling,
        finishing,
        firstTouch,
        freeKickTaking,
        heading,
        longShots,
        longThrows,
        marking,
        passing,
        penaltyTaking,
        tackling,
        technique,
        // Detailed Mental Attributes
        aggression,
        anticipation,
        bravery,
        composure,
        concentration,
        decisions,
        determination,
        flair,
        leadership,
        offTheBall,
        positioning,
        teamwork,
        vision,
        workRate,
        // Detailed Physical Attributes
        acceleration,
        agility,
        balance,
        jumpingReach,
        naturalFitness,
        pace,
        stamina,
        strength
      }
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error('Create player error:', error)
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 })
  }
}

// PUT - Update player
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
    }

    // Ensure detailed attributes have defaults if not provided
    const detailedAttributeDefaults = {
      // Technical
      corners: 50,
      crossing: 50,
      dribbling: 50,
      finishing: 50,
      firstTouch: 50,
      freeKickTaking: 50,
      heading: 50,
      longShots: 50,
      longThrows: 50,
      marking: 50,
      passing: 50,
      penaltyTaking: 50,
      tackling: 50,
      technique: 50,
      // Mental
      aggression: 50,
      anticipation: 50,
      bravery: 50,
      composure: 50,
      concentration: 50,
      decisions: 50,
      determination: 50,
      flair: 50,
      leadership: 50,
      offTheBall: 50,
      positioning: 50,
      teamwork: 50,
      vision: 50,
      workRate: 50,
      // Physical
      acceleration: 50,
      agility: 50,
      balance: 50,
      jumpingReach: 50,
      naturalFitness: 50,
      pace: 50,
      stamina: 50,
      strength: 50
    }

    // Merge with defaults for any missing detailed attributes
    const finalUpdateData = {
      ...detailedAttributeDefaults,
      ...updateData
    }

    const player = await prisma.player.update({
      where: { id },
      data: finalUpdateData
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error('Update player error:', error)
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
  }
}

// DELETE - Delete player
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
    }

    await prisma.player.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Player deleted successfully' })
  } catch (error) {
    console.error('Delete player error:', error)
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 })
  }
}