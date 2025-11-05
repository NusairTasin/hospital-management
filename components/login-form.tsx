'use client'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"

import { loginUser } from "@/app/api/login/route"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [email, setEmail]=useState('')
  const [password, setPassword]=useState('')
  const [message, setMessage]=useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await loginUser(email, password);
    if(res?.success) {
      setMessage('Login successful');
    } else {
      setMessage('Error')
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="flex justify-center">
          <CardTitle>Hospital Management System</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  required
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
              </Field>
              <Field>
                <Button type="submit">Login</Button>
              </Field>
              <Field>
                <p className="text-sm text-center">{message}</p>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
