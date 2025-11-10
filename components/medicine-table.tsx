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

type MedicineTableProps = {
  data: Record<string, any>[]
}

export default function MedicineTable({ data }: MedicineTableProps) {
  const router = useRouter()
  const [insertDialogOpen, setInsertDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ Medicine_Name: '', Medicine_Cost: '' })
  const [loading, setLoading] = useState(false)

  const handleInsert = () => {
    setFormData({ Medicine_Name: '', Medicine_Cost: '' })
    setInsertDialogOpen(true)
  }

  const handleInsertSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Medicine_Name: formData.Medicine_Name,
          Medicine_Cost: parseFloat(formData.Medicine_Cost) || 0
        }),
      })
      const result = await response.json()
      if (result.success) {
        setInsertDialogOpen(false)
        setFormData({ Medicine_Name: '', Medicine_Cost: '' })
        router.refresh()
      } else {
        alert(result.error || 'Failed to add medicine')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to add medicine')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={handleInsert} disabled={loading}>
          Add New Medicine
        </Button>
      </div>
      <DataTable data={data} />

      {/* Insert Dialog */}
      <Dialog open={insertDialogOpen} onOpenChange={setInsertDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setInsertDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add New Medicine</DialogTitle>
            <DialogDescription>
              Enter the medicine information below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="Medicine_Name">Medicine Name</FieldLabel>
                <Input
                  id="Medicine_Name"
                  type="text"
                  value={formData.Medicine_Name}
                  onChange={(e) => setFormData({ ...formData, Medicine_Name: e.target.value })}
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="Medicine_Cost">Medicine Cost</FieldLabel>
                <Input
                  id="Medicine_Cost"
                  type="number"
                  step="0.01"
                  value={formData.Medicine_Cost}
                  onChange={(e) => setFormData({ ...formData, Medicine_Cost: e.target.value })}
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
              {loading ? 'Adding...' : 'Add Medicine'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

