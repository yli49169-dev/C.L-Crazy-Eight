import { motion, HTMLMotionProps } from 'motion/react';
import { Suit, Rank, Card } from '../types';
import { Heart, Diamond, Club, Spade } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayingCardProps extends HTMLMotionProps<'div'> {
  card: Card;
  isFaceDown?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  isPlayable?: boolean;
}

const SuitIcon = ({ suit, className, size = 20 }: { suit: Suit; className?: string; size?: number }) => {
  switch (suit) {
    case Suit.HEARTS:
      return <Heart className={cn("text-red-500 fill-red-500", className)} size={size} />;
    case Suit.DIAMONDS:
      return <Diamond className={cn("text-red-500 fill-red-500", className)} size={size} />;
    case Suit.CLUBS:
      return <Club className={cn("text-slate-900 fill-slate-900", className)} size={size} />;
    case Suit.SPADES:
      return <Spade className={cn("text-slate-900 fill-slate-900", className)} size={size} />;
  }
};

export const PlayingCard = ({
  card,
  isFaceDown = false,
  onClick,
  disabled = false,
  className,
  isPlayable = false,
}: PlayingCardProps) => {
  return (
    <motion.div
      layout
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={!disabled && !isFaceDown ? { y: -10, scale: 1.05 } : {}}
      whileTap={!disabled && !isFaceDown ? { scale: 0.95 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={cn(
        "relative w-24 h-36 sm:w-28 sm:h-40 rounded-xl shadow-lg cursor-pointer transition-shadow duration-200 select-none",
        isFaceDown 
          ? "bg-gradient-to-br from-indigo-600 to-blue-800 border-4 border-white" 
          : "bg-white border-2 border-slate-100",
        isPlayable && !disabled && "ring-4 ring-yellow-400 ring-offset-2",
        disabled && "cursor-not-allowed opacity-80",
        className
      )}
    >
      {isFaceDown ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-16 h-24 border-2 border-white/20 rounded-lg flex items-center justify-center">
             <div className="w-8 h-8 rounded-full bg-white/10" />
          </div>
        </div>
      ) : (
        <div className="w-full h-full p-2 flex flex-col justify-between">
          <div className="flex flex-col items-start">
            <span className={cn(
              "text-xl font-bold leading-none",
              (card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS) ? "text-red-500" : "text-slate-900"
            )}>
              {card.rank}
            </span>
            <SuitIcon suit={card.suit} size={14} />
          </div>
          
          <div className="flex justify-center">
            <SuitIcon suit={card.suit} size={32} />
          </div>
          
          <div className="flex flex-col items-end rotate-180">
            <span className={cn(
              "text-xl font-bold leading-none",
              (card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS) ? "text-red-500" : "text-slate-900"
            )}>
              {card.rank}
            </span>
            <SuitIcon suit={card.suit} size={14} />
          </div>
        </div>
      )}
    </motion.div>
  );
};
