import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Suit, Rank, PlayerType, GameState } from './types';
import { createDeck, shuffleDeck, isValidMove, getAIMove } from './lib/gameLogic';
import { PlayingCard } from './components/PlayingCard';
import { SuitSelector } from './components/SuitSelector';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  RotateCcw, 
  User, 
  Cpu, 
  Layers, 
  Info,
  Heart,
  Diamond,
  Club,
  Spade
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function App() {
  const [game, setGame] = useState<GameState>({
    deck: [],
    playerHand: [],
    aiHand: [],
    discardPile: [],
    currentTurn: 'player',
    currentSuit: null,
    winner: null,
    isDealing: true,
  });

  const [showSuitSelector, setShowSuitSelector] = useState(false);
  const [pendingEightCard, setPendingEightCard] = useState<Card | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  const initGame = useCallback(() => {
    const fullDeck = shuffleDeck(createDeck());
    const playerHand = fullDeck.splice(0, 8);
    const aiHand = fullDeck.splice(0, 8);
    
    // Ensure first discard is not an 8 for simplicity
    let firstDiscardIndex = 0;
    while (fullDeck[firstDiscardIndex].rank === Rank.EIGHT) {
      firstDiscardIndex++;
    }
    const discardPile = fullDeck.splice(firstDiscardIndex, 1);

    setGame({
      deck: fullDeck,
      playerHand,
      aiHand,
      discardPile,
      currentTurn: 'player',
      currentSuit: discardPile[0].suit,
      winner: null,
      isDealing: false,
    });
    setAiThinking(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const checkWinner = (gameState: GameState) => {
    if (gameState.playerHand.length === 0) return 'player';
    if (gameState.aiHand.length === 0) return 'ai';
    return null;
  };

  const playCard = (player: PlayerType, card: Card, chosenSuit: Suit | null = null) => {
    setGame(prev => {
      const isPlayer = player === 'player';
      const hand = isPlayer ? prev.playerHand : prev.aiHand;
      const newHand = hand.filter(c => c.id !== card.id);
      const newDiscardPile = [card, ...prev.discardPile];
      
      const newState = {
        ...prev,
        [isPlayer ? 'playerHand' : 'aiHand']: newHand,
        discardPile: newDiscardPile,
        currentSuit: card.rank === Rank.EIGHT ? (chosenSuit || card.suit) : card.suit,
        currentTurn: isPlayer ? 'ai' : 'player' as PlayerType,
      };

      const winner = checkWinner(newState);
      if (winner) {
        newState.winner = winner;
        if (winner === 'player') {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }

      return newState;
    });
  };

  const drawCard = (player: PlayerType) => {
    setGame(prev => {
      if (prev.deck.length === 0) {
        // If deck is empty, reshuffle discard pile (except top card)
        if (prev.discardPile.length <= 1) {
          // No cards to reshuffle, skip turn
          return { ...prev, currentTurn: player === 'player' ? 'ai' : 'player' as PlayerType };
        }
        const topCard = prev.discardPile[0];
        const newDeck = shuffleDeck(prev.discardPile.slice(1));
        const drawnCard = newDeck.pop()!;
        const isPlayer = player === 'player';
        const newHand = [...(isPlayer ? prev.playerHand : prev.aiHand), drawnCard];
        
        return {
          ...prev,
          deck: newDeck,
          discardPile: [topCard],
          [isPlayer ? 'playerHand' : 'aiHand']: newHand,
          currentTurn: player === 'player' ? 'ai' : 'player' as PlayerType,
        };
      }

      const newDeck = [...prev.deck];
      const drawnCard = newDeck.pop()!;
      const isPlayer = player === 'player';
      const newHand = [...(isPlayer ? prev.playerHand : prev.aiHand), drawnCard];

      return {
        ...prev,
        deck: newDeck,
        [isPlayer ? 'playerHand' : 'aiHand']: newHand,
        currentTurn: player === 'player' ? 'ai' : 'player' as PlayerType,
      };
    });
  };

  const handlePlayerCardClick = (card: Card) => {
    if (game.currentTurn !== 'player' || game.winner) return;

    if (isValidMove(card, game.discardPile[0], game.currentSuit)) {
      if (card.rank === Rank.EIGHT) {
        setPendingEightCard(card);
        setShowSuitSelector(true);
      } else {
        playCard('player', card);
      }
    }
  };

  const handleSuitSelect = (suit: Suit) => {
    if (pendingEightCard) {
      playCard('player', pendingEightCard, suit);
      setPendingEightCard(null);
      setShowSuitSelector(false);
    }
  };

  // AI Logic
  useEffect(() => {
    if (game.currentTurn === 'ai' && !game.winner) {
      setAiThinking(true);
      const timer = setTimeout(() => {
        const { card, chosenSuit } = getAIMove(game.aiHand, game.discardPile[0], game.currentSuit);
        
        if (card) {
          playCard('ai', card, chosenSuit);
        } else {
          drawCard('ai');
        }
        setAiThinking(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [game.currentTurn, game.aiHand, game.discardPile, game.currentSuit, game.winner]);

  const topCard = game.discardPile[0];

  const SuitIndicator = ({ suit }: { suit: Suit | null }) => {
    if (!suit) return null;
    const icons = {
      [Suit.HEARTS]: Heart,
      [Suit.DIAMONDS]: Diamond,
      [Suit.CLUBS]: Club,
      [Suit.SPADES]: Spade,
    };
    const Icon = icons[suit];
    const color = (suit === Suit.HEARTS || suit === Suit.DIAMONDS) ? 'text-red-500' : 'text-slate-900';
    
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Suit</span>
        <Icon className={color} size={20} fill="currentColor" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans p-4 sm:p-8 flex flex-col items-center overflow-hidden">
      {/* Header */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <Layers size={24} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase italic">Crazy Eights</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-slate-400">
            <Info size={16} />
            <span className="text-xs font-medium">Match Suit or Rank. 8 is Wild!</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={initGame}
            className="rounded-full gap-2"
          >
            <RotateCcw size={16} />
            Reset
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl flex flex-col gap-8 relative">
        {/* AI Hand */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Cpu size={18} className={aiThinking ? "animate-pulse text-indigo-500" : ""} />
            <span className="text-sm font-bold uppercase tracking-widest">AI Opponent ({game.aiHand.length})</span>
          </div>
          <div className="flex justify-center -space-x-12 sm:-space-x-16 h-40">
            <AnimatePresence>
              {game.aiHand.map((card, index) => (
                <PlayingCard 
                  key={card.id} 
                  card={card} 
                  isFaceDown 
                  disabled 
                  className="z-0"
                  style={{ zIndex: index }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Area (Deck & Discard) */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="flex items-center gap-8 sm:gap-16">
            {/* Draw Pile */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {game.deck.length > 0 && (
                  <>
                    <div className="absolute top-1 left-1 w-24 h-36 sm:w-28 sm:h-40 bg-slate-200 rounded-xl -z-10" />
                    <PlayingCard 
                      card={game.deck[0]} 
                      isFaceDown 
                      onClick={() => game.currentTurn === 'player' && drawCard('player')}
                      disabled={game.currentTurn !== 'player' || !!game.winner}
                      className="hover:ring-4 hover:ring-indigo-400 hover:ring-offset-2"
                    />
                  </>
                )}
                {game.deck.length === 0 && (
                  <div className="w-24 h-36 sm:w-28 sm:h-40 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                    <span className="text-xs font-bold uppercase">Empty</span>
                  </div>
                )}
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Draw ({game.deck.length})</span>
            </div>

            {/* Discard Pile */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <AnimatePresence mode="popLayout">
                  {topCard && (
                    <PlayingCard 
                      key={topCard.id}
                      card={topCard} 
                      disabled
                      className="shadow-2xl"
                    />
                  )}
                </AnimatePresence>
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Discard</span>
            </div>
          </div>

          {/* Current Suit Indicator */}
          <SuitIndicator suit={game.currentSuit} />
        </div>

        {/* Player Hand */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <User size={18} className={game.currentTurn === 'player' ? "text-indigo-500" : ""} />
            <span className="text-sm font-bold uppercase tracking-widest">Your Hand ({game.playerHand.length})</span>
          </div>
          <div className="flex justify-center -space-x-12 sm:-space-x-16 h-40 pb-4">
            <AnimatePresence>
              {game.playerHand.map((card, index) => (
                <PlayingCard 
                  key={card.id} 
                  card={card} 
                  onClick={() => handlePlayerCardClick(card)}
                  disabled={game.currentTurn !== 'player' || !!game.winner}
                  isPlayable={game.currentTurn === 'player' && isValidMove(card, topCard, game.currentSuit)}
                  className="z-10"
                  style={{ zIndex: index + 20 }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Suit Selector Dialog */}
      <SuitSelector 
        isOpen={showSuitSelector} 
        onSelect={handleSuitSelect} 
      />

      {/* Game Over Dialog */}
      <Dialog open={!!game.winner} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="text-yellow-600" size={40} />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight">
              {game.winner === 'player' ? 'YOU WIN!' : 'AI WINS!'}
            </DialogTitle>
            <DialogDescription className="text-lg">
              {game.winner === 'player' 
                ? 'Congratulations! You cleared all your cards.' 
                : 'Better luck next time! The AI was too fast.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-6">
            <Button 
              size="lg" 
              onClick={initGame}
              className="w-full sm:w-auto rounded-full px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              Play Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Turn Indicator Overlay */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={cn(
            "px-6 py-3 rounded-full shadow-2xl text-white font-black uppercase tracking-widest text-sm",
            game.currentTurn === 'player' ? "bg-indigo-600" : "bg-slate-800"
          )}
        >
          {game.currentTurn === 'player' ? "Your Turn" : "AI is thinking..."}
        </motion.div>
      </div>
    </div>
  );
}
