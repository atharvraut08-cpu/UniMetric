# UniMetric: Project Master Document
## Data Warehousing & Data Mining (DWM) Institutional Analytics Platform

> **Document Version**: 2.1.0  
> **System Status**: Production-Ready / Fully Integrated  
> **Target Domain**: Higher Education Analytics, Academic Quality Assurance, and Student Decision Support  
> **Core Paradigms**: Multidimensional Star Schema (OLAP), Data Mining, Dual Unsupervised Clustering (K-Means & Agglomerative Hierarchical), Dual Supervised Classification (Gaussian Naive Bayes & Decision Tree / ID3-CART), Association Rule Mining (Apriori), Key Driver Extraction (Ridge Regression), Soft Neo-Brutalism UI  

---

## Table of Contents
1. [Executive Summary & Core Purpose](#1-executive-summary--core-purpose)
2. [System Architecture & Technology Stack](#2-system-architecture--technology-stack)
3. [Database Design: OLAP Star Schema](#3-database-design-olap-star-schema)
4. [Role-Based Access Control (RBAC) & Business Logic](#4-role-based-access-control-rbac--business-logic)
5. [The DWM Analytics Engine & Machine Learning Mapping](#5-the-dwm-analytics-engine--machine-learning-mapping)
6. [Core Features & UX Workflows](#6-core-features--ux-workflows)
7. [Repository File Matrix & Verification](#7-repository-file-matrix--verification)

---

## 1. Executive Summary & Core Purpose

### 1.1 The Institutional Evaluation Problem
Conventional higher education review systems (e.g., generic review aggregators, public forums) suffer from fundamental architectural and analytical limitations:
- **Flat Relational Storage**: Feedback is stored as unstructured strings alongside simple scalar columns, preventing multidimensional aggregations across academic terms, cohorts, or demographic axes.
- **Unweighted Averages & Metric Distortion**: Arithmetic means are reported uniformly without assessing which sub-dimensions (e.g., faculty competence vs. Wi-Fi availability) statistically dictate institutional satisfaction.
- **Data Sparsity Breakdown**: Reviews that do not apply to all students (such as on-campus hostel ratings for day scholars) introduce `NULL` clutter, default biases, or schema fragmentation.
- **Unverified Noise & Review Spam**: Arbitrary submissions without temporal controls, enrollment validation, or academic-year fences dilute data credibility.

### 1.2 The UniMetric Solution
**UniMetric** is an enterprise-grade academic feedback intelligence platform architected specifically to demonstrate and operationalize core **Data Warehousing & Data Mining (DWM)** principles. Instead of storing flat reviews, UniMetric decomposes every student submission into an **OLAP Multidimensional Star Schema**, isolating granular evaluation criteria across discrete dimensions (`College`, `Program`, `FeedbackCategory`, `StudentProfile`, and `DateDim`).

Built upon this analytical warehouse, UniMetric executes an automated, asynchronous **Data Mining Pipeline**:
1. **Multidimensional OLAP Rollups & Slice/Dice**: Instantaneous slicing across departments, cohorts, and categories.
2. **Key Rating Drivers via Ridge Regression**: Isolate the statistical weight ($\beta$) of individual operational variables on overall institutional satisfaction using $L_2$-regularization.
3. **Dual Supervised Classification Engine**:
   - **Gaussian Naive Bayes**: Probabilistic recommendation likelihood scoring ($P(\text{Recommend} \mid \mathbf{x})$) and feature probability distributions.
   - **Decision Tree Classifier (Entropy / ID3-CART)**: Rule-based classification uncovering top decision rules and **Attribute Relevance** (ranking the top 3 most influential split features by Information Gain).
4. **Dual Unsupervised Clustering Engine**:
   - **Cohort Segmentation via K-Means Clustering ($k=3$)**: Uncover latent student personas (*Highly Satisfied*, *Infrastructure-Critical*, *Academically Challenged*) using multidimensional satisfaction centroids.
   - **Hierarchical Taxonomy via Agglomerative Clustering (Ward's Linkage)**: Transpose evaluation matrices to group feedback categories into overarching institutional factor themes (*Academic Pedagogy & Curriculum*, *Infrastructure & Campus Living*, *Career Pathways & Campus Culture*).
5. **Systemic Bottleneck Discovery via Apriori Association Rule Mining**: Mine frequent negative itemsets to surface co-occurring campus pain points (e.g., $[Low\ Wi\text{-}Fi \land Low\ Labs] \Rightarrow No\ Recommend$).

The platform bridges enterprise data science with consumer-grade software engineering, wrapping complex machine learning models inside an accessible, tactile **Soft Neo-Brutalism** user interface.

---

## 2. System Architecture & Technology Stack

UniMetric employs a clean, decoupled three-tier architecture comprising a reactive client, a stateless Python API layer, and a cloud-hosted relational OLAP data warehouse.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION TIER (CLIENT)                      │
│                                                                        │
│   React 19 + Vite 6 + Tailwind CSS v4 + Recharts                       │
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

### 2.1 Technology Stack Specifications

| Layer | Component | Version / Specification | Rationale & Responsibility |
|---|---|---|---|
| **Frontend Runtime** | React | 19.x | Declarative UI component tree, fast re-renders, hook-driven architecture. |
| **Build Tool** | Vite | 6.x | Near-instant HMR, ES module bundling, optimized production builds. |
| **Styling Engine** | Tailwind CSS | v4 with CSS Variables | Curated design token system enforcing the "Soft Neo-Brutalism" visual system. |
| **Data Visualization** | Recharts | 2.x | High-performance SVG-based rendering of horizontal bar charts, radars, and donuts. |
| **Client Routing** | React Router | v7.x | Single Page Application (SPA) routing with layout wrapping and RBAC route gating. |
| **Backend Framework** | Django | 5.x | Robust ORM, declarative migrations, administrative ecosystem. |
| **API Architecture** | Django REST Framework | 3.15+ | Stateless JSON REST endpoints, custom model serializers, and query validation. |
| **Data Mining & ML** | scikit-learn & mlxtend | 1.4+ / 0.23+ | Ridge Regression, Gaussian Naive Bayes, DecisionTreeClassifier, KMeans, AgglomerativeClustering, Apriori Algorithm. |
| **Data Manipulation** | Pandas & NumPy | 2.x / 1.26+ | Fast vectorization, pivoting long facts into wide analytical matrices. |
| **Database & Auth** | Supabase (PostgreSQL) | PostgreSQL 15+ | Cloud OLAP warehouse, JWT issue/validation, connection pooling via Supavisor. |

### 2.2 Client-Backend Decoupling & Identity Mirroring
1. **Stateless Backend**: The Django API holds no sticky user sessions. All authentication occurs via Supabase Auth.
2. **Metadata Mirroring**: When a user registers through `supabase.auth.signUp()`, identity credentials (email, hashed password) are secured inside Supabase's encrypted `auth.users` table. Application-specific metadata (`full_name`, `role`, `college_id`, `program_id`, `admission_date`, `gender`, `age_group`, `state_of_domicile`) is encoded into the user's JWT metadata payload.
3. **Transparent Hydration**: The frontend [`RoleContext.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/context/RoleContext.jsx) subscribes to `supabase.auth.onAuthStateChange()`, instantly hydrating user roles across application restarts while Django mirrors profile details in `StudentProfile` for analytical slicing.

---

## 3. Database Design: OLAP Star Schema

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
- **Primary Measure**: `score` (PositiveSmallIntegerField, bounded 1–5). Represents the quantitative evaluation score.
- **Degenerate Dimension**: `submission_id` (UUIDField). Groups the 10 or 11 individual category evaluations completed simultaneously in a single student review event.
- **Dimensional Foreign Keys**:
  - `college_id` $\rightarrow$ `api_college.id` (Enforces institutional rollup)
  - `program_id` $\rightarrow$ `api_program.id` (Enforces departmental rollup)
  - `student_profile_id` $\rightarrow$ `api_studentprofile.id` (Enforces demographic slice/dice)
  - `date_id` $\rightarrow$ `api_datedim.id` (Enforces temporal and academic-year slicing)
  - `category_id` $\rightarrow$ `api_feedbackcategory.id` (Enforces category performance slicing)
- **Categorical & Qualitative Measures**:
  - `would_recommend` (BooleanField): Binary recommendation indicator.
  - `sentiment` (CharField: POSITIVE, NEUTRAL, NEGATIVE): Sentiment classification.
  - `positive_feedback` (TextField): Strengths identified by the student.
  - `complaints` (TextField): Structural pain points reported.
  - `suggestions` (TextField): Actionable student recommendations.

#### Dimensional Tables
1. **`College` (`api_college`)**: Institutional entity (`name`, `location`, `college_type`: PRIVATE, GOVERNMENT, AUTONOMOUS, DEEMED).
2. **`Program` (`api_program`)**: Specific academic major and degree level (`program_name`, `degree_type`, `subject_area`, `college_id`).
3. **`StudentProfile` (`api_studentprofile`)**: Demographic context (`user_id`, `program_id`, `admission_date`, `year_of_study`, `age_group`, `gender`, `state_of_domicile`).
4. **`DateDim` (`api_datedim`)**: Temporal dimension modeling academic calendars (`full_date`, `year`, `quarter`, `month`, `academic_year`).
5. **`FeedbackCategory` (`api_feedbackcategory`)**: Evaluation taxonomy (`category_name`, `category_group`: TEACHING, INFRASTRUCTURE, CAREER).

### 3.3 The Expanded 11-Category Data Matrix

To eliminate aggregate ambiguity, UniMetric standardizes evaluation across 11 granular categories grouped into three functional operational areas:

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

### 3.4 Native Handling of Sparse Data (The Hostel Gateway)
In traditional flat tables, optional or conditional questions (e.g., *Hostel & Accommodation* evaluated only by resident students) cause significant relational anomalies:
- Imputing `0` artificially degrades the college's overall average score.
- Imputing `NULL` requires conditional SQL functions (`COALESCE`, `NULLIF`) and breaks machine learning matrices.

**The Star Schema Advantage**:  
In UniMetric, a submission by a non-resident student (Day Scholar) simply creates **10 rows** in `FeedbackFact` instead of 11. The `Hostel & Accommodation` category row is omitted entirely from that submission's partition.
- **Relational Integrity**: Zero `NULL` cells exist in the fact table.
- **Mathematical Accuracy**: OLAP rollups like `Avg('score')` calculate across existing records only. Day scholars do not affect hostel metrics, and hostel conditions do not artificially drag down day scholar scores.
- **ML Matrix Imputation**: During data ingestion into pandas DataFrames ([`data_loader.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/ml_services/data_loader.py)), the wide matrix imputation assigns column means to missing values strictly for algorithms requiring rectangular arrays, leaving raw database records unpolluted.

---

## 4. Role-Based Access Control (RBAC) & Business Logic

UniMetric defines three distinct security and operational roles, enforced via client-side routing guards, dedicated navigation layouts, and backend business validation.

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
└────────────────────┴──────────────┴──────────────┴─────────────────────┤
```

### 4.1 Role Profiles & UI Routing Restrictions
1. **Prospect (Unauthenticated or Registered Applicant)**:
   - **Intent**: Prospective applicant researching colleges for prospective enrollment.
   - **Streamlined Navigation Layout**: In both [`Navbar.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/common/Navbar.jsx) and [`Sidebar.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/common/Sidebar.jsx), the Prospect navigation primarily displays **"Home"** and **"Compare Colleges"**. Individual institutional scorecards and ML insights are explored seamlessly by clicking on colleges directly from the Home page directory (`/college/:id`).
   - **Restrictions**: Cannot submit institutional feedback (`/submit-feedback` redirects to `/auth`).
2. **Student (Verified Enrolled Student)**:
   - **Intent**: Active campus attendee providing institutional feedback for their enrolled college.
   - **Streamlined Navigation Layout**: In both [`Navbar.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/common/Navbar.jsx) and [`Sidebar.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/common/Sidebar.jsx), the student interface is intentionally focused strictly on **"Home"** and **"Submit Feedback"**.
   - **Routing Restriction**: **Students are explicitly blocked from the "Compare Colleges" tool**. College comparison is an applicant-stage activity; enrolled students evaluate their current institution.
   - **Submission Entitlement**: Permitted to submit feedback once per verified academic year (`/submit-feedback`).
3. **Admin (Institutional Analyst / System Auditor)**:
   - **Intent**: Data auditor and quality assurance officer.
   - **Permissions**: Unrestricted access across all pages, including the `/admin` portal ([`AdminDashboardPage.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/pages/AdminDashboardPage.jsx)) displaying real-time submission logs, database counts, and the manual pipeline trigger `POST /api/analytics/refresh/`.

### 4.2 Backend Data Integrity & Anti-Spam Business Logic

#### Enforced Program Locking
A student's review is irrevocably locked to their enrolled academic degree program. During registration, the student selects their college and program. In [`SubmitReviewView`](file:///d:/Projects/DWMmini/UniMetric/backend/api/views.py#L304-L452), the backend ensures:
```python
# Program is locked to the registered student's profile
program = program or (profile.program if profile else None)
```
A computer science student cannot artificially submit feedback on behalf of the electrical engineering department.

#### Strict "One Review Per Academic Year" Anti-Spam Enforcement
Unlike standard web apps that use crude IP rate-limiting, UniMetric implements a dynamic temporal model based on the student's verified `admission_date`.

1. **Dynamic Academic Year Calculation**:  
   The helper [`calculate_year_of_study`](file:///d:/Projects/DWMmini/UniMetric/backend/api/views.py#L17-L55) determines the student's active academic year based on elapsed months between admission and the current date:
   $$\Delta_{months} = (Year_{current} - Year_{admission}) \times 12 + (Month_{current} - Month_{admission})$$
   $$YearOfStudy = \min\left(\max\left(\left\lfloor \frac{\Delta_{months}}{12} \right\rfloor + 1, 1\right), 4\right)$$

2. **Submission Verification & Duplicate Rejection**:  
   When a student attempts to submit a review (`POST /api/reviews/` or `GET /api/reviews/?user_id=...`), the API queries:
   ```python
   # Check if this user has already submitted for this specific academic year
   already_exists = FeedbackFact.objects.filter(
       Q(user_id=uid) | Q(student_profile__user_id=uid),
       student_profile__year_of_study=calculated_year
   ).exists()

   if already_exists:
       return Response({
           "error": f"You have already submitted a review for Year {calculated_year}. "
                    f"Students are limited to one review per academic year."
       }, status=400)
   ```
3. **Natural Progression**:  
   When a student is in Year 1, they may submit exactly one review. As soon as 12 calendar months elapse from their admission date, their calculated year increments to Year 2. The database automatically permits them to submit their Year 2 evaluation. This creates a clean longitudinal study across four academic years.

---

## 5. The DWM Analytics Engine & Machine Learning Mapping

The core academic differentiator of UniMetric is its comprehensive integration of Data Warehousing and Data Mining algorithms. To guarantee high-throughput web performance (<100ms API response time), heavy machine learning operations are executed asynchronously and cached in the **Analytical Insight Cache** (`CollegeInsightCache` and `GlobalInsightCache`).

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

### 5.1 OLAP Rollups & Aggregations
UniMetric implements multi-level SQL aggregations using Django ORM expressions:
- **Unique Submissions**: `Count('feedback__submission_id', distinct=True)`
- **Category Means**: `Avg('feedback__score')` grouped by `category__category_name`
- **Recommendation Percentage**: Caches boolean values into integer bits to compute exact ratios:
  $$\text{Recommend \%} = \text{Avg}(\text{Cast}(\text{would\_recommend}, \text{IntegerField}())) \times 100$$
- **Slice & Dice**: Filtered instantly by `program_id`, `student_profile__year_of_study`, or `date__academic_year`.

### 5.2 Ridge Regression: Key Rating Drivers
- **File**: [`backend/analytics/ml_services/regression_service.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/ml_services/regression_service.py)
- **Objective**: Quantify the relative marginal impact of each evaluation category on the overall institutional rating.
- **Mathematical Formulation**:  
  Standard Ordinary Least Squares (OLS) suffers from multicollinearity because students who rate teaching quality high often rate curriculum high. UniMetric applies **$L_2$-Regularized Ridge Regression**:
  $$\min_{\mathbf{w}} \left( \|\mathbf{y} - \mathbf{X}\mathbf{w}\|_2^2 + \alpha \|\mathbf{w}\|_2^2 \right), \quad \alpha = 1.0$$
- **Pipeline Implementation**:
  1. Features $\mathbf{X}$ are standardized using `StandardScaler` ($\mu = 0, \sigma = 1$).
  2. Missing categories (e.g. Day Scholars missing hostel scores) are imputed using category column means.
  3. Regression coefficients $w_j$ represent standardized feature importance weights ($\beta$).
- **Actionable Insight**:  
  Yields the **"Key Drivers"** ranking. For example, if $\beta_{\text{Curriculum Relevance}} = 0.42$ while $\beta_{\text{Wi-Fi}} = 0.08$, administrators know curriculum improvements will generate over $5\times$ more satisfaction lift than upgrading Wi-Fi routers.

### 5.3 Dual Supervised Classification Engine: Gaussian Naive Bayes & Decision Tree
- **File**: [`backend/analytics/ml_services/classification_service.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/ml_services/classification_service.py)
- **Target**: `would_recommend` (Binary boolean outcome: recommend or not).
- **Features**: Continuous rating vectors for all 11 categories combined with one-hot encoded qualitative sentiment (`sent_POSITIVE`, `sent_NEUTRAL`, `sent_NEGATIVE`).

#### 5.3.1 Gaussian Naive Bayes (Probabilistic Classifier)
- **Objective**: Classify recommendation probability without requiring deep neural architectures.
- **Mathematical Formulation**:  
  By Bayes' Theorem, with the conditional independence assumption between categories $x_1, \dots, x_n$:
  $$P(Y=1 \mid \mathbf{x}) = \frac{P(Y=1) \prod_{j=1}^n P(x_j \mid Y=1)}{\sum_{k \in \{0, 1\}} P(Y=k) \prod_{j=1}^n P(x_j \mid Y=k)}$$
  where continuous ratings $x_j$ follow Gaussian distributions:
  $$P(x_j \mid Y=k) = \frac{1}{\sqrt{2\pi\sigma_{jk}^2}} \exp\left( -\frac{(x_j - \mu_{jk})^2}{2\sigma_{jk}^2} \right)$$
- **Output**: Generates the **Predictive Recommend Score** (calibrated probability $P(Y=1)$) rendered via an interactive circular SVG gauge.

#### 5.3.2 Decision Tree Classifier (Entropy / Information Gain)
- **Objective**: Extract white-box decision logic and determine **Attribute Relevance** (identifying the top attributes that govern recommendation outcomes).
- **Mathematical Formulation**:  
  The decision tree optimizes splits via **Entropy** and **Information Gain** ($ID3$ / $CART$):
  $$\text{Entropy}(S) = - \sum_{i \in \{0, 1\}} p_i \log_2 p_i$$
  $$\text{Gain}(S, A) = \text{Entropy}(S) - \sum_{v \in \text{Values}(A)} \frac{|S_v|}{|S|} \text{Entropy}(S_v)$$
- **Configuration**: `criterion="entropy"`, `max_depth=4`, `random_state=42`.
- **Attribute Relevance Ranking**: Extracts the top 3 most important features based on Gini/Entropy reduction:
  $$\text{Feature Importance}(A) = \frac{\sum_{t \in \text{splits on } A} \Delta I(t)}{\sum_{t' \in \text{all splits}} \Delta I(t')}$$
  Provides percentage weights (e.g. *Teaching Quality: 41.2%*, *Positive Sentiment: 28.5%*, *Placements: 18.1%*).

#### 5.3.3 Side-by-Side Model Comparison
Rendered in [`ClassificationComparisonCard.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/insights/ClassificationComparisonCard.jsx):
- Displays side-by-side held-out test split accuracy cards for Naive Bayes and Decision Tree.
- Integrates the circular recommendation likelihood gauge alongside the top 3 attribute relevance chips.

### 5.4 Dual Unsupervised Clustering Engine: K-Means & Agglomerative Hierarchical
- **File**: [`backend/analytics/ml_services/clustering_service.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/ml_services/clustering_service.py)

#### 5.4.1 K-Means Clustering ($k=3$): Student Persona Cohort Segmentation
- **Objective**: Group student reviews into homogeneous satisfaction cohorts.
- **Mathematical Formulation**:  
  Partitions $n$ reviews into $k=3$ sets $\mathbf{S} = \{S_1, S_2, S_3\}$ minimizing within-cluster sum of squares:
  $$\arg\min_{\mathbf{S}} \sum_{i=1}^3 \sum_{\mathbf{x} \in S_i} \|\mathbf{x} - \boldsymbol{\mu}_i\|^2$$
- **Centroid Heuristic Classification**:
  1. **Highly Satisfied**: Highest centroid mean across all features.
  2. **Infrastructure-Critical**: Adequate academic scores, but severely degraded centroid means in infrastructure, hostel, Wi-Fi, or equipment.
  3. **Academically Challenged**: Discontent with faculty pace, curriculum depth, or library resources.
- **Display**: Rendered in [`SegmentBadgeList.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/insights/SegmentBadgeList.jsx) showing cohort distribution percentages and counts.

#### 5.4.2 Agglomerative Hierarchical Clustering (Ward's Linkage): Category Taxonomy Splits
- **Objective**: Discover natural structural groupings among evaluation categories by clustering the transposed sample matrix.
- **Mathematical Formulation**:  
  Bottom-up hierarchical merging where clusters are iteratively combined to minimize increase in total within-cluster variance (Ward's minimum variance criterion):
  $$\Delta \text{ESS}(A, B) = \frac{n_A n_B}{n_A + n_B} \|\boldsymbol{\mu}_A - \boldsymbol{\mu}_B\|^2$$
- **Implementation & Thematic Mapping**:
  - The feature space is transposed ($X \in \mathbb{R}^{\text{categories} \times \text{samples}}$).
  - `AgglomerativeClustering(n_clusters=3, linkage="ward")` is fitted.
  - Automatically identifies dominant themes using keyword matching:
    - **Academic Pedagogy & Curriculum**: Teaching Quality, Curriculum Relevance, Library & Resources.
    - **Career Pathways & Campus Culture**: Placements & Opportunities, Extracurriculars & Culture.
    - **Infrastructure & Campus Living**: Equipment, Cleanliness, Basic Amenities, Wi-Fi, Canteen, Hostel.
- **Computed Metrics**: Split branch labels (`Branch A`, `Branch B`, `Branch C`), category count, branch average satisfaction score, and qualitative summary.
- **Display**: Rendered in [`HierarchicalGroupingsCard.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/insights/HierarchicalGroupingsCard.jsx).

### 5.5 Apriori Association Rule Mining: Co-Occurring Weaknesses
- **File**: [`backend/analytics/ml_services/association_service.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/ml_services/association_service.py)
- **Objective**: Discover hidden operational dependencies where deficiencies in one campus domain trigger systemic failure or dissatisfaction.
- **Algorithm Workflow**:
  1. **Binarization**: Scores $\le 2$ are flagged as boolean transactions: `Low_<Category> = True`. Negative recommendations are encoded as `No_Recommend = True`.
  2. **Frequent Itemset Generation**: Implemented via `mlxtend.frequent_patterns.apriori` using a minimum support threshold $s \ge 0.05$.
  3. **Association Rule Extraction**: Rules $A \Rightarrow B$ filtered by minimum confidence $c \ge 0.40$ and sorted by **Lift**:
     $$\text{Support}(A \Rightarrow B) = P(A \cup B)$$
     $$\text{Confidence}(A \Rightarrow B) = \frac{P(A \cup B)}{P(A)}$$
     $$\text{Lift}(A \Rightarrow B) = \frac{P(A \cup B)}{P(A) \cdot P(B)}$$
- **Dashboard Output**: Rendered in [`AssociationRuleChips.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/insights/AssociationRuleChips.jsx):
  - Rule: `Low Infra Cleanliness + Low Canteen → No Recommend`
  - Metrics: Support: 0.18, Confidence: 0.85, Lift: 2.14 ($>1$ denotes a strong correlation rather than coincidental occurrence).

### 5.6 Analytical Cache Models & Pipeline Orchestration
- **Model**: `CollegeInsightCache` in [`backend/analytics/models.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/models.py):
  - `key_drivers`: JSON array of Ridge weights.
  - `cluster_summary`: JSON array of K-Means cohort profiles.
  - `association_rules`: JSON array of mined Apriori rules.
  - `predictive_recommend_score`: GaussianNB likelihood probability.
  - `classifier_accuracy`: GaussianNB test split accuracy.
  - `decision_tree_accuracy`: Decision Tree test split accuracy.
  - `decision_tree_top_features`: Top 3 attributes with percentage contributions.
  - `hierarchical_groupings`: Top-level agglomerative cluster splits with branch means.
- **Pipeline Runner**: Executed via `python manage.py run_analytics_pipeline` or triggered via admin endpoint `POST /api/analytics/refresh/`.

---

## 6. Core Features & UX Workflows

### 6.1 The 5-Part Conditional Feedback Submission Workflow
The feedback submission process ([`FeedbackForm.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/feedback/FeedbackForm.jsx)) guides students through an intuitive, validated five-part sequence:

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

### 6.2 Persona-Based Synthetic Mock Seeding Engine
To rigorously test machine learning algorithms without waiting months for organic survey collection, UniMetric includes a sophisticated **Persona Seeding Engine** ([`seed_mock_data.py`](file:///d:/Projects/DWMmini/UniMetric/backend/api/management/commands/seed_mock_data.py)). It generates 90 authentic reviews across benchmark colleges using realistic behavioral personas:

#### Seeded Benchmark Institutions
1. **Premier Tech Institute** (Autonomous, Bengaluru): High curriculum score (4.7) and placements (4.8), but mediocre hostel baseline (2.6).
2. **Heritage University** (Government, Kolkata): Exceptional library (4.8) and hostels (4.4), but outdated curriculum (2.2).
3. **Metro State College** (Government, Mumbai): Poor Wi-Fi (1.8) and poor hostel infrastructure (1.6).

#### The Three Seeded Behavioral Personas
1. **Persona A: "The Tech/Hackathon Enthusiast"**:
   - Heavy weighting on Wi-Fi, modern curriculum, and laboratory equipment.
   - **Behavioral Rule**: If `is_curriculum_modern == False`, the persona downrates *Placements* ($1-2$) and sets `would_recommend = False`.
2. **Persona B: "The Hosteler"**:
   - Resident student whose living scores (*Hostel*, *Canteen*, *Cleanliness*) are tightly coupled around the college baseline within a tight $\pm 0.4$ variance.
   - **Text Overrides**: If Hostel rating $<3$, complaints sample: *"Hostel rooms are cramped"*, *"Terrible Wi-Fi in the hostel"*, or *"Washrooms are rarely cleaned"*.
3. **Persona C: "The Day Scholar"**:
   - Completely omits the hostel category (exercises the Star Schema's sparse data tolerance).
   - Ratings concentrate on *Teaching Quality*, *Library Access*, and commute amenities.

### 6.3 The 5-Widget Data-Driven Insights Section
Rendered in [`DataDrivenInsightsSection.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/insights/DataDrivenInsightsSection.jsx) across a balanced 2-column grid:
1. **Widget 1: Key Rating Drivers**: Horizontal bar chart visualizing standardized Ridge coefficients ($\beta$) indicating which categories exert the strongest influence on overall satisfaction.
2. **Widget 2: Classification Comparison**: Dual-card layout presenting Gaussian Naive Bayes vs. Decision Tree test split accuracies, the predictive recommendation likelihood gauge, and the Decision Tree's top 3 attribute relevance chips.
3. **Widget 3: Student Segments (K-Means)**: Cohort breakdown displaying percentages and counts across *Highly Satisfied*, *Infrastructure-Critical*, and *Academically Challenged* student groups.
4. **Widget 4: Hierarchical Groupings (Agglomerative)**: Bottom-up cluster splits detailing the grouping of campus dimensions into overarching factor branches along with branch average scores.
5. **Widget 5: Co-Occurring Weaknesses (Apriori Rules)**: Full-width responsive chip container showing frequent low-rating association rules sorted by Lift.

---

## 7. Repository File Matrix & Verification

### 7.1 Key Source Files & Component Responsibilities

| Path | Primary Language | Architectural Role | Key Functions / Exports |
|---|---|---|---|
| [`backend/api/models.py`](file:///d:/Projects/DWMmini/UniMetric/backend/api/models.py) | Python (Django) | Star Schema Model Definitions | `College`, `Program`, `StudentProfile`, `DateDim`, `FeedbackCategory`, `FeedbackFact` |
| [`backend/api/views.py`](file:///d:/Projects/DWMmini/UniMetric/backend/api/views.py) | Python (DRF) | Core API Endpoints & Logic | `calculate_year_of_study`, `CollegeViewSet`, `CollegeSummaryView`, `SubmitReviewView` |
| [`backend/api/serializers.py`](file:///d:/Projects/DWMmini/UniMetric/backend/api/serializers.py) | Python (DRF) | Serialization & Validation | `CollegeListSerializer`, `ReviewSubmitSerializer`, `StudentRegistrationSerializer` |
| [`backend/analytics/models.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/models.py) | Python (Django) | Analytics Cache Models | `CollegeInsightCache` (dual classifiers, dual clustering fields), `GlobalInsightCache` |
| [`backend/analytics/serializers.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/serializers.py) | Python (DRF) | Analytics Serialization | `CollegeInsightSerializer` exposing `decisionTreeAccuracy`, `hierarchicalGroupings`, etc. |
| [`backend/analytics/views.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/views.py) | Python (DRF) | Analytics API Endpoints | `CollegeInsightsView`, `OverviewInsightsView`, `RefreshAnalyticsView` |
| [`backend/analytics/ml_services/data_loader.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/ml_services/data_loader.py) | Python (Pandas) | Star Schema $\rightarrow$ Matrix ETL | `load_feedback_wide`, `load_college_category_matrix` |
| [`backend/analytics/ml_services/regression_service.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/ml_services/regression_service.py) | Python (scikit-learn) | Driver Extraction | `train_regression` (Ridge with StandardScaler) |
| [`backend/analytics/ml_services/classification_service.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/ml_services/classification_service.py) | Python (scikit-learn) | Dual Supervised Classification | `train_classifier` (GaussianNB + DecisionTreeClassifier), `predict_recommend_score` |
| [`backend/analytics/ml_services/clustering_service.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/ml_services/clustering_service.py) | Python (scikit-learn) | Dual Unsupervised Clustering | `run_kmeans` ($k=3$), `cluster_summary_for_college`, `run_agglomerative` (Ward's Linkage) |
| [`backend/analytics/ml_services/association_service.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/ml_services/association_service.py) | Python (mlxtend) | Dependency Mining | `mine_association_rules` (Apriori frequent itemsets) |
| [`backend/analytics/management/commands/run_analytics_pipeline.py`](file:///d:/Projects/DWMmini/UniMetric/backend/analytics/management/commands/run_analytics_pipeline.py) | Python (Django) | ML Pipeline Command | End-to-end training: Ridge, GNB, Decision Tree, K-Means, Agglomerative, Apriori |
| [`backend/api/management/commands/seed_mock_data.py`](file:///d:/Projects/DWMmini/UniMetric/backend/api/management/commands/seed_mock_data.py) | Python (Django) | Synthetic Data Seeder | Authentic persona seeding (90 reviews, 11 categories) |
| [`src/context/RoleContext.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/context/RoleContext.jsx) | JavaScript (React) | Auth & RBAC State | `RoleProvider`, `useRole`, Supabase session sync |
| [`src/components/common/Navbar.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/common/Navbar.jsx) | JavaScript (React) | Top Navigation Bar | Role-specific link gating (Student strictly Home & Submit Feedback) |
| [`src/components/common/Sidebar.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/common/Sidebar.jsx) | JavaScript (React) | Responsive Sidebar | Role-specific routing matching Navbar restrictions |
| [`src/components/feedback/FeedbackForm.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/feedback/FeedbackForm.jsx) | JavaScript (React) | 5-Part Survey Workflow | 11 categories, conditional hostel switch, validation |
| [`src/pages/CollegeDashboardPage.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/pages/CollegeDashboardPage.jsx) | JavaScript (React) | Institutional Analytics Page | OLAP rollups, sentiment donuts, DWM educational badges |
| [`src/components/insights/DataDrivenInsightsSection.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/insights/DataDrivenInsightsSection.jsx) | JavaScript (React) | 5-Widget DWM Container | Houses KeyDrivers, ClassificationComparison, Segments, HierarchicalGroupings, Rules |
| [`src/components/insights/ClassificationComparisonCard.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/insights/ClassificationComparisonCard.jsx) | JavaScript (React) | Dual Classifier Card | Naive Bayes vs Decision Tree accuracy, recommend gauge, top 3 attributes |
| [`src/components/insights/HierarchicalGroupingsCard.jsx`](file:///d:/Projects/DWMmini/UniMetric/src/components/insights/HierarchicalGroupingsCard.jsx) | JavaScript (React) | Agglomerative Splits Card | Ward's linkage cluster splits, branch means, category tags |

### 7.2 System Verification Summary

The architecture, machine learning pipeline, and business rules have been verified through end-to-end testing:

| Verification Suite | Target Component | Validation Criteria | Status |
|---|---|---|---|
| **Database Connectivity** | Supabase Session Pooler | PostgreSQL connection established on port 5432 with `sslmode=require` | **VERIFIED** |
| **Warehouse Integrity** | Star Schema Migrations | All Django migrations applied across `api` and `analytics`; foreign keys verified | **VERIFIED** |
| **Dual Classification** | Supervised Pipeline | GaussianNB & Decision Tree trained, test split accuracies computed, top features extracted | **VERIFIED** |
| **Dual Clustering** | Unsupervised Pipeline | K-Means ($k=3$) student cohorts and Agglomerative Ward hierarchical splits populated | **VERIFIED** |
| **Association Rules** | Apriori Mining | Co-occurring low score patterns extracted with Support, Confidence, and Lift | **VERIFIED** |
| **Sparse Handling** | Day Scholar Submissions | Day Scholar submissions omit Hostel facts without raising schema or null exceptions | **VERIFIED** |
| **Temporal Anti-Spam** | Review Submission API | Submissions in the same academic year rejected with HTTP 400 | **VERIFIED** |
| **RBAC Enforcement** | Navigation & Tools | Student restricted to Home and Submit Feedback; Compare tool gated for Prospect | **VERIFIED** |
| **UI UX Performance** | Soft Neo-Brutalism UI | Responsive 5-widget ML insights grid, SVG gauges, and Recharts graphs rendered | **VERIFIED** |

---

*UniMetric: Developed as an authoritative Data Warehousing & Data Mining (DWM) platform for higher education analytics.*
