import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'game_engine.dart';

void main() {
  runApp(const ElementTetrisApp());
}

class ElementTetrisApp extends StatelessWidget {
  const ElementTetrisApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Element Tetris',
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF050505),
      ),
      home: const GamePage(),
    );
  }
}

class GamePage extends StatefulWidget {
  const GamePage({super.key});

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  late GameEngine engine;
  Timer? _timer;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    engine = GameEngine();
    engine.init();
    startTimer();
  }

  void startTimer() {
    _timer?.cancel();
    int speed = (1000 - (engine.level - 1) * 100).clamp(100, 1000);
    _timer = Timer.periodic(Duration(milliseconds: speed), (timer) {
      if (!engine.isPaused && !engine.gameOver) {
        setState(() {
          engine.drop();
        });
      }
    });
  }

  void _handleKeyEvent(RawKeyEvent event) {
    if (event is RawKeyDownEvent) {
      if (engine.gameOver) return;
      
      setState(() {
        if (event.logicalKey == LogicalKeyboardKey.arrowLeft) {
          engine.move(0, -1);
        } else if (event.logicalKey == LogicalKeyboardKey.arrowRight) {
          engine.move(0, 1);
        } else if (event.logicalKey == LogicalKeyboardKey.arrowDown) {
          engine.drop();
        } else if (event.logicalKey == LogicalKeyboardKey.arrowUp) {
          engine.rotate();
        } else if (event.logicalKey == LogicalKeyboardKey.space) {
          engine.hardDrop();
        } else if (event.logicalKey == LogicalKeyboardKey.keyP) {
          engine.isPaused = !engine.isPaused;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: RawKeyboardListener(
        focusNode: _focusNode,
        autofocus: true,
        onKey: _handleKeyEvent,
        child: Row(
          children: [
            // Sidebar
            Expanded(
              flex: 1,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _buildStat('SCORE', engine.score),
                  _buildStat('LEVEL', engine.level),
                  _buildStat('LINES', engine.lines),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () => setState(() => engine.isPaused = !engine.isPaused),
                    child: Text(engine.isPaused ? 'RESUME' : 'PAUSE'),
                  ),
                  const SizedBox(height: 10),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                    onPressed: () {
                      setState(() {
                        engine = GameEngine();
                        engine.init();
                        startTimer();
                      });
                    },
                    child: const Text('RESTART'),
                  ),
                ],
              ),
            ),
            // Game Board
            Expanded(
              flex: 2,
              child: Center(
                child: AspectRatio(
                  aspectRatio: GRID_COLS / GRID_ROWS,
                  child: Container(
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.white24),
                      color: Colors.black,
                    ),
                    child: GridView.builder(
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: GRID_COLS,
                      ),
                      itemCount: GRID_ROWS * GRID_COLS,
                      itemBuilder: (context, index) {
                        int r = index ~/ GRID_COLS;
                        int c = index % GRID_COLS;
                        return _buildCell(r, c);
                      },
                    ),
                  ),
                ),
              ),
            ),
            // Next Piece
            Expanded(
              flex: 1,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('NEXT', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  ...engine.nextPieces.take(3).map((p) => SizedBox(
                    width: 80,
                    height: 80,
                    child: _buildPreview(p),
                  )),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCell(int r, int c) {
    Cell cell = engine.grid[r][c];
    
    // Check current piece
    if (engine.currentPiece != null) {
      Tetromino p = engine.currentPiece!;
      int pr = r - p.position.row;
      int pc = c - p.position.col;
      if (pr >= 0 && pr < p.shape.length && pc >= 0 && pc < p.shape[0].length) {
        if (p.shape[pr][pc] != ElementType.none) {
          cell = Cell(type: p.shape[pr][pc], isEmpty: false);
        }
      }
    }

    if (cell.isEmpty) return Container();

    Color color;
    String emoji = '';
    switch (cell.type) {
      case ElementType.fire: color = Colors.orange; emoji = '🔥'; break;
      case ElementType.water: color = Colors.blue; emoji = '💧'; break;
      case ElementType.rock: color = Colors.grey; emoji = '🪨'; break;
      case ElementType.dynamite: color = Colors.red; emoji = '🧨'; break;
      default: color = Colors.transparent;
    }

    return Container(
      margin: const EdgeInsets.all(1),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        border: Border.all(color: color),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Center(child: Text(emoji, style: const TextStyle(fontSize: 16))),
    );
  }

  Widget _buildPreview(Tetromino p) {
    return GridView.builder(
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: p.shape[0].length,
      ),
      itemCount: p.shape.length * p.shape[0].length,
      itemBuilder: (context, index) {
        int r = index ~/ p.shape[0].length;
        int c = index % p.shape[0].length;
        if (p.shape[r][c] == ElementType.none) return Container();
        
        Color color;
        switch (p.shape[r][c]) {
          case ElementType.fire: color = Colors.orange; break;
          case ElementType.water: color = Colors.blue; break;
          case ElementType.rock: color = Colors.grey; break;
          case ElementType.dynamite: color = Colors.red; break;
          default: color = Colors.transparent;
        }
        return Container(
          margin: const EdgeInsets.all(1),
          color: color,
        );
      },
    );
  }

  Widget _buildStat(String label, int value) {
    return Container(
      margin: const EdgeInsets.all(8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white10,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          Text('$value', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
