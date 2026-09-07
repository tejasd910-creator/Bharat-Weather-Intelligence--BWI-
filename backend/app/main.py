import re
from datetime import datetime
from fastapi import FastAPI,Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import Base,engine,get_db
from .models import WeatherObservation,CitizenReport,WeatherEvent
from .schemas import ObservationIn,CitizenReportIn
from .seed import seed
from .analytics import anomalies

app=FastAPI(title="National Weather Big Data Analytics Platform",version="2.0")
app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
Base.metadata.create_all(bind=engine)
db=next(get_db()); seed(db)
# Add deterministic IMD-labelled reference observations for the demo validation workflow.
_imd_refs=[
    ("IMD-LKO","Lucknow","Uttar Pradesh",26.8467,80.9462,31.4,91.0,82.0,28.0,1004.2),
    ("IMD-GHY","Guwahati","Assam",26.1445,91.7362,29.1,94.0,96.0,31.0,1002.1),
    ("IMD-JAI","Jaipur","Rajasthan",26.9124,75.7873,34.0,68.0,24.0,42.0,1001.8),
    ("IMD-KNP","Kanpur","Uttar Pradesh",26.4499,80.3319,40.0,60.0,29.0,42.0,1000.8),
    ("IMD-DEL","Delhi","Delhi",28.6139,77.2090,39.0,61.0,25.0,40.0,1001.8),
]
for _station,_city,_state,_lat,_lon,_temp,_hum,_rain,_wind,_press in _imd_refs:
    if not db.query(WeatherObservation).filter(WeatherObservation.station==_station).first():
        db.add(WeatherObservation(station=_station,city=_city,state=_state,latitude=_lat,longitude=_lon,temperature=_temp,humidity=_hum,rainfall=_rain,wind_speed=_wind,pressure=_press,source="IMD Reference",quality_status="VALID",observed_at=datetime.utcnow()))
db.commit(); db.close()

@app.get("/api/health")
def health(): return {"status":"healthy","pipeline":"online"}

@app.get("/api/dashboard")
def dashboard(db:Session=Depends(get_db)):
    rows=db.query(WeatherObservation).all(); a=anomalies(db)
    return {"observations":int(len(rows)),"avg_temperature":float(round(sum(float(x.temperature) for x in rows)/len(rows),1)),
            "avg_humidity":float(round(sum(float(x.humidity) for x in rows)/len(rows),1)),
            "total_rainfall":float(round(sum(float(x.rainfall) for x in rows),1)),"active_anomalies":len(a),
            "high_risk":int(sum(bool(x["risk_score"]>=75) for x in a)),
            "latest":[{"city":x.city,"state":x.state,"temperature":float(x.temperature),"humidity":float(x.humidity),
            "rainfall":float(x.rainfall),"wind_speed":float(x.wind_speed),"latitude":float(x.latitude),"longitude":float(x.longitude),
            "source":x.source} for x in sorted(rows,key=lambda x:x.observed_at,reverse=True)[:40]]}

@app.get("/api/analytics/anomalies")
def get_anomalies(db:Session=Depends(get_db)): return anomalies(db)

@app.post("/api/observations")
def ingest(p:ObservationIn,db:Session=Depends(get_db)):
    # Basic quality gate
    valid=0<=p.humidity<=100 and p.rainfall>=0 and -90<=p.latitude<=90 and -180<=p.longitude<=180
    row=WeatherObservation(**p.model_dump(),quality_status="VALID" if valid else "REJECTED")
    db.add(row); db.commit(); db.refresh(row)
    return {"accepted":valid,"quality_status":row.quality_status,"id":row.id}

