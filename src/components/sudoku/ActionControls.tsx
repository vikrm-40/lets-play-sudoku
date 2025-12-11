import { Button } from "@/components/ui/button";
import { Undo2, Redo2, Lightbulb, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActionControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  mistakes: number;
  hintsUsed: number;
  canUndo: boolean;
  canRedo: boolean;
}

export const ActionControls = ({
  onUndo,
  onRedo,
  onHint,
  mistakes,
  hintsUsed,
  canUndo,
  canRedo
}: ActionControlsProps) => {
  return (
    <div className="space-y-3">
      {/* Action buttons */}
      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={onUndo}
          disabled={!canUndo}
          variant="outline"
          size="sm"
          className="rounded-xl shadow-[var(--shadow-card)] hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all"
        >
          <Undo2 className="w-4 h-4 mr-1" />
          Undo
        </Button>
        <Button
          onClick={onRedo}
          disabled={!canRedo}
          variant="outline"
          size="sm"
          className="rounded-xl shadow-[var(--shadow-card)] hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all"
        >
          <Redo2 className="w-4 h-4 mr-1" />
          Redo
        </Button>
        <Button
          onClick={onHint}
          variant="outline"
          size="sm"
          className="rounded-xl shadow-[var(--shadow-card)] hover:shadow-lg transform hover:scale-105 active:scale-95 transition-all bg-gradient-to-r from-warning/10 to-warning/5 border-warning/30"
        >
          <Lightbulb className="w-4 h-4 mr-1 text-warning" />
          Hint
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-2">
        <Badge variant="outline" className="px-3 py-1 text-xs rounded-full border-2">
          <Trophy className="w-3 h-3 mr-1 text-accent" />
          Mistakes: <span className={cn(
            "ml-1 font-bold",
            mistakes > 3 && "text-destructive"
          )}>{mistakes}</span>
        </Badge>
        <Badge variant="outline" className="px-3 py-1 text-xs rounded-full border-2">
          <Lightbulb className="w-3 h-3 mr-1 text-warning" />
          Hints: <span className="ml-1 font-bold">{hintsUsed}</span>
        </Badge>
      </div>
    </div>
  );
};
