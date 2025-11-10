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

type EmployeeTableProps = {
  data: Record<string, any>[]
}

export default function EmployeeTable({ data }: EmployeeTableProps) {
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
      const response = await fetch('/api/employees', {
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
        alert(result.error || 'Failed to update employee')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to update employee')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setLoading(true)
    try {
      const id = selectedRow?.eid
      const response = await fetch(`/api/employees?eid=${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        setDeleteDialogOpen(false)
        setSelectedRow(null)
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete employee')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to delete employee')
    } finally {
      setLoading(false)
    }
  }

  const handleInsert = () => {
    // Initialize insert form with default employee fields
    setInsertFormData({
      Etype: '',
      Name: '',
      Birthdate: '',
      Salary: '',
      Email: '',
      Address: '',
      Qualification: '',
      Specialty: '',
      Visit_Fee: '',
      Patient_Count: ''
    })
    setInsertDialogOpen(true)
  }

  const handleInsertSubmit = async () => {
    setLoading(true)
    try {
      const employeeData: any = {
        Etype: insertFormData.Etype,
        Name: insertFormData.Name,
        Birthdate: insertFormData.Birthdate,
        Salary: parseFloat(insertFormData.Salary) || 0,
        Email: insertFormData.Email,
        Address: insertFormData.Address
      }

      // Add Doctor-specific fields
      if (insertFormData.Etype === 'Doctor') {
        employeeData.Qualification = insertFormData.Qualification
        employeeData.Specialty = insertFormData.Specialty
        employeeData.Visit_Fee = parseFloat(insertFormData.Visit_Fee) || 0
      }

      // Add Nurse-specific fields
      if (insertFormData.Etype === 'Nurse') {
        employeeData.Patient_Count = parseInt(insertFormData.Patient_Count) || 0
      }

      const response = await fetch('/api/employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData),
      })
      const result = await response.json()
      if (result.success) {
        setInsertDialogOpen(false)
        setInsertFormData({})
        router.refresh()
      } else {
        alert(result.error || 'Failed to add employee')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to add employee')
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

  // Get all keys from the first row to generate form fields
  const formFields = data.length > 0 ? Object.keys(data[0]) : []

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button onClick={handleInsert} disabled={loading}>
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
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Enter the employee information below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="insert-Etype">Employee Type</FieldLabel>
                <select
                  id="insert-Etype"
                  className="w-full h-9 rounded-md border px-3"
                  value={insertFormData.Etype || ''}
                  onChange={(e) => handleInsertInputChange('Etype', e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select Type</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="insert-Name">Name</FieldLabel>
                <Input
                  id="insert-Name"
                  type="text"
                  value={insertFormData.Name || ''}
                  onChange={(e) => handleInsertInputChange('Name', e.target.value)}
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="insert-Birthdate">Birthdate</FieldLabel>
                <Input
                  id="insert-Birthdate"
                  type="date"
                  value={insertFormData.Birthdate || ''}
                  onChange={(e) => handleInsertInputChange('Birthdate', e.target.value)}
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="insert-Salary">Salary</FieldLabel>
                <Input
                  id="insert-Salary"
                  type="number"
                  step="0.01"
                  value={insertFormData.Salary || ''}
                  onChange={(e) => handleInsertInputChange('Salary', e.target.value)}
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="insert-Email">Email</FieldLabel>
                <Input
                  id="insert-Email"
                  type="email"
                  value={insertFormData.Email || ''}
                  onChange={(e) => handleInsertInputChange('Email', e.target.value)}
                  disabled={loading}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="insert-Address">Address</FieldLabel>
                <Input
                  id="insert-Address"
                  type="text"
                  value={insertFormData.Address || ''}
                  onChange={(e) => handleInsertInputChange('Address', e.target.value)}
                  disabled={loading}
                />
              </Field>
              {insertFormData.Etype === 'Doctor' && (
                <>
                  <Field>
                    <FieldLabel htmlFor="insert-Qualification">Qualification</FieldLabel>
                    <Input
                      id="insert-Qualification"
                      type="text"
                      value={insertFormData.Qualification || ''}
                      onChange={(e) => handleInsertInputChange('Qualification', e.target.value)}
                      disabled={loading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="insert-Specialty">Specialty</FieldLabel>
                    <Input
                      id="insert-Specialty"
                      type="text"
                      value={insertFormData.Specialty || ''}
                      onChange={(e) => handleInsertInputChange('Specialty', e.target.value)}
                      disabled={loading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="insert-Visit_Fee">Visit Fee</FieldLabel>
                    <Input
                      id="insert-Visit_Fee"
                      type="number"
                      step="0.01"
                      value={insertFormData.Visit_Fee || ''}
                      onChange={(e) => handleInsertInputChange('Visit_Fee', e.target.value)}
                      disabled={loading}
                    />
                  </Field>
                </>
              )}
              {insertFormData.Etype === 'Nurse' && (
                <Field>
                  <FieldLabel htmlFor="insert-Patient_Count">Patient Count</FieldLabel>
                  <Input
                    id="insert-Patient_Count"
                    type="number"
                    value={insertFormData.Patient_Count || ''}
                    onChange={(e) => handleInsertInputChange('Patient_Count', e.target.value)}
                    disabled={loading}
                  />
                </Field>
              )}
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
              {loading ? 'Adding...' : 'Add Employee'}
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


