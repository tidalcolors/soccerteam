// src/app/api/players/template/route.ts
import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 })
    }

    // Create 16 realistic players for 2 balanced teams
    const templateData = [
      // TEAM A POTENTIAL PLAYERS (8 players)
      {
        'Player Name': 'Marcus Rodriguez',
        'Primary Position': 'GK',
        'Age': 29,
        'Height (cm)': 188,
        'Weight (kg)': 82,
        'Technical': 65,
        'Mental': 85,
        'Physical': 78,
        'Secondary Positions': '',
        'Corners': 40, 'Crossing': 35, 'Dribbling': 45, 'Finishing': 25, 'First Touch': 70,
        'Free Kick Taking': 55, 'Heading': 75, 'Long Shots': 30, 'Long Throws': 85,
        'Marking': 50, 'Passing': 75, 'Penalty Taking': 60, 'Tackling': 45, 'Technique': 65,
        'Aggression': 60, 'Anticipation': 90, 'Bravery': 85, 'Composure': 80, 'Concentration': 90,
        'Decisions': 85, 'Determination': 80, 'Flair': 40, 'Leadership': 75, 'Off the Ball': 55,
        'Positioning': 90, 'Teamwork': 70, 'Vision': 70, 'Work Rate': 75,
        'Acceleration': 55, 'Agility': 80, 'Balance': 75, 'Jumping Reach': 85, 'Natural Fitness': 85,
        'Pace': 50, 'Stamina': 70, 'Strength': 85
      },
      {
        'Player Name': 'David Thompson',
        'Primary Position': 'CB',
        'Age': 31,
        'Height (cm)': 185,
        'Weight (kg)': 80,
        'Technical': 60,
        'Mental': 80,
        'Physical': 85,
        'Secondary Positions': 'CDM',
        'Corners': 65, 'Crossing': 50, 'Dribbling': 45, 'Finishing': 40, 'First Touch': 70,
        'Free Kick Taking': 60, 'Heading': 90, 'Long Shots': 45, 'Long Throws': 60,
        'Marking': 85, 'Passing': 75, 'Penalty Taking': 50, 'Tackling': 85, 'Technique': 60,
        'Aggression': 75, 'Anticipation': 85, 'Bravery': 90, 'Composure': 75, 'Concentration': 85,
        'Decisions': 80, 'Determination': 85, 'Flair': 35, 'Leadership': 85, 'Off the Ball': 60,
        'Positioning': 85, 'Teamwork': 80, 'Vision': 65, 'Work Rate': 80,
        'Acceleration': 60, 'Agility': 65, 'Balance': 75, 'Jumping Reach': 85, 'Natural Fitness': 85,
        'Pace': 65, 'Stamina': 80, 'Strength': 90
      },
      {
        'Player Name': 'Alex Carter',
        'Primary Position': 'RB',
        'Age': 26,
        'Height (cm)': 178,
        'Weight (kg)': 74,
        'Technical': 75,
        'Mental': 75,
        'Physical': 80,
        'Secondary Positions': 'RM, RWB',
        'Corners': 70, 'Crossing': 85, 'Dribbling': 75, 'Finishing': 55, 'First Touch': 80,
        'Free Kick Taking': 65, 'Heading': 65, 'Long Shots': 60, 'Long Throws': 70,
        'Marking': 75, 'Passing': 80, 'Penalty Taking': 50, 'Tackling': 75, 'Technique': 75,
        'Aggression': 65, 'Anticipation': 75, 'Bravery': 70, 'Composure': 75, 'Concentration': 75,
        'Decisions': 75, 'Determination': 80, 'Flair': 70, 'Leadership': 60, 'Off the Ball': 80,
        'Positioning': 80, 'Teamwork': 85, 'Vision': 75, 'Work Rate': 90,
        'Acceleration': 85, 'Agility': 80, 'Balance': 80, 'Jumping Reach': 70, 'Natural Fitness': 85,
        'Pace': 85, 'Stamina': 90, 'Strength': 70
      },
      {
        'Player Name': 'Luis Fernandez',
        'Primary Position': 'LB',
        'Age': 24,
        'Height (cm)': 176,
        'Weight (kg)': 72,
        'Technical': 70,
        'Mental': 70,
        'Physical': 75,
        'Secondary Positions': 'LM',
        'Corners': 60, 'Crossing': 75, 'Dribbling': 80, 'Finishing': 50, 'First Touch': 75,
        'Free Kick Taking': 70, 'Heading': 60, 'Long Shots': 55, 'Long Throws': 55,
        'Marking': 70, 'Passing': 80, 'Penalty Taking': 45, 'Tackling': 70, 'Technique': 75,
        'Aggression': 60, 'Anticipation': 70, 'Bravery': 65, 'Composure': 70, 'Concentration': 70,
        'Decisions': 70, 'Determination': 75, 'Flair': 80, 'Leadership': 50, 'Off the Ball': 75,
        'Positioning': 75, 'Teamwork': 80, 'Vision': 75, 'Work Rate': 85,
        'Acceleration': 80, 'Agility': 85, 'Balance': 80, 'Jumping Reach': 65, 'Natural Fitness': 80,
        'Pace': 80, 'Stamina': 85, 'Strength': 65
      },
      {
        'Player Name': 'Michael Johnson',
        'Primary Position': 'CDM',
        'Age': 28,
        'Height (cm)': 182,
        'Weight (kg)': 78,
        'Technical': 70,
        'Mental': 85,
        'Physical': 80,
        'Secondary Positions': 'CM,CB',
        'Corners': 55, 'Crossing': 60, 'Dribbling': 65, 'Finishing': 45, 'First Touch': 80,
        'Free Kick Taking': 65, 'Heading': 75, 'Long Shots': 55, 'Long Throws': 50,
        'Marking': 80, 'Passing': 85, 'Penalty Taking': 50, 'Tackling': 90, 'Technique': 70,
        'Aggression': 70, 'Anticipation': 90, 'Bravery': 80, 'Composure': 85, 'Concentration': 90,
        'Decisions': 90, 'Determination': 85, 'Flair': 50, 'Leadership': 80, 'Off the Ball': 70,
        'Positioning': 90, 'Teamwork': 90, 'Vision': 80, 'Work Rate': 90,
        'Acceleration': 65, 'Agility': 70, 'Balance': 75, 'Jumping Reach': 75, 'Natural Fitness': 90,
        'Pace': 70, 'Stamina': 90, 'Strength': 80
      },
      {
        'Player Name': 'James Wilson',
        'Primary Position': 'CM',
        'Age': 25,
        'Height (cm)': 179,
        'Weight (kg)': 73,
        'Technical': 85,
        'Mental': 80,
        'Physical': 70,
        'Secondary Positions': 'CAM,RCM',
        'Corners': 75, 'Crossing': 80, 'Dribbling': 85, 'Finishing': 70, 'First Touch': 90,
        'Free Kick Taking': 80, 'Heading': 60, 'Long Shots': 80, 'Long Throws': 45,
        'Marking': 60, 'Passing': 95, 'Penalty Taking': 75, 'Tackling': 65, 'Technique': 90,
        'Aggression': 55, 'Anticipation': 80, 'Bravery': 65, 'Composure': 85, 'Concentration': 80,
        'Decisions': 85, 'Determination': 75, 'Flair': 85, 'Leadership': 70, 'Off the Ball': 85,
        'Positioning': 80, 'Teamwork': 85, 'Vision': 95, 'Work Rate': 80,
        'Acceleration': 75, 'Agility': 80, 'Balance': 85, 'Jumping Reach': 65, 'Natural Fitness': 80,
        'Pace': 75, 'Stamina': 85, 'Strength': 65
      },
      {
        'Player Name': 'Ryan Murphy',
        'Primary Position': 'LW',
        'Age': 23,
        'Height (cm)': 175,
        'Weight (kg)': 70,
        'Technical': 80,
        'Mental': 70,
        'Physical': 85,
        'Secondary Positions': 'LM,CF',
        'Corners': 70, 'Crossing': 85, 'Dribbling': 90, 'Finishing': 75, 'First Touch': 85,
        'Free Kick Taking': 75, 'Heading': 55, 'Long Shots': 70, 'Long Throws': 40,
        'Marking': 50, 'Passing': 75, 'Penalty Taking': 60, 'Tackling': 45, 'Technique': 85,
        'Aggression': 60, 'Anticipation': 70, 'Bravery': 60, 'Composure': 70, 'Concentration': 65,
        'Decisions': 70, 'Determination': 80, 'Flair': 95, 'Leadership': 50, 'Off the Ball': 85,
        'Positioning': 70, 'Teamwork': 70, 'Vision': 80, 'Work Rate': 75,
        'Acceleration': 95, 'Agility': 95, 'Balance': 90, 'Jumping Reach': 60, 'Natural Fitness': 80,
        'Pace': 95, 'Stamina': 80, 'Strength': 60
      },
      {
        'Player Name': 'Carlos Silva',
        'Primary Position': 'ST',
        'Age': 27,
        'Height (cm)': 183,
        'Weight (kg)': 77,
        'Technical': 80,
        'Mental': 75,
        'Physical': 80,
        'Secondary Positions': 'SS,CF',
        'Corners': 50, 'Crossing': 60, 'Dribbling': 80, 'Finishing': 90, 'First Touch': 85,
        'Free Kick Taking': 70, 'Heading': 85, 'Long Shots': 85, 'Long Throws': 35,
        'Marking': 40, 'Passing': 70, 'Penalty Taking': 85, 'Tackling': 35, 'Technique': 85,
        'Aggression': 75, 'Anticipation': 85, 'Bravery': 80, 'Composure': 80, 'Concentration': 70,
        'Decisions': 80, 'Determination': 85, 'Flair': 80, 'Leadership': 65, 'Off the Ball': 90,
        'Positioning': 85, 'Teamwork': 70, 'Vision': 75, 'Work Rate': 75,
        'Acceleration': 80, 'Agility': 80, 'Balance': 80, 'Jumping Reach': 85, 'Natural Fitness': 85,
        'Pace': 80, 'Stamina': 75, 'Strength': 85
      },

      // TEAM B POTENTIAL PLAYERS (8 players)
      {
        'Player Name': 'Thomas Anderson',
        'Primary Position': 'GK',
        'Age': 26,
        'Height (cm)': 190,
        'Weight (kg)': 84,
        'Technical': 70,
        'Mental': 80,
        'Physical': 82,
        'Secondary Positions': '',
        'Corners': 45, 'Crossing': 40, 'Dribbling': 50, 'Finishing': 30, 'First Touch': 75,
        'Free Kick Taking': 60, 'Heading': 80, 'Long Shots': 35, 'Long Throws': 90,
        'Marking': 55, 'Passing': 80, 'Penalty Taking': 65, 'Tackling': 50, 'Technique': 70,
        'Aggression': 65, 'Anticipation': 85, 'Bravery': 90, 'Composure': 85, 'Concentration': 85,
        'Decisions': 80, 'Determination': 85, 'Flair': 45, 'Leadership': 70, 'Off the Ball': 60,
        'Positioning': 85, 'Teamwork': 75, 'Vision': 75, 'Work Rate': 80,
        'Acceleration': 60, 'Agility': 85, 'Balance': 80, 'Jumping Reach': 90, 'Natural Fitness': 90,
        'Pace': 55, 'Stamina': 75, 'Strength': 88
      },
      {
        'Player Name': 'Antonio Garcia',
        'Primary Position': 'CB',
        'Age': 30,
        'Height (cm)': 187,
        'Weight (kg)': 83,
        'Technical': 75,
        'Mental': 85,
        'Physical': 75,
        'Secondary Positions': 'CDM',
        'Corners': 70, 'Crossing': 55, 'Dribbling': 60, 'Finishing': 45, 'First Touch': 80,
        'Free Kick Taking': 75, 'Heading': 85, 'Long Shots': 55, 'Long Throws': 65,
        'Marking': 90, 'Passing': 90, 'Penalty Taking': 55, 'Tackling': 80, 'Technique': 75,
        'Aggression': 65, 'Anticipation': 90, 'Bravery': 85, 'Composure': 90, 'Concentration': 90,
        'Decisions': 90, 'Determination': 80, 'Flair': 60, 'Leadership': 90, 'Off the Ball': 70,
        'Positioning': 90, 'Teamwork': 85, 'Vision': 85, 'Work Rate': 75,
        'Acceleration': 65, 'Agility': 70, 'Balance': 80, 'Jumping Reach': 80, 'Natural Fitness': 80,
        'Pace': 70, 'Stamina': 75, 'Strength': 85
      },
      {
        'Player Name': 'Mark Davis',
        'Primary Position': 'CB',
        'Age': 29,
        'Height (cm)': 186,
        'Weight (kg)': 85,
        'Technical': 55,
        'Mental': 75,
        'Physical': 90,
        'Secondary Positions': 'SW',
        'Corners': 60, 'Crossing': 45, 'Dribbling': 40, 'Finishing': 35, 'First Touch': 65,
        'Free Kick Taking': 50, 'Heading': 95, 'Long Shots': 40, 'Long Throws': 70,
        'Marking': 90, 'Passing': 70, 'Penalty Taking': 45, 'Tackling': 90, 'Technique': 55,
        'Aggression': 85, 'Anticipation': 80, 'Bravery': 95, 'Composure': 70, 'Concentration': 80,
        'Decisions': 75, 'Determination': 90, 'Flair': 30, 'Leadership': 75, 'Off the Ball': 55,
        'Positioning': 80, 'Teamwork': 80, 'Vision': 60, 'Work Rate': 85,
        'Acceleration': 55, 'Agility': 60, 'Balance': 70, 'Jumping Reach': 95, 'Natural Fitness': 90,
        'Pace': 60, 'Stamina': 85, 'Strength': 95
      },
      {
        'Player Name': 'Jake Williams',
        'Primary Position': 'RB',
        'Age': 27,
        'Height (cm)': 180,
        'Weight (kg)': 76,
        'Technical': 65,
        'Mental': 75,
        'Physical': 85,
        'Secondary Positions': 'RWB',
        'Corners': 65, 'Crossing': 70, 'Dribbling': 65, 'Finishing': 50, 'First Touch': 70,
        'Free Kick Taking': 55, 'Heading': 70, 'Long Shots': 55, 'Long Throws': 75,
        'Marking': 80, 'Passing': 75, 'Penalty Taking': 45, 'Tackling': 80, 'Technique': 65,
        'Aggression': 70, 'Anticipation': 75, 'Bravery': 80, 'Composure': 70, 'Concentration': 80,
        'Decisions': 75, 'Determination': 85, 'Flair': 55, 'Leadership': 65, 'Off the Ball': 75,
        'Positioning': 80, 'Teamwork': 85, 'Vision': 70, 'Work Rate': 90,
        'Acceleration': 80, 'Agility': 75, 'Balance': 75, 'Jumping Reach': 75, 'Natural Fitness': 90,
        'Pace': 80, 'Stamina': 95, 'Strength': 80
      },
      {
        'Player Name': 'Kevin Lee',
        'Primary Position': 'CM',
        'Age': 26,
        'Height (cm)': 177,
        'Weight (kg)': 71,
        'Technical': 90,
        'Mental': 75,
        'Physical': 65,
        'Secondary Positions': 'CAM',
        'Corners': 85, 'Crossing': 85, 'Dribbling': 90, 'Finishing': 65, 'First Touch': 95,
        'Free Kick Taking': 90, 'Heading': 50, 'Long Shots': 85, 'Long Throws': 40,
        'Marking': 55, 'Passing': 95, 'Penalty Taking': 80, 'Tackling': 60, 'Technique': 95,
        'Aggression': 45, 'Anticipation': 75, 'Bravery': 55, 'Composure': 90, 'Concentration': 75,
        'Decisions': 80, 'Determination': 70, 'Flair': 95, 'Leadership': 60, 'Off the Ball': 80,
        'Positioning': 75, 'Teamwork': 80, 'Vision': 95, 'Work Rate': 70,
        'Acceleration': 70, 'Agility': 85, 'Balance': 90, 'Jumping Reach': 55, 'Natural Fitness': 75,
        'Pace': 70, 'Stamina': 75, 'Strength': 55
      },
      {
        'Player Name': 'Steve Martinez',
        'Primary Position': 'CM',
        'Age': 28,
        'Height (cm)': 181,
        'Weight (kg)': 75,
        'Technical': 65,
        'Mental': 80,
        'Physical': 90,
        'Secondary Positions': 'CDM',
        'Corners': 60, 'Crossing': 65, 'Dribbling': 70, 'Finishing': 60, 'First Touch': 75,
        'Free Kick Taking': 55, 'Heading': 80, 'Long Shots': 65, 'Long Throws': 55,
        'Marking': 75, 'Passing': 80, 'Penalty Taking': 55, 'Tackling': 85, 'Technique': 65,
        'Aggression': 80, 'Anticipation': 80, 'Bravery': 85, 'Composure': 75, 'Concentration': 85,
        'Decisions': 80, 'Determination': 90, 'Flair': 50, 'Leadership': 75, 'Off the Ball': 80,
        'Positioning': 80, 'Teamwork': 90, 'Vision': 70, 'Work Rate': 95,
        'Acceleration': 75, 'Agility': 75, 'Balance': 80, 'Jumping Reach': 80, 'Natural Fitness': 95,
        'Pace': 75, 'Stamina': 95, 'Strength': 85
      },
      {
        'Player Name': 'Daniel Brown',
        'Primary Position': 'RW',
        'Age': 24,
        'Height (cm)': 174,
        'Weight (kg)': 69,
        'Technical': 85,
        'Mental': 65,
        'Physical': 90,
        'Secondary Positions': 'RM',
        'Corners': 75, 'Crossing': 80, 'Dribbling': 95, 'Finishing': 70, 'First Touch': 80,
        'Free Kick Taking': 65, 'Heading': 50, 'Long Shots': 75, 'Long Throws': 35,
        'Marking': 45, 'Passing': 70, 'Penalty Taking': 55, 'Tackling': 40, 'Technique': 85,
        'Aggression': 65, 'Anticipation': 65, 'Bravery': 55, 'Composure': 65, 'Concentration': 60,
        'Decisions': 65, 'Determination': 75, 'Flair': 95, 'Leadership': 45, 'Off the Ball': 80,
        'Positioning': 70, 'Teamwork': 65, 'Vision': 75, 'Work Rate': 70,
        'Acceleration': 95, 'Agility': 95, 'Balance': 85, 'Jumping Reach': 55, 'Natural Fitness': 85,
        'Pace': 95, 'Stamina': 85, 'Strength': 55
      },
      {
        'Player Name': 'Robert Taylor',
        'Primary Position': 'ST',
        'Age': 25,
        'Height (cm)': 185,
        'Weight (kg)': 81,
        'Technical': 75,
        'Mental': 80,
        'Physical': 85,
        'Secondary Positions': 'SS',
        'Corners': 45, 'Crossing': 55, 'Dribbling': 75, 'Finishing': 85, 'First Touch': 80,
        'Free Kick Taking': 60, 'Heading': 90, 'Long Shots': 80, 'Long Throws': 40,
        'Marking': 45, 'Passing': 65, 'Penalty Taking': 80, 'Tackling': 40, 'Technique': 75,
        'Aggression': 80, 'Anticipation': 90, 'Bravery': 85, 'Composure': 75, 'Concentration': 75,
        'Decisions': 80, 'Determination': 90, 'Flair': 70, 'Leadership': 70, 'Off the Ball': 95,
        'Positioning': 90, 'Teamwork': 75, 'Vision': 70, 'Work Rate': 80,
        'Acceleration': 75, 'Agility': 70, 'Balance': 75, 'Jumping Reach': 90, 'Natural Fitness': 85,
        'Pace': 75, 'Stamina': 80, 'Strength': 90
      }
    ]

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(templateData)

    // Set column widths for better readability
    const wscols = [
      { wch: 15 }, // Player Name
      { wch: 20 }, // Primary Position
      { wch: 8 },  // Age
      { wch: 12 }, // Height
      { wch: 12 }, // Weight
      { wch: 10 }, // Technical
      { wch: 10 }, // Mental
      { wch: 10 }, // Physical
      { wch: 30 }, // Secondary Positions
    ]

    // Add widths for all detailed attributes
    for (let i = 9; i < 50; i++) {
      wscols.push({ wch: 15 })
    }

    ws['!cols'] = wscols

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Players')

    // Create instructions sheet
    const instructionsData = [
      ['Soccer Team Manager - Player Import Template'],
      [''],
      ['READY-TO-USE TEMPLATE WITH 16 REALISTIC PLAYERS'],
      ['This template contains 16 players designed to form 2 balanced teams (8 players each)'],
      [''],
      ['TEAM A POTENTIAL: Marcus Rodriguez (GK), David Thompson (CB), Alex Carter (RB),'],
      ['Luis Fernandez (LB), Michael Johnson (CDM), James Wilson (CM), Ryan Murphy (LW), Carlos Silva (ST)'],
      [''],
      ['TEAM B POTENTIAL: Thomas Anderson (GK), Antonio Garcia (CB), Mark Davis (CB),'],
      ['Jake Williams (RB), Kevin Lee (CM), Steve Martinez (CM), Daniel Brown (RW), Robert Taylor (ST)'],
      [''],
      ['INSTRUCTIONS:'],
      ['1. You can use these 16 players as-is for immediate team balancing testing'],
      ['2. Or modify/replace players with your own team members'],
      ['3. Required fields: Player Name, Primary Position, Technical, Mental, Physical'],
      ['4. Optional fields: All other attributes (will default to 50 if not provided)'],
      ['5. Age, Height, Weight are optional but recommended'],
      ['6. Secondary Positions: Use comma-separated position codes (e.g., "RIGHT_MIDFIELDER,ATTACKING_MIDFIELDER")'],
      ['7. All attribute values must be between 0-100'],
      ['8. Save the file and upload it back to the application'],
      [''],
      ['TEAM BALANCE ANALYSIS:'],
      ['Team A Average: Technical: 72.5, Mental: 77.5, Physical: 78.1 | Overall: 76.0'],
      ['Team B Average: Technical: 72.9, Mental: 77.5, Physical: 82.8 | Overall: 77.7'],
      ['Difference: Very close for competitive matches!'],
      [''],
      ['VALID POSITION CODES:'],
      ['GK (Goalkeeper)'],
      ['SW (Sweeper), LB (Left Back), LCB (Left Center Back), CB (Center Back), RCB (Right Center Back), RB (Right Back)'],
      ['LWB (Left Wing Back), RWB (Right Wing Back)'],
      ['CDM (Central Defensive Midfielder)'],
      ['LM (Left Midfielder), LCM (Left Central Midfielder), CM (Central Midfielder), RCM (Right Central Midfielder), RM (Right Midfielder)'],
      ['CAM (Central Attacking Midfielder)'],
      ['LW (Left Winger), RW (Right Winger)'],
      ['SS (Second Striker), CF (Centre Forward), ST (Striker)'],
      [''],
      ['PLAYER HIGHLIGHTS:'],
      ['- Marcus Rodriguez: Experienced keeper with great positioning'],
      ['- David Thompson: Solid defensive leader with aerial strength'],
      ['- James Wilson: Creative playmaker with excellent passing'],
      ['- Ryan Murphy: Pacey winger with high flair and dribbling'],
      ['- Carlos Silva: Clinical striker with great finishing'],
      ['- Kevin Lee: Technical midfielder with exceptional passing'],
      ['- Daniel Brown: Explosive winger with pace and skill'],
      ['- Robert Taylor: Target man striker with aerial ability'],
    ]

    const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData)
    instructionsWs['!cols'] = [{ wch: 80 }]
    XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions')

    // Generate buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })

    // Return file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="soccer_players_template.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    })

  } catch (error) {
    console.error('Template generation error:', error)
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 })
  }
}