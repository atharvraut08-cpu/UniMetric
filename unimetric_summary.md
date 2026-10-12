# UniMetric: Authoritative Project Summary
## Data Warehousing & Data Mining (DWM) Institutional Analytics Platform

> **Document Version**: 3.0.0 — Unified Source of Truth  
> **System Status**: Production-Ready / Fully Integrated  
> **Target Domain**: Higher Education Analytics, Academic Quality Assurance, and Student Decision Support  
> **Core Paradigms**: Multidimensional Star Schema (OLAP), Data Mining, Dual Unsupervised Clustering (K-Means & Agglomerative Hierarchical), Dual Supervised Classification (Gaussian Naive Bayes & Decision Tree / ID3-CART), Association Rule Mining (Apriori), Key Driver Extraction (Ridge Regression), Soft Neo-Brutalism UI

---

## Table of Contents

1. [Executive Summary & Core Purpose](#1-executive-summary--core-purpose)
2. [System Architecture & Tech Stack](#2-system-architecture--tech-stack)
3. [Database Design & OLAP Star Schema](#3-database-design--olap-star-schema)
4. [Machine Learning & DWM Engine (The Analytics Pipeline)](#4-machine-learning--dwm-engine-the-analytics-pipeline)
5. [Role-Based Access Control (RBAC) & Navigation Logic](#5-role-based-access-control-rbac--navigation-logic)
6. [Core Features & Frontend Design System](#6-core-features--frontend-design-system)
7. [API Reference & Local Setup](#7-api-reference--local-setup)

---

## 1. Executive Summary & Core Purpose

### 1.1 The Institutional Evaluation Problem

Conventional higher education review systems (e.g., generic review aggregators, public forums) suffer from fundamental architectural and analytical limitations:

| Problem | Description |
|---|---|
| **Flat Relational Storage** | Feedback is stored as unstructured strings alongside simple scalar columns, preventing multidimensional aggregations across academic terms, cohorts, or demographic axes. |
| **Unweighted Averages & Metric Distortion** | Arithmetic means are reported uniformly without assessing which sub-dimensions (e.g., faculty competence vs. Wi-Fi availability) statistically dictate institutional satisfaction. |
| **Data Sparsity Breakdown** | Reviews that do not apply to all students (such as on-campus hostel ratings for day scholars) introduce `NULL` clutter, default biases, or schema fragmentation. |
| **Unverified Noise & Review Spam** | Arbitrary submissions without temporal controls, enrollment validation, or academic-year fences dilute data credibility. |

### 1.2 The UniMetric Solution

**UniMetric** is an enterprise-grade academic feedback intelligence platform architected specifically to demonstrate and operationalize core **Data Warehousing & Data Mining (DWM)** principles. Instead of storing flat reviews, UniMetric decomposes every student submission into an **OLAP Multidimensional Star Schema**, isolating granular evaluation criteria across discrete dimensions (`College`, `Program`, `FeedbackCategory`, `StudentProfile`, and `DateDim`).

Built upon this analytical warehouse, UniMetric executes an automated, asynchronous **Data Mining Pipeline**:

1. **Multidimensional OLAP Rollups & Slice/Dice**: Instantaneous slicing across departments, cohorts, and categories.
2. **Key Rating Drivers via Ridge Regression**: Isolate the statistical weight (β) of individual operational variables on overall institutional satisfaction using L₂-regularization.
3. **Dual Supervised Classification Engine**:
   - **Gaussian Naive Bayes**: Probabilistic recommendation likelihood scoring (P(Recommend | **x**)) and feature probability distributions.
   - **Decision Tree Classifier (Entropy / ID3-CART)**: Rule-based classification uncovering top decision rules and **Attribute Relevance** (ranking the top 3 most influential split features by Information Gain).
4. **Dual Unsupervised Clustering Engine**:
   - **Cohort Segmentation via K-Means Clustering (k=3)**: Uncover latent student personas (*Highly Satisfied*, *Infrastructure-Critical*, *Academically Challenged*) using multidimensional satisfaction centroids.
   - **Hierarchical Taxonomy via Agglomerative Clustering (Ward's Linkage)**: Transpose evaluation matrices to group feedback categories into overarching institutional factor themes (*Academic Pedagogy & Curriculum*, *Infrastructure & Campus Living*, *Career Pathways & Campus Culture*).
5. **Systemic Bottleneck Discovery via Apriori Association Rule Mining**: Mine frequent negative itemsets to surface co-occurring campus pain points (e.g., Low Wi-Fi ∧ Low Labs ⇒ No Recommend).

The platform bridges enterprise data science with consumer-grade software engineering, wrapping complex machine learning models inside an accessible, tactile **Soft Neo-Brutalism** user interface.

---

## 2. System Architecture & Tech Stack

UniMetric employs a clean, decoupled three-tier architecture comprising a reactive client, a stateless Python API layer, and a cloud-hosted relational OLAP data warehouse.

### 2.1 Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER (CLIENT)                      │
│                                                                        │
│   React 19 + Vite 8 + Tailwind CSS v4 + Recharts                      │
│   Design Language: "Soft Neo-Brutalism"                                │
│   • Charcoal (#191919), Cream (#F4F2EC), Paper (#FFFFFF)               │
│   • Coral (#F4633E), Yellow (#F5C451), Purple (#C7B7F2), Blue (#AEE1F5)│
│   • Rounded-3xl geometry, tactile borders, high-contrast badges        │
│   • Role Context: Prospect, Student, Admin                             │
│   • 5-Widget Data-Driven Insights Section                              │
└───────────────────┬────────────────────────────────────┬───────────────┘
                    │ HTTPS REST (Axios)                 │ JWT Sessions
                    ▼                                    ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│       APPLICATION TIER (API)         │  │    DATA & IDENTITY TIER      │
│                                      │  │                              │
│   Django 5.x + REST Framework        │  │   Supabase Cloud Platform    │
│   Stateless API Architecture         │  │   • GoTrue Auth (JWT Engine) │
│   • Dynamic dj-database-url config   │  │   • Managed PostgreSQL 15+   │
│   • SSL Connection Pooler (600s TTL) │  │   • Session Pooler (port 5432│
│   • OLAP Rollup Serialization        │  │     aws-0-ap-northeast-2)    │
│   • ML Analytics Worker Pipeline     │  │   • User Metadata Storage    │
│     (Ridge, GNB, DT, KMeans, Agglom, │  │                              │
│      Apriori)                        │  │                              │
└───────────────────┬──────────────────┘  └──────────────▲───────────────┘
                    │                                    │
                    │ Managed ORM Connection             │
                    ▼                                    │
┌────────────────────────────────────────────────────────┴───────────────┐
│                    OLAP STAR SCHEMA WAREHOUSE                          │
│                                                                        │
│  FACT TABLE: api_feedbackfact (Granular Category Measure: score 1-5)   │
│  DIMENSION TABLES:                                                     │
│    api_college           api_program          api_feedbackcategory     │
│    api_studentprofile    api_datedim                                   │
│                                                                        │
│  ANALYTICAL CACHE (OLAP Data Marts):                                   │
│    analytics_collegeinsightcache     analytics_globalinsightcache      │
│    • Key Drivers (Ridge β)           • Dual Classifier Accuracies      │
│    • K-Means Cohorts (k=3)           • Decision Tree Top Features      │
│    • Agglomerative Hierarchical Splits• Apriori Association Rules      │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack Specifications

| Layer | Component | Version / Specification | Rationale & Responsibility |
|---|---|---|---|
| **Frontend Runtime** | React | 19.x | Declarative UI component tree, fast re-renders, hook-driven architecture. |
| **Build Tool** | Vite | 8.x | Near-instant HMR, ES module bundling, optimized production builds. |
| **Styling Engine** | Tailwind CSS | v4 with CSS Variables | Curated design token system enforcing the "Soft Neo-Brutalism" visual system. |
| **Data Visualization** | Recharts | 3.x | High-performance SVG-based rendering of horizontal bar charts, radars, and donuts. |
| **Client Routing** | React Router | v7.x | SPA routing with layout wrapping and RBAC route gating. |
| **Icon Library** | lucide-react | 1.46+ | Lightweight, consistent SVG icon components across all pages. |
| **Auth Client** | @supabase/supabase-js | 2.x | Client-side Supabase session management and GoTrue JWT authentication. |
| **HTTP Client** | Axios | 1.x | Promise-based REST API communication with Django backend. |
| **Backend Framework** | Django | 5.x | Robust ORM, declarative migrations, administrative ecosystem. |
| **API Architecture** | Django REST Framework | 3.15+ | Stateless JSON REST endpoints, custom model serializers, and query validation. |
| **CORS** | django-cors-headers | 4.x | Cross-origin request support for decoupled frontend/backend. |
| **Database Adapter** | psycopg2-binary | 2.9+ | PostgreSQL binary driver for Django ORM connections. |
| **DB URL Config** | dj-database-url | 2.1+ | Dynamic `DATABASE_URL` parsing from environment variables with SSL support. |
| **Data Mining & ML** | scikit-learn | 1.3+ | Ridge Regression, Gaussian Naive Bayes, DecisionTreeClassifier, KMeans, AgglomerativeClustering. |
| **Association Mining** | mlxtend | 0.23+ | Apriori Algorithm for frequent itemset generation and association rule extraction. |
| **Data Manipulation** | Pandas & NumPy | 2.x / 1.24+ | Fast vectorization, pivoting long facts into wide analytical matrices. |
| **Model Persistence** | joblib | 1.3+ | Serialization of trained scikit-learn model objects to disk. |
| **Database & Auth** | Supabase (PostgreSQL) | PostgreSQL 15+ | Cloud OLAP warehouse, JWT issue/validation, connection pooling via Supavisor. |

### 2.3 Client-Backend Decoupling & Identity Mirroring

1. **Stateless Backend**: The Django API holds no sticky user sessions. All authentication occurs via Supabase Auth.
2. **Metadata Mirroring**: When a user registers through `supabase.auth.signUp()`, identity credentials (email, hashed password) are secured inside Supabase's encrypted `auth.users` table. Application-specific metadata (`full_name`, `role`, `college_id`, `program_id`, `admission_date`, `gender`, `age_group`, `state_of_domicile`) is encoded into the user's JWT metadata payload.
3. **Transparent Hydration**: The frontend `RoleContext.jsx` subscribes to `supabase.auth.onAuthStateChange()`, instantly hydrating user roles across application restarts while Django mirrors profile details in `StudentProfile` for analytical slicing.

### 2.4 Detailed Directory Structure

```
UniMetric/
├── .env                              # Active frontend environment variables
├── .env.example                      # Frontend environment template
├── index.html                        # Application HTML entry point
├── package.json                      # React 19, Vite 8, Tailwind CSS v4, Recharts, Supabase JS
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
│   │   ├── models.py                 # Star Schema models (College, Program, StudentProfile,
│   │   │                             #   DateDim, FeedbackCategory, FeedbackFact)
│   │   ├── serializers.py            # DRF serializers for summaries, reviews, and validation
│   │   ├── views.py                  # Core endpoints (list, summary, compare, reviews,
│   │   │                             #   admin system summary)
│   │   ├── urls.py                   # /api/ routing table
│   │   └── management/commands/
│   │       └── seed_mock_data.py     # Seeds colleges, programs, categories, and 90 feedback facts
│   │
│   └── analytics/                    # Machine Learning & Data Mining Application
│       ├── models.py                 # CollegeInsightCache and GlobalInsightCache tables
│       ├── serializers.py            # Serializers for ML insight delivery
│       ├── views.py                  # Endpoints: college insights, global overview, refresh
│       ├── urls.py                   # /api/analytics/ routing table
│       ├── ml_services/              # Core scikit-learn & mlxtend algorithms
│       │   ├── data_loader.py        # Star Schema → wide analytical DataFrame ETL
│       │   ├── regression_service.py # Ridge Regression (Key Drivers)
│       │   ├── classification_service.py # Gaussian Naive Bayes + Decision Tree (Dual)
│       │   ├── clustering_service.py # K-Means (k=3) + Agglomerative (Ward's Linkage)
│       │   ├── association_service.py# Apriori Association Rule Mining
│       │   └── model_registry.py     # Model persistence utilities (joblib)
│       └── management/commands/
│           └── run_analytics_pipeline.py # End-to-end ML training & cache persistence
│
└── src/                              # React Frontend Source Code
    ├── main.jsx                      # App root render & router provider
    ├── App.jsx                       # RoleProvider wrapper + RouterProvider
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
    │   ├── SubmitFeedbackPage.jsx    # Student review submission form (1 review per academic year)
    │   ├── AdminDashboardPage.jsx    # Admin telemetry, institutional rankings, ML engine status
    │   └── AuthPage.jsx              # Supabase Sign In / Sign Up with role metadata selection
    │
    ├── components/
    │   ├── common/                   # Shared UI primitives
    │   │   ├── Navbar.jsx            # Top navigation bar with role-specific link gating
    │   │   ├── Sidebar.jsx           # Responsive vertical sidebar matching Navbar restrictions
    │   │   ├── Footer.jsx            # App-wide footer
    │   │   ├── CollegeCard.jsx       # Individual college listing card (navigates to /college/:id)
    │   │   ├── RatingBadge.jsx       # Color-coded rating display component
    │   │   └── SearchBar.jsx         # Search input for college filtering
    │   │
    │   ├── dashboard/                # College dashboard analytics widgets
    │   │   ├── CategoryPerformanceChart.jsx    # Horizontal bar chart of category averages
    │   │   ├── InfrastructureBreakdownChart.jsx# Infrastructure sub-dimension breakdown
    │   │   ├── OverallRatingStat.jsx           # Hero rating stat with recommendation %
    │   │   ├── SentimentPieChart.jsx           # Donut chart of sentiment distribution
    │   │   └── FeedbackLists.jsx               # Expandable lists of student comments
    │   │
    │   ├── compare/                  # College comparison components
    │   │   ├── CollegeSelector.jsx   # Instant selection dropdown (onMouseDown blur-safe)
    │   │   ├── ComparisonBarChart.jsx# Side-by-side category comparison chart
    │   │   └── ComparisonTable.jsx   # Tabular comparison data
    │   │
    │   ├── feedback/                 # Feedback submission components
    │   │   ├── FeedbackForm.jsx      # 5-part survey workflow (11 categories, conditional hostel)
    │   │   ├── RatingInput.jsx       # Interactive 5-star rating input
    │   │   └── SubmitConfirmation.jsx# Post-submission success screen
    │   │
    │   └── insights/                 # Data-Driven ML Insights widgets
    │       ├── DataDrivenInsightsSection.jsx   # 5-widget DWM container (2-column grid)
    │       ├── KeyDriversChart.jsx             # Horizontal bar chart of Ridge β coefficients
    │       ├── ClassificationComparisonCard.jsx# GNB vs Decision Tree dual accuracy card
    │       ├── PredictiveRecommendGauge.jsx    # Circular SVG gauge (recommendation probability)
    │       ├── SegmentBadgeList.jsx            # K-Means cohort distribution badges
    │       ├── HierarchicalGroupingsCard.jsx   # Agglomerative Ward's cluster splits
    │       └── AssociationRuleChips.jsx        # Apriori co-occurrence rule chips
    │
    ├── mock/                         # Static JSON fallbacks (colleges.json, reviews.json)
    └── utils/                        # Frontend data transformations & sentiment aggregators
```

---

## 3. Database Design & OLAP Star Schema

### 3.1 Multidimensional Data Warehouse Modeling

UniMetric discards traditional flat review schemas (where one row equals one entire review with many fixed columns) in favor of a canonical **Multidimensional Star Schema**. In this schema, the grain of the fact table is **one student's evaluation of a single feedback category during a distinct review event**.

```
                           ┌─────────────────────────┐
                           │       api_college       │
                           ├─────────────────────────┤
                           │ PK  id                  │
                           │     name                │
                           │     location            │
                           │     college_type        │
                           └────────────┬────────────┘
                                        │ 1
                                        │
                                        │ N
┌─────────────────────────┐ 1         N ┌─────────────────────────┐ N         1 ┌─────────────────────────┐
│       api_program       ├─────────────┤    api_feedbackfact     ├─────────────┤  api_feedbackcategory   │
├─────────────────────────┤             ├─────────────────────────┤             ├─────────────────────────┤
│ PK  id                  │             │ PK  id                  │             │ PK  id                  │
│ FK  college_id          │             │ FK  college_id          │             │     category_name       │
│     program_name        │             │ FK  program_id          │             │     category_group      │
│     degree_type         │             │ FK  student_profile_id  │             └─────────────────────────┘
│     subject_area        │             │ FK  date_id             │
│                         │             │ FK  category_id         │
└─────────────────────────┘             │     score (Measure:1-5) │
                                        │     submission_id (Deg) │
                                        │     user_id             │
                                        │     would_recommend     │
┌─────────────────────────┐ 1           │     sentiment           │           1 ┌─────────────────────────┐
│   api_studentprofile    ├─────────────┤     positive_feedback   ├─────────────┤       api_datedim       │
├─────────────────────────┤ N           │     complaints          │ N           ├─────────────────────────┤
│ PK  id                  │             │     suggestions         │             │ PK  id                  │
│     user_id             │             │     created_at          │             │     full_date           │
│ FK  program_id          │             └─────────────────────────┘             │     year                │
│     admission_date      │                                                     │     quarter             │
│     year_of_study       │                                                     │     month               │
│     age_group           │                                                     │     academic_year       │
│     gender              │                                                     └─────────────────────────┘
│     state_of_domicile   │
└─────────────────────────┘
```

### 3.2 Dimension & Fact Entity Dictionary

#### Central Fact Table: `FeedbackFact` (`api_feedbackfact`)

| Field | Type | Description |
|---|---|---|
| `id` | AutoField (PK) | Primary key. |
| `college_id` | ForeignKey → `College` | Institutional rollup dimension. `on_delete=CASCADE`. |
| `program_id` | ForeignKey → `Program` | Departmental rollup dimension. `on_delete=SET_NULL`. |
| `student_profile_id` | ForeignKey → `StudentProfile` | Demographic slice/dice dimension. `on_delete=SET_NULL`. |
| `date_id` | ForeignKey → `DateDim` | Temporal and academic-year slicing. `on_delete=SET_NULL`. |
| `category_id` | ForeignKey → `FeedbackCategory` | Category performance slicing. `on_delete=CASCADE`. |
| `score` | PositiveSmallIntegerField | **Primary Measure** — Quantitative evaluation score (1–5). |
| `submission_id` | UUIDField | **Degenerate Dimension** — Groups the 10 or 11 individual category evaluations from a single review event. |
| `user_id` | CharField | Supabase auth user identifier. |
| `would_recommend` | BooleanField | Binary recommendation indicator. |
| `sentiment` | CharField (POSITIVE/NEUTRAL/NEGATIVE) | Sentiment classification. |
| `positive_feedback` | TextField | Strengths identified by the student. |
| `complaints` | TextField | Structural pain points reported. |
| `suggestions` | TextField | Actionable student recommendations. |
| `created_at` | DateTimeField | Timestamp of fact creation. |

#### Dimensional Tables

| Dimension | Table Name | Key Attributes | Description |
|---|---|---|---|
| **College** | `api_college` | `id`, `name`, `location`, `college_type` (PRIVATE, GOVERNMENT, AUTONOMOUS, DEEMED) | Academic institution entity. |
| **Program** | `api_program` | `id`, `college_id` (FK → College, CASCADE), `program_name`, `degree_type`, `subject_area` | Department and degree offering. |
| **Student Profile** | `api_studentprofile` | `id`, `user_id`, `program_id` (FK → Program, SET_NULL), `admission_date`, `year_of_study`, `age_group`, `gender`, `state_of_domicile` | Demographic context for OLAP slicing. |
| **Date** | `api_datedim` | `id`, `full_date`, `year`, `quarter`, `month`, `academic_year` | Time dimension for quarterly and academic-year rollups. |
| **Feedback Category** | `api_feedbackcategory` | `id`, `category_name`, `category_group` (TEACHING, INFRASTRUCTURE, CAREER) | Evaluation taxonomy for category-level analytics. |

### 3.3 The Expanded 11-Category Data Matrix

UniMetric standardizes evaluation across **11 granular categories** grouped into three functional operational areas:

| Operational Group | Category Name | Description & Evaluation Focus |
|---|---|---|
| **TEACHING** | `Teaching Quality` | Faculty clarity, pedagogy, depth of instruction, doubt resolution |
| **TEACHING** | `Curriculum Relevance` | Industry alignment, syllabus modernity, hands-on lab integration |
| **TEACHING** | `Library & Resources` | Availability of physical reference books, quiet study halls, digital journal access |
| **INFRASTRUCTURE** | `Infra — Quality of Equipment` | Modernity of hardware, lab instruments, workstations, test apparatus |
| **INFRASTRUCTURE** | `Infra — Cleanliness` | Sanitation of lecture halls, communal spaces, and hygiene standards |
| **INFRASTRUCTURE** | `Infra — Basic Amenities` | Continuous drinking water, power redundancy, heating/ventilation, washrooms |
| **INFRASTRUCTURE** | `Wi-Fi & Connectivity` | Campus bandwidth, residence/lab coverage density, low latency |
| **INFRASTRUCTURE** | `Canteen & Food Quality` | Food hygiene, nutritional balance, affordability, dietary variety |
| **INFRASTRUCTURE** | `Hostel & Accommodation` | Residential comfort, security, room maintenance, warden responsiveness |
| **CAREER** | `Placements & Opportunities` | Recruitment drive quality, median packages, training cells, internship pipelines |
| **CAREER** | `Extracurriculars & Culture` | Campus festivals, technical clubs, athletic facilities, student organizations |

### 3.4 Native Handling of Sparse Data (The Conditional Hostel Gateway)

In traditional flat tables, optional or conditional questions (e.g., *Hostel & Accommodation* evaluated only by resident students) cause significant relational anomalies:

- Imputing `0` artificially degrades the college's overall average score.
- Imputing `NULL` requires conditional SQL functions (`COALESCE`, `NULLIF`) and breaks machine learning matrices.

**The Star Schema Advantage**:  
In UniMetric, a submission by a non-resident student (Day Scholar) simply creates **10 rows** in `FeedbackFact` instead of 11. The `Hostel & Accommodation` category row is omitted entirely from that submission's partition.

- **Relational Integrity**: Zero `NULL` cells exist in the fact table's `score` column.
- **Mathematical Accuracy**: OLAP rollups like `Avg('score')` calculate across existing records only. Day scholars do not affect hostel metrics, and hostel conditions do not artificially drag down day scholar scores.
- **ML Matrix Imputation**: During data ingestion into pandas DataFrames (`data_loader.py`), the wide matrix imputation assigns column means to missing values strictly for algorithms requiring rectangular arrays, leaving raw database records unpolluted.

### 3.5 Database Cascading Rules

Django's `on_delete` behaviors enforce strict referential integrity across the warehouse:

| Relationship | `on_delete` Behavior | Effect |
|---|---|---|
| `FeedbackFact.college` → `College` | `CASCADE` | Deleting a College automatically deletes all associated FeedbackFact rows. |
| `FeedbackFact.category` → `FeedbackCategory` | `CASCADE` | Deleting a Category removes all fact rows scored against it. |
| `FeedbackFact.student_profile` → `StudentProfile` | `SET_NULL` | Deleting a StudentProfile nullifies the FK on associated fact rows (reviews are preserved as anonymous records). |
| `FeedbackFact.program` → `Program` | `SET_NULL` | Deleting a Program nullifies the FK; fact rows remain for historical aggregation. |
| `FeedbackFact.date` → `DateDim` | `SET_NULL` | Deleting a DateDim entry nullifies the FK; temporal context is lost but data persists. |
| `Program.college` → `College` | `CASCADE` | Deleting a College cascades to delete all its Program entries. |
| `StudentProfile.program` → `Program` | `SET_NULL` | Deleting a Program nullifies the student's program FK; profile persists. |
| `CollegeInsightCache.college` → `College` | `CASCADE` | Deleting a College removes its pre-computed ML cache. |

---

## 4. Machine Learning & DWM Engine (The Analytics Pipeline)

The core academic differentiator of UniMetric is its comprehensive integration of Data Warehousing and Data Mining algorithms. To guarantee high-throughput web performance (<100ms API response time), heavy machine learning operations are executed **asynchronously** and cached in the **Analytical Insight Cache** (`CollegeInsightCache` and `GlobalInsightCache`).

### 4.1 Pipeline Architecture

```
                    FEEDBACK FACT TABLE (OLAP WAREHOUSE)
                                       │
                                       ▼
                         [ml_services/data_loader.py]
                    Transforms long facts into wide matrix:
               One row per submission, columns = 11 categories
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         │                             │                             │
         ▼                             ▼                             ▼
 [Ridge Regression]        [Dual Classification Engine]     [Dual Clustering Engine]
 Target: overall_rating    Target: would_recommend         1. K-Means (k=3):
 • Standardized weights β  1. Gaussian Naive Bayes:           Student cohort personas
 • "Key Drivers" Ranking      • Recommendation likelihood  2. Agglomerative (Ward):
                               • Test split accuracy           Category factor taxonomy
                            2. Decision Tree (Entropy):        splits & branch means
                               • Attribute Relevance (Top 3)
                               • Test split accuracy
         │                             │                             │
         └─────────────────────────────┼─────────────────────────────┘
                                       │
                                       ▼
                         [Apriori Rule Mining (mlxtend)]
                         Binarizes scores <= 2 as "Low"
                         • Frequent Itemset Generation
                         • "Co-Occurring Weaknesses"
                                       │
                                       ▼
                       PERSISTED TO COLLEGEINSIGHTCACHE
                          (Served directly to Client)
```

### 4.2 OLAP Rollups & Aggregations

UniMetric implements multi-level SQL aggregations using Django ORM expressions:

- **Unique Submissions**: `Count('feedback__submission_id', distinct=True)`
- **Category Means**: `Avg('feedback__score')` grouped by `category__category_name`
- **Recommendation Percentage**: `Avg(Cast(would_recommend, IntegerField())) × 100`
- **Slice & Dice**: Filtered instantly by `program_id`, `student_profile__year_of_study`, or `date__academic_year`.

### 4.3 Ridge Regression: Key Rating Drivers

- **File**: `backend/analytics/ml_services/regression_service.py`
- **Objective**: Quantify the relative marginal impact of each evaluation category on the overall institutional rating.
- **Mathematical Formulation**:  
  Standard OLS suffers from multicollinearity because students who rate teaching quality high often rate curriculum high. UniMetric applies **L₂-Regularized Ridge Regression**:

  ```
  min_w ( ‖y - Xw‖² + α‖w‖² ),   α = 1.0
  ```

- **Pipeline Implementation**:
  1. Features **X** are standardized using `StandardScaler` (μ=0, σ=1).
  2. Missing categories (e.g., Day Scholars missing hostel scores) are imputed using category column means.
  3. Regression coefficients w_j represent standardized feature importance weights (β).
- **Actionable Insight**:  
  Yields the **"Key Drivers"** ranking. For example, if β(Curriculum Relevance) = 0.42 while β(Wi-Fi) = 0.08, administrators know curriculum improvements will generate over 5× more satisfaction lift than upgrading Wi-Fi routers.

### 4.4 Dual Supervised Classification Engine

- **File**: `backend/analytics/ml_services/classification_service.py`
- **Target**: `would_recommend` (Binary boolean outcome: recommend or not).
- **Features**: Continuous rating vectors for all 11 categories combined with one-hot encoded qualitative sentiment (`sent_POSITIVE`, `sent_NEUTRAL`, `sent_NEGATIVE`).

#### 4.4.1 Gaussian Naive Bayes (Probabilistic Classifier)

- **Objective**: Classify recommendation probability without requiring deep neural architectures.
- **Mathematical Formulation**:  
  By Bayes' Theorem, with the conditional independence assumption between categories:

  ```
  P(Y=1 | x) = P(Y=1) ∏ P(xⱼ | Y=1) / Σ_k P(Y=k) ∏ P(xⱼ | Y=k)
  ```

  where continuous ratings xⱼ follow Gaussian distributions.
- **Output**: Generates the **Predictive Recommend Score** (calibrated probability P(Y=1)) rendered via an interactive circular SVG gauge (`PredictiveRecommendGauge.jsx`).

#### 4.4.2 Decision Tree Classifier (Entropy / Information Gain)

- **Objective**: Extract white-box decision logic and determine **Attribute Relevance** (identifying the top attributes that govern recommendation outcomes).
- **Mathematical Formulation**:  
  The decision tree optimizes splits via **Entropy** and **Information Gain** (ID3/CART):

  ```
  Entropy(S) = -Σ pᵢ log₂(pᵢ)
  Gain(S, A) = Entropy(S) - Σ_v (|Sᵥ|/|S|) × Entropy(Sᵥ)
  ```

- **Configuration**: `criterion="entropy"`, `max_depth=4`, `random_state=42`.
- **Attribute Relevance Ranking**: Extracts the top 3 most important features based on Gini/Entropy reduction, providing percentage weights (e.g., *Teaching Quality: 41.2%*, *Positive Sentiment: 28.5%*, *Placements: 18.1%*).

#### 4.4.3 Side-by-Side Model Comparison

Rendered in `ClassificationComparisonCard.jsx`:
- Displays side-by-side held-out test split accuracy cards for Naive Bayes and Decision Tree.
- Integrates the circular recommendation likelihood gauge alongside the top 3 attribute relevance chips.

### 4.5 Dual Unsupervised Clustering Engine

- **File**: `backend/analytics/ml_services/clustering_service.py`

#### 4.5.1 K-Means Clustering (k=3): Student Persona Cohort Segmentation

- **Objective**: Group student reviews into homogeneous satisfaction cohorts.
- **Mathematical Formulation**:  
  Partitions n reviews into k=3 sets **S** = {S₁, S₂, S₃} minimizing within-cluster sum of squares:

  ```
  argmin_S Σᵢ Σ_{x∈Sᵢ} ‖x - μᵢ‖²
  ```

- **Centroid Heuristic Classification**:
  1. **Highly Satisfied**: Highest centroid mean across all features.
  2. **Infrastructure-Critical**: Adequate academic scores, but severely degraded centroid means in infrastructure, hostel, Wi-Fi, or equipment.
  3. **Academically Challenged**: Discontent with faculty pace, curriculum depth, or library resources.
- **Display**: Rendered in `SegmentBadgeList.jsx` showing cohort distribution percentages and counts.

#### 4.5.2 Agglomerative Hierarchical Clustering (Ward's Linkage): Category Taxonomy Splits

- **Objective**: Discover natural structural groupings among evaluation categories by clustering the transposed sample matrix.
- **Mathematical Formulation**:  
  Bottom-up hierarchical merging where clusters are iteratively combined to minimize increase in total within-cluster variance (Ward's minimum variance criterion):

  ```
  ΔESS(A, B) = (nₐ × nᵦ) / (nₐ + nᵦ) × ‖μₐ - μᵦ‖²
  ```

- **Implementation & Thematic Mapping**:
  - The feature space is transposed (X ∈ ℝ^{categories × samples}).
  - `AgglomerativeClustering(n_clusters=3, linkage="ward")` is fitted.
  - Automatically identifies dominant themes using keyword matching:
    - **Academic Pedagogy & Curriculum**: Teaching Quality, Curriculum Relevance, Library & Resources.
    - **Career Pathways & Campus Culture**: Placements & Opportunities, Extracurriculars & Culture.
    - **Infrastructure & Campus Living**: Equipment, Cleanliness, Basic Amenities, Wi-Fi, Canteen, Hostel.
- **Computed Metrics**: Split branch labels, category count, branch average satisfaction score, and qualitative summary.
- **Display**: Rendered in `HierarchicalGroupingsCard.jsx`.

### 4.6 Apriori Association Rule Mining: Co-Occurring Weaknesses

- **File**: `backend/analytics/ml_services/association_service.py`
- **Objective**: Discover hidden operational dependencies where deficiencies in one campus domain trigger systemic failure or dissatisfaction.
- **Algorithm Workflow**:
  1. **Binarization**: Scores ≤ 2 are flagged as boolean transactions: `Low_<Category> = True`. Negative recommendations are encoded as `No_Recommend = True`.
  2. **Frequent Itemset Generation**: Implemented via `mlxtend.frequent_patterns.apriori` using a minimum support threshold s ≥ 0.05.
  3. **Association Rule Extraction**: Rules A ⇒ B filtered by minimum confidence c ≥ 0.40 and sorted by **Lift**:

     ```
     Support(A ⇒ B)    = P(A ∪ B)
     Confidence(A ⇒ B) = P(A ∪ B) / P(A)
     Lift(A ⇒ B)       = P(A ∪ B) / (P(A) × P(B))
     ```

- **Dashboard Output**: Rendered in `AssociationRuleChips.jsx`:
  - Example Rule: `Low Infra Cleanliness + Low Canteen → No Recommend`
  - Metrics: Support: 0.18, Confidence: 0.85, Lift: 2.14 (>1 denotes a strong correlation rather than coincidental occurrence).

### 4.7 Analytical Cache Models & Pipeline Orchestration

#### `CollegeInsightCache` (Per-College Analytics)

| Field | Type | Contents |
|---|---|---|
| `college` | OneToOneField → College (CASCADE) | Parent institution reference. |
| `key_drivers` | JSONField | Array of Ridge β weights per category. |
| `cluster_summary` | JSONField | Array of K-Means cohort profiles ({segment, count, percent}). |
| `association_rules` | JSONField | Array of mined Apriori rules ({rule, confidence, lift}). |
| `predictive_recommend_score` | FloatField | GaussianNB likelihood probability. |
| `classifier_accuracy` | FloatField | GaussianNB test split accuracy. |
| `decision_tree_accuracy` | FloatField | Decision Tree test split accuracy. |
| `decision_tree_top_features` | JSONField | Top 3 attributes with percentage contributions. |
| `hierarchical_groupings` | JSONField | Agglomerative cluster splits with branch means. |
| `computed_at` | DateTimeField | Timestamp of last pipeline execution. |

#### `GlobalInsightCache` (Cross-College Analytics)

| Field | Type | Contents |
|---|---|---|
| `singleton_key` | CharField (unique, default="GLOBAL") | Singleton row identifier. |
| `category_clusters` | JSONField | Agglomerative cross-college category groupings. |
| `cross_college_rules` | JSONField | Global Apriori association rules. |
| `computed_at` | DateTimeField | Timestamp of last computation. |

#### Pipeline Execution

The pipeline is triggered via:
- **Management Command**: `python manage.py run_analytics_pipeline`
- **Admin API Endpoint**: `POST /api/analytics/refresh/`

Both methods execute the full training cycle: Ridge → GNB + Decision Tree → K-Means + Agglomerative → Apriori, then persist results into the cache tables.

---

## 5. Role-Based Access Control (RBAC) & Navigation Logic

UniMetric defines three distinct security and operational roles, enforced via client-side routing guards (`RoleContext.jsx`), dedicated navigation layouts (`Navbar.jsx`, `Sidebar.jsx`), and backend business validation.

### 5.1 Role Permission Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ROLE PERMISSION MATRIX                          │
├────────────────────┬──────────────┬──────────────┬─────────────────────┤
│ Feature / Endpoint │ Prospect     │ Student      │ Admin               │
├────────────────────┼──────────────┼──────────────┼─────────────────────┤
│ Search & Listings  │ Full Access  │ Full Access  │ Full Access         │
│ College Scorecard  │ Full Access  │ Full Access  │ Full Access         │
│ DWM ML Insights    │ Full Access  │ Full Access  │ Full Access         │
│ Compare Colleges   │ Full Access  │ BLOCKED (UI) │ Full Access         │
│ Submit Feedback    │ BLOCKED (Auth│ 1 Review/Yr  │ Full Access (Audit) │
│ Admin Dashboard    │ BLOCKED      │ BLOCKED      │ Full Access         │
│ Refresh Analytics  │ BLOCKED      │ BLOCKED      │ Full Access         │
└────────────────────┴──────────────┴──────────────┴─────────────────────┘
```

### 5.2 Prospect (Unauthenticated or Registered Applicant)

- **Intent**: Prospective applicant researching colleges for prospective enrollment.
- **Navigation Layout**: Both `Navbar.jsx` and `Sidebar.jsx` display **"Home"** and **"Compare Colleges"** as the primary navigation links. The global "Dashboard" link is intentionally **hidden** from Prospect navigation — prospects access individual college dashboards (scorecards and ML insights) organically by clicking on **CollegeCard** components on the Home page, which navigate to `/college/:id`.
- **Homepage Compare Button**: Unauthenticated visitors who click a "Compare Colleges" style call-to-action on the homepage are routed to `/compare`. If not logged in, the Compare page may present a restricted access modal prompting authentication.
- **Restrictions**: Cannot submit institutional feedback (`/submit-feedback` redirects to `/auth`).

### 5.3 Student (Verified Enrolled Student)

- **Intent**: Active campus attendee providing institutional feedback for their enrolled college.
- **Navigation Layout**: Both `Navbar.jsx` and `Sidebar.jsx` display strictly **"Home"** and **"Submit Feedback"** — no other navigation items. This intentional focus eliminates distractions and reinforces the student's primary action: evaluating their institution.
- **Routing Restriction**: **Students are explicitly blocked from the "Compare Colleges" tool**. College comparison is an applicant-stage activity; enrolled students evaluate their current institution.
- **Submission Entitlement**: Permitted to submit feedback **once per verified academic year** (`/submit-feedback`). If a student has already submitted their annual review, the Submit Feedback page displays a friendly "Review Already Submitted" screen with a single **"Back to Home"** button — the "Go to Dashboard" button is hidden, routing them only to the Home page.
- **1-Review-Per-Academic-Year Logic**:
  1. **Dynamic Academic Year Calculation**: The helper `calculate_year_of_study` determines the student's active academic year based on elapsed months between admission and the current date:
     ```
     Δ_months = (Year_current - Year_admission) × 12 + (Month_current - Month_admission)
     YearOfStudy = min(max(⌊Δ_months / 12⌋ + 1, 1), 4)
     ```
  2. **Duplicate Rejection**: The API queries `FeedbackFact` for existing submissions matching the user and calculated year. If found, the request is rejected with HTTP 400.
  3. **Natural Progression**: When 12 calendar months elapse from admission, the calculated year increments, permitting the next annual evaluation.

### 5.4 Admin (Institutional Analyst / System Auditor)

- **Intent**: Data auditor and quality assurance officer.
- **Navigation Layout**: Both `Navbar.jsx` and `Sidebar.jsx` display **"Home"** and **"Admin Dashboard"** (with a distinctive ShieldCheck icon and yellow accent styling on the admin route).
- **Permissions**: Unrestricted access across all pages, including the exclusive `/admin` portal (`AdminDashboardPage.jsx`).

#### Admin Dashboard Features

1. **Live KPI Stat Cards**: Three top-level metric cards (Total Registered Students, Colleges Indexed, Total Reviews Submitted) display global platform statistics. These cards are **display-only** — misleading arrow icons have been removed to avoid implying clickable navigation.

2. **Algorithmic Institutional Rankings**: A dynamic, searchable and sortable leaderboard exclusively visible to admins. Colleges are ranked based on a **Composite Score Index**:
   ```
   Composite Score = (0.55 × Scaled Overall Rating) + (0.35 × Recommend %) + (0.10 × Volume Credibility)
   ```
   This mitigates the small-sample-size bias where a college with one 5-star review outranks a college with a thousand 4.8-star reviews. Each ranking row includes:
   - Rank medal icons (Trophy/Medal/Award for top 3)
   - Composite score with letter grade (A+, A, B+, B)
   - Overall rating, recommendation percentage, review count
   - Academic pillar scores (Teaching, Placements, Infrastructure)
   - Primary ML driver
   - **Profile action button**: Correctly routes to `/college/:id` (with a `/colleges/:id` alias in the router for backwards compatibility), resolving the previous 404 routing error.

3. **Live Activity Stream**: Real-time monitoring of global student feedback submissions with sentiment pill tagging (Positive/Neutral/Negative) and quick-access qualitative review modals showing detailed dimension ratings and student commentary.

4. **ML Intelligence Engine Control Center**: A structured architectural view exposing the exact deployment configurations, file targets, and caching status for all 4 ML model cards:
   - Ridge Driver Regression (`regression_service.py`)
   - K-Means & Agglomerative Clustering (`clustering_service.py`)
   - Apriori Association Rules (`association_service.py`)
   - Naive Bayes & Decision Tree (`classification_service.py`)

5. **Sidebar Quick Stats**: Global sentiment breakdown (interactive Recharts donut pie chart with progress bars), new sign-ups feed with role pills, and flagged reviews counter.

### 5.5 Frontend Routing Table

| Path | Component | Access | Description |
|---|---|---|---|
| `/` | `HomePage` | All | Landing page with platform KPIs, search, and college card grid. |
| `/auth` | `AuthPage` | All | Full-screen Supabase Sign In / Sign Up (standalone layout). |
| `/dashboard` | `CollegeDashboardPage` | All | General dashboard entry (resolves college from session). |
| `/college/:id` | `CollegeDashboardPage` | All | College-specific scorecard, charts, and ML insights. |
| `/colleges/:id` | `CollegeDashboardPage` | All | Alias route for backwards compatibility. |
| `/compare` | `ComparePage` | Prospect, Admin | Side-by-side college comparison tool. Blocked for Students. |
| `/submit-feedback` | `SubmitFeedbackPage` | Student, Admin | 5-part feedback form. Redirects Prospects to `/auth`. |
| `/admin` | `AdminDashboardPage` | Admin only | Admin telemetry, rankings, and ML pipeline control. |

---

## 6. Core Features & Frontend Design System

### 6.1 The 5-Part Conditional Feedback Submission Workflow

The feedback submission process (`FeedbackForm.jsx`) guides students through an intuitive, validated five-part sequence:

```
[Part 1: Academics] ──> [Part 2: Infra] ──> [Part 3: Hostel Gateway] ──> [Part 4: Career] ──> [Part 5: Insights]
  • Teaching Quality       • Equipment         • Resided in Hostel?        • Placements          • Recommend Toggle
  • Curriculum             • Cleanliness         ├─ YES: Rate (1-5)        • Culture             • Positive Text
  • Library                • Amenities           └─ NO:  Bypassed                                • Complaints
                           • Wi-Fi                                                               • Suggestions
                           • Canteen
```

1. **Context Auto-Locking**: If the student profile is established, their enrolled `College`, `Program`, and dynamic `Academic Year` are locked with visible security badges, preventing review fabrication.
2. **Part 1: Academics & Learning (3 Categories)**: Interactive 5-star rating inputs with tactile hover states for *Teaching Quality*, *Curriculum Relevance*, and *Library & Resources*.
3. **Part 2: Campus Infrastructure & Daily Living (5 Categories)**: Ratings for *Quality of Equipment*, *Cleanliness*, *Basic Amenities*, *Wi-Fi & Connectivity*, and *Canteen & Food Quality*.
4. **Part 3: Hostel & Residential Gateway (Conditional)**:
   - Students encounter a binary prompt: *"Did you reside in or utilize the college hostel / residential facilities?"*
   - Selecting **"No"** completely bypasses the hostel section. No `Hostel & Accommodation` score is included in the network payload, preventing day-scholar bias.
   - Selecting **"Yes"** reveals a dedicated rating input with mandatory validation.
5. **Part 4: Career Pathways & Campus Culture (2 Categories)**: Ratings for *Placements & Opportunities* and *Extracurriculars & Culture*.
6. **Part 5: Qualitative Insights & Recommendation**:
   - High-contrast **Would Recommend** toggle button.
   - Structured text fields for *Positive Aspects*, *Constructive Complaints*, and *Administrative Suggestions*.

### 6.2 Soft Neo-Brutalism Design System

UniMetric uses a tailored **Soft Neo-Brutalism** aesthetic, defined in `index.css` and `tailwind.config.js`:

#### Color Palette

| Token | Hex Value | Usage |
|---|---|---|
| **Charcoal** | `#191919` | High-contrast text, borders, dark sidebar background |
| **Cream** | `#F4F2EC` | App canvas background |
| **Paper** | `#FFFFFF` | Card and panel backgrounds |
| **Coral** | `#F4633E` | Primary call-to-action buttons, negative sentiment indicators, logo accent |
| **Yellow** | `#F5C451` | Warning badges, highlight KPI cards, admin route accent |
| **Purple** | `#C7B7F2` | Autonomous / specialized institution badges |
| **Blue** | `#AEE1F5` | Government institution badges |

#### Design Tokens

- **Geometry**: High border-radius components (`rounded-3xl`, `rounded-4xl`), soft contrast drop shadows (`shadow-soft`), crisp borders (`border-brand-charcoal/10`).
- **Typography**: Bold weight system (`font-semibold`, `font-bold`, `font-extrabold`, `font-black`) for visual hierarchy.
- **Interactive Patterns**: Glass-morphism cards (`glass-card` class), hover-lift animations (`hover-lift`), smooth fade-in transitions (`animate-fade-in-up`).
- **Interactive Safeguards**: `CollegeSelector.jsx` utilizes `onMouseDown` with event prevention and keyboard `Enter` handlers to prevent blur-event race conditions during dropdown selection.

### 6.3 The 5-Widget Data-Driven Insights Grid Layout

Rendered in `DataDrivenInsightsSection.jsx` across a balanced 2-column grid layout:

| Widget | Component | ML Algorithm | Content |
|---|---|---|---|
| **1. Key Rating Drivers** | `KeyDriversChart.jsx` | Ridge Regression | Horizontal bar chart visualizing standardized Ridge β coefficients indicating which categories exert the strongest influence on overall satisfaction. |
| **2. Classification Comparison** | `ClassificationComparisonCard.jsx` | GNB + Decision Tree | Dual-card layout presenting Gaussian Naive Bayes vs. Decision Tree test split accuracies, the predictive recommendation likelihood gauge (`PredictiveRecommendGauge.jsx`), and the Decision Tree's top 3 attribute relevance chips. |
| **3. Student Segments** | `SegmentBadgeList.jsx` | K-Means (k=3) | Cohort breakdown displaying percentages and counts across *Highly Satisfied*, *Infrastructure-Critical*, and *Academically Challenged* student groups. |
| **4. Hierarchical Groupings** | `HierarchicalGroupingsCard.jsx` | Agglomerative (Ward) | Bottom-up cluster splits detailing the grouping of campus dimensions into overarching factor branches along with branch average scores. |
| **5. Co-Occurring Weaknesses** | `AssociationRuleChips.jsx` | Apriori | Full-width responsive chip container showing frequent low-rating association rules sorted by Lift, with Support and Confidence metrics. |

### 6.4 Persona-Based Synthetic Mock Seeding Engine

To rigorously test machine learning algorithms without waiting months for organic survey collection, UniMetric includes a sophisticated **Persona Seeding Engine** (`seed_mock_data.py`). It generates **90 authentic reviews** across benchmark colleges using realistic behavioral personas:

#### Seeded Benchmark Institutions

| College | Type | Location | Strengths | Weaknesses |
|---|---|---|---|---|
| Premier Tech Institute | Autonomous | Bengaluru | Curriculum (4.7), Placements (4.8) | Hostel (2.6) |
| Heritage University | Government | Kolkata | Library (4.8), Hostels (4.4) | Curriculum (2.2) |
| Metro State College | Government | Mumbai | — | Wi-Fi (1.8), Hostel (1.6) |

#### The Three Seeded Behavioral Personas

1. **Persona A: "The Tech/Hackathon Enthusiast"**: Heavy weighting on Wi-Fi, modern curriculum, and laboratory equipment. If `is_curriculum_modern == False`, the persona downrates *Placements* (1–2) and sets `would_recommend = False`.
2. **Persona B: "The Hosteler"**: Resident student whose living scores (Hostel, Canteen, Cleanliness) are tightly coupled around the college baseline within a tight ±0.4 variance.
3. **Persona C: "The Day Scholar"**: Completely omits the hostel category (exercises the Star Schema's sparse data tolerance). Ratings concentrate on Teaching Quality, Library Access, and commute amenities.

---

## 7. API Reference & Local Setup

### 7.1 Core API (`/api/`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/colleges/` | Returns list of colleges with annotated aggregates (`unique_reviews`, `avg_score`, `recommend_pct`) and search query support (`?search=`). |
| `GET` | `/api/colleges/<id>/summary/` | Detailed institutional scorecard including category averages, sentiment counts, and sample feedback. |
| `GET` | `/api/colleges/<id>/dashboard-bundle/` | Comprehensive dashboard data bundle (college details, reviews, insights) in a single request. |
| `GET` | `/api/colleges/<id>/reviews/` | Reconstructed individual review cards from `FeedbackFact` records. |
| `GET` | `/api/colleges/compare/?ids=1,2` | Side-by-side summary payload for two or more institutions. |
| `GET` | `/api/programs/` | Academic program offerings (filterable by `?college_id=`). |
| `GET` | `/api/reviews/?user_id=<uid>` | Queries if a student user has already submitted a review for the current academic year. |
| `POST` | `/api/reviews/` | Creates student profile record and writes 10–11 `FeedbackFact` rows (one per evaluated category). Enforces 1-review-per-academic-year. |
| `POST` | `/api/students/register/` | Registers a new student profile with demographic metadata. |
| `GET` | `/api/admin/system-summary/` | Admin-only endpoint returning platform-wide KPIs, college rankings, recent submissions, sign-ups, and pipeline status. |

### 7.2 Analytics API (`/api/analytics/`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/college/<id>/insights/` | Fetches precomputed Ridge β weights, GNB recommend probability, K-Means clusters, Decision Tree accuracy/top features, Agglomerative groupings, and Apriori rules for a specific college. |
| `GET` | `/api/analytics/overview/` | Fetches cross-institutional category clusters and global association rules. |
| `POST` | `/api/analytics/refresh/` | Executes `run_analytics_pipeline` on demand to update all cache tables. Admin-only. |

### 7.3 Local Setup & Execution Instructions

#### Backend (Django + Supabase)

1. **Activate Virtual Environment**:
   ```bash
   cd backend
   ..\venv\Scripts\activate   # Windows
   # source ../venv/bin/activate  # macOS / Linux
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables** (`backend/.env`):
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[REDACTED_KEY]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require"
   SECRET_KEY="[REDACTED_KEY]"
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

#### Frontend (React + Vite)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables** (`.env` in project root):
   ```env
   VITE_API_BASE_URL="http://localhost:8000/api"
   VITE_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
   VITE_SUPABASE_ANON_KEY="[REDACTED_KEY]"
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Access Application**:
   Navigate to `http://localhost:5173`.

#### Production Build

```bash
npm run build     # Generates optimized bundle in dist/
npm run preview   # Preview production build locally
```

---

## Appendix: Key Source File Reference

| Path | Language | Architectural Role |
|---|---|---|
| `backend/api/models.py` | Python (Django) | Star Schema model definitions (College, Program, StudentProfile, DateDim, FeedbackCategory, FeedbackFact) |
| `backend/api/views.py` | Python (DRF) | Core API endpoints & business logic (year calculation, anti-spam, OLAP rollups) |
| `backend/api/serializers.py` | Python (DRF) | Serialization & validation (college lists, review submission, student registration) |
| `backend/analytics/models.py` | Python (Django) | Analytics cache models (CollegeInsightCache, GlobalInsightCache) |
| `backend/analytics/views.py` | Python (DRF) | Analytics API endpoints (college insights, overview, refresh) |
| `backend/analytics/ml_services/data_loader.py` | Python (Pandas) | Star Schema → wide analytical DataFrame ETL |
| `backend/analytics/ml_services/regression_service.py` | Python (scikit-learn) | Ridge Regression key driver extraction |
| `backend/analytics/ml_services/classification_service.py` | Python (scikit-learn) | Dual Supervised Classification (GNB + Decision Tree) |
| `backend/analytics/ml_services/clustering_service.py` | Python (scikit-learn) | Dual Unsupervised Clustering (K-Means + Agglomerative) |
| `backend/analytics/ml_services/association_service.py` | Python (mlxtend) | Apriori association rule mining |
| `backend/analytics/management/commands/run_analytics_pipeline.py` | Python (Django) | End-to-end ML pipeline command |
| `backend/api/management/commands/seed_mock_data.py` | Python (Django) | Persona-based synthetic data seeding (90 reviews) |
| `src/context/RoleContext.jsx` | JavaScript (React) | Auth & RBAC state provider (Supabase session sync) |
| `src/router.jsx` | JavaScript (React) | React Router v7 route definitions and layout wrapping |
| `src/components/common/Navbar.jsx` | JavaScript (React) | Top navigation bar with role-specific link gating |
| `src/components/common/Sidebar.jsx` | JavaScript (React) | Responsive sidebar with role-specific routing |
| `src/components/feedback/FeedbackForm.jsx` | JavaScript (React) | 5-part survey workflow (11 categories, conditional hostel gateway) |
| `src/pages/CollegeDashboardPage.jsx` | JavaScript (React) | Institutional analytics page (OLAP rollups, charts, DWM insights) |
| `src/pages/AdminDashboardPage.jsx` | JavaScript (React) | Admin telemetry, institutional rankings, ML engine control center |
| `src/components/insights/DataDrivenInsightsSection.jsx` | JavaScript (React) | 5-widget DWM insights container |

---

## Appendix: System Verification Summary

| Verification Suite | Target Component | Validation Criteria | Status |
|---|---|---|---|
| **Database Connectivity** | Supabase Session Pooler | PostgreSQL connection established on port 5432 with `sslmode=require` | ✅ VERIFIED |
| **Warehouse Integrity** | Star Schema Migrations | All Django migrations applied across `api` and `analytics`; foreign keys verified | ✅ VERIFIED |
| **Dual Classification** | Supervised Pipeline | GaussianNB & Decision Tree trained, test split accuracies computed, top features extracted | ✅ VERIFIED |
| **Dual Clustering** | Unsupervised Pipeline | K-Means (k=3) student cohorts and Agglomerative Ward hierarchical splits populated | ✅ VERIFIED |
| **Association Rules** | Apriori Mining | Co-occurring low score patterns extracted with Support, Confidence, and Lift | ✅ VERIFIED |
| **Sparse Handling** | Day Scholar Submissions | Day Scholar submissions omit Hostel facts without raising schema or null exceptions | ✅ VERIFIED |
| **Temporal Anti-Spam** | Review Submission API | Submissions in the same academic year rejected with HTTP 400 | ✅ VERIFIED |
| **RBAC Enforcement** | Navigation & Tools | Student restricted to Home and Submit Feedback; Compare tool gated for Prospect | ✅ VERIFIED |
| **Admin Routing** | Profile Links | Admin Dashboard college "Profile" buttons correctly route to `/college/:id` (404 resolved) | ✅ VERIFIED |
| **Admin UX** | Stat Cards | Misleading ArrowRight icons removed from non-clickable stat cards | ✅ VERIFIED |
| **UI/UX Performance** | Soft Neo-Brutalism UI | Responsive 5-widget ML insights grid, SVG gauges, and Recharts graphs rendered | ✅ VERIFIED |

---

*UniMetric: Developed as an authoritative Data Warehousing & Data Mining (DWM) platform for higher education analytics.*
