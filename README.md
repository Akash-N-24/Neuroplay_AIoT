# NeuroPlay

## 🧠 NeuroPlay: An AIoT-Based Real-Time Stress Monitoring and Alert System for Competitive Gaming

NeuroPlay is an academic **AIoT research prototype** that combines physiological sensing, machine learning, a Django REST backend, a React monitoring dashboard, and Android local notifications into an end-to-end stress-monitoring workflow for competitive gaming research.

> **Project status:** Working academic prototype / research demonstrator. This system is intended for experimentation and evaluation, not medical diagnosis.

## 🔄 End-to-end pipeline

```
MAX30102 / PPG sensing
        ↓
ESP32 edge/data node
        ↓
HTTP JSON
        ↓
Django REST API
        ↓
Feature construction
        ↓
Random Forest inference
        ↓
Physiological heuristic layer
        ↓
SQLite / StressLog
        ↓
React + Vite dashboard
        ↓
Metrics + trends + alerts
        ↓
Android notifications
```

## ✨ Key capabilities

- PPG-oriented physiological stress-monitoring workflow
- ESP32-to-Django HTTP JSON ingestion
- Django REST API for readings and history
- Random Forest stress classification
- Hybrid ML + physiological heuristic decision layer
- SQLite persistence
- CSV import for historical readings
- React/Vite monitoring dashboard
- Stress trend visualization
- Moderate / High stress warnings
- Capacitor Android notification integration
- Django API tests for core workflows

## 🤖 Machine-learning implementation

The backend loads the saved model bundle with Joblib and uses the configured feature order.

Current deployed features:

- `mean_hr`
- `rmssd`
- `sdnn`
- `mean_nn`
- `pnn50`

### Random Forest configuration

- 200 estimators
- Maximum depth: 10
- Minimum samples per leaf: 3
- Balanced class weights
- Random state: 42

The repository documents the current inference implementation and deliberately distinguishes prototype engineering heuristics from clinical thresholds.

## 📊 Research evaluation

The supplied preliminary evaluation uses leave-one-subject-out evaluation on S3, S4 and S5:

| Subject | Accuracy |
|---|---:|
| S3 | 77.51% |
| S4 | 67.14% |
| S5 | 64.65% |
| **Mean** | **69.77%** |
| **Std.** | **5.57%** |

Only three subjects are included, so these results should not be treated as population-level performance.

## 🗂️ Repository structure

```
neuroplay/
├── ai-model/
├── backend/
├── frontend/
├── docs/
├── live_sensor_data_readme.md
├── phase_i_synopsis.md
├── requirements.txt
└── README.md
```

## ▶️ Local development

### Backend

```bash
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
python backend/manage.py migrate
python backend/manage.py test stress_monitor
python backend/manage.py runserver 127.0.0.1:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite development server uses port 5173.

### Android

```bash
cd frontend
npm install
npx cap sync android
npx cap open android
```

## 🔐 Security

Before public deployment:

- move Django `SECRET_KEY` to environment variables;
- disable `DEBUG`;
- restrict `ALLOWED_HOSTS`;
- restrict CORS to trusted origins;
- add authentication and authorization;
- use HTTPS/TLS;
- protect stored physiological data;
- do not expose the development server directly to the public internet.

## ⚠️ Research limitations

NeuroPlay is a stress-monitoring research prototype, not a medical device. The current evaluation is preliminary and uses three subjects. PPG-derived measurements, motion artefacts, sensor contact, power stability and longer-duration real-world reliability remain important validation considerations.

## 📚 Documentation

See the `docs/` directory for:

- Architecture
- API
- Sensor integration
- Machine-learning model
- Development

## 📄 License

MIT
