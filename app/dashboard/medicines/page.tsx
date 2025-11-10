import React from 'react'
import MedicineTable from "@/components/medicine-table"

export default async function medicinespage() {
  const res = await fetch('http://localhost:3000/api/medicines', { cache: 'no-store' })
  const medicines = await res.json()

  return (
    <div>
      <MedicineTable data={medicines || []} />
    </div>
  )
}

