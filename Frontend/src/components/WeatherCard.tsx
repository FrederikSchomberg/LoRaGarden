type WeatherCardProps = {
    rainProbability: number;
    forecast: string;
    outsideTemperature: number;
};

export function WeatherCard({
    rainProbability,
    forecast,
    outsideTemperature,
}: WeatherCardProps) {
    return (
        <article className="weather-card">
            <p className="card-label">Wetter</p>
            <h2>{rainProbability}% Regen</h2>
            <p>{forecast}</p>
            <p>Außentemperatur: {outsideTemperature}°C</p>
        </article>
    );
}