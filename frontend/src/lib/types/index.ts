// Generic paginated response type for API
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
// Incident log type for incidentStore
export interface IncidentLog {
  id: string | number;
  childId?: string | number; // legacy/compat
  child?: string | number; // API response
  child_name?: string; // API response
  title: string;
  description: string;
  createdAt?: string;
  created_at?: string; // API response
  createdBy?: string | number;
  logged_by?: string | number; // API response
  logged_by_name?: string; // API response
}
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: 'admin' | 'receptionist' | 'parent' | 'babysitter' | 'nurse' | '';
  phone?: string;
  bio?: string;
  avatar?: string;
  profile_picture?: string | null | any; // Include 'any' to allow File objects in forms
  is_active_staff: boolean;
  is_public?: boolean; // For staff profile visibility
  createdAt?: string;
  password?: string; // Optional: only for creation/update
}

export interface UserAPIResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface Child {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  age?: number;
  parentId: string;
  babysitterId: string | null;
  medicalInfo: string;
  emergencyContact: string;
  allergies: string;
  dateOfBirth: string;
  familyId: string | null;
  family?: string;
  isActive: boolean;
  profileComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Announcement {
  id: string
  title: string
  content: string
  date: string
  author: string
  isPublic: boolean
  createdAt: string
}

export interface AttendanceRecord {
  id: string
  childId: string
  date: string
  checkIn?: string
  checkOut?: string
  notes?: string
  status: "present" | "absent" | "late"
  checkedInBy?: string
  checkedOutBy?: string
}

export interface ActivityLog {
  id: string
  childId: string
  activity: string
  time: string
  date: string
  loggedBy: string
  type: "meal" | "nap" | "play" | "health" | "other"
  // Extended fields from backend ChildActivity
  activity_type?: string
  description?: string
  start_time?: string
  end_time?: string
  logged_by?: string
  logged_by_name?: string
  notes?: string
  photos?: string
}

export interface HealthEvent {
  id: string
  childId: string
  event: string
  time: string
  date: string
  loggedBy: string
  type: "medication" | "checkup" | "incident" | "other" | "health_check" | "injury" | "illness" | "temperature"
  notes?: string
  // Backend fields for display
  recorded_by_name?: string
  event_type?: string
  description?: string
  medication_name?: string
  dosage?: string
  temperature?: string
  child?: string | number
  timestamp?: string
}

export interface GalleryPhoto {
  id: string
  url: string
  caption: string
  uploadedBy: string
  uploadedAt: string
  isPublic: boolean
}

export interface StaffProfile {
  id: string
  userId: string
  bio: string
  experience: string
  specialty: string
  isPublic: boolean
  user?: User // Make the user property optional
}

// export interface Conversation {
//   id: string
//   participants: string[]
//   childId?: string
//   lastMessage?: Message
//   createdAt: string
//   updatedAt: string
// }

// export interface Message {
//   id: string
//   conversationId: string
//   senderId: string
//   content: string
//   type: "text" | "image" | "file"
//   fileUrl?: string
//   sentAt: string
//   readBy: string[]
// }

export interface DailyReport {
  id: string
  childId: string
  date: string
  activities: ActivityLog[]
  healthEvents: HealthEvent[]
  attendance: AttendanceRecord
  summary: string
}

// Store State Interfaces
export interface UIState {
  isLoading: boolean;
  error: string | null;
  unreadMessages: number;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;       // Access token
  refreshToken: string | null; // Added: Refresh token property
  login: (user: User, accessToken: string, refreshToken: string) => void; // Updated: login function to accept both tokens
  logout: () => void;
  setTokens: (accessToken: string, refreshToken: string) => void; // Fixed: setTokens should be a function
}

export interface UserState {
  users: User[];
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  updateUser: (id: number, updates: Partial<User>) => void; // Changed id to number
  deactivateUser: (id: number) => void; // Changed id to number
}

export interface ChildState {
  children: Child[]
  isChildrenLoading: boolean
  setChildren: (children: Child[]) => void
  addChild: (child: Child) => Promise<Child>
  updateChild: (id: string, updates: Partial<Child>) => Promise<Child>
  deactivateChild: (id: string) => Promise<void>
  fetchChildren: () => Promise<Child[]>
}

export interface AnnouncementState {
  announcements: Announcement[];
  setAnnouncements: (announcements: Announcement[]) => void;
  addAnnouncement: (announcement: Announcement) => void;
  updateAnnouncement: (id: string, updates: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
}

export interface ActivityState {
  activities: ActivityLog[];
  setActivities: (activities: ActivityLog[]) => void;
  addActivity: (activity: ActivityLog) => void;
}

export interface AttendanceState {
  attendance: AttendanceRecord[];
  setAttendance: (attendance: AttendanceRecord[]) => void;
  addAttendance: (record: AttendanceRecord) => void;
  updateAttendance: (id: string, updates: Partial<AttendanceRecord>) => void;
}

// export interface ConversationState {
//   conversations: Conversation[];
//   messages: Record<string, Message[]>;
//   setConversations: (conversations: Conversation[]) => void;
//   addConversation: (conversation: Conversation) => void;
//   setMessages: (conversationId: string, messages: Message[]) => void;
//   addMessage: (message: Message) => void;
//   markMessagesAsRead: (conversationId: string, userId: string) => void;
// }

export interface DailyReportState {
  dailyReports: DailyReport[];
  setDailyReports: (reports: DailyReport[]) => void;
  addDailyReport: (report: DailyReport) => void;
}

export interface GalleryState {
  gallery: GalleryPhoto[];
  setGallery: (gallery: GalleryPhoto[]) => void;
  addPhoto: (photo: GalleryPhoto) => void;
  deletePhoto: (id: string) => void;
}

export interface HealthState {
  healthEvents: HealthEvent[];
  setHealthEvents: (events: HealthEvent[]) => void;
  addHealthEvent: (event: HealthEvent) => void;
}

export interface StaffProfileState {
  staffProfiles: StaffProfile[];
  setStaffProfiles: (profiles: StaffProfile[]) => void;
  addStaffProfile: (profile: StaffProfile) => void;
  updateStaffProfile: (id: string, updates: Partial<StaffProfile>) => void;
}