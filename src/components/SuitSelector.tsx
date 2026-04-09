import { Suit } from '../types';
import { Heart, Diamond, Club, Spade } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { motion } from 'motion/react';

interface SuitSelectorProps {
  isOpen: boolean;
  onSelect: (suit: Suit) => void;
}

export const SuitSelector = ({ isOpen, onSelect }: SuitSelectorProps) => {
  const suits = [
    { type: Suit.HEARTS, icon: Heart, color: 'text-red-500', label: 'Hearts' },
    { type: Suit.DIAMONDS, icon: Diamond, color: 'text-red-500', label: 'Diamonds' },
    { type: Suit.CLUBS, icon: Club, color: 'text-slate-900', label: 'Clubs' },
    { type: Suit.SPADES, icon: Spade, color: 'text-slate-900', label: 'Spades' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Pick a Suit</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 p-4">
          {suits.map((suit) => (
            <motion.button
              key={suit.type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(suit.type)}
              className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 hover:bg-slate-100 border-2 border-transparent hover:border-slate-200 transition-all"
            >
              <suit.icon className={suit.color} size={48} />
              <span className="mt-2 font-semibold text-slate-700">{suit.label}</span>
            </motion.button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
