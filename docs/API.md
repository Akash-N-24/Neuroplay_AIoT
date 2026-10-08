# NeuroPlay API

## POST /api/sensor-data/

Accepts:

    {"hr":92,"hrv":48.6,"rmssd":31.2}

The backend predicts the stress class and stores the record.

## GET /api/sensor-data/

Returns stored StressLog records ordered newest first.

## GET /api/history/?limit=N

Returns up to N recent records. The dashboard requests a larger history window and filters the chart to the most recent 30 minutes.

## POST /api/import-csv/

Multipart upload using field name file.

Required columns:
- hr or bpm
- hrv
- rmssd

Optional:
- stress_level
- timestamp
- recorded_at

## Example

    curl -X POST http://127.0.0.1:8000/api/sensor-data/ -H "Content-Type: application/json" -d '{"hr":92,"hrv":48.6,"rmssd":31.2}'