@app.post("/api/simulate/extreme")
def simulate(db:Session=Depends(get_db)):
    now=datetime.utcnow()
    row=WeatherObservation(station="SIM-001",city="Kanpur",state="Uttar Pradesh",
        latitude=26.4499,longitude=80.3319,temperature=35.2,humidity=97,
        rainfall=142.0,wind_speed=48.0,pressure=998.0,source="Simulation Engine",
        quality_status="VALID",observed_at=now)
    db.add(row); db.commit(); db.refresh(row)
    a=anomalies(db); hit=next((x for x in a if x["id"]==row.id),None)
    if hit:
        ev=WeatherEvent(event_type=hit["event_type"],city=hit["city"],state=hit["state"],
            risk_score=hit["risk_score"],severity=hit["severity"],description="Simulated extreme weather event detected.",
            explanation=hit["explanation"],action=hit["action"],created_at=now)
        db.add(ev); db.commit()
    return {"stage":["INGEST","VALIDATE","PROCESS","AI ANALYSIS","GIS","ALERT"],"observation_id":row.id,"alert":hit}

@app.post("/api/citizen-reports")
def report(p:CitizenReportIn,db:Session=Depends(get_db)):
    row=CitizenReport(**p.model_dump(),created_at=datetime.utcnow())
    db.add(row); db.commit(); db.refresh(row); return {"message":"report submitted","id":row.id}

@app.get("/api/citizen-reports")
def reports(db:Session=Depends(get_db)): return db.query(CitizenReport).order_by(CitizenReport.created_at.desc()).limit(50).all()

@app.get("/api/events")
def events(db:Session=Depends(get_db)): return db.query(WeatherEvent).order_by(WeatherEvent.created_at.desc()).limit(50).all()

# --- Social-media intelligence + IMD validation prototype ---
from .models import SocialReport
from .schemas import SocialReportIn

SOCIAL_DEMO = [
    {"platform":"X / Public Report","author":"@citywatch_lko","text":"Heavy rain has flooded roads near Gomti Nagar, Lucknow. Water level is rising rapidly.","city":"Lucknow","state":"Uttar Pradesh","latitude":26.8467,"longitude":80.9462,"hours":0.1},
    {"platform":"X / Public Report","author":"@weatheralert_up","text":"250mm rainfall recorded in Lucknow today. Worst rain in years!","city":"Lucknow","state":"Uttar Pradesh","latitude":26.8467,"longitude":80.9462,"hours":0.4},
    {"platform":"Public Community Feed","author":"@guwahati_now","text":"Very heavy rainfall around Guwahati, several low areas are waterlogged.","city":"Guwahati","state":"Assam","latitude":26.1445,"longitude":91.7362,"hours":0.7},
    {"platform":"X / Public Report","author":"@jaipur_updates","text":"Hailstorm reported in Jaipur with strong winds around the city.","city":"Jaipur","state":"Rajasthan","latitude":26.9124,"longitude":75.7873,"hours":1.1},
]

def _seed_social(db):
    if db.query(SocialReport).count(): return
    from datetime import timedelta
    now=datetime.utcnow()
    for s in SOCIAL_DEMO:
        db.add(SocialReport(platform=s["platform"],author=s["author"],text=s["text"],city=s["city"],state=s["state"],latitude=s["latitude"],longitude=s["longitude"],reported_at=now-timedelta(hours=s["hours"])))
    db.commit()

_db_seed=next(get_db())

# Small authoritative-reference demo layer. In production this is replaced by the official IMD feed.
_IMD_DEMO = [
    ("IMD-LKO-01", "Lucknow", "Uttar Pradesh", 26.8467, 80.9462, 31.2, 84.0, 82.0, 28.0),
    ("IMD-GAU-01", "Guwahati", "Assam", 26.1445, 91.7362, 29.4, 88.0, 118.0, 34.0),
    ("IMD-JAI-01", "Jaipur", "Rajasthan", 26.9124, 75.7873, 34.1, 62.0, 18.0, 52.0),
]
for _st,_city,_state,_lat,_lon,_temp,_hum,_rain,_wind in _IMD_DEMO:
    if not _db_seed.query(WeatherObservation).filter(WeatherObservation.station==_st).first():
        _db_seed.add(WeatherObservation(station=_st, city=_city, state=_state, latitude=_lat, longitude=_lon, temperature=_temp, humidity=_hum, rainfall=_rain, wind_speed=_wind, pressure=1004.0, source="IMD Reference Data (Demo)", quality_status="VALID", observed_at=datetime.utcnow()))
