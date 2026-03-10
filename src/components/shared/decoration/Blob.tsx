export type BlobProps = {
  color: string;
  size: string;
  position: string;
  shape: string;
  blur?: string;
};

const Blob = ({ color, size, position, shape, blur }: BlobProps) => (
  <div
    className={`pointer-events-none absolute ${size} ${position} ${color} ${blur ?? ""}`}
    style={{ borderRadius: shape }}
  />
);

export default Blob;
