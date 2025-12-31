interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  isLastMinute?: boolean;
  isFinalCountdown?: boolean;
}

export function ProgressRing({ 
  progress, 
  size = 280, 
  strokeWidth = 4,
  isLastMinute = false,
  isFinalCountdown = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const gradientId = `progress-gradient-${Math.random().toString(36).slice(2)}`;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg 
        width={size} 
        height={size} 
        className={`
          -rotate-90 transition-all duration-300
          ${isLastMinute ? 'animate-pulse' : ''}
          ${isFinalCountdown ? 'animate-scale-pulse' : ''}
        `}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {isFinalCountdown ? (
              <>
                <stop offset="0%" stopColor="#FF6B35" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FF00FF" />
              </>
            ) : isLastMinute ? (
              <>
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#FF6B35" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#FFF3B0" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#B8860B" />
              </>
            )}
          </linearGradient>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`
            transition-all duration-100 ease-linear
            ${isFinalCountdown ? 'drop-shadow-[0_0_10px_#FFD700]' : ''}
          `}
          style={{
            filter: isFinalCountdown 
              ? 'drop-shadow(0 0 15px #FFD700) drop-shadow(0 0 30px #FF6B35)' 
              : isLastMinute 
                ? 'drop-shadow(0 0 10px #FFD700)' 
                : 'none'
          }}
        />

        {/* Glow orb at progress point */}
        {progress > 0 && (
          <circle
            cx={size / 2 + radius * Math.cos((progress / 100) * 2 * Math.PI - Math.PI / 2)}
            cy={size / 2 + radius * Math.sin((progress / 100) * 2 * Math.PI - Math.PI / 2)}
            r={isFinalCountdown ? 8 : 6}
            fill={isFinalCountdown ? '#FF6B35' : '#FFD700'}
            className="animate-pulse"
            style={{
              filter: `drop-shadow(0 0 ${isFinalCountdown ? 15 : 10}px ${isFinalCountdown ? '#FF6B35' : '#FFD700'})`
            }}
          />
        )}
      </svg>
    </div>
  );
}

export default ProgressRing;
