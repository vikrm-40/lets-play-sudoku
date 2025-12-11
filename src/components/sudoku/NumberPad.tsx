import { Button } from "@/components/ui/button";
import { Eraser, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumberPadProps {
  onNumberSelect: (num: number) => void;
  onErase: () => void;
  isNoteMode: boolean;
  onToggleNoteMode: () => void;
  disabled: boolean;
}

export const NumberPad = ({
  onNumberSelect,
  onErase,
  isNoteMode,
  onToggleNoteMode,
  disabled
}: NumberPadProps) => {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-5 lg:grid-cols-3 gap-2 w-full lg:w-auto">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => onNumberSelect(num)}
            disabled={disabled}
            className={cn(
              "w-12 h-12 lg:w-14 lg:h-14 text-xl font-bold rounded-xl",
              "bg-gradient-to-br from-primary to-primary/80",
              "hover:from-primary/90 hover:to-primary/70",
              "shadow-[var(--shadow-playful)] hover:shadow-lg",
              "transform hover:scale-105 active:scale-95",
              "transition-all duration-200"
            )}
          >
            {num}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onErase}
          disabled={disabled}
          variant="destructive"
          className="flex-1 h-12 rounded-xl shadow-[var(--shadow-card)] hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all"
        >
          <Eraser className="w-5 h-5" />
        </Button>
        <Button
          onClick={onToggleNoteMode}
          disabled={disabled}
          variant={isNoteMode ? "secondary" : "outline"}
          className={cn(
            "flex-1 h-12 rounded-xl",
            "shadow-[var(--shadow-card)] hover:shadow-lg",
            "transform hover:scale-105 active:scale-95 transition-all",
            isNoteMode && "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground"
          )}
        >
          <Edit3 className="w-4 h-4 mr-1" />
          Notes
        </Button>
      </div>
    </div>
  );
};
