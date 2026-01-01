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
      home: const StartScreen(),
    );
  }
}

// Start Screen Widget
class StartScreen extends StatelessWidget {
  const StartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0f0c29),
              Color(0xFF302b63),
              Color(0xFF24243e),
              Color(0xFF1a1a2e),
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: [
                const SizedBox(height: 20),
                // Game Title
                ShaderMask(
                  shaderCallback: (bounds) => const LinearGradient(
                    colors: [
                      Color(0xFF667eea),
                      Color(0xFF764ba2),
                      Color(0xFFf093fb),
                      Color(0xFF4facfe),
                    ],
                  ).createShader(bounds),
                  child: const Text(
                    'Element Tetris',
                    style: TextStyle(
                      fontSize: 36,
                      fontWeight: FontWeight.w900,
                      color: Colors.white,
                      letterSpacing: 2,
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                const Text(
                  '🔥💧🪨🧨 Elementlerin Gücünü Birleştir!',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white70,
                    letterSpacing: 1,
                  ),
                ),
                const SizedBox(height: 30),

                // Info Sections
                _buildInfoSection(
                  '🎮 Nasıl Oynanır?',
                  [
                    '⬅️ ➡️ Sol/Sağ tuşları ile hareket',
                    '⬆️ Yukarı tuşu ile döndür',
                    '⬇️ Aşağı tuşu ile hızlı düşür',
                    '⎵ Space tuşu ile anında düşür',
                    'P Duraklat',
                  ],
                ),
                const SizedBox(height: 12),

                _buildInfoSection(
                  '📱 Dokunmatik Kontroller',
                  [
                    '👆 Dokun - Döndür',
                    '👈👉 Sağa/Sola kaydır - Hareket',
                    '👇 Aşağı kaydır - Anında düşür',
                    '👆 Yukarı kaydır - Hızlı düşür',
                  ],
                ),
                const SizedBox(height: 12),

                // Elements Section
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(0.1)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      ShaderMask(
                        shaderCallback: (bounds) => const LinearGradient(
                          colors: [Color(0xFF4facfe), Color(0xFF00f2fe)],
                        ).createShader(bounds),
                        child: const Text(
                          '⚗️ Element Etkileşimleri',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildElementRow('💧', '→', '🔥', '= Su ateşi söndürür!'),
                      _buildElementRow('🧨', '→', '🪨', '= Dinamit kayaları patlatır!'),
                      _buildElementRow('🔥', '→', '🧨', '= Ateş dinamiti patlatır!'),
                    ],
                  ),
                ),
                const SizedBox(height: 12),

                _buildInfoSection(
                  '🏆 Puanlama',
                  [
                    'Her satır silme: 100 × Seviye puanı',
                    'Element birleşimleri: Bonus puan!',
                    'Seviye arttıkça hız artar',
                  ],
                ),
                const SizedBox(height: 30),

                // Start Button
                GestureDetector(
                  onTap: () {
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(builder: (_) => const GamePage()),
                    );
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF43e97b), Color(0xFF38f9d7)],
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF43e97b).withOpacity(0.4),
                          blurRadius: 20,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('🎮', style: TextStyle(fontSize: 24)),
                        SizedBox(width: 12),
                        Text(
                          'YENİ OYUN',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF0a0a0a),
                            letterSpacing: 2,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 30),

                // Developer Credit
                GestureDetector(
                  onTap: () {
                    // Could open URL
                  },
                  child: Text(
                    'Developed by Mercury Software',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withOpacity(0.3),
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInfoSection(String title, List<String> items) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShaderMask(
            shaderCallback: (bounds) => const LinearGradient(
              colors: [Color(0xFF4facfe), Color(0xFF00f2fe)],
            ).createShader(bounds),
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(height: 8),
          ...items.map((item) => Padding(
            padding: const EdgeInsets.symmetric(vertical: 3),
            child: Text(
              item,
              style: TextStyle(
                fontSize: 13,
                color: Colors.white.withOpacity(0.8),
              ),
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildElementRow(String icon1, String arrow, String icon2, String result) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Text(icon1, style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 8),
          Text(arrow, style: TextStyle(color: Colors.white.withOpacity(0.4))),
          const SizedBox(width: 8),
          Text(icon2, style: const TextStyle(fontSize: 20)),
          const SizedBox(width: 8),
          Text(
            result,
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withOpacity(0.7),
            ),
          ),
        ],
      ),
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
                  const SizedBox(height: 10),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.grey[700]),
                    onPressed: () {
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(builder: (_) => const StartScreen()),
                      );
                    },
                    child: const Text('ANA MENÜ'),
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
