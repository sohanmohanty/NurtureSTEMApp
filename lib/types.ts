import type {
  APPROVAL_STATUSES,
  RESOURCE_TYPES,
  ROLES,
  STUDENT_LEVELS,
  STUDENT_STATUSES,
  SUBJECTS,
  TRAINING_STATUSES,
} from "@/lib/constants";

export type Subject = (typeof SUBJECTS)[number];
export type StudentLevel = (typeof STUDENT_LEVELS)[number];
export type StudentStatus = (typeof STUDENT_STATUSES)[number];
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];
export type ResourceType = (typeof RESOURCE_TYPES)[number];
export type Role = (typeof ROLES)[number];
export type TrainingStatus = (typeof TRAINING_STATUSES)[number];

export type Profile = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: Role;
  setup_complete: boolean;
  created_at: string;
  updated_at: string;
};

export type Student = {
  id: string;
  display_name: string;
  level: StudentLevel;
  grade_num: number | null;
  subject_focus: Subject;
  status: StudentStatus;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type Volunteer = {
  id: string;
  profile_id: string | null;
  name: string;
  email: string;
  grade_level: number | null;
  subject_strengths: Subject[];
  max_capacity: number;
  active_status: boolean;
  training_status: TrainingStatus;
  availability_note: string | null;
  admin_note: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type Assignment = {
  id: string;
  student_id: string;
  volunteer_id: string;
  status: "Active" | "Ended";
  start_date: string;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

export type HourLog = {
  id: string;
  volunteer_id: string;
  student_id: string | null;
  duration_minutes: number;
  subject_category: Subject;
  short_summary: string | null;
  approval_status: ApprovalStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TrainingItem = {
  id: string;
  title: string;
  description: string | null;
  required: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type TrainingProgress = {
  id: string;
  volunteer_id: string;
  training_item_id: string;
  completed: boolean;
  completed_at: string | null;
};

export type Resource = {
  id: string;
  title: string;
  subject: Subject;
  level: StudentLevel | "All Levels";
  resource_type: ResourceType;
  url: string;
  description: string | null;
  created_by: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
};

export type AppSettings = {
  id: number;
  public_page_enabled: boolean;
  mission_statement: string;
  program_start_year: number;
  announcement: string | null;
  updated_at: string;
};

export type ProgramStats = {
  total_students: number;
  active_students: number;
  waitlisted_students: number;
  total_volunteers: number;
  active_volunteers: number;
  approved_minutes: number;
  pending_logs: number;
  total_logs: number;
  active_assignments: number;
  resources_count: number;
  avg_approved_minutes_per_volunteer: number;
  students_by_subject: Record<string, number>;
  students_by_status: Record<string, number>;
  volunteers_by_subject: Record<string, number>;
};

export type PublicStats = {
  enabled: boolean;
  students_reached: number;
  volunteer_tutors: number;
  approved_minutes: number;
  subjects_supported: string[];
  program_start_year: number;
  mission_statement: string;
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };
