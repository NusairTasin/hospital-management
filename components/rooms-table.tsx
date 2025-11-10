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

type RoomsTableProps = {
  data: Record<string, any>[]
}

export default function RoomsTable({ data }: RoomsTableProps) {
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
    // Exclude Status as it's calculated, not stored
    const { Status, ...updateableData } = row
    setFormData(updateableData)
    setUpdateDialogOpen(true)
  }

  const handleDelete = (row: Record<string, any>) => {
    setSelectedRow(row)
    setDeleteDialogOpen(true)
  }

  const handleUpdateSubmit = async () => {
    setLoading(true)
    try {
      // Ensure Room_ID is included and exclude Status
      const updateData = {
        Room_ID: formData.Room_ID || selectedRow?.Room_ID,
        RoomType: formData.RoomType,
        RoomCost: parseFloat(formData.RoomCost) || 0
      }
      
      const response = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      const result = await response.json()
      if (result.success) {
        setUpdateDialogOpen(false)
        setSelectedRow(null)
        setFormData({})
        router.refresh()
      } else {
        alert(result.error || 'Failed to update room')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to update room')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setLoading(true)
    try {
      const id = selectedRow?.Room_ID || selectedRow?.room_id || selectedRow?.rid
      const response = await fetch(`/api/rooms?room_id=${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        setDeleteDialogOpen(false)
        setSelectedRow(null)
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete room')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to delete room')
    } finally {
      setLoading(false)
    }
  }

  const handleInsert = () => {
    setInsertFormData({
      Room_ID: '',
      RoomType: '',
      RoomCost: ''
    })
    setInsertDialogOpen(true)
  }

  const handleInsertSubmit = async () => {
    setLoading(true)
    try {
      const roomData = {
        Room_ID: insertFormData.Room_ID,
        RoomType: insertFormData.RoomType,
        RoomCost: parseFloat(insertFormData.RoomCost) || 0
      }
      
      const response = await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      })
      const result = await response.json()
      if (result.success) {
        setInsertDialogOpen(false)
        setInsertFormData({})
        router.refresh()
      } else {
        alert(result.error || 'Failed to add room')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to add room')
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

  // Get updateable fields (exclude Status as it's calculated)
  const updateableFields = data.length > 0 
    ? Object.keys(data[0]).filter(key => key !== 'Status')
    : ['Room_ID', 'RoomType', 'RoomCost']

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={handleInsert} disabled={loading}>
          Add New Room
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
            <DialogTitle>Update Room</DialogTitle>
            <DialogDescription>
              Update the room information below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="Room_ID">Room ID</FieldLabel>
                <Input
                  id="Room_ID"
                  type="text"
                  value={formData.Room_ID ?? ''}
                  onChange={(e) => handleInputChange('Room_ID', e.target.value)}
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="RoomType">Room Type</FieldLabel>
                <Input
                  id="RoomType"
                  type="text"
                  value={formData.RoomType ?? ''}
                  onChange={(e) => handleInputChange('RoomType', e.target.value)}
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="RoomCost">Room Cost</FieldLabel>
                <Input
                  id="RoomCost"
                  type="number"
                  step="0.01"
                  value={formData.RoomCost ?? ''}
                  onChange={(e) => handleInputChange('RoomCost', e.target.value)}
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Input
                  type="text"
                  value={selectedRow?.Status || 'Calculated automatically'}
                  disabled={true}
                  className="bg-gray-100"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Status is automatically calculated based on room allocation
                </p>
              </Field>
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
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>
              Enter the room information below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="insert-Room_ID">Room ID</FieldLabel>
                <Input
                  id="insert-Room_ID"
                  type="text"
                  value={insertFormData.Room_ID ?? ''}
                  onChange={(e) => handleInsertInputChange('Room_ID', e.target.value)}
                  disabled={loading}
                  placeholder="e.g., R101"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="insert-RoomType">Room Type</FieldLabel>
                <Input
                  id="insert-RoomType"
                  type="text"
                  value={insertFormData.RoomType ?? ''}
                  onChange={(e) => handleInsertInputChange('RoomType', e.target.value)}
                  disabled={loading}
                  placeholder="e.g., Single, Double, ICU"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="insert-RoomCost">Room Cost (per day)</FieldLabel>
                <Input
                  id="insert-RoomCost"
                  type="number"
                  step="0.01"
                  value={insertFormData.RoomCost ?? ''}
                  onChange={(e) => handleInsertInputChange('RoomCost', e.target.value)}
                  disabled={loading}
                  placeholder="0.00"
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
              {loading ? 'Adding...' : 'Add Room'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setDeleteDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this room? This action cannot be undone.
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

