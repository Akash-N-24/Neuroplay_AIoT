# Sensor Integration

The backend defines a simple contract for an ESP32/data source.

Endpoint:
POST http://HOST:8000/api/sensor-data/

Payload:

    {"hr":92,"hrv":48.6,"rmssd":31.2}

Expected sequence:

1. MAX30102/PPG acquisition runs on the sensor node.
2. Pulse-to-pulse information is processed according to the actual firmware.
3. HR, HRV/SDNN and RMSSD are sent to Django.
4. Django constructs the model input and predicts stress.
5. StressLog stores the result.
6. React polls the history endpoint and updates the interface.

Important: 127.0.0.1 on an ESP32 refers to the ESP32 itself. A physical device must use a reachable host address for the computer running Django.

Never commit Wi-Fi credentials, private LAN addresses or API secrets.
