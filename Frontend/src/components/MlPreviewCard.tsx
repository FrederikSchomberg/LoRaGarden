// Machine Learning Preview Card component is used to display the results 
// of a machine learning model's prediction in a card format.

type MlPreviewCardProps = {
    title: string;
    reason: string;
    mode: string;
    confidence: number;
    soilMoistureIn2Hours: number;
    mainFactor: string;
};

export function MlPreviewCard({
    title,
    reason,
    mode,
    confidence,
    soilMoistureIn2Hours,
    mainFactor,
}: MlPreviewCardProps) {
    return (
        <article className="ml-card">
            <p className="card-label">ML-Vorschau</p>
            <h2>{title}</h2>
            <p>{reason}</p>

            <div className="decision-info">
                <span>Modus: {mode}</span>
                <span>Sicherheit: {confidence}%</span>
                <span>Feuchte in 2h: {soilMoistureIn2Hours}%</span>
                <span>Hauptfaktor: {mainFactor}</span>
            </div>
        </article>
    );
}