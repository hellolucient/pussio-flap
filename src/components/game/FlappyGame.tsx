"use client"

import React, { useEffect, useRef, useState } from 'react';
import { useFlaps } from '@/contexts/FlapsContext';

interface GameState {
  catY: number;
  catVelocity: number;
  obstacles: Obstacle[];
  gameLoop: number | null;
  lastTimestamp: number;
  lastObstacleSpawn: number;
  scrollX: number;
  isStarted: boolean;
  score: number;
  flaps: number;
}

interface Obstacle {
  x: number;
  gapTop: number;
  gapBottom: number;
  passed: boolean;
}

// Move constants to the top, outside the component
const GRAVITY = 0.3;
const FLAP_FORCE = -6;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const CAT_WIDTH = 80;
const CAT_HEIGHT = 60;
const DISPLAY_WIDTH = 225;  // 25% smaller than 300
const DISPLAY_HEIGHT = 169; // 25% smaller than 225 (keeping aspect ratio)
const OBSTACLE_WIDTH = 80;
const OBSTACLE_GAP = 300;
const OBSTACLE_SPEED = 1.5;
const SPAWN_INTERVAL = 3000;
const FLAPS_PER_OBSTACLE = 100;

// Add interface for promo pop-ups
interface PromoPopup {
  image: number; // 0 for first image, 1 for second
  x: number;
  y: number;
  timeLeft: number;
  opacity: number;
}

// Add these constants for promo timing
const FIRST_PROMO_START = 1;  // Show after 1st obstacle
const FIRST_PROMO_END = 3;    // Hide after 3rd obstacle
const SECOND_PROMO_START = 7;  // Show after 7th obstacle
const SECOND_PROMO_END = 11;   // Hide after 11th obstacle

