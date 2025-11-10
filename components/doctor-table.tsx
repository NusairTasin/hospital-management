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

type DoctorTableProps = {
  data: Record<string, any>[]
}

export default function DoctorTable({ data }: DoctorTableProps) {
  const router = useRouter()
  const [insertDialogOpen, setInsertDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [insertFormData, setInsertFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  const handleUpdate = (row: Record<string, any>) => {
    setSelectedRow(row)
    setFormData({ ...row })
    setUpdateDialogOpen(true)
  }

  const handleDelete = (row: Record<string, any>) => {
    setSelectedRow(row)
    setDeleteDialogOpen(true)
  }

  const handleUpdateSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/doctor', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (result.success) {
        setUpdateDialogOpen(false)
        setSelectedRow(null)
        setFormData({})
        router.refresh()
      } else {
        alert(result.error || 'Failed to update doctor')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to update doctor')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setLoading(true)
    try {
      const id = selectedRow?.doctor_id || selectedRow?.eid
      const response = await fetch(`/api/doctor?doctor_id=${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        setDeleteDialogOpen(false)
        setSelectedRow(null)
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete doctor')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to delete doctor')
    } finally {
      setLoading(false)
    }
  }

  const handleInsert = () => {
    const emptyData: Record<string, any> = {}
    if (data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        emptyData[key] = ''
      })
    }
    setInsertFormData(emptyData)
    setInsertDialogOpen(true)
  }

  const handleInsertSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insertFormData),
      })
      const result = await response.json()
      if (result.success) {
        setInsertDialogOpen(false)
        setInsertFormData({})
        router.refresh()
      } else {
        alert(result.error || 'Failed to add doctor')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to add doctor')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleInsertInputChange = (key: string, value: any) => {
    setInsertFormData(prev => ({ ...prev, [key]: value }))
  }

  const formFields = data.length > 0 ? Object.keys(data[0]) : []

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={handleInsert} disabled={loading}>
          Add New Doctor
        </Button>
      </div>
      <DataTable
        data={data}
        showActions={true}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />

      {/* Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setUpdateDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Update Doctor</DialogTitle>
            <DialogDescription>
              Update the doctor information below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FieldGroup>
              {formFields.map((key) => (
                <Field key={key}>
                  <FieldLabel htmlFor={key}>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                  </FieldLabel>
                  <Input
                    id={key}
                    type={typeof formData[key] === 'number' ? 'number' : 'text'}
                    value={formData[key] ?? ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    disabled={loading}
                  />
                </Field>
              ))}
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insert Dialog */}
      <Dialog open={insertDialogOpen} onOpenChange={setInsertDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setInsertDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add New Doctor</DialogTitle>
            <DialogDescription>
              Enter the doctor information below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FieldGroup>
              {formFields.map((key) => (
                <Field key={key}>
                  <FieldLabel htmlFor={`insert-${key}`}>
                    {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}
                  </FieldLabel>
                  <Input
                    id={`insert-${key}`}
                    type={typeof insertFormData[key] === 'number' ? 'number' : 'text'}
                    value={insertFormData[key] ?? ''}
                    onChange={(e) => handleInsertInputChange(key, e.target.value)}
                    disabled={loading}
                  />
                </Field>
              ))}
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
              {loading ? 'Adding...' : 'Add Doctor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setDeleteDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Delete Doctor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this doctor? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={loading}
            >
              No, Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

