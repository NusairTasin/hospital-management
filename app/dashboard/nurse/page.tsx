import React from 'react'
import NurseTable from "@/components/nurse-table"

export default async function nursepage() {
  const res = await fetch('http://localhost:3000/api/nurse', { cache: 'no-store' })
  const nurses = await res.json()

  return (
    <div>
      <NurseTable data={nurses} />
    </div>
  )
}
