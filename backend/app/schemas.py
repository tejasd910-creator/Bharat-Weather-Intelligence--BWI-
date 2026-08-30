from pydantic import BaseModel
from datetime import datetime

class ObservationIn(BaseModel):
    station:str; city:str; state:str; latitude:float; longitude:float
    temperature:float; humidity:float; rainfall:float; wind_speed:float; pressure:float
    source:str="api"; observed_at:datetime

class CitizenReportIn(BaseModel):
    name:str="Anonymous"; category:str; description:str; city:str
    latitude:float; longitude:float; severity:str="medium"

class SocialReportIn(BaseModel):
    platform:str="Public Social Feed"; author:str="@public_report"; text:str
    city:str; state:str; latitude:float; longitude:float; reported_at:datetime
