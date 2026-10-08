# NeuroPlay Architecture

## System layers

1. Physiological sensing: MAX30102 PPG and the ESP32 prototype produce physiological measurements.
2. Network/data transport: the data node sends HR, HRV and RMSSD as JSON over HTTP.
3. Backend: Django REST Framework validates data, constructs the model feature frame, runs Random Forest inference and applies the current heuristic layer.
4. Persistence: Django stores readings in StressLog using SQLite for the prototype.
5. Presentation: React/Vite polls the history endpoint and renders live metrics, trends and alerts.
6. Mobile: Capacitor wraps the frontend for Android and provides local notifications.

## Current data path

MAX30102 -> ESP32 -> HTTP JSON -> Django REST -> feature construction -> Random Forest -> heuristic layer -> StressLog -> React polling -> dashboard/notifications

The current frontend uses polling, not WebSocket push.
