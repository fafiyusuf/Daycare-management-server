"use client"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { publicAPI } from "@/lib/api/public"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { SubmitHandler, useForm, type Resolver } from "react-hook-form"
import * as z from "zod"

const schema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  
  // Employment details
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  employee_monthly_salary: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)), 
    z.number().min(1, "Employee salary is required")
  ),
  spouse_monthly_salary: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? undefined : Number(v)), 
    z.number().optional()
  ),
  
  // Child information
  child_birth_date: z.string().min(1, "Child's birth date is required"),
  
  // Residential address
  sub_city: z.string().min(1, "Sub-city is required"),
  woreda: z.string().min(1, "Woreda is required"),
  kebele: z.string().min(1, "Kebele/Neighborhood is required"),
})

type FormValues = z.infer<typeof schema>

export function PublicApplicationForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const defaults: FormValues = {
    full_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    employee_monthly_salary: undefined as unknown as number,
    spouse_monthly_salary: undefined,
    child_birth_date: '',
    sub_city: '',
    woreda: '',
    kebele: '',
  }
  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: defaults,
  })

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setSuccess(null)
    setError(null)
    try {
      await publicAPI.submitApplication(values)
      setSuccess("Application submitted. We'll get back to you soon.")
      form.reset(defaults)
      onSubmitted?.()
    } catch (e: any) {
      setError(e?.response?.data ? JSON.stringify(e.response.data) : 'Failed to submit')
    }
  }


  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 h-[calc(100vh-8rem)] overflow-y-auto">
      <h3 className="text-2xl font-semibold mb-2 text-black dark:text-white">Childcare Service Application Form</h3>
      <p className="text-gray-800 dark:text-gray-200 mb-6">This application form is only for permanently employed female staff of the institution.</p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField<FormValues>
            control={form.control}
            name="full_name"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input placeholder="Jane Doe" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField<FormValues>
              control={form.control}
              name="email"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField<FormValues>
              control={form.control}
              name="phone"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+251..." {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <h4 className="text-lg font-semibold mt-4">Employment Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField<FormValues>
              control={form.control}
              name="department"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="Your department" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField<FormValues>
              control={form.control}
              name="position"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input placeholder="Your position" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField<FormValues>
              control={form.control}
              name="employee_monthly_salary"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Your Monthly Salary</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Amount in ETB" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField<FormValues>
              control={form.control}
              name="spouse_monthly_salary"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Spouse's Monthly Salary (if applicable)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Amount in ETB" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <h4 className="text-lg font-semibold mt-4">Child Information</h4>
          <FormField<FormValues>
            control={form.control}
            name="child_birth_date"
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Child's Date of Birth (attach birth certificate)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>Child must be between 4 months and 4 years old</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <h4 className="text-lg font-semibold mt-4">Residential Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField<FormValues>
              control={form.control}
              name="sub_city"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Sub-city</FormLabel>
                  <FormControl>
                    <Input placeholder="Sub-city" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField<FormValues>
              control={form.control}
              name="woreda"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Woreda</FormLabel>
                  <FormControl>
                    <Input placeholder="Woreda" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField<FormValues>
              control={form.control}
              name="kebele"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Kebele/Neighborhood</FormLabel>
                  <FormControl>
                    <Input placeholder="Kebele/Neighborhood" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              <strong>Note:</strong> Due to the current capacity of the childcare center, the following conditions apply:
              <br />• This form is to be filled out only by female employees.
              <br />• At one time, a staff member can only enroll one child at the center (except for twins).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit">Submit Application</Button>
            {success && <span className="text-green-600 dark:text-green-400 text-sm">{success}</span>}
            {error && <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>}
          </div>
        </form>
      </Form>
    </div>
  )
}