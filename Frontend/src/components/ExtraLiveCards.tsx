import { SensorCard } from "./SensorCard";

// SensorCard component is used to display individual sensor information in a card format. 
// The ExtraLiveCards component takes an array of ExtraLiveCard objects and renders them as a grid of SensorCards.
//  If there are no cards to display, it returns null, effectively rendering nothing.

type ExtraLiveCard = {
  title: string;
  value: string;
  description: string;
};

type ExtraLiveCardsProps = {
  cards: ExtraLiveCard[];
};

export function ExtraLiveCards({ cards }: ExtraLiveCardsProps) {
  // wenn keine livewerte da dann nix anzeigen 
  if (cards.length === 0) {
    return null;
  }

  return (
    <section className="sensor-grid live-sensor-grid">
      {cards.map((card) => (
        <SensorCard
          key={card.title}
          title={card.title}
          value={card.value}
          description={card.description}
        />
      ))}
    </section>
  );
}