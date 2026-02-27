type ZoomButtonProps = {
  onZoom?: () => void;
  onSearchIconClick?: (e: React.MouseEvent) => void;
};

const ZoomButton = ({ onZoom, onSearchIconClick }: ZoomButtonProps) => {
  return (
    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (onSearchIconClick) onSearchIconClick(e);
          else if (onZoom) onZoom();
        }}
        className="bg-white/90 p-2 rounded-full shadow-lg hover:bg-white transition-colors"
      >
        <svg
          className="w-5 h-5 text-hyperion-forest"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>
    </div>
  );
};

export default ZoomButton;
