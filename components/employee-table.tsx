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

type EmployeeTableProps = {
  data: Record<string, any>[]
}

export default function EmployeeTable({ data }: EmployeeTableProps) {
  const [insertDialogOpen, setInsertDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [insertFormData, setInsertFormData] = useState<Record<string, any>>({})

  const handleUpdate = (row: Record<string, any>) => {
    setSelectedRow(row)
    setFormData({ ...row })
    setUpdateDialogOpen(true)
  }

  const handleDelete = (row: Record<string, any>) => {
    setSelectedRow(row)
    setDeleteDialogOpen(true)
  }

  const handleUpdateSubmit = () => {
    console.log('Update employee', formData)
    // TODO: Implement API call to update employee
    setUpdateDialogOpen(false)
    setSelectedRow(null)
    setFormData({})
  }

  const handleDeleteConfirm = () => {
    console.log('Delete employee', selectedRow)
    // TODO: Implement API call to delete employee
    setDeleteDialogOpen(false)
    setSelectedRow(null)
  }

  const handleInsert = () => {
    // Initialize insert form with empty values
    const emptyData: Record<string, any> = {}
    if (data.length > 0) {
      Object.keys(data[0]).forEach(key => {
        emptyData[key] = ''
      })
    }
    setInsertFormData(emptyData)
    setInsertDialogOpen(true)
  }

  const handleInsertSubmit = () => {
    console.log('Insert employee', insertFormData)
    // TODO: Implement API call to insert employee
    setInsertDialogOpen(false)
    setInsertFormData({})
  }

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleInsertInputChange = (key: string, value: any) => {
    setInsertFormData(prev => ({ ...prev, [key]: value }))
  }

  // Get all keys from the first row to generate form fields
  const formFields = data.length > 0 ? Object.keys(data[0]) : []

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={handleInsert}>
          Add New Employee
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
            <DialogTitle>Update Employee</DialogTitle>
            <DialogDescription>
              Update the employee information below. Click save when you're done.
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
                  />
                </Field>
              ))}
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSubmit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Insert Dialog */}
      <Dialog open={insertDialogOpen} onOpenChange={setInsertDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setInsertDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the employee information below. Click save when you're done.
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
                  />
                </Field>
              ))}
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInsertDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleInsertSubmit}>
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setDeleteDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this employee? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              No, Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
            >
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