_db_seed.commit()
_seed_social(_db_seed); _db_seed.close()

def _extract_report(r):
    text=r.text.lower()
    if any(k in text for k in ["hailstorm","hail"]): event="Hailstorm"
    elif any(k in text for k in ["flood","waterlogged","water level"]): event="Flood / Heavy Rainfall"
    elif any(k in text for k in ["heavy rain","rainfall","rain"]): event="Heavy Rainfall"
    elif any(k in text for k in ["snowfall","snow","blizzard"]): event="Snowfall"
    elif any(k in text for k in ["heatwave","hot"]): event="Heatwave"
    elif any(k in text for k in ["wind","storm"]): event="Strong Wind / Storm"
    else: event="Weather Anomaly"
    severity="HIGH" if any(k in text for k in ["heavy","flood","250mm","rapidly","worst","extreme"]) else "MEDIUM"
    keywords=[k for k in ["heavy rain","rainfall","flood","waterlogged","water level","hailstorm","strong winds","250mm"] if k in text]
    return event,severity,keywords


def _extract_numeric_claims(text):
    """Extract explicit numeric weather claims from social text for deterministic demo validation."""
    t=text.lower().replace("°", "").replace("º", "")
    out={}

    # Temperature patterns: "temperature goes 12 degrees", "drops to 12C",
    # "temperature is 12", and plain "12 degrees".
    temp_patterns=[
        r'(?:temperature|temp(?:erature)?)\s*(?:is|of|goes(?:\s+down)?|drops?\s+to|dropped\s+to|falls?\s+to|fell\s+to|reached|at)\s*(-?\d+(?:\.\d+)?)\s*(?:c|celsius|degrees?(?:\s*celsius)?)?\b',
        r'(-?\d+(?:\.\d+)?)\s*(?:c|celsius|degrees?(?:\s*celsius)?)\b'
    ]
    for pat in temp_patterns:
        m=re.search(pat,t)
        if m:
            out["temperature"]=float(m.group(1)); break

    m=re.search(r'(-?\d+(?:\.\d+)?)\s*(?:mm|millimet(?:er|re)s?)\b', t)
    if m: out["rainfall"]=float(m.group(1))

    m=re.search(r'(-?\d+(?:\.\d+)?)\s*(?:km/?h|kmph|kph|km\s*/\s*hr)\b', t)
    if m: out["wind_speed"]=float(m.group(1))
    return out


def _compare_numeric_claim(claim, reference, kind):
    """Return verdict, score and explanation for a numeric claim vs reference."""
    if claim is None or reference is None:
        return None
    diff=abs(float(claim)-float(reference))
    if kind == "temperature":
        # Weather temperature: <=2C is a close match; >5C is a strong contradiction.
        if diff <= 2: return ("corroborated", 98, f"Reported temperature {claim:.1f}°C is within 2°C of the IMD/reference value {reference:.1f}°C.")
        if diff <= 5: return ("partial", 65, f"Reported temperature {claim:.1f}°C differs from the IMD/reference value {reference:.1f}°C by {diff:.1f}°C.")
        return ("contradicted", 8, f"Reported temperature {claim:.1f}°C contradicts the IMD/reference value {reference:.1f}°C by {diff:.1f}°C.")
    if kind == "rainfall":
        tolerance=max(10.0, float(reference)*0.20)
        if diff <= tolerance: return ("corroborated", 97, f"Reported rainfall {claim:.1f} mm is within the allowed tolerance of the IMD/reference value {reference:.1f} mm.")
        if diff <= max(25.0, float(reference)*0.50): return ("partial", 62, f"Reported rainfall {claim:.1f} mm differs from the IMD/reference value {reference:.1f} mm by {diff:.1f} mm.")
        return ("contradicted", 8, f"Reported rainfall {claim:.1f} mm materially contradicts the IMD/reference value {reference:.1f} mm.")
    if kind == "wind_speed":
        if diff <= 5: return ("corroborated", 96, f"Reported wind speed {claim:.1f} km/h is within 5 km/h of the IMD/reference value {reference:.1f} km/h.")
        if diff <= 10: return ("partial", 64, f"Reported wind speed {claim:.1f} km/h differs from the IMD/reference value {reference:.1f} km/h by {diff:.1f} km/h.")
        return ("contradicted", 8, f"Reported wind speed {claim:.1f} km/h contradicts the IMD/reference value {reference:.1f} km/h by {diff:.1f} km/h.")


