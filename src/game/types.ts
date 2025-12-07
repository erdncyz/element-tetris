export type ElementType = 'FIRE' | 'WATER' | 'ROCK' | 'DYNAMITE' | 'NONE';

export interface Cell {
  type: ElementType;
  color: string;
  isEmpty: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Tetromino {
  shape: ElementType[][]; // 2D array representing the shape and elements
  position: Position;
  color?: string; // Base color if needed, but elements have their own colors
}

export const GRID_ROWS = 14;
export const GRID_COLS = 10;

export const ELEMENT_COLORS: Record<ElementType, string> = {
  FIRE: '#FF4500',    // OrangeRed
  WATER: '#00BFFF',   // DeepSkyBlue
  ROCK: '#808080',    // Gray
  DYNAMITE: '#DC143C', // Crimson
  NONE: '#000000',    // Black/Transparent
};

export const ELEMENT_ICONS: Record<ElementType, string> = {
  FIRE: '🔥',
  WATER: '💧',
  ROCK: '🪨',
  DYNAMITE: '🧨',
  NONE: '',
};
