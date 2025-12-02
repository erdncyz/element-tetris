import 'dart:math';

enum ElementType { fire, water, rock, dynamite, none }

class Cell {
  ElementType type;
  bool isEmpty;

  Cell({this.type = ElementType.none, this.isEmpty = true});

  Cell copy() => Cell(type: type, isEmpty: isEmpty);
}

class Position {
  int row;
  int col;
  Position(this.row, this.col);
}

class Tetromino {
  List<List<ElementType>> shape;
  Position position;

  Tetromino({required this.shape, required this.position});
}

const int GRID_ROWS = 20;
const int GRID_COLS = 10;

class GameEngine {
  List<List<Cell>> grid;
  Tetromino? currentPiece;
  List<Tetromino> nextPieces = [];
  int score = 0;
  int level = 1;
  int lines = 0;
  bool gameOver = false;
  bool isPaused = false;
  Random rng = Random();

  GameEngine() : grid = List.generate(GRID_ROWS, (_) => List.generate(GRID_COLS, (_) => Cell()));

  void init() {
    nextPieces = [createRandomTetromino(), createRandomTetromino(), createRandomTetromino()];
    spawnNext();
  }

  List<ElementType> _bag = [];

  ElementType getRandomElement() {
    if (_bag.isEmpty) {
      // Refill bag
      _bag = [
        ElementType.fire, ElementType.fire, ElementType.fire, ElementType.fire,
        ElementType.water, ElementType.water, ElementType.water, ElementType.water,
        ElementType.rock, ElementType.rock, ElementType.rock,
        ElementType.dynamite, ElementType.dynamite
      ];
      
      if (level > 5) _bag.add(ElementType.dynamite);
      if (level > 10) _bag.add(ElementType.rock);
      
      _bag.shuffle(rng);
    }
    
    return _bag.removeLast();
  }

  Tetromino createRandomTetromino() {
    var element = getRandomElement();
    // Always a single 1x1 block
    var shape = [[element]];
    
    return Tetromino(
      shape: shape,
      position: Position(0, (GRID_COLS / 2).floor()),
    );
  }

  void spawnNext() {
    currentPiece = nextPieces.removeAt(0);
    nextPieces.add(createRandomTetromino());
    
    if (checkCollision(currentPiece!, 0, 0)) {
      gameOver = true;
    }
  }

  bool checkCollision(Tetromino piece, int dRow, int dCol) {
    for (int r = 0; r < piece.shape.length; r++) {
      for (int c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] != ElementType.none) {
          int newRow = piece.position.row + r + dRow;
          int newCol = piece.position.col + c + dCol;

          if (newCol < 0 || newCol >= GRID_COLS || newRow >= GRID_ROWS) return true;
          if (newRow >= 0 && !grid[newRow][newCol].isEmpty) return true;
        }
      }
  Stopwatch stopwatch = Stopwatch();

  void update(double dt) {
    if (gameOver || isPaused) return;
    if (!stopwatch.isRunning) stopwatch.start();

    // Speed curve: 400ms base, -30ms per level, min 40ms
    int speed = max(40, 400 - (level - 1) * 30);
    
    if (stopwatch.elapsedMilliseconds > speed) {
      drop();
      stopwatch.reset();
    }
  }

  void move(int dRow, int dCol) {
    if (gameOver || isPaused || currentPiece == null) return;
    if (!checkCollision(currentPiece!, dRow, dCol)) {
      currentPiece!.position.row += dRow;
      currentPiece!.position.col += dCol;
    }
  }

  void rotate() {
    if (gameOver || isPaused || currentPiece == null) return;
    
    var originalShape = currentPiece!.shape;
    int rows = originalShape.length;
    int cols = originalShape[0].length;
    var newShape = List.generate(cols, (i) => List.generate(rows, (j) => ElementType.none));
    
    for (int r = 0; r < rows; r++) {
      for (int c = 0; c < cols; c++) {
        newShape[c][rows - 1 - r] = originalShape[r][c];
      }
    }
    
    var rotatedPiece = Tetromino(shape: newShape, position: Position(currentPiece!.position.row, currentPiece!.position.col));
    
    // Wall kicks
    if (!checkCollision(rotatedPiece, 0, 0)) {
      currentPiece!.shape = newShape;
    } else if (!checkCollision(rotatedPiece, 0, -1)) {
      currentPiece!.shape = newShape;
      currentPiece!.position.col -= 1;
    } else if (!checkCollision(rotatedPiece, 0, 1)) {
      currentPiece!.shape = newShape;
      currentPiece!.position.col += 1;
    }
  }

  void drop() {
    if (gameOver || isPaused || currentPiece == null) return;
    if (!checkCollision(currentPiece!, 1, 0)) {
      currentPiece!.position.row += 1;
    } else {
      lockPiece();
    }
  }

  void hardDrop() {
    if (gameOver || isPaused || currentPiece == null) return;
    while (!checkCollision(currentPiece!, 1, 0)) {
      currentPiece!.position.row += 1;
    }
    lockPiece();
  }

