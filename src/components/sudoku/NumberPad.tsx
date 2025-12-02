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
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <Button
            key={num}
            onClick={() => onNumberSelect(num)}
            disabled={disabled}
            className={cn(
              "aspect-square text-xl md:text-2xl font-bold rounded-2xl",
              "bg-gradient-to-br from-primary to-primary/80",
              "hover:from-primary/90 hover:to-primary/70",
              "shadow-[var(--shadow-playful)] hover:shadow-lg",
              "transform hover:scale-105 active:scale-95",
              "transition-all duration-200"
            )}
            size="lg"
          >
            {num}
          </Button>
        ))}
        <Button
          onClick={onErase}
          disabled={disabled}
          variant="destructive"
          className="aspect-square rounded-2xl col-span-2 shadow-[var(--shadow-card)] hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all"
          size="lg"
        >
          <Eraser className="w-6 h-6" />
        </Button>
        <Button
          onClick={onToggleNoteMode}
          disabled={disabled}
          variant={isNoteMode ? "secondary" : "outline"}
          className={cn(
            "aspect-square rounded-2xl col-span-3",
            "shadow-[var(--shadow-card)] hover:shadow-lg",
            "transform hover:scale-105 active:scale-95 transition-all",
            isNoteMode && "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground"
          )}
          size="lg"
        >
          <Edit3 className="w-5 h-5 mr-2" />
          Notes
        </Button>
      </div>
    </div>
  );
};