def _nearest_observation(db,r):
    rows=db.query(WeatherObservation).filter(WeatherObservation.city==r.city).order_by(WeatherObservation.observed_at.desc()).limit(8).all()
    return rows[0] if rows else None


def _validate_social(db,r):
    event,severity,keywords=_extract_report(r)
    claims=_extract_numeric_claims(r.text)
    text=r.text.lower()
    imd=db.query(WeatherObservation).filter(WeatherObservation.city==r.city, WeatherObservation.source.ilike('%IMD%')).order_by(WeatherObservation.observed_at.desc()).first() or _nearest_observation(db,r)
    if not imd:
        return {"status":"uncertain","verdict":"UNCERTAIN","score":40,"reason":"No IMD/reference observation is available for this location.","observation":None,"keywords":keywords,"event":event,"severity":severity,"location_match":0,"time_match":0,"event_match":0,"severity_match":0,"source_reliability":0,"numeric_claims":claims,"numeric_checks":[]}

    reported=r.reported_at.replace(tzinfo=None) if getattr(r.reported_at,"tzinfo",None) else r.reported_at
    observed=imd.observed_at.replace(tzinfo=None) if getattr(imd.observed_at,"tzinfo",None) else imd.observed_at
    hours=abs((reported-observed).total_seconds())/3600
    time_match=max(35,min(100,100-hours*7))
    location=96
    source=92 if "IMD" in (imd.source or "").upper() else 82

    # Event matching is evidence-based, not a reward for simply saying "heavy".
    if event in ["Heavy Rainfall","Flood / Heavy Rainfall"]:
        event_match=95 if imd.rainfall>=70 else 55 if imd.rainfall>=25 else 15
    elif event=="Heatwave":
        event_match=98 if imd.temperature>=42 else 30 if imd.temperature>=35 else 5
    elif event=="Strong Wind / Storm":
        event_match=98 if imd.wind_speed>=45 else 55 if imd.wind_speed>=30 else 10
    elif event=="Snowfall":
        # The demo reference feed has no snowfall field. For this prototype, a
        # warm lowland observation (>5°C) is treated as a strong contradiction.
        event_match=5 if imd.temperature>5 else 60
    elif event=="Hailstorm":
        event_match=50  # cannot be confirmed from the available numeric fields
    else:
        event_match=50

    severity_match=92 if (severity=="HIGH" and (imd.rainfall>=70 or imd.temperature>=42 or imd.wind_speed>=45)) else 78 if severity=="HIGH" else 85

    numeric_checks=[]
    for kind in ["temperature","rainfall","wind_speed"]:
        if kind in claims:
            check=_compare_numeric_claim(claims[kind],getattr(imd,kind,None),kind)
            if check:
                verdict,nscore,reason=check
                numeric_checks.append({"metric":kind,"claim":claims[kind],"reference":float(getattr(imd,kind)),"difference":round(abs(claims[kind]-float(getattr(imd,kind))),1),"verdict":verdict,"score":nscore,"reason":reason})

    # Explicit snowfall claim is a contradiction when the reference temperature
    # makes snowfall implausible in the demo location.
    if event=="Snowfall" and imd.temperature>5:
        numeric_checks.append({"metric":"weather_condition","claim":"snowfall","reference":f"{imd.temperature:.1f}°C at reference station","difference":None,"verdict":"contradicted","score":3,"reason":f"The report claims snowfall, but the IMD/reference observation is {imd.temperature:.1f}°C; snowfall is not supported under these conditions."})

    contradictions=[x for x in numeric_checks if x["verdict"]=="contradicted"]
    partials=[x for x in numeric_checks if x["verdict"]=="partial"]

    # HARD RULE: any strong contradiction must dominate generic location/source
    # scores. This prevents false reports from receiving a high probability just
    # because they came from the correct city.
    if contradictions:
        score=max(0,min(20,min(x["score"] for x in contradictions)))
        details="; ".join(x["reason"] for x in contradictions)
        return {"status":"unverified","verdict":"FALSE / CONTRADICTED","score":score,
                "reason":details+" Therefore the social-media claim is classified as FALSE / CONTRADICTED by the available IMD/reference evidence.",
                "observation":imd,"keywords":keywords,"event":event,"severity":severity,
                "location_match":location,"time_match":round(time_match,1),"event_match":round(event_match,1),
                "severity_match":round(severity_match,1),"source_reliability":source,
                "numeric_claims":claims,"numeric_checks":numeric_checks}

    if numeric_checks:
        numeric_score=min(x["score"] for x in numeric_checks)
        if numeric_score>=90 and not partials:
            score=round(location*.15+time_match*.15+event_match*.20+severity_match*.10+source*.10+numeric_score*.30,1)
            status="verified" if score>=80 else "probable"
            reason="; ".join(x["reason"] for x in numeric_checks)+" The numerical claim is corroborated by the IMD/reference data."
        else:
            score=round(numeric_score*.45+location*.15+time_match*.15+event_match*.15+source*.10,1)
            status="probable" if score>=60 else "uncertain"
            reason="; ".join(x["reason"] for x in numeric_checks)+" The claim is only partially supported by the reference data."
    else:
        score=round(location*.25+time_match*.20+event_match*.30+severity_match*.15+source*.10,1)
        status="verified" if score>=90 else "probable" if score>=70 else "uncertain"
        reason=(f"Location matched to {imd.city}; reference rainfall is {imd.rainfall:.1f} mm, temperature {imd.temperature:.1f}°C and wind {imd.wind_speed:.1f} km/h. "
                + ("The event claim is consistent with the reference observation." if status=="verified" else "The report partially matches the reference observation but requires additional verification."))

    return {"status":status,"verdict":"CORROBORATED" if status=="verified" else "PARTIALLY CORROBORATED" if status=="probable" else "UNCERTAIN",
            "score":score,"reason":reason,"observation":imd,"keywords":keywords,"event":event,"severity":severity,
            "location_match":location,"time_match":round(time_match,1),"event_match":round(event_match,1),
            "severity_match":round(severity_match,1),"source_reliability":source,"numeric_claims":claims,"numeric_checks":numeric_checks}

