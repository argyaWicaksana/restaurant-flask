import os
from os.path import join, dirname
from dotenv import load_dotenv
from selenium import webdriver
from bs4 import BeautifulSoup
import time
from pymongo import MongoClient
import certifi
import requests

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)
MONGODB_URI = os.environ.get("MONGODB_URI")
DB_NAME =  os.environ.get("DB_NAME")
ACCESS_TOKEN = os.environ.get("ACCESS_TOKEN")

client = MongoClient(MONGODB_URI, tlsCAFile=certifi.where())
db = client[DB_NAME]

driver = webdriver.Chrome('./chromedriver')

url = "https://www.yelp.com/search?cflt=restaurants&amp;find_loc=San+Francisco%2C+CA"

driver.get(url)
time.sleep(5)
driver.execute_script('window.scrollTo(0, document.body.scrollHeight);')
time.sleep(5)

long = -122.420679
lat = 37.772537

start = 0
seen = {}
docs = []

for _ in range(5):
    req = driver.page_source
    
    soup = BeautifulSoup(req, 'html.parser')
    restaurants = soup.select('div[class*="arrange-unit__"]')


    for restaurant in restaurants:
        business_name = restaurant.select_one('div[class*="businessName__"]')
        if not business_name:
            continue

        name = business_name.text.split('.')[-1].strip()
        if name in seen:
            continue
        seen[name] = True

        categories_price_location = restaurant.select_one('div[class*="priceCategory__"]')
        spans = categories_price_location.select('span')
        categories = spans[0].text
        location = spans[-1].text
        geo_url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{location}.json?proximity={long},{lat}&access_token={ACCESS_TOKEN}"
        geo_response = requests.get(geo_url)
        geo_json = geo_response.json()
        center = geo_json['features'][0]['center']
        print(name, ',', categories, ',', location, ',', center)
        # doc = {
        #     'name': name,
        #     'categories': categories,
        #     'location': location,
        #     'coordinates': center,
        # }
        # docs.append(doc)
    
    start += 10
    driver.get(f'{url}&start={start}')
    time.sleep(5)


driver.quit()
# db.restaurants.insert_many(docs)
