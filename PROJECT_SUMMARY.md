# UniMetric: Data Warehousing & Machine Learning Feedback Analytics Platform

> **Project Repository**: `UniMetric`  
> **Domain**: Data Warehousing & Data Mining (DWM) / Academic Analytics  
> **Architecture**: Decoupled Full-Stack (React 19 + Django REST Framework + Supabase PostgreSQL)  

---

## 1. Executive Summary

**UniMetric** is an institutional performance analytics and student feedback intelligence platform developed for Data Warehousing & Data Mining (DWM). Unlike conventional review portals that store flat comments in relational tables, UniMetric models feedback as a **Multidimensional Star Schema Data Warehouse**, allowing high-performance online analytical processing (OLAP), multi-attribute rollups, and drill-downs.

On top of the warehouse, an automated **Data Mining & Machine Learning Pipeline** extracts actionable institutional insights using:
- **Ridge Regression** to isolate key drivers of student satisfaction.
- **Gaussian Naive Bayes** to predict institutional recommendation likelihood.
- **K-Means & Agglomerative Clustering** to segment student cohorts and aggregate institutional attributes.
- **Apriori Association Rule Mining** to discover co-occurring campus pain points.

The interface is delivered via a modern **Soft Neo-Brutalism React** web application connected to a **Supabase PostgreSQL** cloud backend with real-time authentication and role-based access control.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19 + Vite)                      │
│                                                                        │
│  [Soft Neo-Brutalism UI]  [Recharts Data Visualizations]  [Role Context] │
│   - HomePage               - Horizontal Bar Charts        - Prospect   │
│   - CollegeDashboard       - Sentiment Donut / Gauges     - Student    │
│   - ComparePage (Gated)    - Association Rule Chips       - Admin      │
│   - SubmitFeedback (1-per) - Driver Impact Weights                     │
└───────────────────┬────────────────────────────────────┬───────────────┘
                    │ REST API (Axios)                   │ Auth Sessions
                    ▼                                    ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│  DJANGO REST FRAMEWORK BACKEND       │  │   SUPABASE AUTH & POSTGRES   │
│                                      │  │                              │
│  /api/colleges/                      │  │  - User Metadata & Tokens    │
│  /api/colleges/<id>/summary/         │  │  - Session Hydration         │
│  /api/colleges/compare/?ids=1,2      │  │  - SSL Required Pooler       │
│  /api/reviews/                       │  │    (aws-0-ap-northeast-2)    │
│  /api/analytics/college/<id>/insights│  └──────────────▲───────────────┘
│  /api/analytics/overview/            │                 │
│  /api/analytics/refresh/             │                 │
└───────────────────┬──────────────────┘                 │
                    │ Query / Cache                      │
                    ▼                                    │
