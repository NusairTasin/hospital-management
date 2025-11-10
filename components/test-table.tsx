'use client'
import React, { useState } from 'react'
import { DataTable } from '@/components/data-table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { useRouter } from 'next/navigation'

type TestTableProps = {
  data: Record<string, any>[]
}

export default function TestTable({ data }: TestTableProps) {
  const router = useRouter()
  const [insertDialogOpen, setInsertDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ TestName: '', TestCost: '' })
  const [loading, setLoading] = useState(false)

  const handleInsert = () => {
    setFormData({ TestName: '', TestCost: '' })
    setInsertDialogOpen(true)
  }

  const handleInsertSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          TestName: formData.TestName,
          TestCost: parseFloat(formData.TestCost) || 0
        }),
      })
      const result = await response.json()
      if (result.success) {
        setInsertDialogOpen(false)
        setFormData({ TestName: '', TestCost: '' })
        router.refresh()
      } else {
        alert(result.error || 'Failed to add test')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to add test')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={handleInsert} disabled={loading}>
          Add New Test
        </Button>
      </div>
      <DataTable data={data} />

      {/* Insert Dialog */}
      <Dialog open={insertDialogOpen} onOpenChange={setInsertDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setInsertDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add New Test</DialogTitle>
            <DialogDescription>
              Enter the test information below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="TestName">Test Name</FieldLabel>
                <Input
                  id="TestName"
                  type="text"
                  value={formData.TestName}
                  onChange={(e) => setFormData({ ...formData, TestName: e.target.value })}
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="TestCost">Test Cost</FieldLabel>
                <Input
                  id="TestCost"
                  type="number"
                  step="0.01"
                  value={formData.TestCost}
                  onChange={(e) => setFormData({ ...formData, TestCost: e.target.value })}
                  disabled={loading}
                />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInsertDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleInsertSubmit} disabled={loading}>
              {loading ? 'Adding...' : 'Add Test'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

