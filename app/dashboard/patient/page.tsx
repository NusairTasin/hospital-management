import React from 'react'
import PatientTable from "@/components/patient-table"

export default async function patientpage() {
  const res = await fetch('http://localhost:3000/api/patients', { cache: 'no-store' })
  const patients = await res.json()

  return (
    <div>
      <PatientTable data={patients} />
    </div>
  )
}

