import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const groupId = params.id

    // Check if group exists
    const group = await prisma.playerGroup.findUnique({
      where: { id: groupId },
      include: {
        _count: {
          select: {
            players: true,
            matches: true
          }
        }
      }
    })

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Delete the group (this will cascade delete players and matches due to our schema)
    await prisma.playerGroup.delete({
      where: { id: groupId }
    })

    return NextResponse.json({ 
      message: 'Group deleted successfully',
      deletedPlayers: group._count.players,
      deletedMatches: group._count.matches
    })

  } catch (error) {
    console.error('Delete group error:', error)
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
  }
}