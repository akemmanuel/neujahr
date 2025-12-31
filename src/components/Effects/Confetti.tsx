import { useState, useEffect, useMemo } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  type: 'square' | 'circle' | 'triangle';
}

interface ConfettiProps {
  active: boolean;
  count?: number;
}

const COLORS = ['#FFD700', '#FF6B35', '#00FFFF', '#FF00FF', '#8B5CF6', '#10B981', '#F43F5E', '#FFFEF2'];

export function Confetti({ active, count = 100 }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  const generatePieces = useMemo(() => {
    const generated: ConfettiPiece[] = [];
    for (let i = 0; i < count; i++) {
      const types: ('square' | 'circle' | 'triangle')[] = ['square', 'circle', 'triangle'];
      generated.push({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#FFD700',
        size: 6 + Math.random() * 8,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 2,
        rotation: Math.random() * 360,
        type: types[Math.floor(Math.random() * types.length)] ?? 'square',
      });
    }
    return generated;
  }, [count]);

  useEffect(() => {
    if (active) {
      setPieces(generatePieces);
    } else {
      setPieces([]);
    }
  }, [active, generatePieces]);

  if (!active || pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
          }}
        >
          {piece.type === 'square' && (
            <div
              style={{
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                backgroundColor: piece.color,
                transform: `rotate(${piece.rotation}deg)`,
                boxShadow: `0 0 ${piece.size}px ${piece.color}50`,
              }}
            />
          )}
          {piece.type === 'circle' && (
            <div
              className="rounded-full"
              style={{
                width: `${piece.size}px`,
                height: `${piece.size}px`,
                backgroundColor: piece.color,
                boxShadow: `0 0 ${piece.size}px ${piece.color}50`,
              }}
            />
          )}
          {piece.type === 'triangle' && (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${piece.size / 2}px solid transparent`,
                borderRight: `${piece.size / 2}px solid transparent`,
                borderBottom: `${piece.size}px solid ${piece.color}`,
                transform: `rotate(${piece.rotation}deg)`,
                filter: `drop-shadow(0 0 ${piece.size / 2}px ${piece.color}50)`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default Confetti;
