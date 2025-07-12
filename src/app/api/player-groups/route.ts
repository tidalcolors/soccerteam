import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all player groups (no user filtering for now)
export async function GET() {
  try {
    const playerGroups = await prisma.playerGroup.findMany({
      include: {
        players: {
          select: {
            id: true,
            name: true,
            primaryPosition: true,
            technical: true,
            mental: true,
            physical: true
          }
        },
        _count: {
          select: {
            players: true,
            matches: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(playerGroups)
  } catch (error) {
    console.error('Get player groups error:', error)
    return NextResponse.json({ error: 'Failed to fetch player groups' }, { status: 500 })
  }
}

// POST - Create new player group (no owner for now)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    const playerGroup = await prisma.playerGroup.create({
      data: {
        name,
        description,
        ownerId: null  // Always null for now
      },
      include: {
        players: {
          select: {
            id: true,
            name: true,
            primaryPosition: true,
            technical: true,
            mental: true,
            physical: true
          }
        },
        _count: {
          select: {
            players: true,
            matches: true
          }
        }
      }
    })

    return NextResponse.json(playerGroup)
  } catch (error) {
    console.error('Create player group error:', error)
    return NextResponse.json({ error: 'Failed to create player group' }, { status: 500 })
  }
}