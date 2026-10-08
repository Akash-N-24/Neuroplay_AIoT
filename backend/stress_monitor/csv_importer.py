import csv
from datetime import datetime, timezone as dt_timezone
from io import TextIOWrapper
from django.utils.dateparse import parse_datetime
from .inference import predict_stress_label
from .models import StressLog

def import_stress_csv_file(csv_file):
    if hasattr(csv_file,"read") and not isinstance(csv_file.read(0),str):
        csv_file.seek(0); csv_file=TextIOWrapper(csv_file,encoding="utf-8-sig",newline="")
    reader=csv.DictReader(csv_file)
    if not reader.fieldnames: raise ValueError("CSV file has no header row.")
    imported=0
    for row_number,row in enumerate(reader,start=2):
        hr=row.get("hr",row.get("bpm")); hrv=row.get("hrv"); rmssd=row.get("rmssd")
        if hr in (None,"") or hrv in (None,"") or rmssd in (None,""):
            raise ValueError(f"Row {row_number}: expected hr/bpm, hrv, and rmssd columns.")
        stress=row.get("stress_level") or predict_stress_label(float(hr),float(rmssd),float(hrv))
        tv=row.get("timestamp") or row.get("recorded_at")
        log=StressLog(hr=float(hr),hrv=float(hrv),rmssd=float(rmssd),stress_level=stress)
        if tv: log.timestamp=_parse_timestamp(tv)
        log.save(); imported+=1
    return imported

def _parse_timestamp(value):
    parsed=parse_datetime(value)
    if parsed is not None: return parsed
    try: parsed=datetime.fromisoformat(value.replace("Z","+00:00"))
    except ValueError as exc: raise ValueError(f"Invalid timestamp value: {value}") from exc
    return parsed.replace(tzinfo=dt_timezone.utc) if parsed.tzinfo is None else parsed
