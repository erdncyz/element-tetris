import type { Cell, ElementType, Tetromino, Position } from './types';
import { GRID_COLS, GRID_ROWS, ELEMENT_COLORS } from './types';

export const createEmptyGrid = (): Cell[][] => {
    return Array.from({ length: GRID_ROWS }, () =>
        Array.from({ length: GRID_COLS }, () => ({
            type: 'NONE',
            color: ELEMENT_COLORS.NONE,
            isEmpty: true,
        }))
    );
};

let elementBag: ElementType[] = [];

export const getRandomElement = (level: number): ElementType => {
    if (elementBag.length === 0) {
        // Refill bag
        // Base mix: Balanced to ensure variety
        // 4 Fire, 4 Water, 3 Rock, 2 Dynamite (Total 13)
        // This ensures no long streaks of just Fire/Water
        const newBag: ElementType[] = [
            'FIRE', 'FIRE', 'FIRE', 'FIRE',
            'WATER', 'WATER', 'WATER', 'WATER',
            'ROCK', 'ROCK', 'ROCK',
            'DYNAMITE', 'DYNAMITE'
        ];

        // Add extra chaos based on level
        if (level > 5) newBag.push('DYNAMITE');
        if (level > 10) newBag.push('ROCK');

        // Shuffle (Fisher-Yates)
        for (let i = newBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newBag[i], newBag[j]] = [newBag[j], newBag[i]];
        }
        elementBag = newBag;
    }

    return elementBag.pop()!;
};

export const SHAPES = {
    I: [[1, 1, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]],
    O: [[1, 1], [1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    T: [[0, 1, 0], [1, 1, 1]],
    Z: [[1, 1, 0], [0, 1, 1]],
};

export const createRandomTetromino = (level: number): Tetromino => {
    // Pick one element type
    const element = getRandomElement(level);

    // Always a single 1x1 block
    const shape: ElementType[][] = [[element]];

    return {
        shape,
        position: { row: 0, col: Math.floor(GRID_COLS / 2) },
    };
};

export const rotateMatrix = (matrix: ElementType[][]): ElementType[][] => {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = Array.from({ length: cols }, () => Array(rows).fill('NONE'));

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            rotated[c][rows - 1 - r] = matrix[r][c];
        }
    }
    return rotated;
};

export const checkCollision = (
    piece: Tetromino,
    grid: Cell[][],
    offset: Position = { row: 0, col: 0 }
): boolean => {
    const { shape, position } = piece;
    const { row: pRow, col: pCol } = position;
    const { row: dRow, col: dCol } = offset;

    for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] !== 'NONE') {
                const newRow = pRow + r + dRow;
                const newCol = pCol + c + dCol;

                // Bounds
                if (newCol < 0 || newCol >= GRID_COLS || newRow >= GRID_ROWS) return true;

                // Grid collision (ignore if above board, but usually we spawn inside or above)
                // If newRow < 0, it's above board, no collision with grid (unless we want to prevent going too high?)
                if (newRow >= 0) {
                    if (!grid[newRow][newCol].isEmpty) return true;
                }
            }
        }
    }
    return false;
};
