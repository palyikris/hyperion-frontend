// Comprehensive list of trash/waste classification labels
export const TRASH_LABELS = [
  "Plastic bottles",
  "Plastic bags",
  "Aluminum cans",
  "Glass",
  "Paper/cardboard",
  "Metal",
  "Foam",
  "Wood",
  "Tires",
  "Electronics",
  "Textiles",
  "Trash",
] as const;

export type TrashLabel = (typeof TRASH_LABELS)[number];

export const trashLabelOptions = TRASH_LABELS.map((label) => ({
  label,
  value: label,
}));
