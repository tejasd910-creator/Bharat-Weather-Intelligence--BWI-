from sklearn.ensemble import IsolationForest
import numpy as np
from sqlalchemy.orm import Session
from .models import WeatherObservation

def classify(r):
    if r.rainfall >= 100: return "Heavy Rainfall"
    if r.temperature >= 44: return "Heatwave"
    if r.wind_speed >= 55: return "High Wind"
    if r.humidity >= 95 and r.rainfall >= 50: return "Severe Storm Risk"
    return "Weather Anomaly"

def explain(r, risk):
    reasons=[]
    if r.rainfall>50: reasons.append(f"rainfall {r.rainfall:.1f} mm is unusually high")
    if r.temperature>40: reasons.append(f"temperature {r.temperature:.1f}°C is unusually high")
    if r.humidity>90: reasons.append(f"humidity {r.humidity:.1f}% is very high")
    if r.wind_speed>40: reasons.append(f"wind speed {r.wind_speed:.1f} km/h is elevated")
    if not reasons: reasons.append("multivariate weather pattern differs from learned normal conditions")
    return "AI flagged this observation because " + ", ".join(reasons) + "."

def anomalies(db):
    rows=db.query(WeatherObservation).all()
    if len(rows)<10: return []
    X=np.array([[r.temperature,r.humidity,r.rainfall,r.wind_speed,r.pressure] for r in rows])
    model=IsolationForest(contamination=.08,random_state=42)
    labels=model.fit_predict(X); raw=-model.decision_function(X)
    out=[]
    for r,label,s in zip(rows,labels,raw):
        if label==-1:
            risk=float(round(min(99.0,max(50.0,50.0+float(s)*100.0)),1))
            out.append({"id":int(r.id),"city":r.city,"state":r.state,"temperature":float(r.temperature),
                        "rainfall":float(r.rainfall),"humidity":float(r.humidity),"wind_speed":float(r.wind_speed),
                        "risk_score":risk,"event_type":classify(r),"severity":"HIGH" if risk>=75 else "MEDIUM",
                        "explanation":explain(r,risk),
                        "action":"Monitor affected area and issue local advisory." if risk>=75 else "Continue monitoring.",
                        "observed_at":r.observed_at.isoformat()})
    return sorted(out,key=lambda x:x["risk_score"],reverse=True)
