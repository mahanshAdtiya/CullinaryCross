import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CustomizePanelProps {
  onUpdateDifficulty: (difficulty: string) => void;
  onUseHint: () => void;
  onPrint: () => void;
}

const CustomizePanel: React.FC<CustomizePanelProps> = ({
  onUpdateDifficulty,
  onUseHint,
  onPrint,
}) => {
  const [currentDifficulty, setCurrentDifficulty] = useState(() => {
    return localStorage.getItem("difficulty") || "Easy";
  });

  useEffect(() => {
    setCurrentDifficulty(localStorage.getItem("difficulty") || "Easy");
  }, []);

  const handleUpdateDifficulty = (difficulty: string) => {
    setCurrentDifficulty(difficulty);
    onUpdateDifficulty(difficulty);
    localStorage.setItem("difficulty", difficulty);
  };

  return (
    <>
      <div className="flex customize-panel items-center gap-4">
        <div className="flex text-xl">Difficulty Level:</div>
        <div className="flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="border-2 border-gray-300 rounded-md px-2 py-1 hover:border-gray-400">
                {currentDifficulty}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Select difficulty</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleUpdateDifficulty("Easy")}>
                Easy
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleUpdateDifficulty("Normal")}>
                Normal
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleUpdateDifficulty("Hard")}>
                Hard
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-4">
        <Button className="mr-4" variant="outline" onClick={onUseHint}>
          Hint
        </Button>
        <Button variant="outline" onClick={onPrint}>
          Print
        </Button>
      </div>
    </>
  );
};

export default CustomizePanel;
