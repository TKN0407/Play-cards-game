import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  Timer, 
  Footprints, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Check, 
  Award,
  HelpCircle
} from 'lucide-react';
import { generateDeck } from './data/cards';
import { playFlipSound, playMatchSound, playMismatchSound, playWinSound } from './utils/sound';
import './App.css';

export default function App() {
  const [cards, setCards] = useState(() => generateDeck());
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIds, setMatchedIds] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bestScore, setBestScore] = useState(() => {
    try {
      const saved = localStorage.getItem('memory_game_best');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isPlaying && !isCompleted) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isCompleted]);

  // Restart Game
  const restartGame = useCallback(() => {
    setCards(generateDeck());
    setFlippedIndices([]);
    setMatchedIds(new Set());
    setMoves(0);
    setSeconds(0);
    setIsPlaying(false);
    setIsCompleted(false);
    setIsLocked(false);
  }, []);

  // Format time MM:SS
  const formatTime = (totalSec) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Trigger celebration confetti
  const triggerConfetti = () => {
    try {
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 999 };

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 45 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.6 } });
        confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.6 } });
      }, 250);
    } catch (e) {
      // Confetti fallback
    }
  };

  // Handle Card Click
  const handleCardClick = (index) => {
    if (isLocked) return;
    if (flippedIndices.includes(index)) return;
    
    const card = cards[index];
    if (matchedIds.has(card.cardId)) return;

    // Start timer on first flip
    if (!isPlaying && !isCompleted) {
      setIsPlaying(true);
    }

    if (soundEnabled) {
      playFlipSound();
    }

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    // If 2 cards are flipped
    if (nextFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.cardId === secondCard.cardId) {
        // MATCH!
        if (soundEnabled) {
          setTimeout(() => playMatchSound(), 150);
        }

        const nextMatched = new Set(matchedIds);
        nextMatched.add(firstCard.cardId);
        setMatchedIds(nextMatched);
        setFlippedIndices([]);

        // Check if all 8 pairs matched (16 cards total)
        if (nextMatched.size === 8) {
          setIsCompleted(true);
          setIsPlaying(false);
          if (soundEnabled) {
            setTimeout(() => playWinSound(), 400);
          }
          triggerConfetti();

          // Check Best Score
          const currentMoves = moves + 1;
          const currentTime = seconds;
          if (!bestScore || currentMoves < bestScore.moves || (currentMoves === bestScore.moves && currentTime < bestScore.time)) {
            const newBest = { moves: currentMoves, time: currentTime };
            setBestScore(newBest);
            try {
              localStorage.setItem('memory_game_best', JSON.stringify(newBest));
            } catch (e) {
              // Localstorage quota or blocked
            }
          }
        }
      } else {
        // MISMATCH
        setIsLocked(true);
        if (soundEnabled) {
          setTimeout(() => playMismatchSound(), 200);
        }
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
        }, 850);
      }
    }
  };

  // Calculate Stars Rating
  const getRating = () => {
    if (moves <= 11) return { stars: '⭐⭐⭐', text: '神之記憶！登峰造極 👑' };
    if (moves <= 16) return { stars: '⭐⭐⭐', text: '極度出色！記憶大師 🏆' };
    if (moves <= 22) return { stars: '⭐⭐', text: '表現優秀！眼明手快 ✨' };
    return { stars: '⭐', text: '恭喜通關！再接再厲 🚀' };
  };

  return (
    <div className="game-container">
      {/* Header */}
      <header className="game-header">
        <div className="brand-badge">
          <Sparkles size={14} />
          <span>經典益智腦力對決</span>
        </div>
        <h1 className="game-title">
          <span>🃏</span> 記憶翻牌大挑戰
        </h1>
        <p className="game-subtitle">翻開兩張相同卡片即可消除，考驗你的專注與記憶極限！</p>
      </header>

      {/* Status Bar */}
      <div className="status-bar">
        <div className="stat-item">
          <div className="stat-label">
            <Footprints size={15} />
            <span>步數</span>
          </div>
          <div className="stat-value highlight" id="stat-moves">{moves}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">
            <Timer size={15} />
            <span>計時</span>
          </div>
          <div className="stat-value timer" id="stat-timer">{formatTime(seconds)}</div>
        </div>

        <div className="stat-item">
          <div className="stat-label">
            <Award size={15} />
            <span>進度</span>
          </div>
          <div className="stat-value progress" id="stat-progress">{matchedIds.size} / 8</div>
        </div>
      </div>

      {/* Control Actions & Best Record */}
      <div className="control-bar">
        <button 
          className="action-btn primary" 
          onClick={restartGame}
          id="btn-restart"
          title="重新洗牌開始"
        >
          <RotateCcw size={16} />
          <span>重新開始</span>
        </button>

        {bestScore && (
          <div className="best-record-pill">
            <Trophy size={14} color="#f59e0b" />
            <span>最佳: {bestScore.moves} 步 ({formatTime(bestScore.time)})</span>
          </div>
        )}

        <button 
          className="action-btn icon-only" 
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? '靜音' : '開啟音效'}
          id="btn-sound-toggle"
        >
          {soundEnabled ? <Volume2 size={18} color="#a5b4fc" /> : <VolumeX size={18} color="#94a3b8" />}
        </button>
      </div>

      {/* 4x4 Grid (16 Cards) */}
      <main className="cards-grid" id="cards-grid">
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index);
          const isMatched = matchedIds.has(card.cardId);
          const showFace = isFlipped || isMatched;

          return (
            <div
              key={card.instanceId}
              className={`card-wrapper ${showFace ? 'flipped' : ''} ${isMatched ? 'matched' : ''} ${isLocked ? 'disabled' : ''}`}
              onClick={() => handleCardClick(index)}
              id={`card-${index}`}
            >
              <div className="card-inner">
                {/* Back Face (Face down) */}
                <div className="card-back">
                  <div className="card-back-icon">?</div>
                </div>

                {/* Front Face (Face up) */}
                <div className="card-front" style={{ background: card.bg }}>
                  <div className="card-front-content">
                    <span className="card-emoji">{card.emoji}</span>
                    <span className="card-name">{card.name}</span>
                  </div>
                  {isMatched && (
                    <div className="card-matched-badge">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* Completion Modal */}
      {isCompleted && (
        <div className="modal-backdrop" id="completion-modal">
          <div className="modal-content">
            <div className="modal-trophy">
              🏆
            </div>

            <div className="modal-title-wrap">
              <h2 className="modal-title">恭喜完成！</h2>
              <p className="modal-subtitle">{getRating().text}</p>
            </div>

            <div className="modal-stars">
              {getRating().stars}
            </div>

            <div className="modal-stats-grid">
              <div className="modal-stat-box">
                <span className="modal-stat-label">總消耗步數</span>
                <span className="modal-stat-num">{moves} 步</span>
              </div>
              <div className="modal-stat-box">
                <span className="modal-stat-label">通關總時間</span>
                <span className="modal-stat-num">{formatTime(seconds)}</span>
              </div>
            </div>

            {bestScore && (
              <div className="best-record-pill">
                <Trophy size={14} color="#f59e0b" />
                <span>歷史最佳紀錄：{bestScore.moves} 步 · {formatTime(bestScore.time)}</span>
              </div>
            )}

            <div className="modal-btn-group">
              <button 
                className="modal-btn-restart" 
                onClick={restartGame}
                id="btn-modal-restart"
              >
                <RotateCcw size={18} />
                <span>再來一局</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
