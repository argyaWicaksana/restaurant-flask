import requests
import os
from math import radians, cos, sin, asin, sqrt
from os.path import join, dirname
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)
ACCESS_TOKEN = os.environ.get("ACCESS_TOKEN")
url='https://api.spacexdata.com/v4/launches'

response = requests.get(url).json()

# get latest 20 data
data = response[-20:]
# reverse the order
data = data[::-1]

def distance(lat1, lat2, lon1, lon2):
     
    lon1 = radians(lon1)
    lon2 = radians(lon2)
    lat1 = radians(lat1)
    lat2 = radians(lat2)
      
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
 
    c = 2 * asin(sqrt(a))
    
    r = 6371
      
    return(c * r)

for d in data:
    launchpad = d['launchpad']
    date = d['date_utc']
    url = f'https://api.spacexdata.com/v4/launchpads/{launchpad}'

    response = requests.get(url).json()
    loc = response['full_name']
    long = response['longitude']
    lat = response['latitude']
    
    url = f'https://api.mapbox.com/geocoding/v5/mapbox.places/{loc}.json?proximity={long},{lat}&access_token={ACCESS_TOKEN}'
    response = requests.get(url).json()
    geocoding = response['features'][0]['center']
    geo_long = geocoding[0]
    geo_lat = geocoding[1]

    dist = distance(lat, geo_lat, long, geo_long)
    print(f'{date} | {loc} | {dist}')
