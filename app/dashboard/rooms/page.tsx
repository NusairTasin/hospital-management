import React from 'react'
import RoomsTable from "@/components/rooms-table"

export default async function roomspage() {
  try {
    const res = await fetch('http://localhost:3000/api/rooms', { cache: 'no-store' })
    
    if (!res.ok) {
      throw new Error('Failed to fetch rooms')
    }
    
    const rooms = await res.json()

    return (
      <div>
        <RoomsTable data={rooms || []} />
      </div>
    )
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return (
      <div>
        <p>Error loading rooms. Please try again later.</p>
        <RoomsTable data={[]} />
      </div>
    )
  }
}

