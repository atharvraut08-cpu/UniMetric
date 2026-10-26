# UniMetric 🎓📊
**Data Warehousing & Machine Learning Institutional Analytics Platform**

UniMetric is a data-driven College Discovery and Student Feedback Intelligence platform built to demonstrate advanced Data Warehousing and Data Mining (DWM) concepts. 

Traditional university review portals rely on flat database schemas, unweighted averages, and sparse data, leaving administrators and prospective students without actionable insights. UniMetric solves this by modeling student feedback as an **OLAP Multidimensional Star Schema**, feeding an automated, asynchronous Machine Learning pipeline that extracts key rating drivers, segments student cohorts, and predicts recommendation likelihood.

## 🚀 Key Features & ML Pipeline
*   **Multidimensional Star Schema:** Decomposes evaluations into an 11-category matrix (Teaching, Wi-Fi, Placements, etc.), natively handling sparse data (e.g., day scholars omitting hostel ratings).
*   **Role-Based Access Control (RBAC):** Secure routing for Prospects, Students, and Admins, featuring a strict 1-review-per-year anti-spam mechanism based on admission cohorts.
*   **Decision Tree & Naive Bayes (Classification):** Dual supervised models predicting institutional recommendation likelihood. Benchmarked on 23,309 records, the Decision Tree achieved **93.14% test accuracy** and extracted top attribute drivers via Information Gain (Positive Sentiment: 85.0%, Teaching Quality: 7.3%, Cleanliness: 3.2%).
*   **K-Means & Agglomerative Clustering (Unsupervised):** Segments student reviews into latent personas (Academically Challenged 49.9%, Highly Satisfied 40.1%, Infrastructure-Critical 10.0%) and groups category dimensions into institutional taxonomies using Ward's Linkage.
*   **Ridge Regression:** Identifies "Key Rating Drivers" by calculating L2-regularized standardized weights across the 11 evaluation categories.
*   **Apriori Algorithm:** Mines frequent itemsets to discover co-occurring institutional weaknesses (e.g., Low Cleanliness + Low Canteen -> Low Hostel).

## 🛠️ Technology Stack
*   **Frontend:** React 19, Vite, Tailwind CSS (Soft Neo-Brutalism design system), Recharts.
*   **Backend:** Django 5.x, Django REST Framework (DRF).
*   **Machine Learning:** scikit-learn, mlxtend, Pandas, NumPy.
*   **Database & Auth:** Supabase (PostgreSQL), GoTrue Auth.

---

## 💻 Local Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/atharvraut08-cpu/UniMetric.git
cd UniMetric
```

### 2. Backend Setup (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt

# Environment Setup
cp .env.example .env
# Open .env and fill in your local PostgreSQL or Supabase credentials

# Run Migrations & Seed Data
python manage.py migrate
python manage.py seed_mock_data
python manage.py run_analytics_pipeline

# Start the API Server
python manage.py runserver
```

### 3. Frontend Setup (React)
Open a new terminal window:

```bash
# From the root UniMetric directory
npm install

# Environment Setup
cp .env.example .env.local
# Open .env.local and add your Supabase URL and Anon Key

# Start the Development Server
npm run dev
```

Access the application at `http://localhost:5173`.

---

## 👥 Contributors
Developed as a B.Tech Information Technology project at Vidyalankar Institute of Technology (VIT), Mumbai.

*   **Team:** Shreyas Choudhary, Atharv Raut, Prem Ranmale
*   **Project Guide:** Prof. Shruti Agrawal
 