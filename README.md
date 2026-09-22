# 🏙️ NYC Airbnb Room Type Predictor

[![Live Backend](https://img.shields.io/badge/Live%20Backend-Render-brightgreen?style=for-the-badge&logo=render)](https://house-availability-preditions-2347.onrender.com/)
[![Interactive Docs](https://img.shields.io/badge/FastAPI-Swagger%20Docs-009688?style=for-the-badge&logo=fastapi)](https://house-availability-preditions-2347.onrender.com/docs)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/masumganvir/House-availability-preditions)
[![Author](https://img.shields.io/badge/Author-Masum%20Ganvir-orange?style=for-the-badge)](https://github.com/masumganvir)
[![Python](https://img.shields.io/badge/Python-3.12%2B-blue?style=for-the-badge&logo=python)](https://www.python.org/)
[![Scikit-Learn](https://img.shields.io/badge/scikit--learn-F89939?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)

An end-to-end Machine Learning web application and REST API that predicts the room type of New York City Airbnb accommodations (**Entire home/apt**, **Private room**, or **Shared room**) from listing metadata such as geospatial coordinates, pricing, minimum stay rules, review velocities, and host metrics.

---

## 🌟 Live Links

| Resource | URL |
| :--- | :--- |
| 🚀 **Live Production Backend** | [https://house-availability-preditions-2347.onrender.com/](https://house-availability-preditions-2347.onrender.com/) |
| 📖 **Interactive Swagger API Docs** | [https://house-availability-preditions-2347.onrender.com/docs](https://house-availability-preditions-2347.onrender.com/docs) |
| 📚 **ReDoc Documentation** | [https://house-availability-preditions-2347.onrender.com/redoc](https://house-availability-preditions-2347.onrender.com/redoc) |
| 🩺 **Backend Health Endpoint** | [https://house-availability-preditions-2347.onrender.com/health](https://house-availability-preditions-2347.onrender.com/health) |
| 🔮 **Predict Endpoint (POST)** | [https://house-availability-preditions-2347.onrender.com/predict](https://house-availability-preditions-2347.onrender.com/predict) |
| 💻 **GitHub Repository** | [https://github.com/masumganvir/House-availability-preditions](https://github.com/masumganvir/House-availability-preditions) |

---

## 📌 Highlights

- **Production-Ready FastAPI Server**: Validated request handling via Pydantic schemas, comprehensive error reporting, and CORS-enabled endpoints.
- **Tuned Random Forest Pipeline**: Encapsulates imputation, standard scaling, one-hot encoding, and ensemble decision trees inside a unified serialized pipeline (`Model_Pipeline.pkl`).
- **Interactive Cyber-Skyline UI**: Custom dark-mode web application featuring real-time canvas particles, dynamic 3D building visualizers, probability charts, and one-click presets.
- **Real-Time API Health Monitor**: Automatic backend connection detection with retry tolerance for sleeping instances on Render.

---

## 🧠 Machine Learning Architecture

### 1. Dataset
Trained on the **New York City Airbnb Open Data** (48,895+ real-world listings) covering all five NYC boroughs: Manhattan, Brooklyn, Queens, Bronx, and Staten Island.

### 2. Feature Schema

| Feature | Type | Description |
| :--- | :--- | :--- |
| `latitude` | `float` | Geospatial latitude coordinate (-90 to +90) |
| `longitude` | `float` | Geospatial longitude coordinate (-180 to +180) |
| `price` | `float` | Price per night in USD (> 0) |
| `minimum_nights` | `int` | Minimum nights required for reservation (1–365) |
| `number_of_reviews` | `int` | Historical count of reviews received (>= 0) |
| `reviews_per_month` | `float` | Average reviews recorded per month (>= 0) |
| `calculated_host_listings_count` | `int` | Total count of properties operated by host |
| `availability_365` | `int` | Available days per calendar year (0–365) |
| `neighbourhood_group` | `str` | Borough name (`Manhattan`, `Brooklyn`, `Queens`, `Bronx`, `Staten Island`) |
| `neighbourhood` | `str` | Specific neighborhood name (e.g. `Midtown`, `Williamsburg`, `Flushing`) |

### 3. Pipeline Stages
- **Numerical Pipeline**: Missing value imputation via `SimpleImputer(strategy='mean')` followed by `StandardScaler()`.
- **Categorical Pipeline**: Missing value imputation via `SimpleImputer(strategy='mean')` followed by `OneHotEncoder(handle_unknown='ignore')`.
- **Estimator**: `RandomForestClassifier` with balanced hyperparameter tuning.

---

## 📂 Repository Structure

```text
House-availability-preditions/
├── .gitignore                                 # Git ignore configuration
├── Model_Pipeline.pkl                         # Serialized scikit-learn ML pipeline
├── favicon.svg                                # Custom vector favicon
├── index.html                                 # Web frontend application
├── main.py                                    # FastAPI server & prediction routes
├── nyc_airbnb_room_type_classification.ipynb  # Exploratory Data Analysis & Model Training
├── requirements.txt                           # Production Python dependencies
├── runtime.txt                                # Python runtime version specifier (3.12.3)
├── script.js                                  # Frontend client logic & API connection
├── style.css                                  # Custom aesthetic stylesheet
├── the_build_line_guide.html                  # Interactive architecture & pipeline guide
└── README.md                                  # Project documentation
```

---

## 🔌 API Reference & Usage

### 1. Health Check

```bash
curl -X GET "https://house-availability-preditions-2347.onrender.com/health"
```

**Response:**
```json
{
  "status": "ok",
  "model": "Random Forest Pipeline"
}
```

---

### 2. Predict Room Type

**Endpoint:** `POST https://house-availability-preditions-2347.onrender.com/predict`  
**Headers:** `Content-Type: application/json`

**Sample Request:**
```bash
curl -X POST "https://house-availability-preditions-2347.onrender.com/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.7484,
    "longitude": -73.9857,
    "price": 120.0,
    "minimum_nights": 2,
    "number_of_reviews": 84,
    "reviews_per_month": 2.3,
    "calculated_host_listings_count": 1,
    "availability_365": 210,
    "neighbourhood_group": "Manhattan",
    "neighbourhood": "Midtown"
  }'
```

**Sample Response:**
```json
{
  "Predicted_room_type": "Entire home/apt",
  "Probability": [
    0.6268835978835977,
    0.34529866812625426,
    0.027817733990147784
  ],
  "Probabilities": {
    "Entire home/apt": 0.626884,
    "Private room": 0.345299,
    "Shared room": 0.027818
  },
  "confidence": 62.69
}
```

---

## 💻 Local Setup & Development

Follow these steps to run the application locally on your machine:

### 1. Clone the repository
```bash
git clone https://github.com/masumganvir/House-availability-preditions.git
cd House-availability-preditions
```

### 2. Create and activate a virtual environment
```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the development server
```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 5. Access the application
- Open your browser to: `http://127.0.0.1:8000/` or `http://localhost:8000/`
- Interactive Swagger docs: `http://127.0.0.1:8000/docs`

---

## 🚀 Deployment on Render

This project is configured for one-click deployment on Render as a Web Service:

- **Environment**: Python
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`

---

## 👤 Author

Developed by **Masum Ganvir**  
- **GitHub**: [@masumganvir](https://github.com/masumganvir)  
- **Project Repo**: [House-availability-preditions](https://github.com/masumganvir/House-availability-preditions)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
