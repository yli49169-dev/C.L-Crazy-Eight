import { Card, Rank, Suit } from '../types';

export const createDeck = (): Card[] => {
  const deck: Card[] = [];
  const suits = Object.values(Suit);
  const ranks = Object.values(Rank);

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
      });
    }
  }
  return deck;
};

export const shuffleDeck = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export const isValidMove = (card: Card, topCard: Card, currentSuit: Suit | null): boolean => {
  // 8 is always valid
  if (card.rank === Rank.EIGHT) return true;

  // If an 8 was played, we check against the chosen suit
  if (topCard.rank === Rank.EIGHT && currentSuit) {
    return card.suit === currentSuit;
  }

  // Otherwise, match suit or rank
  return card.suit === topCard.suit || card.rank === topCard.rank;
};

export const getAIMove = (
  hand: Card[],
  topCard: Card,
  currentSuit: Suit | null
): { card: Card | null; chosenSuit: Suit | null } => {
  // Try to find a non-8 valid move first
  const normalMove = hand.find((c) => c.rank !== Rank.EIGHT && isValidMove(c, topCard, currentSuit));
  if (normalMove) return { card: normalMove, chosenSuit: null };

  // Try to find an 8
  const eight = hand.find((c) => c.rank === Rank.EIGHT);
  if (eight) {
    // AI picks the suit it has the most of
    const suitCounts: Record<Suit, number> = {
      [Suit.HEARTS]: 0,
      [Suit.DIAMONDS]: 0,
      [Suit.CLUBS]: 0,
      [Suit.SPADES]: 0,
    };
    hand.forEach((c) => {
      if (c.rank !== Rank.EIGHT) suitCounts[c.suit]++;
    });
    
    let bestSuit = Suit.HEARTS;
    let maxCount = -1;
    for (const suit of Object.values(Suit)) {
      if (suitCounts[suit] > maxCount) {
        maxCount = suitCounts[suit];
        bestSuit = suit;
      }
    }
    
    return { card: eight, chosenSuit: bestSuit };
  }

  return { card: null, chosenSuit: null };
};
