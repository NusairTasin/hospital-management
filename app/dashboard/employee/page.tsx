import React from 'react'
import EmployeeTable from "@/components/employee-table"

export default async function employeepage() {
  const res = await fetch('http://localhost:3000/api/employees', { cache: 'no-store' })
  const employees = await res.json()

  return (
    <div>
      <EmployeeTable data={employees} />
    </div>
  )
}
