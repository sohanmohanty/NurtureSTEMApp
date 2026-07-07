export const SUBJECTS = [
  "Math",
  "Science",
  "Algebra",
  "Geometry",
  "Biology",
  "Chemistry",
  "Physics",
  "Computer Science",
  "General STEM",
] as const;

export const STUDENT_LEVELS = ["Elementary", "Middle School"] as const;

export const STUDENT_STATUSES = [
  "Waitlisted",
  "Matched",
  "Active",
  "Paused",
  "Completed",
] as const;

export const APPROVAL_STATUSES = ["Pending", "Approved", "Rejected"] as const;

export const RESOURCE_TYPES = [
  "Worksheet",
  "Slide Deck",
  "Lesson Plan",
  "Activity",
  "External Link",
] as const;

export const ROLES = ["admin", "volunteer", "advisor"] as const;

export const TRAINING_STATUSES = [
  "Not Started",
  "In Progress",
  "Complete",
] as const;

export const SUMMARY_MAX_LENGTH = 200;

export const MAX_SESSION_MINUTES = 480;

export const PROGRAM_START_YEAR = 2024;
