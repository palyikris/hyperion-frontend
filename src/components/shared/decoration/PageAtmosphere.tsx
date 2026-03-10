import Blob, { type BlobProps } from "./Blob";
import { blobShapes } from "./blobPresets";

type AtmosphereVariant = "dashboard" | "lab" | "upload" | "vault" | "settings";

const atmosphereConfigs: Record<AtmosphereVariant, BlobProps[]> = {
  dashboard: [
    {
      color: "bg-hyperion-soft-sky/80",
      size: "h-72 w-72",
      position: "-top-24 right-6",
      shape: blobShapes.organic6,
    },
    {
      color: "bg-hyperion-cool-aqua/70",
      size: "h-72 w-72",
      position: "bottom-10 left-6",
      shape: blobShapes.organic7,
    },
    {
      color: "bg-hyperion-burnt-orange/35",
      size: "h-24 w-48",
      position: "right-24 bottom-24",
      shape: blobShapes.organic8,
    },
    {
      color: "bg-hyperion-sage-mint/55",
      size: "h-16 w-40",
      position: "left-20 top-24",
      shape: blobShapes.organic9,
    },
    {
      color: "bg-hyperion-forest/35",
      size: "h-16 w-32",
      position: "bottom-16 right-40",
      shape: blobShapes.organic24,
    },
  ],
  lab: [
    {
      color: "bg-hyperion-soft-sky/80",
      size: "h-72 w-72",
      position: "-top-32 right-12",
      shape: blobShapes.organic1,
    },
    {
      color: "bg-hyperion-cool-aqua/70",
      size: "h-72 w-72",
      position: "bottom-24 left-16",
      shape: blobShapes.organic2,
    },
    {
      color: "bg-hyperion-burnt-orange/35",
      size: "h-24 w-48",
      position: "right-40 bottom-32",
      shape: blobShapes.organic3,
    },
    {
      color: "bg-hyperion-sage-mint/55",
      size: "h-16 w-40",
      position: "left-32 top-40",
      shape: blobShapes.organic4,
    },
    {
      color: "bg-hyperion-forest/35",
      size: "h-16 w-32",
      position: "bottom-32 right-20",
      shape: blobShapes.organic5,
    },
  ],
  upload: [
    {
      color: "bg-hyperion-soft-sky/80",
      size: "h-80 w-96",
      position: "-top-32 left-10",
      shape: blobShapes.organic10,
    },
    {
      color: "bg-hyperion-cool-aqua/70",
      size: "h-64 w-80",
      position: "bottom-20 right-12",
      shape: blobShapes.organic11,
    },
    {
      color: "bg-hyperion-burnt-orange/35",
      size: "h-32 w-56",
      position: "top-40 right-32",
      shape: blobShapes.organic12,
    },
    {
      color: "bg-hyperion-sage-mint/55",
      size: "h-20 w-44",
      position: "bottom-32 left-32",
      shape: blobShapes.organic13,
    },
    {
      color: "bg-hyperion-forest/35",
      size: "h-24 w-40",
      position: "top-16 right-20",
      shape: blobShapes.organic14,
    },
  ],
  vault: [
    {
      color: "bg-hyperion-burnt-orange/20",
      size: "h-80 w-96",
      position: "top-10 left-12",
      shape: blobShapes.organic15,
    },
    {
      color: "bg-hyperion-cool-aqua/50",
      size: "h-64 w-80",
      position: "top-1/3 right-10",
      shape: blobShapes.organic16,
    },
    {
      color: "bg-hyperion-soft-sky/45",
      size: "h-56 w-56",
      position: "bottom-32 left-1/4",
      shape: blobShapes.organic17,
    },
    {
      color: "bg-hyperion-sage-mint/65",
      size: "h-40 w-48",
      position: "top-2/3 right-1/3",
      shape: blobShapes.organic18,
    },
    {
      color: "bg-hyperion-forest/40",
      size: "h-72 w-64",
      position: "-bottom-8 right-20",
      shape: blobShapes.organic19,
    },
  ],
  settings: [
    {
      color: "bg-hyperion-forest/8",
      size: "h-[22rem] w-[22rem]",
      position: "-top-20 left-8",
      shape: blobShapes.organic20,
    },
    {
      color: "bg-hyperion-soft-sky/40",
      size: "h-[24rem] w-[24rem]",
      position: "top-20 -right-16",
      shape: blobShapes.organic21,
    },
    {
      color: "bg-hyperion-sage-mint/18",
      size: "h-36 w-[26rem]",
      position: "bottom-12 left-1/2 -translate-x-1/2",
      shape: blobShapes.organic22,
    },
  ],
};

type PageAtmosphereProps = {
  variant: AtmosphereVariant;
};

const PageAtmosphere = ({ variant }: PageAtmosphereProps) => (
  <div className="pointer-events-none absolute inset-0">
    {atmosphereConfigs[variant].map((blob, index) => (
      <Blob key={`${variant}-blob-${index}`} {...blob} />
    ))}
  </div>
);

export default PageAtmosphere;
