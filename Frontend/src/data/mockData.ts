export const mockBeds = {
  Beet1: {
    beetName: "Beet 1",
    lastMeasurement: "vor 2min",

    sensors: {
      soilMoisture: 72,
      temperature: 22.8,
      humidity: 64,
      lightLux: 650,
      uvIndex: 3.1,
      waterLevel: 85,
    },

    weather: {
      rainProbability: 75,
      forecast: "Leichter Regen möglich",
      outsideTemperature: 21.7,
    },

    wateringDecision: {
      shouldWater: false,
      title: "Bewässerung ausgesetzt",
      reason: "Bodenfeuchtigkeit ist ausreichend und Regen möglich.",
      mode: "Regelbasiert",
      urgency: "niedrig",
      triggeredRule: "Bodenfeuchtigkeit über 60%",
      nextCheck: "in 30min",
    },

    systemStatus: {
      mqtt: "online",
      influxdb: "online",
      api: "Mockdaten",
      grafana: "online",
    },
  },


  Beet2: {
    beetName: "Beet 2",
    lastMeasurement: "vor 1min",

    sensors: {
      soilMoisture: 34,
      temperature: 25.9,
      humidity: 52,
      lightLux: 980,
      uvIndex: 5.8,
      waterLevel: 54,
    },

    weather: {
      rainProbability: 20,
      forecast: "Sonnig",
      outsideTemperature: 27.4,
    },

    wateringDecision: {
      shouldWater: true,
      title: "Bewässerung empfohlen",
      reason: "Bodenfeuchtigkeit sinkt unter den Zielbereich.",
      mode: "Regelbasiert",
      urgency: "mittel",
      triggeredRule: "Bodenfeuchtigkeit unter 40%",
      nextCheck: "in 15min",
    },

    systemStatus: {
      mqtt: "online",
      influxdb: "online",
      api: "Mockdaten",
      grafana: "online",
    },
  },


  Beet3: {
    beetName: "Beet 3",
    lastMeasurement: "vor 5min",

    sensors: {
      soilMoisture: 18,
      temperature: 29.4,
      humidity: 39,
      lightLux: 1250,
      uvIndex: 7.2,
      waterLevel: 32,
    },

    weather: {
      rainProbability: 5,
      forecast: "Sehr sonnig",
      outsideTemperature: 30.1,
    },

    wateringDecision: {
      shouldWater: true,
      title: "Bewässerung dringend",
      reason: "Hohe Temperatur und niedrige Bodenfeuchtigkeit erkannt.",
      mode: "ML-Modell",
      urgency: "hoch",
      triggeredRule: "Bodenfeuchtigkeit unter 20%",
      nextCheck: "sofort",
    },

    systemStatus: {
      mqtt: "online",
      influxdb: "online",
      api: "Mockdaten",
      grafana: "online",
    },
  },
};

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