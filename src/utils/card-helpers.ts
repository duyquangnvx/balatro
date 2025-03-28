import { PlayingCard, Rank, Suit } from "../objects/playing-card";


export function sortBySuitInternal(cards: PlayingCard[]): void {
    cards.sort((a, b) => {
        // First sort by suit
        const suitCompare = Object.values(Suit).indexOf(a.getSuit()) - Object.values(Suit).indexOf(b.getSuit());
        if (suitCompare !== 0) return suitCompare;
        
        // Then by rank within suit
        const rankA = Object.values(Rank).indexOf(a.getRank());
        const rankB = Object.values(Rank).indexOf(b.getRank());
        return rankA - rankB;
    });
}

export function sortByRankInternal(cards: PlayingCard[]): void {
    cards.sort((a, b) => {
        // First sort by rank
        const rankA = Object.values(Rank).indexOf(a.getRank());
        const rankB = Object.values(Rank).indexOf(b.getRank());
        if (rankA !== rankB) return rankA - rankB;
        
        // Then by suit
        return Object.values(Suit).indexOf(a.getSuit()) - Object.values(Suit).indexOf(b.getSuit());
    });
}   
