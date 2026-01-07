import React from 'react';
import './StartScreen.css';
import { translations, type Language } from '../translations';

interface StartScreenProps {
  onStartGame: () => void;
  onContinueGame?: () => void;
  canContinue?: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onContinueGame,
  canContinue,
  language,
  setLanguage
}) => {
  const t = translations[language];

  return (
    <div className="start-screen">
      <div className="language-selector">
        <button
          className={`lang-btn ${language === 'tr' ? 'active' : ''}`}
          onClick={() => setLanguage('tr')}
        >
          🇹🇷 TR
        </button>
        <button
          className={`lang-btn ${language === 'en' ? 'active' : ''}`}
          onClick={() => setLanguage('en')}
        >
          🇺🇸 EN
        </button>
      </div>

      <div className="start-screen-content">
        <h1 className="game-title">Element Tetris</h1>
        <p className="game-subtitle">{t.subtitle}</p>

        <div className="game-info-container">
          <div className="info-section">
            <h3>{t.howToPlay}</h3>
            <ul>
              {t.howToPlayItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="info-section">
            <h3>{t.scoring}</h3>
            <p className="description-text">{t.scoringText}</p>
          </div>

          <div className="info-section elements-section">
            <h3>{t.elementInteractions}</h3>
            <div className="element-grid">
              <div className="element-item">
                <span className="element-icon">💧</span>
                <span className="element-vs">→</span>
                <span className="element-icon">🔥</span>
                <span className="element-result">= {t.interactionWaterFire}</span>
              </div>
              <div className="element-item">
                <span className="element-icon">🧨</span>
                <span className="element-vs">→</span>
                <span className="element-icon">🪨</span>
                <span className="element-result">= {t.interactionDynamiteRock}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="button-container">
          {canContinue && onContinueGame && (
            <button className="continue-button" onClick={onContinueGame}>
              <span className="button-icon">▶️</span>
              <span className="button-text">{t.continue}</span>
            </button>
          )}
          <button className="start-button" onClick={onStartGame}>
            <span className="button-icon">🎮</span>
            <span className="button-text">{t.newGame}</span>
          </button>
        </div>

        <div className="developer-credit">
          <a
            href="https://erdincyilmaz.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Developed by Erdinç YILMAZ
          </a>
        </div>
      </div>
    </div>
  );
};
