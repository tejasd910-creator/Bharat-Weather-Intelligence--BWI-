from sqlalchemy import Column,Integer,Float,String,DateTime,Text,Boolean
from .database import Base

class WeatherObservation(Base):
    __tablename__="weather_observations"
    id=Column(Integer,primary_key=True)
    station=Column(String,nullable=False); city=Column(String,nullable=False); state=Column(String,nullable=False)
    latitude=Column(Float,nullable=False); longitude=Column(Float,nullable=False)
    temperature=Column(Float,nullable=False); humidity=Column(Float,nullable=False)
    rainfall=Column(Float,nullable=False); wind_speed=Column(Float,nullable=False); pressure=Column(Float,nullable=False)
    source=Column(String,default="demo"); quality_status=Column(String,default="VALID"); observed_at=Column(DateTime,nullable=False)

class CitizenReport(Base):
    __tablename__="citizen_reports"
    id=Column(Integer,primary_key=True); name=Column(String,default="Anonymous")
    category=Column(String,nullable=False); description=Column(Text,nullable=False); city=Column(String,nullable=False)
    latitude=Column(Float,nullable=False); longitude=Column(Float,nullable=False)
    severity=Column(String,default="medium"); status=Column(String,default="pending"); created_at=Column(DateTime,nullable=False)

class SocialReport(Base):
    __tablename__="social_reports"
    id=Column(Integer,primary_key=True)
    platform=Column(String,nullable=False,default="Public Social Feed")
    author=Column(String,nullable=False,default="@public_report")
    text=Column(Text,nullable=False)
    city=Column(String,nullable=False)
    state=Column(String,nullable=False)
    latitude=Column(Float,nullable=False)
    longitude=Column(Float,nullable=False)
    reported_at=Column(DateTime,nullable=False)
    analyzed=Column(Boolean,default=False)
    event_type=Column(String,nullable=True)
    severity=Column(String,nullable=True)
    extraction_confidence=Column(Float,nullable=True)
    validation_status=Column(String,default="pending")
    validation_score=Column(Float,nullable=True)
    validation_reason=Column(Text,nullable=True)

class WeatherEvent(Base):
    __tablename__="weather_events"
    id=Column(Integer,primary_key=True); event_type=Column(String,nullable=False)
    city=Column(String,nullable=False); state=Column(String,nullable=False)
    risk_score=Column(Float,nullable=False); severity=Column(String,nullable=False)
    description=Column(Text,nullable=False); created_at=Column(DateTime,nullable=False)
    explanation=Column(Text,nullable=False); action=Column(String,nullable=False); resolved=Column(Boolean,default=False)
