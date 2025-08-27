// LoginForm.tsx
"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/crd"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authAPI } from "@/lib/api/auth"; // Make sure this path is correct
import { useAuthStore, useUIStore } from "@/lib/store"
import { loginSchema } from "@/lib/validationSchemas"
import { ErrorMessage, Field, Form, Formik } from "formik"
import { Eye, EyeOff, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface LoginFormValues {
  username: string
  password: string
}

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { login } = useAuthStore() // Get login function from store
  const { setLoading, setError, error } = useUIStore()
  const router = useRouter()

  const handleSubmit = async (values: LoginFormValues) => {
    try {
      setLoading(true)
      setError(null)

      const { user, access, refresh } = await authAPI.login( // Get both access and refresh
        values.username,
        values.password,
      )
      
      login(user, access, refresh) // Pass both to the store's login function
      setIsOpen(false)

      console.log("Logged in user object:", user);
      console.log("User role received:", user.role);

      // Redirect to role-specific dashboard
      switch (user.role) {
        case "admin":
          router.push("/admin")
          break
        case "receptionist":
          router.push("/receptionist")
          break
        case "parent":
          router.push("/parent")
          break
        case "babysitter":
          router.push("/babysitter")
          break
        case "nurse":
          router.push("/nurse")
          break
        default:
          router.push("/public")
          break
      }
    } catch (err: any) { // Catch any type to handle Axios errors more gracefully
      // Axios errors have a response object
      const errorMessage = err.response?.data?.detail || err.message || "Login failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="ssgi-gradient text-white shadow-lg hover:shadow-xl transition-shadow"
        size="lg"
      >
        <LogIn className="h-5 w-5 mr-2" />
        Staff Login
      </Button>
    )
  }

  return (
    <Card className="w-96 ssgi-card">
      <CardHeader>
        <CardTitle className="text-center">Staff Login</CardTitle>
      </CardHeader>
      <CardContent>
        <Formik
          initialValues={{ username: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Field
                  as={Input}
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  className={
                    errors.username && touched.username ? "border-red-500" : ""
                  }
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={
                      errors.password && touched.password
                        ? "border-red-500 pr-10"
                        : "pr-10"
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-red-500 text-sm"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 ssgi-gradient text-white"
                >
                  {isSubmitting ? "Logging in..." : "Login"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
              </div>

              {/* <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                <p className="font-medium mb-2">Demo Credentials:</p>
                <p>Email: sarah.johnson@ssgi.org</p>
                <p>Password: password123</p>
              </div> */}
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  )
}