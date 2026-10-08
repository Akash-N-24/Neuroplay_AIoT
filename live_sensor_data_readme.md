# Live Sensor Data Setup

NeuroPlay accepts live physiological values through the Django REST API.

## Data flow

1. ESP32/data source sends JSON.
2. Django validates the reading.
3. The inference module predicts Normal, Moderate or High.
4. StressLog stores the result.
5. React polls history every 3.5 seconds.
6. The dashboard updates HR, HRV, stress state, chart and alerts.

## Endpoint

POST http://HOST:8000/api/sensor-data/

Example payload:

    {"hr":92,"hrv":48.6,"rmssd":31.2}

Example curl:

    curl -X POST http://127.0.0.1:8000/api/sensor-data/ -H "Content-Type: application/json" -d '{"hr":92,"hrv":48.6,"rmssd":31.2}'

For a physical ESP32, replace 127.0.0.1 with the reachable LAN address of the Django host.

## Frontend

The dashboard reads:
GET /api/history/?limit=500

The default polling interval is 3.5 seconds.

## Important

The physical MAX30102/ESP32 firmware should be the actual firmware used by the research prototype. This guide documents the server-side integration contract and does not invent sensor-acquisition code that was not supplied in the repository.
