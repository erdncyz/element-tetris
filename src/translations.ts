export type Language = 'tr' | 'en';

export const translations = {
    tr: {
        score: 'SKOR',
        level: 'SEVİYE',
        lines: 'SATIR',
        resume: 'DEVAM',
        pause: 'DURAKLAT',
        restart: 'YENİDEN BAŞLAT',
        mainMenu: 'ANA MENÜ',
        gameOver: 'OYUN BİTTİ',
        finalScore: 'Son Skor',
        tryAgain: 'Tekrar Dene',
        paused: 'DURAKLATILDI',
        subtitle: '🔥💧🪨🧨 Elementlerin Gücünü Birleştir!',
        howToPlay: '📱 Nasıl Oynanır?',
        howToPlayItems: [
            '👆 Dokun - Döndür',
            '👈👉 Sağa/Sola kaydır - Hareket',
            '👇 Aşağı kaydır - Anında düşür',
            '👆 Yukarı kaydır - Hızlı düşür'
        ],
        scoring: '🏆 Puanlama',
        scoringText: 'Temel hedefin, aynı türden elementleri yan yana dizerek bir yatay satırı tamamen doldurmak ve seviye atlamak! Bu süreçte elementleri birbirine temas ettirip etkileşime sokarak puanını katla ve zirveye ulaş.',
        elementInteractions: '⚗️ Element Etkileşimleri',
        interactionWaterFire: 'Su ve Ateş birbirini yok eder.',
        interactionDynamiteRock: 'Dinamit taşı patlatır, yoksa kaybolur.',
        interactionFireDynamite: 'Ateş dinamiti patlatır!',
        continue: 'DEVAM ET',
        newGame: 'YENİ OYUN',
        languageName: 'Türkçe'
    },
    en: {
        score: 'SCORE',
        level: 'LEVEL',
        lines: 'LINES',
        resume: 'RESUME',
        pause: 'PAUSE',
        restart: 'RESTART',
        mainMenu: 'MAIN MENU',
        gameOver: 'GAME OVER',
        finalScore: 'Final Score',
        tryAgain: 'Try Again',
        paused: 'PAUSED',
        subtitle: '🔥💧🪨🧨 Unite the Power of Elements!',
        howToPlay: '📱 How to Play?',
        howToPlayItems: [
            '👆 Tap - Rotate',
            '👈👉 Swipe Left/Right - Move',
            '👇 Swipe Down - Hard Drop',
            '👆 Swipe Up - Soft Drop'
        ],
        scoring: '🏆 Scoring',
        scoringText: 'Your main goal is to fill a horizontal line by arranging elements and level up! Boost your score by making elements interact with each other to reach the peak.',
        elementInteractions: '⚗️ Element Interactions',
        interactionWaterFire: 'Water and Fire destroy each other.',
        interactionDynamiteRock: 'Dynamite blasts rock, else vanishes.',
        interactionFireDynamite: 'Fire detonates dynamite!',
        continue: 'CONTINUE',
        newGame: 'NEW GAME',
        languageName: 'English'
    }
};
