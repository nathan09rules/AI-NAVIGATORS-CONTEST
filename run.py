import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

from flask import Flask , request , jsonify , render_template
from flask_cors import CORS
import json

import tensorflow as tf
import numpy as np
import pandas as pd
import ollama 

import requests
from bs4 import BeautifulSoup

model = tf.keras.models.load_model("static/DIS1_small.keras")

with open("static/data.json","r") as file:
    data = json.load(file)

symptoms = data["symptoms"]
symptoms = [np.nan if x=="nan" else x for x in symptoms]

disease = data["diseases"]

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return render_template('home.html')

@app.route('/predict' , methods = ['POST'])
def predict():
    data = request.get_json()
    inputed = data.get("inputed" , "")
    inputed[73] = 1
    inputed =  pd.DataFrame([inputed], columns=symptoms)


    result = model.predict(inputed)
    top_5 = (np.argsort(result)).tolist()[0][::-1][:5]

    reponse = []
    for i in top_5:
        reponse.append(disease[i])

    return jsonify({"result" : reponse})

@app.route('/symptoms')
def find_symptoms():
    return render_template('symptoms.html')

@app.route('/template')
def template():
    return render_template('template.html')

@app.route('/chatbot')
def chatbot():
    return render_template('chat.html')

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data["message"]
    
    # Call Ollama AI chatbot
    response = ollama.chat(model="doc", messages=[
        {"role": "user", "content": user_message}
    ])
    
    return jsonify({"response": response["message"]["content"]})

def get_disease_news():
    url = "https://www.who.int/news-room"  # Example source (change if needed)
    headers = {"User-Agent": "Mozilla/5.0"}
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.text, "html.parser")
    
    articles = soup.find_all("a", class_="link-container")[:5]  # Adjust for real website
    news_list = []
    
    for article in articles:
        title = article.get_text(strip=True)
        link = "https://www.who.int" + article["href"]
        news_list.append({"title": title, "link": link})
    
    return news_list

@app.route('/suma')
def suma():
    news = get_disease_news()
    return render_template("dt.html", news=news)

if __name__ == "__main__":
    app.run(debug = True)