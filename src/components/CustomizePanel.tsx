import React from 'react'; 
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle"
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

const CustomizePanel: React.FC<CustomizePanelProps> = ({ onUpdateDifficulty, onUseHint, onPrint }) => {
  const [currentDifficulty, setCurrentDifficulty] = useState('Easy'); 

  const handleUpdateDifficulty = (difficulty: string) => {
    setCurrentDifficulty(difficulty); 
    onUpdateDifficulty(difficulty);    
  };

  return (
    <div className="customize-panel items-center px-3">
      <div className="text-xl">Difficulty Level:</div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="border-2 border-gray-300 rounded-md px-2 py-1 hover:border-gray-400">
              {currentDifficulty} 
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Select difficulty</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleUpdateDifficulty("Easy")}>Easy</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleUpdateDifficulty("Normal")}>Normal</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleUpdateDifficulty("Hard")}>Hard</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className='mt-4'>
        <Button variant="outline" onClick={onUseHint}>Hint</Button>
        <Button variant="outline" onClick={onPrint}>Print</Button>
      </div>
    </div>
  );
};

export default CustomizePanel;