@app.post("/api/social-reports")
def create_social_report(p: SocialReportIn, db: Session = Depends(get_db)):
    # Manual injection endpoint: accepts the same structure a real social connector would send.
    payload=p.model_dump()
    payload["reported_at"] = p.reported_at or datetime.utcnow()
    row = SocialReport(**payload)
    db.add(row); db.commit(); db.refresh(row)
    # Automatically extract and validate immediately so ingestion is demonstrable end-to-end.
    event, severity, keywords = _extract_report(row)
    row.analyzed = True
    row.event_type = event
    row.severity = severity
    row.extraction_confidence = round(min(98, 78 + len(keywords) * 3.2), 1)
    result = _validate_social(db, row)
    row.validation_status = result["status"]
    row.validation_score = result["score"]
    row.validation_reason = result["reason"]
    db.commit(); db.refresh(row)
    return {
        "id": row.id,
        "message": "Social report ingested and automatically validated",
        "status": row.validation_status,
        "score": row.validation_score,
        "event": row.event_type,
        "city": row.city,
        "reason": row.validation_reason
    }

@app.get("/api/social-stats")
def social_stats(db:Session=Depends(get_db)):
    rows=db.query(SocialReport).all()
    rejected=sum(1 for r in rows if r.validation_status=="unverified")
    verified=sum(1 for r in rows if r.validation_status=="verified")
    probable=sum(1 for r in rows if r.validation_status=="probable")
    pending=sum(1 for r in rows if r.validation_status in (None,"pending","uncertain"))
    return {"accepted":verified+probable,"verified":verified,"probable":probable,"rejected":rejected,"pending":pending}

