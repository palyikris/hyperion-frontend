export type CardStatus = "trash-detected" | "processing" | "clear" | "default";

export type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
  status: CardStatus;
  gpsCoordinates: string;
  timestamp: string;
  metadataInfo: string;
};
