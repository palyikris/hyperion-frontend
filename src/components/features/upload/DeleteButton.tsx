import { Trash2 } from "lucide-react";

type DeleteButtonProps = {
  onDelete?: (e: React.MouseEvent) => void;
};

const DeleteButton = ({ onDelete }: DeleteButtonProps) => {
  return (
    <div className="absolute bottom-3 left-3 gallery-hover-control opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDelete?.(event);
        }}
        className="bg-hyperion-burnt-orange/90 min-h-11 min-w-11 p-2 rounded-full shadow-lg hover:bg-hyperion-burnt-orange transition-colors"
        aria-label="Delete item"
      >
        <Trash2 className="w-5 h-5 text-hyperion-cream" />
      </button>
    </div>
  );
};

export default DeleteButton;