const FlappyGame: React.FC = () => {
  const { flapsBalance, addFlaps } = useFlaps();
  const [totalFlaps, setTotalFlaps] = useState(flapsBalance);
  const totalFlapsRef = useRef(flapsBalance);  // Add this ref to track total

  // Sync with flapsBalance changes
  useEffect(() => {
    setTotalFlaps(flapsBalance);
    totalFlapsRef.current = flapsBalance;
  }, [flapsBalance]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const flapperImageRef = useRef<HTMLImageElement | null>(null);
  const gameState = useRef<GameState>({
    catY: GAME_HEIGHT / 2,
    catVelocity: 0,
    obstacles: [],
    gameLoop: null,
    lastTimestamp: 0,
    lastObstacleSpawn: 0,
    scrollX: 0,
    isStarted: false,
    score: 0,
    flaps: 0
  });

  // Add audio refs
  const purrSoundRef = useRef<HTMLAudioElement | null>(null);
  const screamSoundRef = useRef<HTMLAudioElement | null>(null);

  // Add a ref to track if purr is playing
  const isPurringRef = useRef(false);

  // Add a new ref for the background image
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);

  // Add refs for the promo images
  const promoImage1Ref = useRef<HTMLImageElement | null>(null);
  const promoImage2Ref = useRef<HTMLImageElement | null>(null);

  // Add state for promo pop-ups
  const [promoPopups, setPromoPopups] = useState<PromoPopup[]>([]);

  // Update the ref to hold all 5 images
  const pussioImagesRef = useRef<(HTMLImageElement | null)[]>([null, null, null, null, null]);

  // Initialize audio elements
  useEffect(() => {
    // Create purr sound
    const purrSound = new Audio('/sounds/cat-purr.mp3');
    purrSound.volume = 0.3; // Adjust volume as needed
    purrSoundRef.current = purrSound;

    // Create scream sound
    const screamSound = new Audio('/sounds/cat-scream.mp3');
    screamSound.volume = 0.4; // Adjust volume as needed
    screamSoundRef.current = screamSound;
  }, []);

  const handleFlap = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!gameState.current.isStarted) {
      console.log('Starting game...');
      startGame();
    } else {
      console.log('Flapping...');
      if (purrSoundRef.current) {
        purrSoundRef.current.currentTime = 0;
        purrSoundRef.current.play();
        isPurringRef.current = true;
      }
      gameState.current.catVelocity = FLAP_FORCE;
    }
  };

  // Initialize canvas and game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set actual canvas dimensions
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw initial screen
    drawGame(ctx);

    // Handle canvas click
    const handleCanvasClick = (e: MouseEvent) => {
      e.preventDefault();
      handleFlap();
    };

    canvas.addEventListener('click', handleCanvasClick);

    return () => {
      canvas.removeEventListener('click', handleCanvasClick);
      if (gameState.current.gameLoop) {
        cancelAnimationFrame(gameState.current.gameLoop);
      }
    };
  }, []);

  // Handle keyboard
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      handleFlap();
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Update the scoring function
  const addScore = () => {
    console.log('Adding score and flaps');
    // Update score
    gameState.current.score += 1;
    
    // Update flaps
    gameState.current.flaps += FLAPS_PER_OBSTACLE;
    
    // Update total immediately
    const newTotal = totalFlapsRef.current + FLAPS_PER_OBSTACLE;
    totalFlapsRef.current = newTotal;
    setTotalFlaps(newTotal);
    
    console.log('New score:', gameState.current.score, 'Game flaps:', gameState.current.flaps, 'Total flaps:', newTotal);
  };

  // Update the updatePromos function to prevent multiple additions
  const updatePromos = () => {
    const currentScore = gameState.current.score;
    console.log('Updating promos:', {
      currentScore,
      currentPopups: promoPopups.length
    });
    
    if (currentScore === FIRST_PROMO_START && promoPopups.length === 0) {
      console.log('Adding test circle promo');
      setPromoPopups([{
        image: 0,
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT / 2,
        timeLeft: 99999,
        opacity: 0
      }]);
    } else if (currentScore === FIRST_PROMO_END) {
      console.log('Removing test circle promo');
      setPromoPopups([]);
    }
  };

  // Update the updateGame function to use the new promo system
  const updateGame = (deltaTime: number) => {
    const delta = deltaTime / 16;

    // Update cat position with smoother physics
    gameState.current.catVelocity += GRAVITY * delta;
    gameState.current.catY += gameState.current.catVelocity * delta;

    // Update scroll position
    gameState.current.scrollX += OBSTACLE_SPEED * delta;

    // Spawn new obstacles
    if (Date.now() - gameState.current.lastObstacleSpawn > SPAWN_INTERVAL) {
      spawnObstacle();
      gameState.current.lastObstacleSpawn = Date.now();
    }

    // Update obstacles
    gameState.current.obstacles = gameState.current.obstacles.filter(obstacle => {
      obstacle.x -= OBSTACLE_SPEED * delta;

      // Check for scoring
      const catX = 100 + CAT_WIDTH;
      if (!obstacle.passed && catX > obstacle.x + OBSTACLE_WIDTH) {
        console.log('Passed obstacle!');
        obstacle.passed = true;
        addScore();  // Use the new scoring function
      }

      // Check for collision
      if (checkCollision(obstacle)) {
        void gameOver();  // Handle the promise
        return false;  // Remove the obstacle
      }

      return obstacle.x + OBSTACLE_WIDTH > -100;
    });

    // Check boundaries
    if (gameState.current.catY > GAME_HEIGHT - CAT_HEIGHT || gameState.current.catY < 0) {
      void gameOver();
      return;
    }

    // Replace the random promo spawn with our new system
    updatePromos();
    
    // Make opacity changes more dramatic
    setPromoPopups(prev => 
      prev.map(popup => ({
        ...popup,
        opacity: Math.min(popup.opacity + 0.2, 1) // Faster fade in, from 0.05 to 0.2
      }))
    );
  };

  const startGame = () => {
    console.log('startGame called');
    
    gameState.current = {
      catY: GAME_HEIGHT / 2,
      catVelocity: 0,
      obstacles: [],
      gameLoop: null,
      lastTimestamp: 0,
      lastObstacleSpawn: Date.now(),
      scrollX: 0,
      isStarted: true,
      score: 0,
      flaps: 0
    };

    spawnObstacle();
    gameState.current.gameLoop = requestAnimationFrame(gameLoop);
  };

  const gameLoop = (timestamp: number) => {
    console.log('Game loop running, gameStarted:', gameState.current.isStarted);
    
    if (!gameState.current.isStarted) {
      console.log('Game not started, stopping loop');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize lastTimestamp if it's the first frame
    if (gameState.current.lastTimestamp === 0) {
      gameState.current.lastTimestamp = timestamp;
    }
    
    // Calculate delta time
    const deltaTime = timestamp - gameState.current.lastTimestamp;
    gameState.current.lastTimestamp = timestamp;
    
    // Update and draw
    updateGame(deltaTime);
    drawGame(ctx);
    
    // Continue loop
    gameState.current.gameLoop = requestAnimationFrame(gameLoop);
  };

  const checkCollision = (obstacle: Obstacle): boolean => {
    const catX = 100;
    const catY = gameState.current.catY;
    
    // Add some forgiveness to the collision (5 pixels of forgiveness)
    const FORGIVENESS = 5;

    return (
      catX + CAT_WIDTH - FORGIVENESS > obstacle.x &&
      catX + FORGIVENESS < obstacle.x + OBSTACLE_WIDTH &&
      (catY + FORGIVENESS < obstacle.gapTop || 
       catY + CAT_HEIGHT - FORGIVENESS > obstacle.gapBottom)
    );
  };

  const gameOver = () => {
    gameState.current.isStarted = false;
    if (gameState.current.gameLoop) {
      cancelAnimationFrame(gameState.current.gameLoop);
    }

    // Stop purring immediately if it's playing
    if (purrSoundRef.current && isPurringRef.current) {
      purrSoundRef.current.pause();
      purrSoundRef.current.currentTime = 0;
      isPurringRef.current = false;
    }

    // Play scream sound immediately
    if (screamSoundRef.current) {
      screamSoundRef.current.currentTime = 0;
      const playPromise = screamSoundRef.current.play();
      
      // Handle play promise to avoid potential errors
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Error playing scream sound:", error);
        });
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (gameState.current.flaps > 0) {
      // Update context
      console.log('Adding flaps to context:', gameState.current.flaps);
      addFlaps(gameState.current.flaps);

      // Draw game over screen
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      ctx.fillText('Game Over!', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 50);
      ctx.font = 'bold 32px Arial';
      ctx.fillText(`Obstacles Passed: ${gameState.current.score}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 10);
      ctx.fillText(`Game $FLAPS Earned: ${gameState.current.flaps}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 50);
      ctx.fillText(`Total $FLAPS: ${totalFlapsRef.current}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 90);
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Click or Press Space to Play Again', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 140);
      ctx.shadowBlur = 0;
    }
  };

  const spawnObstacle = () => {
    const gapPosition = Math.random() * (GAME_HEIGHT - OBSTACLE_GAP - 100) + 50;
    
    gameState.current.obstacles.push({
      x: GAME_WIDTH,
      gapTop: gapPosition,
      gapBottom: gapPosition + OBSTACLE_GAP,
      passed: false
    });
  };

  // Force redraw when display balance changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGame(ctx);
  }, [totalFlaps]);

  // Update the image loading useEffect
  useEffect(() => {
    // Load flapper image
    const flapperImage = new Image();
    flapperImage.src = '/images/flapper.png';
    flapperImage.onload = () => {
      console.log('Flapper image loaded');
      flapperImageRef.current = flapperImage;
      drawGameIfReady();
    };

    // Load background image
    const backgroundImage = new Image();
    backgroundImage.src = '/images/wall1.png';
    backgroundImage.onload = () => {
      console.log('Background image loaded');
      backgroundImageRef.current = backgroundImage;
      drawGameIfReady();
    };

    // Load promo images with correct filenames
    const promoImage1 = new Image();
    promoImage1.src = '/images/flapforwl.png';  // Updated filename
    promoImage1.onload = () => {
      console.log('Promo image 1 loaded:', {
        width: promoImage1.width,
        height: promoImage1.height
      });
      promoImage1Ref.current = promoImage1;
      drawGameIfReady();
    };
    promoImage1.onerror = (e) => {
      console.error('Error loading promo image 1:', e);
    };

    const promoImage2 = new Image();
    promoImage2.src = '/images/flapyourpussio.png';  // Updated filename
    promoImage2.onload = () => {
      console.log('Promo image 2 loaded:', {
        width: promoImage2.width,
        height: promoImage2.height
      });
      promoImage2Ref.current = promoImage2;
      drawGameIfReady();
    };
    promoImage2.onerror = (e) => {
      console.error('Error loading promo image 2:', e);
    };

    // Load all 5 pussio images
    for (let i = 1; i <= 5; i++) {
      const pussioImage = new Image();
      pussioImage.src = `/images/pussio${i}.png`;
      pussioImage.onload = () => {
        console.log(`Pussio image ${i} loaded:`, {
          width: pussioImage.width,
          height: pussioImage.height
        });
        pussioImagesRef.current[i-1] = pussioImage;
        drawGameIfReady();
      };
      pussioImage.onerror = (e) => {
        console.error(`Error loading pussio image ${i}:`, e);
      };
    }

    // Helper function to draw game when all images are loaded
    const drawGameIfReady = () => {
      const allPussioImagesLoaded = pussioImagesRef.current.every(img => img !== null);
      if (flapperImageRef.current && 
          backgroundImageRef.current && 
          promoImage1Ref.current && 
          promoImage2Ref.current &&
          allPussioImagesLoaded) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            drawGame(ctx);
          }
        }
      }
    };
  }, []);

  // Update the drawGame function
  const drawGame = (ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw scrolling background
    if (backgroundImageRef.current) {
      const scrollX = gameState.current.scrollX * 0.5;
      const pattern = ctx.createPattern(backgroundImageRef.current, 'repeat');
      
      if (pattern) {
        ctx.save();
        ctx.translate(-scrollX, 0);
        ctx.fillStyle = pattern;
        ctx.fillRect(scrollX, 0, GAME_WIDTH + backgroundImageRef.current.width, GAME_HEIGHT);
        
        // Increase overall spacing
        const spacing = 2000; // Much wider spacing
        const startX = Math.floor(scrollX / spacing) * spacing;
        
        // Create a seeded random number based on x position
        const seededRandom = (x: number) => {
          return ((Math.sin(x) + 1) / 2);
        };

        // Draw repeating sets
        for (let x = startX; x < startX + GAME_WIDTH + spacing * 2; x += spacing) {
          // First draw promo images
          if (promoImage1Ref.current && promoImage2Ref.current) {
            // Draw promos further apart
            ctx.drawImage(
              promoImage1Ref.current,
              x + spacing * 0.2, // At 20% of spacing
              150,
              400,
              100
            );
            
            ctx.drawImage(
              promoImage2Ref.current,
              x + spacing * 0.7, // At 70% of spacing
              350,
              400,
              100
            );
          }

          // Define safe zones for pussio images (avoid promo areas)
          const promoZones = [
            { start: 100, end: 200 },    // Above first promo
            { start: 250, end: 300 },    // Between promos
            { start: 450, end: 550 }     // Below second promo
          ];
          
          // Draw pussio images in safe zones
          pussioImagesRef.current.forEach((image, index) => {
            if (image) {
              // Generate random but consistent size
              const baseScale = 0.15 + (seededRandom(x + index) * 0.1);
              const scale = baseScale + (Math.sin(x * 0.01 + index) * 0.02);
              
              const width = image.width * scale;
              const height = image.height * scale;
              
              // Get safe zone for this image
              const zone = promoZones[index % promoZones.length];
              
              // Calculate Y position within safe zone
              const minY = zone.start;
              const maxY = zone.end - height;
              const baseY = minY + (seededRandom(x * 2 + index) * (maxY - minY));
              const offsetY = baseY + (Math.sin(x * 0.02 + index * Math.PI) * 5);
              
              // Calculate X position with better distribution
              const sectionWidth = spacing * 0.15; // 15% of spacing for each section
              const sectionStart = x + (index * sectionWidth);
              const minX = sectionStart + 50;
              const maxX = sectionStart + sectionWidth - width - 50;
              const offsetX = minX + (seededRandom(x * 3 + index) * (maxX - minX));
              
              ctx.drawImage(
                image,
                offsetX,
                offsetY,
                width,
                height
              );
            }
          });
        }
        
        ctx.restore();
      }
    }

    // Draw obstacles with parallax effect
    gameState.current.obstacles.forEach(obstacle => {
      // Top wall (brick texture)
      ctx.fillStyle = '#8B0000';
      ctx.fillRect(obstacle.x, 0, OBSTACLE_WIDTH, obstacle.gapTop);
      
      // Bottom obstacle (trash can)
      ctx.fillStyle = '#4A4A4A';
      ctx.fillRect(
        obstacle.x, 
        obstacle.gapBottom, 
        OBSTACLE_WIDTH, 
        GAME_HEIGHT - obstacle.gapBottom
      );
      
      // Add metallic shine
      ctx.fillStyle = '#606060';
      ctx.fillRect(
        obstacle.x + 5, 
        obstacle.gapBottom, 
        10, 
        GAME_HEIGHT - obstacle.gapBottom
      );
    });

    // Draw flapper with larger dimensions
    if (flapperImageRef.current) {
      ctx.save();
      
      // Add shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      
      ctx.drawImage(
        flapperImageRef.current,
        100 - (DISPLAY_WIDTH - CAT_WIDTH) / 2,  // Center horizontally relative to collision box
        gameState.current.catY - (DISPLAY_HEIGHT - CAT_HEIGHT) / 2,  // Center vertically
        DISPLAY_WIDTH,
        DISPLAY_HEIGHT
      );
      
      ctx.restore();
    }

    // Update score display
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 32px Arial';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 8;
    ctx.textAlign = 'left';
    
    ctx.fillText(`Obstacles: ${gameState.current.score}`, 20, 40);
    ctx.fillText(`Game $FLAPS: ${gameState.current.flaps}`, 20, 80);
    ctx.fillText(`Total $FLAPS: ${totalFlapsRef.current}`, 20, 120);
    ctx.shadowBlur = 0;

    // Update +100 animation text
    gameState.current.obstacles.forEach(obstacle => {
      const catX = 100 + CAT_WIDTH;
      if (!obstacle.passed && catX > obstacle.x + OBSTACLE_WIDTH - 20 && catX < obstacle.x + OBSTACLE_WIDTH + 20) {
        // Draw floating "+100 $FLAPS" text with animation
        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 15;
        ctx.fillText('+100 $FLAPS', catX + 50, gameState.current.catY - 20);
        ctx.shadowBlur = 0;
      }
    });

    // Draw instructions or wallet message
    if (!gameState.current.isStarted) {
      // Show regular start message
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 8;
      ctx.fillText('Click or Press Space to Start', GAME_WIDTH / 2, GAME_HEIGHT / 2);
      ctx.font = 'bold 24px Arial';
      ctx.fillText('Avoid the walls and collect $FLAPS!', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
      ctx.shadowBlur = 0;
    }
  };

  return (
    <div 
      className="flappy-game-container" 
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.code === 'Space') {
          console.log('Space pressed on container');
          handleFlap(e);
        }
      }}
      onClick={(e) => {
        handleFlap(e);
      }}
    >
      <canvas
        ref={canvasRef}
        className="flappy-game-canvas"
      />
    </div>
  );
};

export default FlappyGame; 