import { z } from "zod";
import {
  APPROVAL_STATUSES,
  MAX_SESSION_MINUTES,
  RESOURCE_TYPES,
  STUDENT_LEVELS,
  STUDENT_STATUSES,
  SUBJECTS,
  SUMMARY_MAX_LENGTH,
} from "@/lib/constants";

export const studentSchema = z.object({
  display_name: z.string().trim().min(1).max(80),
  level: z.enum(STUDENT_LEVELS),
  grade_num: z.coerce.number().int().min(1).max(8).nullable().optional(),
  subject_focus: z.enum(SUBJECTS),
  status: z.enum(STUDENT_STATUSES),
});

export const volunteerSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(200),
  grade_level: z.coerce.number().int().min(9).max(12).nullable().optional(),
  subject_strengths: z.array(z.enum(SUBJECTS)).min(1),
  max_capacity: z.coerce.number().int().min(0).max(20),
  active_status: z.boolean(),
  availability_note: z.string().trim().max(200).nullable().optional(),
  admin_note: z.string().trim().max(300).nullable().optional(),
});

export const volunteerSelfSchema = z.object({
  subject_strengths: z.array(z.enum(SUBJECTS)).min(1),
  availability_note: z.string().trim().max(200).nullable().optional(),
  active_status: z.boolean(),
});

export const hourLogSchema = z.object({
  volunteer_id: z.string().uuid(),
  student_id: z.string().uuid().nullable().optional(),
  duration_minutes: z.coerce
    .number()
    .int()
    .min(5)
    .max(MAX_SESSION_MINUTES),
  subject_category: z.enum(SUBJECTS),
  short_summary: z
    .string()
    .trim()
    .max(SUMMARY_MAX_LENGTH)
    .nullable()
    .optional(),
});

export const hourReviewSchema = z.object({
  id: z.string().uuid(),
  approval_status: z.enum(APPROVAL_STATUSES),
  duration_minutes: z.coerce
    .number()
    .int()
    .min(5)
    .max(MAX_SESSION_MINUTES)
    .optional(),
});

export const resourceSchema = z.object({
  title: z.string().trim().min(1).max(150),
  subject: z.enum(SUBJECTS),
  level: z.enum([...STUDENT_LEVELS, "All Levels"] as const),
  resource_type: z.enum(RESOURCE_TYPES),
  url: z.string().trim().url().max(500),
  description: z.string().trim().max(300).nullable().optional(),
});

export const trainingItemSchema = z.object({
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(300).nullable().optional(),
  required: z.boolean(),
});

export const assignmentSchema = z.object({
  student_id: z.string().uuid(),
  volunteer_id: z.string().uuid(),
});

export const profileSetupSchema = z.object({
  name: z.string().trim().min(1).max(100),
  grade_level: z.coerce.number().int().min(9).max(12).nullable().optional(),
  subject_strengths: z.array(z.enum(SUBJECTS)).min(1),
});

export const settingsSchema = z.object({
  public_page_enabled: z.boolean(),
  mission_statement: z.string().trim().min(1).max(500),
  program_start_year: z.coerce.number().int().min(2000).max(2100),
  announcement: z.string().trim().max(500).nullable().optional(),
});
