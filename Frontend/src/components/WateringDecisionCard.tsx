type WateringDecisionCardProps = {
    shouldWater: boolean,
    title: string;
    reason: string;
    mode: string;
    urgency: string;
    triggeredRule: string;
    nextCheck: string;
};

export function WateringDecisionCard({
    shouldWater,
    title,
    reason,
    mode,
    urgency,
    triggeredRule,
    nextCheck,
}: WateringDecisionCardProps) {
    const statusText = shouldWater
        ? "Bewässerung empfohlen"
        : "Keine Bewässerung nötig";

    const statusClass = shouldWater
        ? "watering-status watering-needed"
        : "watering-status watering-paused";
    return (
        <article className="watering-card">
            <p className="card-label">Bewässerungsentscheidung</p>
            <div className={statusClass}>{statusText}</div>
            <h2>{title}</h2>
            <p>{reason}</p>

            <div className="decision-info">
                <span>Modus: {mode}</span>
                <span>Dringlichkeit: {urgency}</span>
                <span>Regel: {triggeredRule}</span>
                <span>Nächste Prüfung: {nextCheck}</span>
            </div>
        </article>
    );
}