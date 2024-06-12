export interface WordData {
    word: string;
    clue: string;
    length: number;
  }
  
export interface Cell {
  char: string | null; // the character for the cell, null if empty
  acrossWordIndex: number | null; // index of the word across, null if none
  downWordIndex: number | null; // index of the word down, null if none
}

export type Direction = 'across' | 'down';

export interface Position {
  row: number;
  col: number;
  direction: Direction;
}
  
export type CrosswordMatrix = Cell[][];
  