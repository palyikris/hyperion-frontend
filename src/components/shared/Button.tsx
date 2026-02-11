type ButtonProps = {
  text: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
};

export const Button = ({ text, onClick, className, icon }: ButtonProps) => {
  return (
    <button
      className={`w-full bg-hyperion-deep-sea text-white font-bold py-4 shadow-lg shadow-hyperion-deep-sea/20 hover:shadow-xl hover:shadow-hyperion-deep-sea/30 transition-all duration-500 transform active:scale-[0.97] hover:-translate-y-1 flex items-center justify-center space-x-3 group ${className}`}
      style={{
        borderRadius: "28px 44px 30px 48px / 40px 28px 46px 32px",
        transition: "all 0.5s ease, border-radius 0.5s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderRadius = "48px 30px 44px 28px / 32px 46px 28px 40px";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderRadius = "28px 44px 30px 48px / 40px 28px 46px 32px";
      }}
      type="submit"
      onClick={onClick}
    >
      <span className="tracking-wide group-hover:tracking-wider transition-all duration-500">{text}</span>
      {icon && <span className="transition-all duration-500 group-hover:translate-x-2 group-hover:scale-110 group-hover:rotate-12">{icon}</span>}
    </button>
  );
}