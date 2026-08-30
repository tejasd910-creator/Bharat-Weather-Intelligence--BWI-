# Weather Incident Intelligence MVP

A demonstration platform for **social-media weather report ingestion and IMD reference validation**.

## Demo workflow

`Social report → Ingest → Extract event/location/severity → Match IMD reference → Score evidence → Verified / Probable / Unverified → Incident Map`

## Run locally

### Backend

```bat
cd backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bat
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` for a deployed backend.

## Demonstration feature

Open **📡 Social Ingestion**. Paste a report, select its location, and click **INGEST & AUTO-VALIDATE**. The report is stored by FastAPI, automatically analyzed, compared with the IMD reference layer, scored, and immediately appears in the live feed.

The **Auto-ingest demo feed** toggle adds a new controlled report every few seconds to demonstrate continuous ingestion.

> Demo note: the included social reports and IMD reference observations are controlled prototype data. A production deployment should replace these with authorized live social connectors and official IMD data services.


## Validation showcase

The Social Ingestion page supports manual injection and automatic IMD/reference validation. Numeric claims are compared directly against the reference observation. A material contradiction is classified as `FALSE / CONTRADICTED` (stored as `unverified` for backward compatibility with the existing UI).

Example demo in Lucknow: enter `Temperature in Lucknow is 12°C` while the bundled IMD reference is about 31.2°C. The result should be FALSE / CONTRADICTED with a very low evidence score and an explanation showing the 19.2°C difference.

For rainfall and wind-speed claims, the same direct comparison logic is applied. Claims without a numeric value continue through the event/location evidence rules and may be corroborated, probable, or uncertain.
