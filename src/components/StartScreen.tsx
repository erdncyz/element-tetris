import React from 'react';
import './StartScreen.css';

interface StartScreenProps {
  onStartGame: () => void;
  onContinueGame?: () => void;
  canContinue?: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame, onContinueGame, canContinue }) => {
  return (
    <div className="start-screen">
      <div className="start-screen-content">
        <h1 className="game-title">Element Tetris</h1>
        <p className="game-subtitle">🔥💧🪨🧨 Elementlerin Gücünü Birleştir!</p>

        <div className="game-info-container">
          <div className="info-section">
            <h3>📱 Nasıl Oynanır?</h3>
            <ul>
              <li>👆 Dokun - Döndür</li>
              <li>👈👉 Sağa/Sola kaydır - Hareket</li>
              <li>👇 Aşağı kaydır - Anında düşür</li>
              <li>👆 Yukarı kaydır - Hızlı düşür</li>
            </ul>
          </div>

          <div className="info-section elements-section">
            <h3>⚗️ Element Etkileşimleri</h3>
            <div className="element-grid">
              <div className="element-item">
                <span className="element-icon">💧</span>
                <span className="element-vs">→</span>
                <span className="element-icon">🔥</span>
                <span className="element-result">= Su ateşi söndürür!</span>
              </div>
              <div className="element-item">
                <span className="element-icon">🧨</span>
                <span className="element-vs">→</span>
                <span className="element-icon">🪨</span>
                <span className="element-result">= Dinamit kayaları patlatır!</span>
              </div>
              <div className="element-item">
                <span className="element-icon">🔥</span>
                <span className="element-vs">→</span>
                <span className="element-icon">🧨</span>
                <span className="element-result">= Ateş dinamiti patlatır!</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>🏆 Puanlama</h3>
            <ul>
              <li>Yatay satır tamamen dolunca silinir</li>
              <li>Her satır silme: 100 × Seviye puanı</li>
              <li>Çoklu satır silme: Bonus puan!</li>
              <li>Element birleşimleri: Ekstra bonus!</li>
              <li>Her 10 satırda seviye artar, hız yükselir</li>
            </ul>
          </div>
        </div>

        <div className="button-container">
          {canContinue && onContinueGame && (
            <button className="continue-button" onClick={onContinueGame}>
              <span className="button-icon">▶️</span>
              <span className="button-text">DEVAM ET</span>
            </button>
          )}
          <button className="start-button" onClick={onStartGame}>
            <span className="button-icon">🎮</span>
            <span className="button-text">YENİ OYUN</span>
          </button>
        </div>

        <div className="developer-credit">
          <a
            href="https://erdincyilmaz.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Developed by Mercury Software
          </a>
        </div>
      </div>
    </div>
  );
};