@app.get("/api/social-reports")
def social_reports(db:Session=Depends(get_db)):
    """Return the incoming feed, including rejected reports for audit/demo visibility."""
    return db.query(SocialReport).order_by(SocialReport.reported_at.desc()).limit(50).all()

@app.get("/api/social-reports/rejected")
def rejected_social_reports(db:Session=Depends(get_db)):
    """Rejected social claims are retained for transparency but excluded from validated statistics."""
    return (db.query(SocialReport)
            .filter(SocialReport.validation_status == "unverified")
            .order_by(SocialReport.reported_at.desc())
            .limit(50).all())

@app.get("/api/social-reports/{report_id}")
def social_report(report_id:int,db:Session=Depends(get_db)):
    r=db.get(SocialReport,report_id)
    if not r: return {"error":"Report not found"}
    return r

@app.post("/api/social-reports/{report_id}/analyze")
def analyze_social(report_id:int,db:Session=Depends(get_db)):
    r=db.get(SocialReport,report_id)
    if not r: return {"error":"Report not found"}
    event,severity,keywords=_extract_report(r)
    r.analyzed=True; r.event_type=event; r.severity=severity; r.extraction_confidence=round(min(98,78+len(keywords)*3.2),1)
    db.commit()
    return {"id":r.id,"event":event,"location":r.city+", "+r.state,"latitude":r.latitude,"longitude":r.longitude,"severity":severity,"keywords":keywords,"confidence":r.extraction_confidence}

@app.post("/api/validation/{report_id}/run")
def validate_social(report_id:int,db:Session=Depends(get_db)):
    r=db.get(SocialReport,report_id)
    if not r: return {"error":"Report not found"}
    result=_validate_social(db,r)
    r.analyzed=True; r.event_type=result["event"]; r.severity=result["severity"]; r.extraction_confidence=r.extraction_confidence or 90
    r.validation_status=result["status"]; r.validation_score=result["score"]; r.validation_reason=result["reason"]
    db.commit()
    obs=result.get("observation")
    return {**result,"report":{"id":r.id,"text":r.text,"platform":r.platform,"author":r.author,"city":r.city,"state":r.state,"reported_at":r.reported_at.isoformat()},"imd":{"station":obs.station if obs else None,"source":obs.source if obs else None,"rainfall":obs.rainfall if obs else None,"temperature":obs.temperature if obs else None,"humidity":obs.humidity if obs else None,"wind_speed":obs.wind_speed if obs else None,"observed_at":obs.observed_at.isoformat() if obs else None}}

@app.get("/api/validation/{report_id}")
def validation(report_id:int,db:Session=Depends(get_db)):
    r=db.get(SocialReport,report_id)
    if not r: return {"error":"Report not found"}
    if not r.validation_score: return {"status":"pending","message":"Run validation first."}
    return validate_social(report_id,db)

@app.post("/api/simulation/social")
def social_simulation(db:Session=Depends(get_db)):
    from datetime import timedelta
    r=db.query(SocialReport).filter(SocialReport.id==1).first() or db.query(SocialReport).first()
    result=_validate_social(db,r)
    return {"stage":["INGEST SOCIAL REPORT","EXTRACT LOCATION + EVENT","MATCH IMD REFERENCE","COMPARE EVIDENCE","CALCULATE CONFIDENCE","CLASSIFY INCIDENT"],"report_id":r.id,"alert":{"status":result["status"],"score":result["score"],"event":result["event"],"city":r.city,"reason":result["reason"]}}
