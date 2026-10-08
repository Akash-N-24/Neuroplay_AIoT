# NeuroPlay

## NeuroPlay: An AIoT-Based Real-Time Stress Monitoring and Alert System for Competitive Gaming

NeuroPlay is an academic AIoT prototype that connects physiological sensing, machine-learning-based stress classification, a Django REST backend, a React monitoring dashboard, and Android local notifications into one end-to-end workflow for competitive gaming research.

**Project status:** Working academic prototype / research demonstrator. This project is intended for experimentation, evaluation and demonstration, not medical diagnosis.

## End-to-end pipeline

MAX30102 / PPG sensing
  -> ESP32 edge/data node
  -> HTTP JSON
  -> Django REST API
  -> feature construction
  -> Random Forest inference
  -> physiological heuristic layer
  -> SQLite / StressLog
  -> React + Vite dashboard
  -> live metrics, history chart and alerts
  -> Capacitor Android notifications

The current frontend uses polling for dashboard refresh. It requests recent history approximately every 3.5 seconds. WebSockets or SSE are future options, not the current transport.

## Key capabilities

- PPG-oriented physiological stress monitoring workflow.
- ESP32-to-Django HTTP JSON ingestion contract.
- Django REST Framework API for sensor readings and history.
- Random Forest stress classification into Normal, Moderate and High.
- Five current model fields: mean_hr, rmssd, sdnn, mean_nn and pnn50.
- Hybrid inference layer combining model output with physiological heuristics.
- SQLite persistence through Django.
- CSV import for offline or historical readings.
- React/Vite dashboard with live HR and HRV cards.
- Recent stress trend chart.
- Moderate and High stress warnings.
- Capacitor Android local-notification integration.
- Django API tests for core ingestion, history and CSV workflows.

## Repository structure

    neuroplay/
    ├── ai-model/                 # model notebook and trained model bundle
    ├── backend/                  # Django REST API and persistence
    ├── frontend/                 # React/Vite dashboard and Android wrapper
    ├── docs/                     # architecture, API, model and development docs
    ├── live_sensor_data_readme.md
    ├── phase_i_synopsis.md
    ├── requirements.txt
    └── README.md

## Machine-learning implementation

The backend loads the saved model bundle with Joblib and reads the feature order from feature_columns.pkl.

The current deployed inference frame is built from API values HR, HRV and RMSSD:

- mean_hr = incoming HR/BPM
- rmssd = incoming RMSSD
- sdnn = incoming HRV field
- mean_nn = 60000 / mean_hr when HR is positive
- pnn50 = the current deployment-derived RMSSD/HRV ratio, bounded to 0-100

The pNN50 field is documented this way deliberately: the current backend implementation does not recompute conventional pNN50 from a raw sequence of successive interval differences.

### Random Forest configuration

The training workflow records:

- 200 estimators
- maximum depth 10
- minimum samples per leaf 3
- balanced class weights
- random state 42

### Hybrid decision layer

The current backend contains two physiological rules:

High:
- HR >= 105 BPM
- HRV <= 45 ms
- RMSSD <= 35 ms

Moderate:
- HR >= 90 BPM
- HRV <= 55 ms
- RMSSD <= 45 ms
- applied to reinforce Moderate when the Random Forest predicts Normal

These are prototype engineering heuristics, not clinical thresholds.

## Reported research evaluation

The supplied research evaluation uses leave-one-subject-out evaluation on S3, S4 and S5.

    S3     77.51%
    S4     67.14%
    S5     64.65%
    Mean   69.77%
    Std     5.57%

The Moderate class is the main weak point in the current preliminary evaluation. Only three subjects are included, so these results should not be treated as population-level performance.

## Backend API

POST /api/sensor-data/
Accepts HR, HRV and RMSSD, runs inference and stores the result.

Example JSON:

    {
      "hr": 92,
      "hrv": 48.6,
      "rmssd": 31.2
    }

GET /api/sensor-data/
Returns stored StressLog records.

GET /api/history/?limit=500
Returns recent records used by the dashboard.

POST /api/import-csv/
Imports historical readings. Required fields are hr (or bpm), hrv and rmssd. Optional fields include stress_level and timestamp/recorded_at.

## Local development

### Backend

    python -m venv .venv
    .venv\Scripts\activate
    pip install -r requirements.txt
    python backend/manage.py migrate
    python backend/manage.py test stress_monitor
    python backend/manage.py runserver 127.0.0.1:8000

### Frontend

    cd frontend
    npm install
    npm run dev

The Vite development server uses port 5173.

To change the backend host, create frontend/.env.local:

    VITE_API_BASE_URL=http://127.0.0.1:8000

Never commit private LAN addresses, credentials, API keys or Wi-Fi passwords.

### Android

    cd frontend
    npm install
    npx cap sync android
    npx cap open android

## Sensor integration

The project defines an HTTP contract between an ESP32/data source and Django. The supplied sensor guide shows how to POST HR, HRV and RMSSD.

Important networking detail: 127.0.0.1 on an ESP32 refers to the ESP32 itself. A physical ESP32 must use a reachable host address for the computer running Django.

The final physical sensing firmware should remain aligned with the actual MAX30102/PPG implementation used in the research demonstration.

## Security and deployment

This is an academic prototype. Before public deployment:

- move Django SECRET_KEY to an environment variable;
- disable DEBUG;
- restrict ALLOWED_HOSTS;
- restrict CORS to trusted origins;
- add authentication and authorization;
- use HTTPS/TLS for sensor-to-server traffic;
- protect stored physiological data;
- do not expose the development server directly to the public internet.

The supplied development secret has been removed from the repository configuration and replaced with environment-based configuration.

## Research limitations

NeuroPlay is a stress-monitoring research prototype, not a medical device. The current evaluation is preliminary and uses three subjects. The physiological measurements are PPG-derived, and the supplied prototype does not establish simultaneous ECG validation. Motion artefacts, sensor contact, power stability and longer-duration real-world reliability remain important validation areas.

Future work includes larger cohorts, additional physiological signals such as GSR, sequence models such as LSTM, stronger subject-independent preprocessing and real-time intervention evaluation.

## Documentation

- docs/ARCHITECTURE.md
- docs/API.md
- docs/SENSOR_INTEGRATION.md
- docs/MODEL.md
- docs/DEVELOPMENT.md
- phase_i_synopsis.md
- live_sensor_data_readme.md

## Academic project

Project: NeuroPlay

Title: NeuroPlay: An AIoT-Based Real-Time Stress Monitoring and Alert System for Competitive Gaming

The repository is maintained as the implementation and demonstration companion for the academic project and associated research paper.

## License

The existing MIT license from the user's repository is retained.
