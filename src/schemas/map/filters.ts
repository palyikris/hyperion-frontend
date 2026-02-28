import { z } from "zod";

// Map filter schema options
export const mapFilterSchema = z.object({
  min_confidence: z
    .number()
    .min(0, "Minimum confidence must be at least 0%.")
    .max(100, "Minimum confidence cannot exceed 100%."),
  has_trash: z.boolean().optional(),
  min_lat: z
    .number()
    .min(-90, "Latitude must be >= -90.")
    .max(90, "Latitude must be <= 90.")
    .optional(),
  max_lat: z
    .number()
    .min(-90, "Latitude must be >= -90.")
    .max(90, "Latitude must be <= 90.")
    .optional(),
  min_lng: z
    .number()
    .min(-180, "Longitude must be >= -180.")
    .max(180, "Longitude must be <= 180.")
    .optional(),
  max_lng: z
    .number()
    .min(-180, "Longitude must be >= -180.")
    .max(180, "Longitude must be <= 180.")
    .optional(),
});

export type MapFiltersFormData = z.infer<typeof mapFilterSchema>;
