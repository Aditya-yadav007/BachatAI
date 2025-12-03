"""
predict_service.py

Flask service to serve transaction category predictions.

Expect the following artifact files in the same folder:
- tfidf.pkl
- scaler.pkl
- clf.pkl

Endpoints:
- GET  /health                -> simple readiness check
- GET  /version               -> model version (if available)
- POST /predict               -> single prediction: {"description": "...", "amount": 123.45}
- POST /predict/batch         -> batch prediction: {"items": [{"description":"...","amount":...}, ...]}

Run:
(activate your virtualenv that has flask, joblib, scikit-learn, scipy, numpy)
python predict_service.py
"""
import os
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from scipy.sparse import hstack
from datetime import datetime

ARTIFACT_TFIDF = "tfidf.pkl"
ARTIFACT_SCALER = "scaler.pkl"
ARTIFACT_CLF = "clf.pkl"
MODEL_VERSION_FILE = "model_version.txt"  # optional

app = Flask(__name__)
CORS(app)  # allow all origins for dev; lock down in production

# Load artifacts
tfidf = None
scaler = None
clf = None
MODEL_VERSION = None

def load_artifacts():
    global tfidf, scaler, clf, MODEL_VERSION
    base = os.path.dirname(os.path.abspath(__file__))
    tfidf_path = os.path.join(base, ARTIFACT_TFIDF)
    scaler_path = os.path.join(base, ARTIFACT_SCALER)
    clf_path = os.path.join(base, ARTIFACT_CLF)
    try:
        tfidf = joblib.load(tfidf_path)
        scaler = joblib.load(scaler_path)
        clf = joblib.load(clf_path)
    except Exception as e:
        app.logger.error("Failed to load artifacts: %s", e)
        app.logger.debug(traceback.format_exc())
        tfidf = scaler = clf = None

    version_path = os.path.join(base, MODEL_VERSION_FILE)
    if os.path.exists(version_path):
        try:
            with open(version_path, "r") as f:
                MODEL_VERSION = f.read().strip()
        except:
            MODEL_VERSION = None

load_artifacts()

def artifacts_ready():
    return tfidf is not None and scaler is not None and clf is not None

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "artifacts_ready": artifacts_ready(),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

@app.route("/version", methods=["GET"])
def version():
    return jsonify({
        "model_version": MODEL_VERSION or "unknown",
        "artifacts_ready": artifacts_ready()
    })

def make_prediction_single(description: str, amount: float):
    """
    Return: dict { category:str, confidence:float, label_probs: {label:prob,...} }
    """
    if not artifacts_ready():
        raise RuntimeError("Model artifacts are not loaded on the server.")

    desc = "" if description is None else str(description)
    try:
        X_text = tfidf.transform([desc])
    except Exception as e:
        # If TF-IDF transform fails, encode empty vector fallback
        X_text = tfidf.transform([""])

    X_num = scaler.transform([[float(amount)]])  # scaler expects 2D
    X = hstack([X_text, X_num])
    probs = clf.predict_proba(X)[0]
    labels = clf.classes_.tolist()
    max_idx = int(np.argmax(probs))
    return {
        "category": labels[max_idx],
        "confidence": float(probs[max_idx]),
        "label_probs": { labels[i]: float(probs[i]) for i in range(len(labels)) }
    }

@app.route("/predict", methods=["POST"])
def predict():
    """
    Single prediction endpoint.
    Request JSON:
      { "description": "...", "amount": 123.45 }
    Response JSON:
      { "category": "...", "confidence": 0.87, "label_probs": {...} }
    """
    try:
        payload = request.get_json(force=True)
        if not payload:
            return jsonify({"error": "Empty request body"}), 400

        desc = payload.get("description", "")
        amount = payload.get("amount", 0.0)
        result = make_prediction_single(desc, amount)
        return jsonify(result)
    except Exception as e:
        app.logger.error("Predict error: %s", e)
        app.logger.debug(traceback.format_exc())
        return jsonify({"error": "internal_server_error", "details": str(e)}), 500

@app.route("/predict/batch", methods=["POST"])
def predict_batch():
    """
    Batch prediction endpoint.
    Request JSON:
      { "items": [ {"description":"...", "amount": 123}, {...} ] }
    Response JSON:
      { "results": [ {category, confidence, label_probs}, ... ] }
    """
    try:
        payload = request.get_json(force=True)
        items = payload.get("items") if payload else None
        if not items or not isinstance(items, list):
            return jsonify({"error": "Invalid input, expected {items: [{description,amount}, ...]}"}), 400

        results = []
        for it in items:
            desc = it.get("description", "")
            amount = it.get("amount", 0.0)
            res = make_prediction_single(desc, amount)
            results.append(res)
        return jsonify({"results": results})
    except Exception as e:
        app.logger.error("Predict batch error: %s", e)
        app.logger.debug(traceback.format_exc())
        return jsonify({"error": "internal_server_error", "details": str(e)}), 500

if __name__ == "__main__":
    # helpful log output on start
    if artifacts_ready():
        app.logger.info("Loaded model artifacts. Ready to serve predictions.")
    else:
        app.logger.warning("Model artifacts NOT loaded. Place tfidf.pkl, scaler.pkl, clf.pkl into the same folder.")

    port = int(os.environ.get("PREDICT_PORT", 9000))
    host = os.environ.get("PREDICT_HOST", "0.0.0.0")
    app.run(host=host, port=port)
