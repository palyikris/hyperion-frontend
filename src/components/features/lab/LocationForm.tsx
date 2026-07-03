import { MapPinned, RotateCcw, Ruler, Save } from "lucide-react";
import type { SubmitHandler, UseFormHandleSubmit, UseFormRegister } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { InputField } from "../../shared/InputField";
import { Button } from "../../shared/Button";
import type { LabMetadataFormData } from "../../../schemas/lab/media";

type LocationFormProps = {
  id?: string;
  register: UseFormRegister<LabMetadataFormData>;
  handleSubmit: UseFormHandleSubmit<LabMetadataFormData>;
  onSubmit: SubmitHandler<LabMetadataFormData>;
  errors: {
    lat?: { message?: string };
    lng?: { message?: string };
    altitude?: { message?: string };
  };
  isDirty: boolean;
  isSubmitting: boolean;
  isUpdatePending: boolean;
  onReset: () => void;
};

const toOptionalNumber = (value: unknown) => {
  if (value === "" || value === null || value === undefined) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? undefined : parsedValue;
};

const LocationForm = ({
  id,
  register,
  handleSubmit,
  onSubmit,
  errors,
  isDirty,
  isSubmitting,
  isUpdatePending,
  onReset,
}: LocationFormProps) => {
  const { t } = useTranslation();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
      aria-busy={isSubmitting || isUpdatePending}
    >
      <div className="grid grid-cols-12 gap-4">
        <InputField
          label={t("lab.form.latitudeLabel", "Latitude")}
          type="number"
          placeholder={t("lab.form.latitudePlaceholder", "Enter latitude...")}
          id="latitude"
          icon={MapPinned}
          inputProps={{
            step: "any",
            ...register("lat", { setValueAs: toOptionalNumber }),
          }}
          error={errors.lat?.message}
          className="col-span-4"
        />
        <InputField
          label={t("lab.form.longitudeLabel", "Longitude")}
          type="number"
          placeholder={t("lab.form.longitudePlaceholder", "Enter longitude...")}
          id="longitude"
          icon={MapPinned}
          inputProps={{
            step: "any",
            ...register("lng", { setValueAs: toOptionalNumber }),
          }}
          error={errors.lng?.message}
          className="col-span-4"
        />
        <InputField
          label={t("lab.form.altitudeLabel", "Altitude")}
          type="number"
          placeholder={t("lab.form.altitudePlaceholder", "Enter altitude...")}
          id="altitude"
          icon={Ruler}
          inputProps={{
            step: "any",
            ...register("altitude", { setValueAs: toOptionalNumber }),
          }}
          error={errors.altitude?.message}
          className="col-span-4"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="submit"
          text={
            t("lab.form.save", "Save metadata") + (isUpdatePending ? "..." : "")
          }
          icon={<Save className="h-4 w-4 text-white" />}
          className="px-6"
          disabled={!id || !isDirty || isSubmitting || isUpdatePending}
          id="save-minimap-location-btn"
        />
        <Button
          type="button"
          theme="danger"
          text={t("lab.form.reset", "Reset")}
          icon={<RotateCcw className="h-4 w-4 text-white" />}
          onClick={onReset}
          className="px-6"
          disabled={isSubmitting || isUpdatePending}
          id="reset-minimap-location-btn"
        />
      </div>
    </form>
  );
};

export default LocationForm;
