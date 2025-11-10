import React from 'react'
import TestTable from "@/components/test-table"

export default async function testspage() {
  const res = await fetch('http://localhost:3000/api/tests', { cache: 'no-store' })
  const tests = await res.json()

  return (
    <div>
      <TestTable data={tests || []} />
    </div>
  )
}

