import React, { useEffect, useRef, useState, useCallback } from 'react';
import { isPrime, generateMazeNumber, getPedagogicalFeedback, PRIMES_UP_TO_100 } from '../utils/mathUtils';
import { sound } from '../utils/soundEffects';

interface PacmanCanvasProps {
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onPrimesEatenChange: (count: number) => void;
  onFeedback: (feedback: { title: string; detail: string; isPrime: boolean; equation?: string } | null) => void;
  onGameOver: (finalScore: number, primesEaten: number) => void;
  isGameRunning: boolean;
  onResetGame: () => void;
}

// 19 sütun x 21 satır Klasik Pac-Man Tarzı Simetrik Labirent Haritası
// 1 = Duvar, 0 = Yürünebilir Yol, 2 = Hayalet Evi/Çıkışı
const MAZE_GRID = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,0,0,0,0,0,0,1,0,1,1,1,1],
  [0,0,0,0,0,0,0,1,1,2,1,1,0,0,0,0,0,0,0], // Yan tünel geçişleri
  [1,1,1,1,0,1,0,1,2,2,2,1,0,1,0,1,1,1,1],
  [1,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
  [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
  [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const COLS = 19;
const ROWS = 20;
const TILE_SIZE = 28; // 19 * 28 = 532px genişlik, 20 * 28 = 560px yükseklik

interface NumberItem {
  id: number;
  col: number;
  row: number;
  value: number;
  isPrime: boolean;
  scale: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
}

interface Ghost {
  x: number;
  y: number;
  col: number;
  row: number;
  dirX: number;
  dirY: number;
  color: string;
  name: string;
  speed: number;
}

export const PacmanCanvas: React.FC<PacmanCanvasProps> = ({
  onScoreChange,
  onLivesChange,
  onPrimesEatenChange,
  onFeedback,
  onGameOver,
  isGameRunning,
  onResetGame
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Oyun Durumları (Ref içinde tutulur ki 60 FPS döngüsünde react re-render gecikmesi yaşanmasın)
  const gameStateRef = useRef({
    score: 0,
    lives: 3,
    primesEaten: 0,
    pacman: {
      x: 9 * TILE_SIZE + TILE_SIZE / 2,
      y: 14 * TILE_SIZE + TILE_SIZE / 2,
      dirX: 0,
      dirY: 0,
      nextDirX: 0,
      nextDirY: 0,
      speed: 2.8,
      mouthAngle: 0.2,
      mouthSpeed: 0.04,
      mouthDir: 1,
      invulnerableTimer: 0
    },
    ghosts: [
      {
        x: 8 * TILE_SIZE + TILE_SIZE / 2,
        y: 10 * TILE_SIZE + TILE_SIZE / 2,
        col: 8,
        row: 10,
        dirX: 0,
        dirY: -1,
        color: '#ef4444', // Blinky - Kırmızı
        name: 'Kırmızı Hayalet',
        speed: 2.1
      },
      {
        x: 10 * TILE_SIZE + TILE_SIZE / 2,
        y: 10 * TILE_SIZE + TILE_SIZE / 2,
        col: 10,
        row: 10,
        dirX: 0,
        dirY: -1,
        color: '#06b6d4', // Inky - Turkuaz
        name: 'Turkuaz Hayalet',
        speed: 1.85
      }
    ] as Ghost[],
    numbers: [] as NumberItem[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    screenShake: 0,
    nextId: 1
  });

  const [activePrimesCount, setActivePrimesCount] = useState<number>(0);

  // Yürünebilir hücreleri hesapla
  const getWalkableTiles = useCallback(() => {
    const list: { col: number; row: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        // Tünel dışı ve hayalet kafesi dışı yollar
        if (MAZE_GRID[r][c] === 0 && !(r >= 8 && r <= 11 && c >= 7 && c <= 11)) {
          // Pacman başlangıç noktasından uzak olsun
          if (!(r === 14 && c === 9)) {
            list.push({ col: c, row: r });
          }
        }
      }
    }
    return list;
  }, []);

  // Labirentte sayıların dağıtımı & Her zaman EN AZ 3 Asal Sayı Bulunması Garantisi
  const spawnInitialNumbers = useCallback(() => {
    const tiles = getWalkableTiles();
    // Rastgele 18 nokta seç
    const shuffled = [...tiles].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 18);

    const items: NumberItem[] = [];
    let primeCount = 0;

    selected.forEach((tile, index) => {
      // İlk 4 tanesini garanti asal yap, geri kalanlar dengeli dağılsın
      const forcePrime = primeCount < 4;
      const val = generateMazeNumber(forcePrime);
      const isNumPrime = isPrime(val);
      if (isNumPrime) primeCount++;

      items.push({
        id: index + 1,
        col: tile.col,
        row: tile.row,
        value: val,
        isPrime: isNumPrime,
        scale: 1
      });
    });

    // Yine de 3'ten azsa birkaçını asal sayı ile değiştir
    while (primeCount < 3) {
      for (let i = 0; i < items.length; i++) {
        if (!items[i].isPrime) {
          const p = PRIMES_UP_TO_100[Math.floor(Math.random() * PRIMES_UP_TO_100.length)];
          items[i].value = p;
          items[i].isPrime = true;
          primeCount++;
          if (primeCount >= 3) break;
        }
      }
    }

    gameStateRef.current.numbers = items;
    gameStateRef.current.nextId = 100;
    setActivePrimesCount(primeCount);
  }, [getWalkableTiles]);

  // Yeni tek bir sayı üret (Yenilen sayının yerine)
  const spawnReplacementNumber = useCallback(() => {
    const state = gameStateRef.current;
    const tiles = getWalkableTiles();

    // Halihazırda dolu olmayan boş yürünebilir hücreleri bul
    const occupied = new Set(state.numbers.map(n => `${n.col},${n.row}`));
    // Pacman'in şu anki hücresini de hariç tut
    const pacCol = Math.floor(state.pacman.x / TILE_SIZE);
    const pacRow = Math.floor(state.pacman.y / TILE_SIZE);
    occupied.add(`${pacCol},${pacRow}`);

    const freeTiles = tiles.filter(t => !occupied.has(`${t.col},${t.row}`));
    if (freeTiles.length === 0) return;

    const chosenTile = freeTiles[Math.floor(Math.random() * freeTiles.length)];

    // Mevcut asal sayısını say
    const currentPrimes = state.numbers.filter(n => n.isPrime).length;
    // Eğer 3'ten az asal varsa KESİNLİKLE asal sayı üret!
    const forcePrime = currentPrimes < 3;
    const val = generateMazeNumber(forcePrime);
    const isNumPrime = isPrime(val);

    state.numbers.push({
      id: state.nextId++,
      col: chosenTile.col,
      row: chosenTile.row,
      value: val,
      isPrime: isNumPrime,
      scale: 0.2 // Belirme animasyonu için küçük başla
    });

    const newPrimesCount = state.numbers.filter(n => n.isPrime).length;
    setActivePrimesCount(newPrimesCount);
  }, [getWalkableTiles]);

  // Oyunu Sıfırla
  const resetGame = useCallback(() => {
    const state = gameStateRef.current;
    state.score = 0;
    state.lives = 3;
    state.primesEaten = 0;
    state.screenShake = 0;

    // Pacman reset
    state.pacman.x = 9 * TILE_SIZE + TILE_SIZE / 2;
    state.pacman.y = 14 * TILE_SIZE + TILE_SIZE / 2;
    state.pacman.dirX = 0;
    state.pacman.dirY = 0;
    state.pacman.nextDirX = 0;
    state.pacman.nextDirY = 0;
    state.pacman.invulnerableTimer = 0;

    // Hayaletler reset
    state.ghosts[0].x = 8 * TILE_SIZE + TILE_SIZE / 2;
    state.ghosts[0].y = 10 * TILE_SIZE + TILE_SIZE / 2;
    state.ghosts[0].dirX = 0;
    state.ghosts[0].dirY = -1;

    state.ghosts[1].x = 10 * TILE_SIZE + TILE_SIZE / 2;
    state.ghosts[1].y = 10 * TILE_SIZE + TILE_SIZE / 2;
    state.ghosts[1].dirX = 0;
    state.ghosts[1].dirY = -1;

    state.particles = [];
    state.floatingTexts = [];

    onScoreChange(0);
    onLivesChange(3);
    onPrimesEatenChange(0);
    onFeedback(null);

    spawnInitialNumbers();
  }, [onScoreChange, onLivesChange, onPrimesEatenChange, onFeedback, spawnInitialNumbers]);

  // Başlangıçta sayıları doldur
  useEffect(() => {
    spawnInitialNumbers();
  }, [spawnInitialNumbers]);

  // Tuş kontrolü
  const handleDirection = useCallback((dx: number, dy: number) => {
    gameStateRef.current.pacman.nextDirX = dx;
    gameStateRef.current.pacman.nextDirY = dy;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Ok tuşlarının tarayıcı sayfasını kaydırmasını engelle
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        handleDirection(0, -1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        handleDirection(0, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleDirection(-1, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleDirection(1, 0);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleDirection]);

  // Yürünebilirlik kontrolü
  const canMoveTo = (x: number, y: number, radius: number = 10): boolean => {
    // Tünel kontrolü (Row 9'daki yan geçişler)
    if (y >= 9 * TILE_SIZE && y < 10 * TILE_SIZE) {
      if (x < 0 || x > COLS * TILE_SIZE) return true;
    }

    const checkPoints = [
      { cx: x - radius, cy: y - radius },
      { cx: x + radius, cy: y - radius },
      { cx: x - radius, cy: y + radius },
      { cx: x + radius, cy: y + radius }
    ];

    for (const pt of checkPoints) {
      const col = Math.floor(pt.cx / TILE_SIZE);
      const row = Math.floor(pt.cy / TILE_SIZE);

      if (row < 0 || row >= ROWS || col < 0 || col >= COLS) {
        return false;
      }
      if (MAZE_GRID[row][col] === 1) {
        return false;
      }
    }
    return true;
  };

  // Parçacık ekle
  const createParticles = (x: number, y: number, color: string, count: number = 14) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      gameStateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        size: Math.random() * 4 + 2
      });
    }
  };

  // Uçuşan yazı ekle
  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    gameStateRef.current.floatingTexts.push({
      id: gameStateRef.current.nextId++,
      text,
      x,
      y,
      color,
      alpha: 1
    });
  };

  // Ana Oyun Döngüsü
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = () => {
      const state = gameStateRef.current;

      if (isGameRunning) {
        // --- 1. Pacman Hareketi ---
        const p = state.pacman;

        // Sıradaki yönü deneyelim (Köşe dönüşlerinde kolaylık sağlamak için grid hizalama)
        if (p.nextDirX !== 0 || p.nextDirY !== 0) {
          const testX = p.x + p.nextDirX * p.speed;
          const testY = p.y + p.nextDirY * p.speed;
          if (canMoveTo(testX, testY)) {
            p.dirX = p.nextDirX;
            p.dirY = p.nextDirY;
          }
        }

        // Mevcut yönde ilerle
        const newX = p.x + p.dirX * p.speed;
        const newY = p.y + p.dirY * p.speed;

        if (canMoveTo(newX, newY)) {
          p.x = newX;
          p.y = newY;
        }

        // Tünel geçişi (Ekranın solundan çıkıp sağdan girme)
        if (p.x < -TILE_SIZE / 2) {
          p.x = COLS * TILE_SIZE + TILE_SIZE / 2;
        } else if (p.x > COLS * TILE_SIZE + TILE_SIZE / 2) {
          p.x = -TILE_SIZE / 2;
        }

        // Ağız animasyonu (Sadece hareket ederken)
        if (p.dirX !== 0 || p.dirY !== 0) {
          p.mouthAngle += p.mouthSpeed * p.mouthDir;
          if (p.mouthAngle > 0.45) {
            p.mouthAngle = 0.45;
            p.mouthDir = -1;
          } else if (p.mouthAngle < 0.05) {
            p.mouthAngle = 0.05;
            p.mouthDir = 1;
          }
        }

        // Dokunulmazlık sayacı düşüşü
        if (p.invulnerableTimer > 0) {
          p.invulnerableTimer -= 1 / 60;
          if (p.invulnerableTimer < 0) p.invulnerableTimer = 0;
        }

        // --- 2. Sayı Yeme Kontrolü ---
        const pacTileCol = Math.floor(p.x / TILE_SIZE);
        const pacTileRow = Math.floor(p.y / TILE_SIZE);

        for (let i = state.numbers.length - 1; i >= 0; i--) {
          const numItem = state.numbers[i];
          const numX = numItem.col * TILE_SIZE + TILE_SIZE / 2;
          const numY = numItem.row * TILE_SIZE + TILE_SIZE / 2;

          const dist = Math.hypot(p.x - numX, p.y - numY);
          if (dist < TILE_SIZE * 0.75) {
            // Sayı yendi!
            state.numbers.splice(i, 1);

            const feedback = getPedagogicalFeedback(numItem.value);
            onFeedback({
              title: feedback.shortLabel,
              detail: feedback.detail,
              isPrime: feedback.isNumberPrime,
              equation: feedback.equation
            });

            if (numItem.isPrime) {
              // Doğru hamle: Asal Sayı Yendi!
              state.score += 10;
              state.primesEaten += 1;
              onScoreChange(state.score);
              onPrimesEatenChange(state.primesEaten);

              sound.playEatPrime();
              createParticles(numX, numY, '#22c55e', 18);
              addFloatingText(`+10 ${numItem.value} ASAL!`, numX, numY - 10, '#4ade80');
            } else {
              // Hatalı hamle: Bileşik veya 1 Yendi!
              state.score = Math.max(0, state.score - 5);
              state.lives -= 1;
              onScoreChange(state.score);
              onLivesChange(state.lives);

              sound.playEatComposite();
              state.screenShake = 16;
              createParticles(numX, numY, '#ef4444', 16);
              addFloatingText(`-5 BİLEŞİK! (${numItem.value})`, numX, numY - 10, '#f87171');

              if (state.lives <= 0) {
                sound.playGameOver();
                onGameOver(state.score, state.primesEaten);
                return;
              }
            }

            // Yenilen sayının yerine yeni sayı koy ve en az 3 asal kuralını koru
            spawnReplacementNumber();
            break;
          }
        }

        // --- 3. Hayaletlerin Hareketi ---
        state.ghosts.forEach((ghost, gIndex) => {
          // Hayalet grid merkezine yaklaştığında yön seçer
          const cellCenterX = Math.floor(ghost.x / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
          const cellCenterY = Math.floor(ghost.y / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
          const distToCenter = Math.hypot(ghost.x - cellCenterX, ghost.y - cellCenterY);

          if (distToCenter < ghost.speed) {
            ghost.x = cellCenterX;
            ghost.y = cellCenterY;

            // Olası geçerli hareket yönleri
            const possibleDirs = [
              { dx: 0, dy: -1 },
              { dx: 0, dy: 1 },
              { dx: -1, dy: 0 },
              { dx: 1, dy: 0 }
            ].filter(dir => {
              // Geriye dönmeyi engelle (zorunlu olmadıkça)
              if (dir.dx === -ghost.dirX && dir.dy === -ghost.dirY) return false;
              const targetX = ghost.x + dir.dx * TILE_SIZE;
              const targetY = ghost.y + dir.dy * TILE_SIZE;
              return canMoveTo(targetX, targetY, 8);
            });

            if (possibleDirs.length > 0) {
              if (gIndex === 0 && Math.random() < 0.65) {
                // Kırmızı hayalet akıllıca Pacman'e doğru yönelir
                possibleDirs.sort((a, b) => {
                  const distA = Math.hypot(ghost.x + a.dx * TILE_SIZE - p.x, ghost.y + a.dy * TILE_SIZE - p.y);
                  const distB = Math.hypot(ghost.x + b.dx * TILE_SIZE - p.x, ghost.y + b.dy * TILE_SIZE - p.y);
                  return distA - distB;
                });
                ghost.dirX = possibleDirs[0].dx;
                ghost.dirY = possibleDirs[0].dy;
              } else {
                // Diğer hayalet devriye gezer
                const chosen = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                ghost.dirX = chosen.dx;
                ghost.dirY = chosen.dy;
              }
            } else {
              // Çıkmaz sokak: geri dön
              ghost.dirX = -ghost.dirX;
              ghost.dirY = -ghost.dirY;
            }
          }

          ghost.x += ghost.dirX * ghost.speed;
          ghost.y += ghost.dirY * ghost.speed;

          // Hayaletle çarpışma kontrolü
          const ghostDist = Math.hypot(p.x - ghost.x, p.y - ghost.y);
          if (ghostDist < TILE_SIZE * 0.7 && p.invulnerableTimer === 0) {
            // Can kaybı!
            state.lives -= 1;
            onLivesChange(state.lives);
            p.invulnerableTimer = 2.5; // 2.5 saniye dokunulmazlık ve yanıp sönme
            state.screenShake = 18;
            sound.playGhostHit();

            createParticles(p.x, p.y, '#f97316', 20);
            addFloatingText('HAYALET! -1 CAN', p.x, p.y - 15, '#fb923c');

            onFeedback({
              title: 'HAYALETE YAKALANDIN!',
              detail: 'Hayaletlere dikkat et! Labirentte sadece asal sayıları toplayarak puan kazanmalısın.',
              isPrime: false
            });

            if (state.lives <= 0) {
              sound.playGameOver();
              onGameOver(state.score, state.primesEaten);
              return;
            }
          }
        });

        // Parçacık güncellemesi
        for (let i = state.particles.length - 1; i >= 0; i--) {
          const pt = state.particles[i];
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.alpha -= 0.025;
          if (pt.alpha <= 0) {
            state.particles.splice(i, 1);
          }
        }

        // Uçuşan yazı güncellemesi
        for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
          const ft = state.floatingTexts[i];
          ft.y -= 0.8;
          ft.alpha -= 0.02;
          if (ft.alpha <= 0) {
            state.floatingTexts.splice(i, 1);
          }
        }

        // Sayı belirme animasyonu
        state.numbers.forEach(num => {
          if (num.scale < 1) {
            num.scale = Math.min(1, num.scale + 0.1);
          }
        });
      }

      // --- ÇİZİM AŞAMASI (CANVAS RENDER) ---
      ctx.save();

      // Ekran sarsıntısı efekti
      if (state.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * state.screenShake;
        const shakeY = (Math.random() - 0.5) * state.screenShake;
        ctx.translate(shakeX, shakeY);
        state.screenShake *= 0.88;
        if (state.screenShake < 0.5) state.screenShake = 0;
      }

      // Arka planı temizle
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Labirent Duvarlarını Çiz (Retro Çift Çizgili Neon Mavi)
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 6;

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (MAZE_GRID[r][c] === 1) {
            const wx = c * TILE_SIZE;
            const wy = r * TILE_SIZE;

            ctx.fillStyle = '#0f172a';
            ctx.fillRect(wx + 2, wy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeRect(wx + 2, wy + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          }
        }
      }
      ctx.shadowBlur = 0; // Gölgeyi sıfırla

      // Sayıları Çiz
      state.numbers.forEach(item => {
        const cx = item.col * TILE_SIZE + TILE_SIZE / 2;
        const cy = item.row * TILE_SIZE + TILE_SIZE / 2;
        const radius = (TILE_SIZE / 2 - 2) * item.scale;

        ctx.save();
        ctx.translate(cx, cy);

        // Sayı Rozeti Arka Planı (Şık retro kart)
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#64748b';
        ctx.stroke();

        // Sayı Yazısı
        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold ${item.value > 99 ? '11px' : '13px'} sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.value.toString(), 0, 1);

        ctx.restore();
      });

      // Hayaletleri Çiz
      state.ghosts.forEach(ghost => {
        ctx.save();
        ctx.translate(ghost.x, ghost.y);

        const r = TILE_SIZE * 0.42;

        // Hayalet Gövdesi
        ctx.beginPath();
        ctx.arc(0, -r * 0.2, r, Math.PI, 0, false);
        // Etek kıvrımları
        ctx.lineTo(r, r);
        ctx.lineTo(r * 0.4, r * 0.6);
        ctx.lineTo(0, r);
        ctx.lineTo(-r * 0.4, r * 0.6);
        ctx.lineTo(-r, r);
        ctx.closePath();

        ctx.fillStyle = ghost.color;
        ctx.shadowColor = ghost.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Gözler (Beyaz küre)
        const eyeOffset = r * 0.35;
        const eyeRadius = r * 0.28;
        const pupilRadius = r * 0.14;

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-eyeOffset, -r * 0.2, eyeRadius, 0, Math.PI * 2);
        ctx.arc(eyeOffset, -r * 0.2, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Göz bebekleri (Hareket yönüne bakar)
        const lookX = ghost.dirX * (eyeRadius * 0.5);
        const lookY = ghost.dirY * (eyeRadius * 0.5);

        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(-eyeOffset + lookX, -r * 0.2 + lookY, pupilRadius, 0, Math.PI * 2);
        ctx.arc(eyeOffset + lookX, -r * 0.2 + lookY, pupilRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      // Pacman'i Çiz
      const p = state.pacman;
      // Dokunulmazken yanıp sönme efekti
      const isVisible = p.invulnerableTimer === 0 || Math.floor(p.invulnerableTimer * 10) % 2 === 0;

      if (isVisible) {
        ctx.save();
        ctx.translate(p.x, p.y);

        // Pacman dönüş açısını hesapla
        let rotation = 0;
        if (p.dirX === 1) rotation = 0;
        else if (p.dirX === -1) rotation = Math.PI;
        else if (p.dirY === 1) rotation = Math.PI / 2;
        else if (p.dirY === -1) rotation = -Math.PI / 2;

        ctx.rotate(rotation);

        const pacRadius = TILE_SIZE * 0.46;

        // Pacman Sarı Gövde ve Açılır Kapanır Ağız
        ctx.beginPath();
        ctx.arc(0, 0, pacRadius, p.mouthAngle, Math.PI * 2 - p.mouthAngle);
        ctx.lineTo(0, 0);
        ctx.closePath();

        ctx.fillStyle = '#facc15'; // Parlak arcade sarısı
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Pacman Gözü
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(pacRadius * 0.15, -pacRadius * 0.5, pacRadius * 0.14, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Parçacıkları Çiz
      state.particles.forEach(pt => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.alpha);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Uçuşan Yazıları Çiz
      state.floatingTexts.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.alpha);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 14px "Press Start 2P", monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isGameRunning, onFeedback, onScoreChange, onLivesChange, onPrimesEatenChange, onGameOver, spawnReplacementNumber]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Oyun Tuvali */}
      <div className="relative border-4 border-blue-500 rounded-2xl overflow-hidden shadow-2xl arcade-box bg-slate-950">
        <canvas
          ref={canvasRef}
          width={COLS * TILE_SIZE}
          height={ROWS * TILE_SIZE}
          className="block max-w-full h-auto touch-none"
        />

        {/* Ekranda Aktif Kalan Asal Sayı Göstergesi Rozeti */}
        <div className="absolute top-2 right-2 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/40 text-xs font-mono text-emerald-400 flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Labirentte Asal: <strong>{activePrimesCount}</strong> (≥3)</span>
        </div>
      </div>

      {/* Dokunmatik / Mobil & Akıllı Tahta D-Pad Kontrolleri */}
      <div className="mt-4 flex flex-col items-center md:hidden w-full max-w-xs">
        <div className="text-xs text-slate-400 mb-2 font-mono">DOKUNMATİK KONTROLLER</div>
        <button
          onClick={() => handleDirection(0, -1)}
          className="w-16 h-12 bg-slate-800 active:bg-blue-600 rounded-t-xl border border-slate-600 text-white font-bold text-xl flex items-center justify-center shadow-lg active:scale-95"
          aria-label="Yukarı Git"
        >
          ▲
        </button>
        <div className="flex gap-4 my-1">
          <button
            onClick={() => handleDirection(-1, 0)}
            className="w-16 h-12 bg-slate-800 active:bg-blue-600 rounded-l-xl border border-slate-600 text-white font-bold text-xl flex items-center justify-center shadow-lg active:scale-95"
            aria-label="Sola Git"
          >
            ◀
          </button>
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400 text-xs font-bold font-arcade">
            PAC
          </div>
          <button
            onClick={() => handleDirection(1, 0)}
            className="w-16 h-12 bg-slate-800 active:bg-blue-600 rounded-r-xl border border-slate-600 text-white font-bold text-xl flex items-center justify-center shadow-lg active:scale-95"
            aria-label="Sağa Git"
          >
            ▶
          </button>
        </div>
        <button
          onClick={() => handleDirection(0, 1)}
          className="w-16 h-12 bg-slate-800 active:bg-blue-600 rounded-b-xl border border-slate-600 text-white font-bold text-xl flex items-center justify-center shadow-lg active:scale-95"
          aria-label="Aşağı Git"
        >
          ▼
        </button>
      </div>
    </div>
  );
};
