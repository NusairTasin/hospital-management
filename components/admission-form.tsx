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

type AdmissionFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  patientId: string
}

export default function AdmissionForm({ open, onOpenChange, patientId }: AdmissionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState<any[]>([])
  const [nurses, setNurses] = useState<any[]>([])
  const [rooms, setRooms] = useState<any[]>([])
  const [formData, setFormData] = useState({
    Doctor_ID: '',
    Nurse_ID: '',
    Room_ID: '',
    DaysCount: '1',
    Admission_Fee: '0'
  })

  useEffect(() => {
    if (open) {
      // Fetch doctors
      fetch('/api/employees?type=Doctor')
        .then(res => res.json())
        .then(data => setDoctors(data || []))
      
      // Fetch nurses
      fetch('/api/employees?type=Nurse')
        .then(res => res.json())
        .then(data => setNurses(data || []))
      
      // Fetch available rooms
      fetch('/api/rooms')
        .then(res => res.json())
        .then(data => {
          const availableRooms = (data || []).filter((room: any) => room.Status === 'Available')
          setRooms(availableRooms)
        })
    }
  }, [open])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          PID: patientId,
          Doctor_ID: formData.Doctor_ID || null,
          Nurse_ID: formData.Nurse_ID || null,
          Room_ID: formData.Room_ID || null,
          DaysCount: parseInt(formData.DaysCount) || 1,
          Admission_Fee: parseFloat(formData.Admission_Fee) || 0
        }),
      })
      const result = await response.json()
      if (result.success) {
        alert(`Admission created successfully! Admission ID: ${result.Admission_ID}`)
        onOpenChange(false)
        setFormData({
          Doctor_ID: '',
          Nurse_ID: '',
          Room_ID: '',
          DaysCount: '1',
          Admission_Fee: '0'
        })
        router.refresh()
      } else {
        alert(result.error || 'Failed to create admission')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to create admission')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogClose onClose={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Create Admission</DialogTitle>
          <DialogDescription>
            Create a new admission for patient ID: {patientId}
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
              <FieldLabel htmlFor="Nurse_ID">Nurse</FieldLabel>
              <select
                id="Nurse_ID"
                className="w-full h-9 rounded-md border px-3"
                value={formData.Nurse_ID}
                onChange={(e) => setFormData({ ...formData, Nurse_ID: e.target.value })}
                disabled={loading}
              >
                <option value="">Select Nurse</option>
                {nurses.map(nurse => (
                  <option key={nurse.EID} value={nurse.EID}>
                    {nurse.Name}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="Room_ID">Room</FieldLabel>
              <select
                id="Room_ID"
                className="w-full h-9 rounded-md border px-3"
                value={formData.Room_ID}
                onChange={(e) => setFormData({ ...formData, Room_ID: e.target.value })}
                disabled={loading}
              >
                <option value="">Select Room</option>
                {rooms.map(room => (
                  <option key={room.Room_ID} value={room.Room_ID}>
                    {room.Room_ID} - {room.RoomType} (${room.RoomCost}/day)
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="DaysCount">Days Count</FieldLabel>
              <Input
                id="DaysCount"
                type="number"
                value={formData.DaysCount}
                onChange={(e) => setFormData({ ...formData, DaysCount: e.target.value })}
                disabled={loading}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="Admission_Fee">Admission Fee</FieldLabel>
              <Input
                id="Admission_Fee"
                type="number"
                step="0.01"
                value={formData.Admission_Fee}
                onChange={(e) => setFormData({ ...formData, Admission_Fee: e.target.value })}
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
            {loading ? 'Creating...' : 'Create Admission'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

