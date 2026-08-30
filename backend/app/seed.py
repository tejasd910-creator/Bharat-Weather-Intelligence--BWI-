from datetime import datetime,timedelta
import random
from sqlalchemy.orm import Session
from .models import WeatherObservation
CITIES=[("Delhi","Delhi",28.6139,77.2090),("Mumbai","Maharashtra",19.0760,72.8777),
("Kanpur","Uttar Pradesh",26.4499,80.3319),("Lucknow","Uttar Pradesh",26.8467,80.9462),
("Kolkata","West Bengal",22.5726,88.3639),("Chennai","Tamil Nadu",13.0827,80.2707),
("Bengaluru","Karnataka",12.9716,77.5946),("Guwahati","Assam",26.1445,91.7362),
("Jaipur","Rajasthan",26.9124,75.7873),("Patna","Bihar",25.5941,85.1376)]
def seed(db:Session):
    if db.query(WeatherObservation).count(): return
    now=datetime.utcnow()
    for i in range(260):
        city,state,lat,lon=random.choice(CITIES); extreme=i%43==0
        rain=random.uniform(2,30) if not extreme else random.uniform(110,180)
        temp=random.uniform(22,36) if not extreme else random.uniform(43,47)
        db.add(WeatherObservation(station=f"ST-{i+1:04d}",city=city,state=state,latitude=lat,longitude=lon,
            temperature=round(temp,1),humidity=round(random.uniform(35,96),1),rainfall=round(rain,1),
            wind_speed=round(random.uniform(2,35),1),pressure=round(random.uniform(995,1020),1),
            source=random.choice(["Weather API","AWS Sensor","Radar Feed","Citizen Network"]),
            observed_at=now-timedelta(hours=random.randint(0,240))))
    db.commit()
