import { z } from "zod";

// Loose date strings, not z.date() — resumes write "Jun 2023 – Present".
// Normalization to a real `date` column happens in normalize.ts, not here;
// the model shouldn't be fighting a strict format mid-extraction.
const dateString = z.string().regex(/^\d{4}(-\d{2})?$/, "Expected YYYY or YYYY-MM");

export const resumeExtractionSchema = z.object({
  profile: z
    .object({
      fullName: z.string().optional(),
      headline: z.string().optional(),
      location: z.string().optional(),
      email: z.string().optional(),
    })
    .partial(),
  experience: z.array(
    z.object({
      org: z.string(),
      role: z.string(),
      employmentType: z
        .enum(["full-time", "part-time", "contract", "freelance", "internship", "volunteer"])
        .nullable()
        .optional(),
      location: z.string().nullable().optional(),
      startDate: dateString,
      endDate: dateString.nullable(), // null = current
      summary: z.string().optional(),
      highlights: z.array(z.string()).optional(),
      tech: z.array(z.string()).optional(),
      sourceQuote: z.string().describe("Verbatim span from the resume this was extracted from"),
      confidence: z.number().min(0).max(1),
    })
  ),
  education: z.array(
    z.object({
      institution: z.string(),
      credential: z.string().nullable().optional(),
      fieldOfStudy: z.string().nullable().optional(),
      startDate: dateString.nullable().optional(),
      endDate: dateString.nullable().optional(),
      sourceQuote: z.string(),
      confidence: z.number().min(0).max(1),
    })
  ),
  skills: z.array(
    z.object({
      name: z.string(),
      category: z.enum(["language", "framework", "tool", "platform", "practice"]).nullable().optional(),
      sourceQuote: z.string(),
      confidence: z.number().min(0).max(1),
    })
  ),
});

export type ResumeExtraction = z.infer<typeof resumeExtractionSchema>;
