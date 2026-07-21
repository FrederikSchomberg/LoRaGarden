import type { BedName } from "../api";

type BarNavigatorProps = {
    activeTab: BedName;
    onTabChange: (tab: BedName) => void;
};

export function BarNavigator({
    activeTab,
    onTabChange,
}: BarNavigatorProps) {

    const tabs = ["Alle", "Beet1", "Beet2", "Beet3"] as const;

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