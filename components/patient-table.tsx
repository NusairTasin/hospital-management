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
import VisitForm from './visit-form'
import AdmissionForm from './admission-form'

type PatientTableProps = {
  data: Record<string, any>[]
}

export default function PatientTable({ data }: PatientTableProps) {
  const router = useRouter()
  const [insertDialogOpen, setInsertDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [visitDialogOpen, setVisitDialogOpen] = useState(false)
  const [admissionDialogOpen, setAdmissionDialogOpen] = useState(false)
  const [dischargeDialogOpen, setDischargeDialogOpen] = useState(false)
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
      // Ensure PID is included in the update
      const updateData = { ...formData, PID: formData.PID || formData.pid || formData.patient_id }
      const response = await fetch('/api/patient', {
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
        alert(result.error || 'Failed to update patient')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to update patient')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setLoading(true)
    try {
      const id = selectedRow?.PID || selectedRow?.patient_id || selectedRow?.pid
      const response = await fetch(`/api/patient?pid=${id}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        setDeleteDialogOpen(false)
        setSelectedRow(null)
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete patient')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to delete patient')
    } finally {
      setLoading(false)
    }
  }

  const handleInsert = () => {
    // Initialize with default patient fields
    setInsertFormData({
      Name: '',
      Gender: '',
      Birthdate: '',
      Relative_Num: '',
      Address: '',
      Phone_Numbers: ['']
    })
    setInsertDialogOpen(true)
  }

  const handleVisit = (row: Record<string, any>) => {
    setSelectedRow(row)
    setVisitDialogOpen(true)
  }

  const handleAdmission = (row: Record<string, any>) => {
    setSelectedRow(row)
    setAdmissionDialogOpen(true)
  }

  const handleDischarge = (row: Record<string, any>) => {
    setSelectedRow(row)
    setDischargeDialogOpen(true)
  }

  const handleDischargeConfirm = async () => {
    setLoading(true)
    try {
      const pid = selectedRow?.PID || selectedRow?.pid || selectedRow?.patient_id
      const response = await fetch(`/api/discharge/${pid}`, {
        method: 'POST',
      })
      const result = await response.json()
      if (result.success) {
        alert('Patient discharged successfully!')
        setDischargeDialogOpen(false)
        setSelectedRow(null)
        router.refresh()
      } else {
        alert(result.error || 'Failed to discharge patient')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to discharge patient')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (row: Record<string, any>) => {
    const pid = row.PID || row.pid || row.patient_id
    window.location.href = `/dashboard/patient/${pid}`
  }

  const handleInsertSubmit = async () => {
    setLoading(true)
    try {
      // Extract phone numbers array
      const phoneNumbers = Array.isArray(insertFormData.Phone_Numbers) 
        ? insertFormData.Phone_Numbers.filter(phone => phone && phone.trim())
        : insertFormData.Phone_Number 
          ? [insertFormData.Phone_Number].filter(phone => phone && phone.trim())
          : []

      const patientData = {
        Name: insertFormData.Name,
        Gender: insertFormData.Gender,
        Birthdate: insertFormData.Birthdate,
        Relative_Num: insertFormData.Relative_Num,
        Address: insertFormData.Address,
        Phone_Numbers: phoneNumbers
      }

      const response = await fetch('/api/patient', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      })
      const result = await response.json()
      if (result.success) {
        setInsertDialogOpen(false)
        setInsertFormData({})
        router.refresh()
      } else {
        alert(result.error || 'Failed to add patient')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to add patient')
    } finally {
      setLoading(false)
    }
  }

  const addPhoneNumberField = () => {
    setInsertFormData(prev => ({
      ...prev,
      Phone_Numbers: [...(prev.Phone_Numbers || []), '']
    }))
  }

  const updatePhoneNumber = (index: number, value: string) => {
    setInsertFormData(prev => {
      const phones = [...(prev.Phone_Numbers || [])]
      phones[index] = value
      return { ...prev, Phone_Numbers: phones }
    })
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
          Add New Patient
        </Button>
      </div>
      <DataTable
        data={data}
        showActions={true}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        customActions={(row: Record<string, any>) => (
          <div className="flex gap-2">
            <button
              onClick={() => handleViewDetails(row)}
              className="text-blue-600 hover:underline text-sm"
            >
              View
            </button>
            <button
              onClick={() => handleVisit(row)}
              className="text-green-600 hover:underline text-sm"
            >
              Visit
            </button>
            {row.Status === 'Admitted' ? (
              <button
                onClick={() => handleDischarge(row)}
                className="text-orange-600 hover:underline text-sm"
              >
                Discharge
              </button>
            ) : (
              <button
                onClick={() => handleAdmission(row)}
                className="text-purple-600 hover:underline text-sm"
              >
                Admit
              </button>
            )}
            <button
              onClick={() => handleUpdate(row)}
              className="text-primary hover:underline text-sm"
            >
              Update
            </button>
            <button
              onClick={() => handleDelete(row)}
              className="text-destructive hover:underline text-sm"
            >
              Delete
            </button>
          </div>
        )}
      />

      {/* Update Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setUpdateDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Update Patient</DialogTitle>
            <DialogDescription>
              Update the patient information below. Click save when you're done.
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
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter the patient information below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <FieldGroup>
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
                <FieldLabel htmlFor="insert-Gender">Gender</FieldLabel>
                <select
                  id="insert-Gender"
                  className="w-full h-9 rounded-md border px-3"
                  value={insertFormData.Gender || ''}
                  onChange={(e) => handleInsertInputChange('Gender', e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
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
                <FieldLabel htmlFor="insert-Relative_Num">Relative Number</FieldLabel>
                <Input
                  id="insert-Relative_Num"
                  type="text"
                  value={insertFormData.Relative_Num || ''}
                  onChange={(e) => handleInsertInputChange('Relative_Num', e.target.value)}
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
              <Field>
                <FieldLabel>Phone Numbers</FieldLabel>
                {(insertFormData.Phone_Numbers || ['']).map((phone: string, index: number) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      type="text"
                      value={phone}
                      onChange={(e) => updatePhoneNumber(index, e.target.value)}
                      disabled={loading}
                      placeholder="Phone Number"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPhoneNumberField}
                  disabled={loading}
                  className="mt-2"
                >
                  Add Phone Number
                </Button>
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
              {loading ? 'Adding...' : 'Add Patient'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setDeleteDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Delete Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this patient? This action cannot be undone.
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

      {/* Visit Dialog */}
      {selectedRow && (
        <VisitForm
          open={visitDialogOpen}
          onOpenChange={setVisitDialogOpen}
          patientId={selectedRow.PID || selectedRow.pid || selectedRow.patient_id}
        />
      )}

      {/* Admission Dialog */}
      {selectedRow && (
        <AdmissionForm
          open={admissionDialogOpen}
          onOpenChange={setAdmissionDialogOpen}
          patientId={selectedRow.PID || selectedRow.pid || selectedRow.patient_id}
        />
      )}

      {/* Discharge Dialog */}
      <Dialog open={dischargeDialogOpen} onOpenChange={setDischargeDialogOpen}>
        <DialogContent>
          <DialogClose onClose={() => setDischargeDialogOpen(false)} />
          <DialogHeader>
            <DialogTitle>Discharge Patient</DialogTitle>
            <DialogDescription>
              Are you sure you want to discharge this patient? This will update the admission record and free up the bed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDischargeDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleDischargeConfirm}
              disabled={loading}
            >
              {loading ? 'Discharging...' : 'Yes, Discharge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

