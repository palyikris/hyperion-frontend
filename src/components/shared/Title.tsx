type TitleProps = {
  text: string;
  colorFrom: string;
  colorVia: string;
  colorTo: string;
  size: string;
  className?: string;
};

export const Title = ({ text, colorFrom, colorVia, colorTo, size, className }: TitleProps) => {
  
  return (
    <h1
      className={`relative text-${size} font-extrabold uppercase tracking-[0.35em] text-transparent bg-clip-text bg-linear-to-br from-${colorFrom} via-${colorVia} to-${colorTo} drop-shadow-[0_6px_14px_rgba(18,70,62,0.25)] ${className}`}
    >
      {text}
    </h1>
  );
};