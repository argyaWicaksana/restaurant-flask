import os
import json
from os.path import join, dirname
from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    redirect,
    url_for
)
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

app = Flask(__name__)

dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)
MONGODB_URI = os.environ.get("MONGODB_URI")
DB_NAME =  os.environ.get("DB_NAME")
ACCESS_TOKEN = os.environ.get("ACCESS_TOKEN")

client = MongoClient(MONGODB_URI, tlsCAFile=certifi.where())
db = client[DB_NAME]

@app.route('/')
def main():
    return render_template("index.html", token=ACCESS_TOKEN)

@app.route('/restaurants', methods=["GET"])
def get_restaurants():
    # This api endpoint should fetch a list of restaurants
    restaurants = list(db.restaurants.find({}, {'_id': False}))
    return jsonify({'result': 'success', 'restaurants': restaurants})

@app.route('/restaurants', methods=["POST"])
def add_restaurants():
    restaurant = request.get_json()
    db.restaurants.insert_one(restaurant)
    return jsonify({'msg': 'Add restaurant to list!'})

@app.route('/restaurants', methods=["DELETE"])
def del_restaurants():
    restaurant = request.form.get('name')
    db.restaurants.delete_one({'name': restaurant})
    return jsonify({'msg': 'Delete restaurant from list!'})

if __name__ == '__main__':
    app.run('0.0.0.0', port=5000, debug=True)