import React from 'react'
import DoctorTable from "@/components/doctor-table"

export default async function doctorpage() {
  const res = await fetch('http://localhost:3000/api/doctor', { cache: 'no-store' })
  const doctors = await res.json()

  return (
    <div>
      <DoctorTable data={doctors} />
    </div>
  )
}

