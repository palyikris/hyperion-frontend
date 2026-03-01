import type { MapFiltersFormData } from "../../schemas/map/filters";

export const areMapFiltersEqual = (
  first: MapFiltersFormData,
  second: MapFiltersFormData,
) =>
  first.has_trash === second.has_trash &&
  first.min_confidence === second.min_confidence &&
  first.min_lat === second.min_lat &&
  first.max_lat === second.max_lat &&
  first.min_lng === second.min_lng &&
  first.max_lng === second.max_lng;
