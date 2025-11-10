'use client'
import React, { useState, useEffect } from 'react'
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

type VisitFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
}

export default function VisitForm({ open, onOpenChange, patientId }: VisitFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState<any[]>([])
  const [tests, setTests] = useState<any[]>([])
  const [medicines, setMedicines] = useState<any[]>([])
  const [formData, setFormData] = useState({
    Doctor_ID: '',
    Description: '',
    Treatment_Date: new Date().toISOString().split('T')[0],
    Test_IDs: [] as string[],
    Medicine_IDs: [] as string[],
    OtherCharges: '0'
  })

  useEffect(() => {
    if (open) {
      // Fetch doctors
      fetch('/api/employees?type=Doctor')
        .then(res => res.json())
        .then(data => setDoctors(data || []))
      
      // Fetch tests
      fetch('/api/tests')
        .then(res => res.json())
        .then(data => setTests(data || []))
      
      // Fetch medicines
      fetch('/api/medicines')
        .then(res => res.json())
        .then(data => setMedicines(data || []))
    }
  }, [open])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          PID: patientId,
          Doctor_ID: formData.Doctor_ID || null,
          Description: formData.Description,
          Treatment_Date: formData.Treatment_Date,
          Test_IDs: formData.Test_IDs.filter(id => id),
          Medicine_IDs: formData.Medicine_IDs.filter(id => id),
          OtherCharges: parseFloat(formData.OtherCharges) || 0
        }),
      })
      const result = await response.json()
      if (result.success) {
        alert(`Visit created successfully! Total Cost: $${result.Total_Cost}`)
        onOpenChange(false)
        setFormData({
          Doctor_ID: '',
          Description: '',
          Treatment_Date: new Date().toISOString().split('T')[0],
          Test_IDs: [],
          Medicine_IDs: [],
          OtherCharges: '0'
        })
        router.refresh()
      } else {
        alert(result.error || 'Failed to create visit')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to create visit')
    } finally {
      setLoading(false)
    }
  }

  const toggleTest = (testId: string) => {
    setFormData(prev => ({
      ...prev,
      Test_IDs: prev.Test_IDs.includes(testId)
        ? prev.Test_IDs.filter(id => id !== testId)
        : [...prev.Test_IDs, testId]
    }))
  }

  const toggleMedicine = (medId: string) => {
    setFormData(prev => ({
      ...prev,
      Medicine_IDs: prev.Medicine_IDs.includes(medId)
        ? prev.Medicine_IDs.filter(id => id !== medId)
        : [...prev.Medicine_IDs, medId]
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Create Visit/Consultation</DialogTitle>
          <DialogDescription>
            Create a new visit for patient ID: {patientId}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="Doctor_ID">Doctor</FieldLabel>
              <select
                id="Doctor_ID"
                className="w-full h-9 rounded-md border px-3"
                value={formData.Doctor_ID}
                onChange={(e) => setFormData({ ...formData, Doctor_ID: e.target.value })}
                disabled={loading}
              >
                <option value="">Select Doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.EID} value={doctor.EID}>
                    {doctor.Name} - {doctor.Specialty}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="Description">Description</FieldLabel>
              <Input
                id="Description"
                type="text"
                value={formData.Description}
                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                disabled={loading}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="Treatment_Date">Treatment Date</FieldLabel>
              <Input
                id="Treatment_Date"
                type="date"
                value={formData.Treatment_Date}
                onChange={(e) => setFormData({ ...formData, Treatment_Date: e.target.value })}
                disabled={loading}
              />
            </Field>
            <Field>
              <FieldLabel>Tests</FieldLabel>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {tests.map(test => (
                  <label key={test.Test_ID} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={formData.Test_IDs.includes(String(test.Test_ID))}
                      onChange={() => toggleTest(String(test.Test_ID))}
                      disabled={loading}
                    />
                    <span>{test.TestName} - ${test.TestCost}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field>
              <FieldLabel>Medicines</FieldLabel>
              <div className="border rounded-md p-3 max-h-40 overflow-y-auto">
                {medicines.map(medicine => (
                  <label key={medicine.Medicine_ID} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={formData.Medicine_IDs.includes(String(medicine.Medicine_ID))}
                      onChange={() => toggleMedicine(String(medicine.Medicine_ID))}
                      disabled={loading}
                    />
                    <span>{medicine.Medicine_Name} - ${medicine.Medicine_Cost}</span>
                  </label>
                ))}
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="OtherCharges">Other Charges</FieldLabel>
              <Input
                id="OtherCharges"
                type="number"
                step="0.01"
                value={formData.OtherCharges}
                onChange={(e) => setFormData({ ...formData, OtherCharges: e.target.value })}
                disabled={loading}
              />
            </Field>
          </FieldGroup>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creating...' : 'Create Visit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

