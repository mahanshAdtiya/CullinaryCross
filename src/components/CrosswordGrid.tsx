import React, { useState, useRef, useEffect } from "react";
import { generateLayout } from "../lib/layout_generator";
import LeftPanel from "./LeftPanel";
import wordsList from "../data/words.json";
import CustomizePanel from "./CustomizePanel";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WordLayout {
  answer: string;
  startx: number;
  starty: number;
  orientation: string;
  position: number;
  clue: string;
}

const CrosswordGrid: React.FC = () => {
  type Difficulty = "Easy" | "Normal" | "Hard";
  const initialScore = 0;
  const hintDeduction = {
    Easy: 1,
    Normal: 2,
    Hard: 3,
  };

  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    return (localStorage.getItem("difficulty") as Difficulty) || "Easy";
  });

  const [grid, setGrid] = useState<string[][]>([]);
  const [score, setScore] = useState(initialScore);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wordPlacements, setWordPlacements] = useState<Record<string, boolean>>(
    {}
  );
  const [clues, setClues] = useState<Record<string, string>>({});
  const [layoutResult, setLayoutResult] = useState<WordLayout[]>([]);
  const [userInput, setUserInput] = useState<Record<string, string>>({});
  const [feedbackEnabled, setFeedbackEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFeedbackEnabled = () => {
    setFeedbackEnabled(!feedbackEnabled);
  };

  const updateDifficulty = (newDifficulty: string) => {
    if (
      newDifficulty === "Easy" ||
      newDifficulty === "Normal" ||
      newDifficulty === "Hard"
    ) {
      setIsLoading(true);
      setDifficulty(newDifficulty as Difficulty);
      setScore(initialScore);
      setHintsUsed(0);
      localStorage.setItem("difficulty", newDifficulty);
      window.location.reload();
    } else {
      console.error("Invalid difficulty level:", newDifficulty);
    }
  };

  const useHint = () => {
    if (
      (difficulty === "Normal" && hintsUsed >= 10) ||
      (difficulty === "Hard" && hintsUsed >= 5)
    ) {
      alert(
        "You have used the maximum number of hints for this difficulty level."
      );
    }

    const unsolvedCells = [];
    for (const [key, value] of Object.entries(userInput)) {
      if (
        value !== grid[parseInt(key.split(",")[0])][parseInt(key.split(",")[1])]
      ) {
        unsolvedCells.push(key);
      }
    }

    if (unsolvedCells.length === 0) return;

    const randomCellKey =
      unsolvedCells[Math.floor(Math.random() * unsolvedCells.length)];
    const [rowIndex, cellIndex] = randomCellKey.split(",").map(Number);
    const correctChar = grid[rowIndex][cellIndex];

    setUserInput((prevInput) => ({
      ...prevInput,
      [randomCellKey]: correctChar,
    }));

    setScore((prevScore) => {
      const deduction = hintDeduction[difficulty as Difficulty];
      return Math.max(prevScore - deduction, 0);
    });

    setHintsUsed(hintsUsed + 1);
  };

  useEffect(() => {
    const wordCount =
      difficulty === "Easy" ? 5 : difficulty === "Normal" ? 10 : 15;
    const selectedWords = wordsList
      .sort(() => 0.5 - Math.random())
      .slice(0, wordCount)
      .map((wordObj: any) => wordObj.word);
    const layoutInput = selectedWords.map((word: string) => ({
      answer: word.toLowerCase(),
    }));
    const layout = generateLayout(layoutInput, difficulty);

    const numberPositionsTemp: Record<string, number> = {};
    layout.result.forEach((word: any) => {
      const key = `${word.starty - 1},${word.startx - 1}`;
      if (word.position !== undefined) {
        numberPositionsTemp[key] = word.position;
      }
    });

    const updatedLayoutResult = layout.result.map(
      (word: any) => {
        const correspondingWord = wordsList.find(
          (wordObj: any) => wordObj.word.toLowerCase() === word.answer
        );
        return correspondingWord
          ? { ...word, clue: correspondingWord.clue }
          : word;
      },
      [difficulty]
    );

    const wordPlacement: Record<string, boolean> = {};
    const wordClues: Record<string, string> = {};
    layout.result.forEach((word: any) => {
      for (let i = 0; i < word.answer.length; i++) {
        const key =
          word.orientation === "across"
            ? `${word.starty - 1},${word.startx - 1 + i}`
            : `${word.starty - 1 + i},${word.startx - 1}`;
        wordPlacement[key] = true;
      }
      if (word.position !== undefined) {
        wordClues[word.answer] =
          wordsList.find((w) => w.word === word.answer)?.clue || "";
      }
    });

    const newGrid = layout.table.map((row: any) =>
      row.map((cell: any) => (cell === "-" ? "" : cell))
    );

    const initialUserInput: Record<string, string> = {};
    layout.table.forEach((row: any[], rowIndex: number) => {
      row.forEach((cell: string, cellIndex: number) => {
        const key = `${rowIndex},${cellIndex}`;
        initialUserInput[key] = "";
      });
    });
    setUserInput(initialUserInput);

    setLayoutResult(updatedLayoutResult);
    setGrid(newGrid);
    setWordPlacements(wordPlacement);
    setClues(wordClues);
  }, [difficulty]);

  const crosswordContainerRef = useRef<HTMLDivElement>(null);

  // const handlePrint = () => {
  //   const crosswordContainer = crosswordContainerRef.current;
  //   const cluesContainer = document.querySelector(".crossword-clues");

  //   (crosswordContainer as HTMLElement)?.focus();
  //   window.print();

  //   (cluesContainer as HTMLElement)?.focus();
  //   window.print();
  // };

  const handleNext = () => {
    if (difficulty === "Easy") {
      updateDifficulty("Normal");
    } else if (difficulty === "Normal") {
      updateDifficulty("Hard");
    } else {
      setCompleted(true);
    }

    // don't change the difficulty level, just reload the page
    // setIsLoading(true);
    // window.location.reload();
  };

  useEffect(() => {
    const checkCompletion = () => {
      const isCompletedCorrectly = Object.entries(wordPlacements).every(
        ([key, value]) => {
          if (!value) {
            return true;
          }
          const [rowIndex, cellIndex] = key.split(",").map(Number);
          if (isNaN(rowIndex) || isNaN(cellIndex)) {
            console.error(`Invalid key encountered: ${key}`);
            return false;
          }

          const row = grid[rowIndex];
          if (!row) {
            console.error(`Row at index ${rowIndex} is undefined`);
            return false;
          }
          const cell = row[cellIndex];
          if (cell === undefined) {
            console.error(
              `Cell at rowIndex: ${rowIndex}, cellIndex: ${cellIndex} is undefined`
            );
            return false;
          }

          const correctChar = cell.toLowerCase();
          const userChar = userInput[key]?.toLowerCase() || "";
          return correctChar === userChar;
        }
      );

      setShowSuccessAlert(isCompletedCorrectly);
    };

    const timer = setTimeout(checkCompletion, 100);

    return () => clearTimeout(timer);
  }, [userInput, wordPlacements, grid]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    rowIndex: number,
    cellIndex: number
  ) => {
    const { key } = e;
    let targetKey = `${rowIndex},${cellIndex}`;
    let found = false;

    if (
      key === "ArrowUp" ||
      key === "ArrowDown" ||
      key === "ArrowLeft" ||
      key === "ArrowRight"
    ) {
      e.preventDefault();

      let increment = key === "ArrowDown" || key === "ArrowRight" ? 1 : -1;
      let isHorizontal = key === "ArrowLeft" || key === "ArrowRight";

      while (!found) {
        if (isHorizontal) {
          cellIndex += increment;
        } else {
          rowIndex += increment;
        }

        if (
          rowIndex < 0 ||
          rowIndex >= grid.length ||
          cellIndex < 0 ||
          cellIndex >= grid[rowIndex].length
        ) {
          break;
        }

        targetKey = `${rowIndex},${cellIndex}`;
        if (grid[rowIndex][cellIndex] !== "") {
          found = true;
        }
      }
    }

    if (found) {
      const nextTextArea = document.querySelector<HTMLTextAreaElement>(
        `textarea[data-key="${targetKey}"]`
      );
      nextTextArea?.focus();
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
    rowIndex: number,
    cellIndex: number
  ) => {
    const key = `${rowIndex},${cellIndex}`;
    const newInput = e.target.value.slice(-1).toLowerCase();
    const expectedChar = grid[rowIndex][cellIndex].toLowerCase();

    setUserInput((prevInput) => ({
      ...prevInput,
      [key]: newInput,
    }));

    const moveNext = () => {
      const isHorizontal =
        wordPlacements[`${rowIndex},${cellIndex + 1}`] !== undefined ||
        wordPlacements[`${rowIndex},${cellIndex - 1}`] !== undefined;
      let nextRowIndex = rowIndex;
      let nextCellIndex = cellIndex;

      if (isHorizontal) {
        nextCellIndex += 1;
      } else {
        nextRowIndex += 1;
      }

      if (
        nextRowIndex < grid.length &&
        nextCellIndex < grid[0].length &&
        grid[nextRowIndex][nextCellIndex] !== ""
      ) {
        const nextKey = `${nextRowIndex},${nextCellIndex}`;
        const nextTextArea = document.querySelector<HTMLTextAreaElement>(
          `textarea[data-key="${nextKey}"]`
        );
        nextTextArea?.focus();
      }
    };

    if (newInput && grid[rowIndex][cellIndex] === newInput) {
      moveNext();
    }
  };

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {completed && (
        <Alert className="py-5 mb-4">
          <AlertTitle>Congratulations!</AlertTitle>
          <AlertDescription>
            You have completed all levels. Well done!
          </AlertDescription>
        </Alert>
      )}
      {showSuccessAlert && (
        <Alert className="py-5 mb-4">
          <AlertTitle>Great Job!</AlertTitle>
          <AlertDescription>
            Your crossword is complete and correct. Well done!
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col lg:flex-row justify-center items-start w-full max-w-6xl">
        <div ref={crosswordContainerRef} className="crossword-container">
          {grid.map((row, rowIndex) => (
            <div key={rowIndex} className="flex">
              {row.map((cell, cellIndex) => {
                const key = `${rowIndex},${cellIndex}`;
                const isStartingCell = layoutResult.some((word) => {
                  const matchesStart =
                    word.startx - 1 === cellIndex &&
                    word.starty - 1 === rowIndex;
                  return (
                    matchesStart &&
                    (word.orientation === "across" ||
                      word.orientation === "down")
                  );
                });
                const cellNumber = isStartingCell
                  ? layoutResult.find(
                      (word) =>
                        word.startx - 1 === cellIndex &&
                        word.starty - 1 === rowIndex
                    )?.position
                  : undefined;

                const cellBackgroundClass = cell
                  ? "bg-blue-200"
                  : "bg-gray-200";
                const expectedChar = cell ? cell.toLowerCase() : "";
                const isCorrect =
                  userInput[key]?.toLowerCase() === expectedChar && cell !== "";
                const borderColor =
                  isCorrect && cell !== "" && difficulty !== "Hard"
                    ? "green"
                    : "gray";
                const borderWidth = cell !== "" ? "1px" : "1px";
                const backgroundColor =
                  isCorrect && cell !== "" && difficulty !== "Hard"
                    ? "#abf7b1"
                    : cellBackgroundClass;
                const textColor =
                  isCorrect && cell !== "" && difficulty !== "Hard"
                    ? "black"
                    : "white";

                return (
                  <div
                    key={cellIndex}
                    className={`relative ${cellBackgroundClass} w-8 h-8 md:w-12 md:h-12`}
                  >
                    {cellNumber && (
                      <span className="absolute top-0 left-0 text-xs">
                        {cellNumber}
                      </span>
                    )}
                    <textarea
                      id={`cell-${rowIndex}-${cellIndex}`}
                      className={`border-2 border-gray-300 p-1 md:p-2 text-center align-middle ${
                        !cell && "text-gray-300"
                      } w-full h-full`}
                      maxLength={1}
                      value={userInput[key]}
                      onChange={(e) =>
                        handleInputChange(e, rowIndex, cellIndex)
                      }
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, cellIndex)}
                      data-key={`${rowIndex},${cellIndex}`}
                      disabled={!cell}
                      style={{
                        resize: "none",
                        overflow: "hidden",
                        borderColor: borderColor,
                        borderWidth: borderWidth,
                        backgroundColor: backgroundColor,
                        color: textColor,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex-1 items-center ml-5">
          <CustomizePanel
            onUpdateDifficulty={updateDifficulty}
            onUseHint={useHint}
            onNext={handleNext}
          />
          <div className="mt-4">
            <div className="mt-4">
              <div className="mt-4">
                <div className="text-xl">
                  <strong>Score: {score}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="crossword-clues w-full px-5 py-5">
        {clues && <LeftPanel layoutResult={layoutResult} />}
      </div>
    </div>
  );
};

export default CrosswordGrid;
