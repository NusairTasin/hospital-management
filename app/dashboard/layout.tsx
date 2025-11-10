import React from 'react'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (<>
    <nav className="flex align-center justify-center px-50 py-5 bg-amber-50">
        <li className="flex justify-between w-full">
            <ul><a href="/dashboard">Home</a></ul>
            <ul><a href="/dashboard/nurse">Nurse</a></ul>
            <ul><a href="/dashboard/employee">Employee</a></ul>
            <ul><a href="/dashboard/doctor">Doctor</a></ul>
            <ul><a href="/dashboard/patient">Patient</a></ul>
            <ul><a href="/dashboard/rooms">Rooms</a></ul>
            <ul><a href="/dashboard/tests">Tests</a></ul>
            <ul><a href="/dashboard/medicines">Medicines</a></ul>
        </li>
    </nav>
    <div>
        {children}
    </div>
  </>
  );
}