import { z } from "zod";

const statusOptions = [
  "READY",
  "PROCESSING",
  "FAILED",
  "UPLOADED",
  "PENDING",
  "EXTRACTING",
] as const;
const sortOptions = ["created_at", "filename", "status"] as const;

export const createVaultFiltersSchema = (t: (key: string) => string) =>
  z.object({
    search: z.string().trim().max(120, t("vault.validation.searchTooLong")),
    status: z
      .string()
      .refine(
        (value) =>
          value === "" ||
          statusOptions.includes(value as (typeof statusOptions)[number]),
        { message: t("vault.validation.statusInvalid") },
      ),
    order_by: z
      .string()
      .refine(
        (value) => sortOptions.includes(value as (typeof sortOptions)[number]),
        { message: t("vault.validation.orderByInvalid") },
      ),
    page_size: z
      .number()
      .min(1, t("vault.validation.pageSizeMin"))
      .max(100, t("vault.validation.pageSizeMax")),
  });

export type VaultFiltersFormData = z.infer<
  ReturnType<typeof createVaultFiltersSchema>
>;
