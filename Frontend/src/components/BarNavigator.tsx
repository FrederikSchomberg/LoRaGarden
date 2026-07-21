type BarNavigatorProps = {
    activeTab: string;
    onTabChange: (tab: string) => void;
};

export function BarNavigator({
    activeTab,
    onTabChange,
}: BarNavigatorProps) {

    const tabs = ["Alle", "Beet1", "Beet2", "Beet3"];

    return (
        <div className="bar-navigator">
            <div className="tabs-container">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        className={`tab ${activeTab === tab ? "active" : ""}`}
                        onClick={() => onTabChange(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
}