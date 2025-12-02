import { Cell } from "@/utils/sudoku";
import { cn } from "@/lib/utils";

interface SudokuCellProps {
  cell: Cell;
  row: number;
  col: number;
  isSelected: boolean;
  onSelect: (row: number, col: number) => void;
}

export const SudokuCell = ({ cell, row, col, isSelected, onSelect }: SudokuCellProps) => {
  const { value, isInitial, notes, isError, isHighlighted } = cell;

  return (
    <button
      className={cn(
        "aspect-square w-full flex items-center justify-center relative",
        "transition-all duration-200",
        "border border-border/30",
        "hover:bg-primary/5",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:z-10",
        // Grid lines
        col % 3 === 2 && col !== 8 && "border-r-2 border-r-border",
        row % 3 === 2 && row !== 8 && "border-b-2 border-b-border",
        // Initial cells
        isInitial && "bg-muted/30 font-bold",
        // Selected cell
        isSelected && "bg-primary/20 ring-2 ring-primary shadow-lg scale-105 z-20",
        // Highlighted cells (same number)
        isHighlighted && !isSelected && "bg-accent/30",
        // Error state
        isError && "bg-destructive/20 text-destructive animate-wiggle"
      )}
      onClick={() => onSelect(row, col)}
      disabled={isInitial}
    >
      {value ? (
        <span className={cn(
          "text-2xl md:text-3xl font-semibold",
          isInitial ? "text-foreground" : "text-primary",
          isError && "text-destructive"
        )}>
          {value}
        </span>
      ) : notes.length > 0 ? (
        <div className="absolute inset-0 p-0.5 grid grid-cols-3 gap-0">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <span
              key={num}
              className={cn(
                "text-[0.5rem] md:text-xs text-muted-foreground flex items-center justify-center",
                !notes.includes(num) && "opacity-0"
              )}
            >
              {num}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
};
