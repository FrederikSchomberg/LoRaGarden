export const mockData = {
    beetName: "Beet1",
    lastMeasurement: "vor 2min",


    sensors: {
        soilMoisture: 42,   //%
        temperature: 24.6,  //°C
        humidity: 61,       //%
        lightLux: 780,      //lx
        uvIndex: 4.2,      //uvi        
        waterLevel: 68,     //%
    },

    weather: {
        rainProbability: 81,
        forecast: "Regen erwartet",
        outsideTemperature: 23.5,
    },

    wateringDecision: {
        shouldWater: false,
        title: "Bewässerung wird ausgesetzt",
        reason: "Die Regenwarscheinlichkeit ist zu hoch.",
        mode: "Regelbasiert",
        urgency: "niedrig",
        triggeredRule: "Regenwarschenlichkeit über 80%",
        nextCheck: "in 30min"
    },

    systemStatus: {
        mqtt: "online",
        influxdb: "online",
        api: "Mockdaten",
        grafana: "online"
    }
}

export const mlMockData = {
    shouldWater: true,
    title: "Bewässerung empfohlen",
    reason:
        "Das Modell erwartet, dass die Bodenfeuchtigkeit in den nächsten Stunden unter den Zielwert fällt.",
    mode: "ML-Modell",
    confidence: 76,
    nextCheck: "in 20 Minuten",


    prediction: {
        // vorhersage der bodenfeuchtigkeit in 2h
        soilMoistureIn2Hours: 31,

        waterNeed: "mittel",

        // wichtigster einflussfaktor für die entscheidung
        mainFactor: "sinkende Bodenfeuchtigkeit",
    },
};