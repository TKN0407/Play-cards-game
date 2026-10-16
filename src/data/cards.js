export const CARD_ITEMS = [
  { id: 'rocket', emoji: '🚀', name: '火箭', color: 'from-blue-600 to-indigo-700', bg: 'linear-gradient(135deg, #4f46e5, #7c3aed)' },
  { id: 'diamond', emoji: '💎', name: '鑽石', color: 'from-cyan-500 to-blue-600', bg: 'linear-gradient(135deg, #06b6d4, #2563eb)' },
  { id: 'lightning', emoji: '⚡', name: '閃電', color: 'from-amber-400 to-yellow-600', bg: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'clover', emoji: '🍀', name: '幸運草', color: 'from-emerald-400 to-teal-600', bg: 'linear-gradient(135deg, #10b981, #059669)' },
  { id: 'star', emoji: '🌟', name: '星星', color: 'from-yellow-400 to-orange-500', bg: 'linear-gradient(135deg, #fbbf24, #ea580c)' },
  { id: 'crystal', emoji: '🔮', name: '水晶球', color: 'from-fuchsia-500 to-purple-600', bg: 'linear-gradient(135deg, #d946ef, #9333ea)' },
  { id: 'gamepad', emoji: '🎮', name: '掌機', color: 'from-rose-500 to-red-600', bg: 'linear-gradient(135deg, #f43f5e, #dc2626)' },
  { id: 'planet', emoji: '🪐', name: '星球', color: 'from-teal-400 to-cyan-600', bg: 'linear-gradient(135deg, #14b8a6, #0284c7)' },
];

export function generateDeck() {
  // Create 8 pairs -> 16 cards total
  const pairedCards = [...CARD_ITEMS, ...CARD_ITEMS].map((item, index) => ({
    instanceId: `${item.id}-${index}`,
    cardId: item.id,
    emoji: item.emoji,
    name: item.name,
    bg: item.bg,
  }));

  // Fisher-Yates shuffle
  for (let i = pairedCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairedCards[i], pairedCards[j]] = [pairedCards[j], pairedCards[i]];
  }

  return pairedCards;
}
