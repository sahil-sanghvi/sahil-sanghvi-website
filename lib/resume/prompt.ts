export function buildExtractionPrompt(resumeText: string): string {
  return `Extract structured data from the resume text below. It may have multiple columns interleaved from PDF text extraction — reconstruct chronological order from dates, not from reading order.

For every experience, education, and skill entry, include a verbatim "sourceQuote" — the exact span of the resume text that supports it — and a "confidence" score between 0 and 1. Never invent entries that aren't supported by the text.

experience.employmentType: unpaid, club, ambassador, society, hackathon-organizing, and other community/volunteer roles are "volunteer", not "full-time" or "internship" — even if they carried a title like "President" or "Lead". A paid role with reduced hours is "part-time". A standard salaried role is "full-time".

Also extract top-level "profile" fields (fullName, headline, location, email) if the resume's header/contact section states them plainly — do not infer a headline from job history, only use text that already reads as a summary line.

Dates should be "YYYY" or "YYYY-MM". Use null for an end date that means "present" / current.

--- RESUME TEXT ---
${resumeText}
--- END RESUME TEXT ---`;
}
