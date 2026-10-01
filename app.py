import os
import requests
from flask import Flask, jsonify, render_template

app = Flask(__name__)

BLYNK_SERVER = os.getenv("BLYNK_SERVER", "blr1.blynk.cloud").strip()
BLYNK_AUTH_TOKEN = os.getenv("BLYNK_AUTH_TOKEN", "").strip()

PINS = {
    "temperature": "V0",
    "humidity": "V1",
    "light": "V2",
    "motion": "V3",
    "door": "V4",
    "power": "V8",
    "energy": "V9",
}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/data")
def data():
    if not BLYNK_AUTH_TOKEN:
        return jsonify({"error": "BLYNK_AUTH_TOKEN is not configured"}), 503

    result = {}
    url = f"https://{BLYNK_SERVER}/external/api/get"
    for name, pin in PINS.items():
        try:
            response = requests.get(
                url,
                params={"token": BLYNK_AUTH_TOKEN, pin: ""},
                timeout=8,
            )
            response.raise_for_status()
            value = response.json()
            # Blynk may return a scalar or a one-item list, depending on endpoint response.
            if isinstance(value, list):
                value = value[0] if value else None
            result[name] = value
        except (requests.RequestException, ValueError):
            result[name] = None

    return jsonify(result)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))
