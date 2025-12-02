import { Cell } from "@/utils/sudoku";
import { SudokuCell } from "./SudokuCell";

interface SudokuBoardProps {
  board: Cell[][];
  selectedCell: { row: number; col: number } | null;
  onCellSelect: (row: number, col: number) => void;
}

export const SudokuBoard = ({ board, selectedCell, onCellSelect }: SudokuBoardProps) => {
  return (
    <div className="relative bg-card rounded-3xl p-2 md:p-4 shadow-[var(--shadow-card)] border-2 border-border">
      <div className="grid grid-cols-9 gap-0 bg-background rounded-2xl overflow-hidden border-2 border-border aspect-square max-w-[500px] mx-auto">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <SudokuCell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              row={rowIndex}
              col={colIndex}
              isSelected={
                selectedCell?.row === rowIndex && selectedCell?.col === colIndex
              }
              onSelect={onCellSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};