┌────────────────────────────────────────────────────────┴───────────────┐
│                    POSTGRESQL STAR SCHEMA DATA WAREHOUSE               │
│                                                                        │
│  DIMENSIONS:                        FACT TABLE:                        │
│   • College (Name, Location, Type)   • FeedbackFact                    │
│   • Program (Major, Degree)             - Measure: score (1-5)         │
│   • StudentProfile (Year, Domicile)     - Degenerate: submission_id    │
│   • DateDim (Year, Quarter, Month)      - would_recommend, sentiment   │
│   • FeedbackCategory (Teaching, etc)    - text feedback & suggestions  │
│                                                                        │
│  ANALYTICS CACHE TABLES:                                               │
│   • CollegeInsightCache (Ridge, Naive Bayes, K-Means, Apriori)         │
│   • GlobalInsightCache (Cross-College Agglomerations & Rules)          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```
UniMetric/
├── .env                              # Active frontend environment variables
├── .env.example                      # Frontend environment template
├── changes_summary.md                # Detailed changelog of recent updates
├── index.html                        # Application HTML entry point
├── package.json                      # React 19, Vite, Tailwind CSS v4, Recharts, Supabase JS
├── tailwind.config.js                # Tailwind CSS custom design tokens
├── vite.config.js                    # Vite bundler configuration
│
├── backend/                          # Django Backend Application
│   ├── manage.py                     # Django management script
│   ├── requirements.txt              # Python dependencies (Django, DRF, scikit-learn, mlxtend)
│   ├── .env                          # Backend database credentials & pooler URIs
│   ├── .env.example                  # Backend environment template
│   │
│   ├── backend/                      # Django Core Settings
│   │   ├── settings.py               # Dynamic DB config (Supabase session pooler, SSL)
│   │   ├── urls.py                   # Master route configuration (/api/ & /api/analytics/)
│   │   └── wsgi.py / asgi.py
│   │
│   ├── api/                          # OLAP Star Schema & Core API Application
│   │   ├── models.py                 # Star Schema models (College, Program, Student, Date, Fact)
│   │   ├── serializers.py            # DRF serializers for summaries, reviews, and validation
│   │   ├── views.py                  # Core endpoints (list, summary, compare, reviews)
│   │   ├── urls.py                   # /api/ routing table
│   │   └── management/commands/
│   │       └── seed_mock_data.py     # Seeds colleges, programs, categories, and 50 feedback facts
│   │
│   └── analytics/                    # Machine Learning & Data Mining Application
│       ├── models.py                 # CollegeInsightCache and GlobalInsightCache tables
│       ├── serializers.py            # Serializers for ML insight delivery
│       ├── views.py                  # Endpoints: college insights, global overview, refresh
│       ├── urls.py                   # /api/analytics/ routing table
│       ├── ml_services/              # Core scikit-learn & mlxtend algorithms
│       │   ├── regression_service.py # Ridge Regression (Key Drivers)
│       │   ├── classification_service.py # Gaussian Naive Bayes (Recommend probability)
│       │   ├── clustering_service.py # K-Means (Student cohorts) & Agglomerative clustering
│       │   ├── association_service.py# Apriori Association Rule Mining
│       │   ├── data_loader.py        # Converts Star Schema rows into wide analytical DataFrames
│       │   └── model_registry.py     # Model persistence utilities
│       └── management/commands/
│           └── run_analytics_pipeline.py # Management command to execute training and cache results
│
└── src/                              # React Frontend Source Code
    ├── main.jsx                      # App root render & router provider
    ├── router.jsx                    # React Router v7 routes & layout wrapping
    ├── index.css                     # Soft Neo-Brutalism theme CSS variables and resets
    ├── App.css                       # Layout helper styles
    │
    ├── layouts/
    │   └── MainLayout.jsx            # Shell: dark rounded sidebar, top navbar, scrollable paper
    │
    ├── context/
    │   └── RoleContext.jsx           # Supabase session watcher & RBAC (Prospect, Student, Admin)
    │
    ├── lib/
    │   └── supabaseClient.js         # Supabase client factory with credential fallback detection
    │
    ├── services/
    │   └── mockDataService.js        # Centralized Axios API client wrapping Django endpoints
    │
    ├── pages/
    │   ├── HomePage.jsx              # Landing page: platform KPIs, search filter, college card grid
    │   ├── CollegeDashboardPage.jsx  # Detailed college analytics, charts, and ML insights
    │   ├── ComparePage.jsx           # Interactive side-by-side college comparison (gated)
    │   ├── SubmitFeedbackPage.jsx    # Student review submission form (1 review limit per student)
    │   ├── AdminDashboardPage.jsx    # Administrative oversight, platform stats, and audit logs
    │   └── AuthPage.jsx              # Supabase Sign In and Sign Up with role metadata selection
    │
    ├── components/
    │   ├── common/                   # Navbar, Sidebar, Footer, CollegeCard, RatingBadge, SearchBar
    │   ├── dashboard/                # CategoryPerformanceChart, InfrastructureBreakdownChart,
    │   │                             # OverallRatingStat, SentimentPieChart, FeedbackLists
    │   ├── compare/                  # CollegeSelector (instant selection), ComparisonBarChart,
    │   │                             # ComparisonTable
    │   ├── feedback/                 # FeedbackForm, RatingInput, SubmitConfirmation
    │   └── insights/                 # DataDrivenInsightsSection, KeyDriversChart,
    │                                 # SegmentBadgeList, AssociationRuleChips,
    │                                 # PredictiveRecommendGauge
    ├── mock/                         # Static JSON fallbacks (colleges.json, reviews.json)
    └── utils/                        # Frontend data transformations & sentiment aggregators
```

