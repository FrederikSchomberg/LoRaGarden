#include <MKRWAN_v2.h>

LoRaModem modem;

String devAddr = "DEINE_DEV_ADDR";
String nwkSKey = "DEIN_NWK_S_KEY";
String appSKey = "DEIN_APP_S_KEY";

void setup() {
  Serial.begin(115200);
  while (!Serial);

  Serial.println("Starte LoRaWAN ABP mit MKRWAN_v2...");

  if (!modem.begin(EU868)) {
    Serial.println("Fehler: LoRa-Modem startet nicht");
    while (1);
  }

  Serial.print("Modem Version: ");
  Serial.println(modem.version());

  if (!modem.joinABP(devAddr, nwkSKey, appSKey)) {
    Serial.println("Fehler: ABP Join fehlgeschlagen");
    while (1);
  }

  Serial.println("ABP bereit, sende Daten...");
  Serial.print("Data Rate: ");
  Serial.println(modem.getDataRate());
}

void loop() {
  String sender = "Yamen";
  float temperatur = 24.5;
  int bodenfeuchtigkeit = 61;

  String msg =
    sender + ";" +
    String(temperatur, 1) + ";" +
    String(bodenfeuchtigkeit);

  modem.beginPacket();
  modem.print(msg);

  int result = modem.endPacket();

  if (result > 0) {
    Serial.println("Gesendet:");
    Serial.println(msg);
  } else {
    Serial.print("Fehlercode: ");
    Serial.println(result);
  }

  delay(180000); // 3 Minuten
}