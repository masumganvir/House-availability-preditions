from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse
import pandas as pd
from pydantic import BaseModel, Field
import joblib
from fastapi.middleware.cors import CORSMiddleware
import numpy as np


app = FastAPI(
    title="NYC Airbnb Room Type Predictor",
    description="Predict Airbnb room type (Entire home, Private room, Shared room) from listing features.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


COLUMNS = [
    "latitude", "longitude", "price", "minimum_nights",
    "number_of_reviews", "reviews_per_month",
    "calculated_host_listings_count", "availability_365",
    "neighbourhood_group", "neighbourhood",
]

# scikit-learn sorts classes alphabetically
CLASS_ORDER = ["Entire home/apt", "Private room", "Shared room"]

model = joblib.load("Model_Pipeline.pkl")  # Load the pre-trained model pipeline


# Pydantic Model = the input validation
class Features(BaseModel):
    latitude:                       float = Field(..., ge=-90,  le=90,  description="Latitude coordinate")
    longitude:                      float = Field(..., ge=-180, le=180, description="Longitude coordinate")
    price:                          float = Field(..., gt=0,             description="Price per night, must be positive")
    minimum_nights:                 int   = Field(..., ge=1,   le=365,  description="Minimum nights required for booking")
    number_of_reviews:              int   = Field(..., ge=0,             description="Total number of reviews")
    reviews_per_month:              float = Field(..., ge=0,             description="Average reviews per month")
    calculated_host_listings_count: int   = Field(..., ge=0,             description="Number of listings by this host")
    availability_365:               int   = Field(..., ge=0,   le=365,  description="Days available out of 365")
    neighbourhood_group:            str   = Field(..., min_length=1,     description="Borough or neighbourhood group")
    neighbourhood:                  str   = Field(..., min_length=1,     description="Specific neighbourhood name")


@app.get('/')
def greet(request: Request):
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        return FileResponse("index.html")
    return {"message": "NYC Airbnb Room Type Predictor API", "docs": "/docs", "ui": "/ui"}


@app.get('/ui')
@app.get('/index.html')
def serve_ui():
    return FileResponse("index.html")


@app.get('/style.css')
def serve_css():
    return FileResponse("style.css", media_type="text/css")


@app.get('/script.js')
def serve_js():
    return FileResponse("script.js", media_type="application/javascript")


@app.get('/guide')
def serve_guide():
    return FileResponse("the_build_line_guide.html")


@app.get('/favicon.svg')
@app.get('/favicon.ico')
def serve_favicon():
    return FileResponse("favicon.svg", media_type="image/svg+xml")


@app.get('/health')
def health():
    return {"status": "ok", "model": "Random Forest Pipeline"}


@app.post('/predict')
def predict(features: Features):
    feat_data = features.model_dump() if hasattr(features, "model_dump") else features.dict()
    row = pd.DataFrame([feat_data], columns=COLUMNS)

    prediction  = model.predict(row)
    probability = model.predict_proba(row)

    probs_list = probability.tolist()[0]

    # Build a labelled probability dict for convenience
    prob_dict = {cls: round(float(p), 6) for cls, p in zip(CLASS_ORDER, probs_list)}

    return {
        "Predicted_room_type": str(prediction[0]),
        "Probability": probs_list,           # raw list (frontend uses class order)
        "Probabilities": prob_dict,          # labelled dict (for debugging / API consumers)
        "confidence": round(float(max(probs_list)) * 100, 2),
    }