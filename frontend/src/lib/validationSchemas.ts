import * as Yup from "yup"

export const loginSchema = Yup.object({
  username: Yup.string().min(1, "Username must be at least 3 characters").required("Username is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
})

export const childSchema = Yup.object({
  name: Yup.string().min(2, "Name must be at least 2 characters").required("Child name is required"),
  age: Yup.number().min(1, "Age must be at least 1").max(12, "Age must be less than 12").required("Age is required"),
  parentId: Yup.string().required("Parent selection is required"),
  babysitterId: Yup.string().optional(),
  medicalInfo: Yup.string().optional(),
  emergencyContact: Yup.string()
    .matches(/^[+]?[1-9][\d]{0,15}$/, "Invalid phone number format")
    .required("Emergency contact is required"),
})

export const announcementSchema = Yup.object({
  title: Yup.string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters")
    .required("Title is required"),
  content: Yup.string()
    .min(10, "Content must be at least 10 characters")
    .max(1000, "Content must be less than 1000 characters")
    .required("Content is required"),
  date: Yup.date().required("Date is required"),
  author: Yup.string().required("Author is required"),
  isPublic: Yup.boolean().default(true),
})

export const attendanceSchema = Yup.object({
  childId: Yup.string().required("Child selection is required"),
  date: Yup.date().required("Date is required"),
  checkIn: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .optional(),
  checkOut: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .optional(),
  status: Yup.string().oneOf(["present", "absent", "late"], "Invalid status").required("Status is required"),
})

export const activitySchema = Yup.object({
  childId: Yup.string().required("Child selection is required"),
  activity: Yup.string()
    .min(5, "Activity description must be at least 5 characters")
    .max(500, "Activity description must be less than 500 characters")
    .required("Activity description is required"),
  time: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .required("Time is required"),
  date: Yup.date().required("Date is required"),
  type: Yup.string()
    .oneOf(["meal", "nap", "play", "other"], "Invalid activity type")
    .required("Activity type is required"),
})

export const healthEventSchema = Yup.object({
  childId: Yup.string().required("Child selection is required"),
  event: Yup.string()
    .min(5, "Event description must be at least 5 characters")
    .max(500, "Event description must be less than 500 characters")
    .required("Event description is required"),
  time: Yup.string()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .required("Time is required"),
  date: Yup.date().required("Date is required"),
  type: Yup.string()
    .oneOf(["medication", "checkup", "incident", "other", "health_check", "injury", "illness", "temperature"], "Invalid event type")
    .required("Event type is required"),
  notes: Yup.string().max(1000, "Notes must be less than 1000 characters").optional(),
  medication_name: Yup.string().max(100, 'Medication name too long').optional(),
  dosage: Yup.string().max(50, 'Dosage too long').optional(),
  temperature: Yup.string().matches(/^\d{2}(\.\d)?$/, 'Temperature format e.g. 36.5').optional(),
})

export const userSchema = Yup.object().shape({
  id: Yup.number(),
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  username: Yup.string().required('Username is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  role: Yup.string().oneOf(["admin", "receptionist", "parent", "babysitter", "nurse"], "Invalid role").required('Role is required'),
  phone: Yup.string(),
  bio: Yup.string(),
  profile_picture: Yup.mixed().nullable(),
  password: Yup.string().when('id', {
    is: (id: number) => !id || id === 0,
    then: (schema) => schema.required('Password is required for new users').min(8, 'Password must be at least 8 characters'),
    otherwise: (schema) => schema.optional(),
  }),
});

export const messageSchema = Yup.object({
  content: Yup.string()
    .min(1, "Message cannot be empty")
    .max(1000, "Message must be less than 1000 characters")
    .required("Message content is required"),
  type: Yup.string().oneOf(["text", "image", "file"], "Invalid message type").default("text"),
})