---

## 4. Star Schema Data Warehouse Model

UniMetric decomposes student submissions into an **OLAP Star Schema** with discrete dimensions and a central fact table:

### Dimensional Tables

| Dimension | Table Name | Key Attributes | Description |
|---|---|---|---|
| **College** | `api_college` | `id`, `name`, `location`, `college_type` | Academic institution entity |
| **Program** | `api_program` | `id`, `college_id`, `program_name`, `degree_type`, `subject_area` | Department and degree offering |
| **Student Profile**| `api_studentprofile` | `id`, `user_id`, `year_of_study`, `age_group`, `gender`, `state_of_domicile`| Demographics and cohort data |
| **Date** | `api_datedim` | `id`, `full_date`, `year`, `quarter`, `month`, `academic_year` | Time dimension for quarterly rollups |
| **Feedback Category**| `api_feedbackcategory` | `id`, `category_name`, `category_group` | Evaluation metrics (Teaching, Labs, Wi-Fi, etc.) |

### Central Fact Table (`FeedbackFact` / `api_feedbackfact`)

- **Foreign Keys**: `college_id`, `program_id`, `student_profile_id`, `date_id`, `category_id`.
- **Numerical Measure**: `score` (integer 1 through 5).
- **Degenerate Dimension**: `submission_id` (UUID tying together the 5 rating records generated in a single submission).
- **Metadata**: `user_id`, `would_recommend` (boolean), `sentiment` (Positive/Neutral/Negative), `positive_feedback`, `complaints`, `suggestions`, `created_at`.

---

## 5. Machine Learning & Data Mining Pipelines

Rather than running expensive model training synchronously during HTTP requests, UniMetric uses an **analytical cache model** (`CollegeInsightCache` and `GlobalInsightCache`). The pipeline is trained via `python manage.py run_analytics_pipeline` or triggered via `POST /api/analytics/refresh/`.

```
                       STAR SCHEMA DATA
                              │
                    [data_loader.py]
               (Pivots facts into wide matrix)
                              │
      ┌───────────────────────┼───────────────────────┐
      ▼                       ▼                       ▼
[Ridge Regression]    [Gaussian Naive Bayes]     [K-Means & Agglomerative]
- Standardized coefs  - Feature probability      - 3 Student Segments:
- Key Drivers Rank    - Recommendation Score       • Highly Satisfied
                      - Held-out Accuracy          • Infrastructure-Critical
                                                   • Academically Challenged
                              │
                              ▼
                  [Apriori Rule Mining]
                  - mlxtend frequent itemsets
                  - Identifies co-occurring low scores
                    (e.g., Low Teaching + Low Labs → No Recommend)
                              │
                              ▼
            PERSISTED TO COLLEGE & GLOBAL CACHE
```

1. **Ridge Regression ([`regression_service.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/ml_services/regression_service.py))**:
   - Computes standardized coefficients between sub-category scores and the overall institutional rating.
   - Generates the ranked **Key Drivers** list informing administrators where capital investments will have the highest marginal return.
2. **Gaussian Naive Bayes ([`classification_service.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/ml_services/classification_service.py))**:
   - Computes posterior probability of `would_recommend == True` given rating patterns and one-hot encoded sentiments.
   - Evaluates test-set accuracy on held-out samples.
3. **K-Means Clustering ([`clustering_service.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/ml_services/clustering_service.py))**:
   - Groups student reviews into $k=3$ interpretable clusters:
     - **Highly Satisfied**: High scores across both academics and infrastructure.
     - **Infrastructure-Critical**: Acceptable academics, but heavily dissatisfied with Wi-Fi, hostels, or laboratories.
     - **Academically Challenged**: Discontent with curriculum pace and teaching quality.
4. **Apriori Association Rule Mining ([`association_service.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/ml_services/association_service.py))**:
   - Binarizes ratings where `score <= 2` as `Low_<Category>`.
   - Uses `mlxtend` to identify association rules filtered by minimum confidence and sorted by lift.

