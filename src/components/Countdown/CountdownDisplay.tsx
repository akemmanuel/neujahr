import { TimeUnit } from './TimeUnit';
import { ProgressRing } from './ProgressRing';

interface CountdownDisplayProps {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isLastMinute: boolean;
  isFinalCountdown: boolean;
  finalIntensity: number;
}

export function CountdownDisplay({
  hours,
  minutes,
  seconds,
  totalSeconds,
  isLastMinute,
  isFinalCountdown,
  finalIntensity,
}: CountdownDisplayProps) {
  // Calculate progress for the ring (based on seconds in current minute)
  const secondsProgress = ((60 - seconds) / 60) * 100;

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Progress Ring */}
      <ProgressRing 
        progress={secondsProgress}
        size={320}
        strokeWidth={isFinalCountdown ? 6 : 4}
        isLastMinute={isLastMinute}
        isFinalCountdown={isFinalCountdown}
      />

      {/* Time Units Container */}
      <div className={`
        relative z-10 flex items-center gap-2 sm:gap-4
        transition-transform duration-300
        ${isFinalCountdown ? 'scale-105' : ''}
      `}>
        {/* Hours */}
        <TimeUnit 
          value={hours} 
          label="Std" 
          isActive={minutes === 59 && seconds >= 50}
        />

        {/* Separator */}
        <span className={`
          font-[Cinzel] text-4xl sm:text-5xl font-bold
          text-gold animate-pulse
          ${isFinalCountdown ? 'text-orange-glow' : ''}
        `}>
          :
        </span>

        {/* Minutes */}
        <TimeUnit 
          value={minutes} 
          label="Min" 
          isActive={seconds >= 50}
          isFinal={isLastMinute && !isFinalCountdown}
        />

        {/* Separator */}
        <span className={`
          font-[Cinzel] text-4xl sm:text-5xl font-bold
          text-gold animate-pulse
          ${isFinalCountdown ? 'text-orange-glow' : ''}
        `}>
          :
        </span>

        {/* Seconds */}
        <TimeUnit 
          value={seconds} 
          label="Sek" 
          isActive={true}
          isFinal={isFinalCountdown}
          intensity={finalIntensity}
        />
      </div>

      {/* Total seconds display for final countdown */}
      {isFinalCountdown && (
        <div 
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 font-[Syne] text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-glow via-gold to-magenta-glow animate-pulse"
          style={{
            textShadow: '0 0 30px #FFD700, 0 0 60px #FF6B35',
          }}
        >
          {totalSeconds}
        </div>
      )}

      {/* Last Minute Indicator */}
      {isLastMinute && !isFinalCountdown && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="font-[Outfit] text-sm sm:text-base uppercase tracking-[0.3em] text-gold animate-pulse">
            Die letzte Minute
          </span>
        </div>
      )}
    </div>
  );
}

export default CountdownDisplay;
