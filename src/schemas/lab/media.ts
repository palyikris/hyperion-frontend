import { z } from "zod";

export const createLabMetadataSchema = (t: (key: string) => string) =>
  z.object({
    lat: z
      .number()
      .min(-90, t("lab.validation.latitudeRange"))
      .max(90, t("lab.validation.latitudeRange"))
      .optional(),
    lng: z
      .number()
      .min(-180, t("lab.validation.longitudeRange"))
      .max(180, t("lab.validation.longitudeRange"))
      .optional(),
    altitude: z
      .number()
      .min(0, t("lab.validation.altitudeRange"))
      .max(3000, t("lab.validation.altitudeRange"))
      .optional(),
  });

export type LabMetadataFormData = z.infer<
  ReturnType<typeof createLabMetadataSchema>
>;