---

## 6. Authentication & Role-Based Access Control

Authentication is powered by **Supabase Auth** with full session persistence across page refreshes.

| Role | Access Permissions |
|---|---|
| **Prospect** (Guest) | • Browse college listings & search<br>• View college scorecards & review text<br>• View platform KPIs on Home Page |
| **Student** (Verified Enrolled) | • All Prospect permissions<br>• Access to **Compare Page** (Side-by-side analysis)<br>• Access to **Submit Feedback Form** (Restricted to 1 submission per verified user) |
| **Admin** | • All Student permissions<br>• Access to **Admin Dashboard** (`/admin`)<br>• Real-time system activity and submission logs<br>• Algorithmic College Rankings and ML Telemetry |

---

## 7. API Reference

### Core API (`/api/`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/colleges/` | Returns list of colleges with annotated aggregates (`unique_reviews`, `avg_score`, `recommend_pct`) and search query support (`?search=`). |
| `GET` | `/api/colleges/<id>/summary/` | Detailed institutional scorecard including category averages, sentiment counts, and sample feedback. |
| `GET` | `/api/colleges/compare/?ids=1,2` | Side-by-side summary payload for two or more institutions. |
| `GET` | `/api/colleges/<id>/reviews/` | Reconstructed individual review cards from `FeedbackFact` records. |
| `GET` | `/api/programs/` | Academic program offerings (filterable by `?college_id=`). |
| `GET` | `/api/reviews/?user_id=<uid>` | Queries if a student user has already submitted a review. |
| `POST` | `/api/reviews/` | Creates student profile record and writes 5 `FeedbackFact` rows (one per category). |

### Analytics API (`/api/analytics/`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/college/<id>/insights/` | Fetches precomputed Ridge weights, Naive Bayes recommend probability, K-Means clusters, and Apriori rules. |
| `GET` | `/api/analytics/overview/` | Fetches cross-institutional category clusters and global association rules. |
| `POST` | `/api/analytics/refresh/` | Executes `run_analytics_pipeline` on demand to update cache tables. |

---

## 8. Frontend Design System

UniMetric uses a tailored **Soft Neo-Brutalism** aesthetic:
- **Palette**:
  - **Charcoal**: `#191919` (High-contrast text, borders, dark sidebar)
  - **Cream**: `#F4F2EC` (App canvas background)
  - **Paper**: `#FFFFFF` (Card and panel backgrounds)
  - **Yellow**: `#F5C451` (Warning badges & highlight KPI cards)
  - **Coral**: `#F4633E` (Primary call-to-action buttons & negative sentiment indicators)
  - **Purple**: `#C7B7F2` (Autonomous / specialized institution badges)
  - **Blue**: `#AEE1F5` (Government institution badges)
- **Geometry**: High border-radius components (`rounded-3xl`, `rounded-4xl`), soft contrast drop shadows (`shadow-soft`), crisp borders (`border-brand-charcoal/10`).
- **Interactive Safeguards**:
  - `CollegeSelector.jsx` utilizes `onMouseDown` with event prevention and keyboard `Enter` handlers to prevent blur-event race conditions during dropdown selection.

---

## 9. Setup & Execution Instructions

### Backend (Django + Supabase)

1. **Activate Virtual Environment**:
   ```bash
   cd backend
   ..\venv\Scripts\activate   # Windows
   ```
2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure Environment Variables** (`backend/.env`):
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require"
   SECRET_KEY="your-secret-key"
   DEBUG=True
   ```
4. **Run Migrations & Seed Data**:
   ```bash
   python manage.py migrate
   python manage.py seed_mock_data
   python manage.py run_analytics_pipeline
   ```
5. **Start Development Server**:
   ```bash
   python manage.py runserver 8000
   ```

### Frontend (React + Vite)

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Configure Environment Variables** (`.env`):
   ```env
   VITE_API_BASE_URL="http://localhost:8000/api"
   VITE_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   ```
3. **Start Development Server**:
   ```bash
   npm run dev
   ```
4. **Access Application**:
   Navigate to `http://localhost:5173`.
