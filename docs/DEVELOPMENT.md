# Development Guide

## Backend

    python -m venv .venv
    .venv\Scripts\activate
    pip install -r requirements.txt
    python backend/manage.py migrate
    python backend/manage.py test stress_monitor
    python backend/manage.py runserver 127.0.0.1:8000

## Frontend

    cd frontend
    npm install
    npm run dev
    npm run build

## Android

    cd frontend
    npx cap sync android
    npx cap open android

## Verification checklist

1. Run Django tests.
2. Build the React frontend.
3. Start Django.
4. POST a sample reading.
5. Confirm the record appears in history.
6. Open the dashboard.
7. Verify Normal, Moderate and High transitions.
8. Verify Android notification permissions when using Capacitor.

Use environment variables for Django configuration and the frontend API URL.