  void lockPiece() {
    // Write to grid
    List<Position> newCells = [];
    for (int r = 0; r < currentPiece!.shape.length; r++) {
      for (int c = 0; c < currentPiece!.shape[r].length; c++) {
        if (currentPiece!.shape[r][c] != ElementType.none) {
          int row = currentPiece!.position.row + r;
          int col = currentPiece!.position.col + c;
          if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
            grid[row][col] = Cell(type: currentPiece!.shape[r][c], isEmpty: false);
            newCells.add(Position(row, col));
          }
        }
      }
    }
    
    resolveBoard(newCells);
    spawnNext();
  }

  void resolveBoard(List<Position> initialActiveCells) {
    bool stable = false;
    int combo = 0;
    List<Position> activeCells = List.from(initialActiveCells);
    Set<String> exhaustedCells = {};

    while (!stable) {
      stable = true;
      List<Position> toRemove = [];
      List<String> reasons = [];

      // 1. Interactions (Check only active cells)
      for (var p in activeCells) {
        int r = p.row;
        int c = p.col;
        if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS) continue;
        if (grid[r][c].isEmpty) continue;
        
        // Skip if exhausted
        if (exhaustedCells.contains('$r,$c')) continue;

        var neighbors = [
          if (r > 0) Position(r - 1, c),
          if (r < GRID_ROWS - 1) Position(r + 1, c),
        ];

        if (grid[r][c].type == ElementType.fire) {
           // Fire vs Water: Both disappear
           for (var n in neighbors) {
             if (grid[n.row][n.col].type == ElementType.water) {
               toRemove.add(n); // Remove Water
               toRemove.add(Position(r, c)); // Remove Fire (Self)
               reasons.add('FIRE_EXTINGUISHED');
               reasons.add('FIRE_EXTINGUISHED');
               exhaustedCells.add('$r,$c');
               break; 
             }
           }
        } else if (grid[r][c].type == ElementType.water) {
           // Water vs Fire: Both disappear
           for (var n in neighbors) {
             if (grid[n.row][n.col].type == ElementType.fire) {
               toRemove.add(n); // Remove Fire
               toRemove.add(Position(r, c)); // Remove Water (Self)
               reasons.add('FIRE_EXTINGUISHED');
               reasons.add('FIRE_EXTINGUISHED');
               exhaustedCells.add('$r,$c');
               break; 
             }
           }
        } else if (grid[r][c].type == ElementType.dynamite) {
          if (r + 1 < GRID_ROWS) {
             if (grid[r + 1][c].type == ElementType.rock) {
               // Dynamite destroys Rock AND Self
               toRemove.add(Position(r + 1, c)); // Rock
               toRemove.add(Position(r, c)); // Dynamite
               reasons.add('ROCK');
               reasons.add('ROCK');
               exhaustedCells.add('$r,$c');
             } else if (!grid[r + 1][c].isEmpty) {
               // Dynamite on something else -> Wasted
               toRemove.add(Position(r, c));
               reasons.add('WASTED');
             }
          } else {
             // Floor -> Wasted
             toRemove.add(Position(r, c));
             reasons.add('WASTED');
          }
        }
      }

      if (toRemove.isNotEmpty) {
        stable = false;
        for (int i = 0; i < toRemove.length; i++) {
          var p = toRemove[i];
          if (!grid[p.row][p.col].isEmpty) {
            grid[p.row][p.col] = Cell();
            if (reasons[i] == 'FIRE_EXTINGUISHED') score += 20;
            if (reasons[i] == 'ROCK') score += 50;
            if (reasons[i] == 'WASTED') score -= 10;
          }
        }
        combo++;
      }

      // 2. Line Clears
      int linesCleared = 0;
      for (int r = 0; r < GRID_ROWS; r++) {
        if (grid[r].every((c) => !c.isEmpty)) {
          // Check if all elements are the same type
          var firstType = grid[r][0].type;
          bool allSame = grid[r].every((c) => c.type == firstType);

          if (allSame) {
            linesCleared++;
            for (int c = 0; c < GRID_COLS; c++) {
              grid[r][c] = Cell();
            }
            // Speed curve: 400ms base, -30ms per level, min 40ms
            int speed = max(40, 400 - (level - 1) * 30);
            if (stopwatch.elapsedMilliseconds > speed) {
              drop();
              stopwatch.reset();
            }
            score += linesCleared * 100 * (combo + 1);
            // Level up every 2 lines
            level = (lines / 2).floor() + 1;
          }
        }
      }
      
      if (linesCleared > 0) {
        lines += linesCleared;
        // The score and level update logic was moved inside the loop above
      }

      // 3. Gravity
      List<Position> nextActiveCells = [];
      for (int c = 0; c < GRID_COLS; c++) {
        for (int r = GRID_ROWS - 1; r >= 0; r--) {
          if (grid[r][c].isEmpty) {
            for (int k = r - 1; k >= 0; k--) {
              if (!grid[k][c].isEmpty) {
                grid[r][c] = grid[k][c];
                grid[k][c] = Cell();
                
                // Update exhausted status
                if (exhaustedCells.contains('$k,$c')) {
                   exhaustedCells.remove('$k,$c');
                   exhaustedCells.add('$r,$c');
                }
                
                nextActiveCells.add(Position(r, c));
                stable = false;
                break;
              }
            }
          }
        }
      }
      activeCells = nextActiveCells;
    }
  }
}
