import React from 'react';

interface WordLayout {
    answer: string;
    startx: number;
    starty: number;
    orientation: string;
    position: number; 
    clue: string;
}

interface LeftPanelProps {
    layoutResult: WordLayout[];
}

const LeftPanel: React.FC<LeftPanelProps> = ({ layoutResult }) => {
    const acrossClues: Record<number, string> = {};
    const downClues: Record<number, string> = {};

    layoutResult.forEach((word) => {
        if (word.orientation === 'across') {
            acrossClues[word.position] = word.clue;
        } else if (word.orientation === 'down') {
            downClues[word.position] = word.clue;
        }
    });

    return (
        <div className="flex flex-col justify-start">
            <div className="p-4 mb-4 border-2 rounded-md">
                <h2 className="text-lg font-semibold text-center mb-2">Across</h2>
                <ul>
                    {Object.entries(acrossClues).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([number, clue]) => (
                        <li key={number}>
                            {number}. {clue}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="p-4 mb-4 border-2 rounded-md">
                <h2 className="text-lg font-semibold text-center mb-2">Down</h2>
                <ul>
                    {Object.entries(downClues).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([number, clue]) => (
                        <li key={number}>
                            {number}. {clue}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default LeftPanel;
