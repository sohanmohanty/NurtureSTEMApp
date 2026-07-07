import type { Student, Volunteer } from "@/lib/types";

export type MatchCandidate = {
  volunteer: Volunteer;
  score: number;
  reasons: string[];
  assignedCount: number;
};

export function scoreMatch(
  student: Student,
  volunteer: Volunteer,
  assignedCount: number
): MatchCandidate {
  let score = 30;
  const reasons: string[] = [];

  if (volunteer.subject_strengths.includes(student.subject_focus)) {
    score += 40;
    reasons.push(`Strong in ${student.subject_focus}`);
  } else if (volunteer.subject_strengths.includes("General STEM")) {
    score += 15;
    reasons.push("General STEM background");
  }

  const hasCapacity = assignedCount < volunteer.max_capacity;
  if (hasCapacity) {
    const openSlots = volunteer.max_capacity - assignedCount;
    score += Math.min(15, openSlots * 5);
    reasons.push(`${openSlots} open slot${openSlots === 1 ? "" : "s"}`);
  } else {
    score -= 30;
    reasons.push("At capacity");
  }

  if (volunteer.training_status === "Complete") {
    score += 15;
    reasons.push("Training complete");
  } else if (volunteer.training_status === "In Progress") {
    score += 5;
    reasons.push("Training in progress");
  }

  if (!volunteer.active_status) {
    score -= 30;
    reasons.push("Currently inactive");
  }

  return {
    volunteer,
    score: Math.max(0, Math.min(100, score)),
    reasons,
    assignedCount,
  };
}

export function rankCandidates(
  student: Student,
  volunteers: Volunteer[],
  assignedCounts: Map<string, number>
): MatchCandidate[] {
  return volunteers
    .filter((v) => !v.archived)
    .map((v) => scoreMatch(student, v, assignedCounts.get(v.id) ?? 0))
    .sort((a, b) => b.score - a.score);
}
