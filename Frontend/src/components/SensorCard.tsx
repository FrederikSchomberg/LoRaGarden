type SensorCardProps = {
    title: string;
    value: string;
    description: string;
};

export function SensorCard({ title, value, description }: SensorCardProps) {
    return (
        <div className="sensor-card">
            <p className="card-label">{title}</p>
            <h2>{value}</h2>
            <p>{description}</p>
        </div>
    );
}