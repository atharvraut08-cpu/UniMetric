"""
run_analytics_pipeline.py
Django management command that orchestrates all 5 ML steps:
  1. Data loading (data_loader)
  2. Ridge regression per college (regression_service)
  3. GaussianNB classifier (global model, applied per college) (classification_service)
  4. K-Means clustering per college + Agglomerative on global matrix (clustering_service)
  5. Apriori association rules per college + global (association_service)

Results written to CollegeInsightCache and GlobalInsightCache.
Run manually: python manage.py run_analytics_pipeline
"""
import traceback
from django.core.management.base import BaseCommand
from api.models import College
from analytics.models import CollegeInsightCache, GlobalInsightCache
from analytics.ml_services.data_loader import (
    load_feedback_wide,
    get_category_columns,
    load_college_category_matrix,
)
from analytics.ml_services.regression_service import train_regression
from analytics.ml_services.classification_service import train_classifier, predict_recommend_score
from analytics.ml_services.clustering_service import cluster_summary_for_college, run_agglomerative
from analytics.ml_services.association_service import mine_association_rules
from analytics.ml_services.model_registry import save_model


class Command(BaseCommand):
    help = "Run all ML/data-mining analytics pipelines and persist results to cache tables."

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("=== Running Analytics Pipeline ==="))

        # ── Step 1: Load global dataset ────────────────────────────────────────
        self.stdout.write("Loading global feedback dataset...")
        global_df = load_feedback_wide()
        if global_df.empty:
            self.stdout.write(self.style.WARNING(
                "No feedback data found. Seed mock data first with: "
                "python manage.py seed_mock_data"
            ))
            return

        global_cat_cols = get_category_columns(global_df)
        self.stdout.write(f"  Categories: {global_cat_cols}")
        self.stdout.write(f"  Total submissions: {len(global_df)}")

        # ── Step 2: Global classifier (GaussianNB) ─────────────────────────────
        self.stdout.write("Training global GaussianNB classifier...")
        global_model, global_accuracy = train_classifier(global_df, global_cat_cols)
        if global_model:
            save_model("gnb_global", global_model)
            self.stdout.write(f"  Accuracy: {global_accuracy:.2%}")
        else:
            self.stdout.write(self.style.WARNING("  Insufficient data for classifier."))

        # ── Step 3: Per-college analytics ──────────────────────────────────────
        colleges = College.objects.all()
        for college in colleges:
            self.stdout.write(f"\nProcessing: {college.name} (id={college.id})")
            try:
                df_college = load_feedback_wide(college_id=college.id)
                if df_college.empty:
                    self.stdout.write(f"  [SKIP] No data, skipping.")
                    continue

                cat_cols = get_category_columns(df_college)
                n = len(df_college)
                self.stdout.write(f"  Submissions: {n}, Categories: {len(cat_cols)}")

                # Regression — key drivers
                impact_dict, reg_model, r2 = train_regression(df_college, cat_cols)
                if reg_model:
                    save_model(f"ridge_college_{college.id}", reg_model)
                key_drivers = [
                    {"category": cat, "impact": round(coef, 4)}
                    for cat, coef in impact_dict.items()
                ]
                self.stdout.write(f"  Regression R²: {r2:.3f}")

                # Classification — recommend score per college
                recommend_score = predict_recommend_score(global_model, df_college, cat_cols)

                # Clustering — K-Means segment distribution
                cluster_summary = cluster_summary_for_college(df_college, cat_cols)
                self.stdout.write(f"  Clusters: {[s['segment'] for s in cluster_summary]}")

                # Association rules — per college
                assoc_rules = mine_association_rules(df_college, cat_cols)
                self.stdout.write(f"  Association rules found: {len(assoc_rules)}")

                # Persist to cache
                CollegeInsightCache.objects.update_or_create(
                    college=college,
                    defaults={
                        "key_drivers": key_drivers,
                        "cluster_summary": cluster_summary,
                        "association_rules": assoc_rules,
                        "predictive_recommend_score": recommend_score,
                        "classifier_accuracy": global_accuracy if global_model else None,
                    },
                )
                self.stdout.write(self.style.SUCCESS(f"  [OK] Cache updated."))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  [ERR] Error: {e}"))
                traceback.print_exc()

        # ── Step 4: Global analytics ───────────────────────────────────────────
        self.stdout.write("\nRunning global analytics...")
        try:
            # Agglomerative clustering on category matrix
            college_category_matrix = load_college_category_matrix()
            if not college_category_matrix.empty:
                cat_clusters = run_agglomerative(college_category_matrix)
                self.stdout.write(f"  Category clusters: {[g['group'] for g in cat_clusters]}")
            else:
                cat_clusters = []

            # Global association rules
            cross_college_rules = mine_association_rules(global_df, global_cat_cols)
            self.stdout.write(f"  Global rules found: {len(cross_college_rules)}")

            GlobalInsightCache.objects.update_or_create(
                singleton_key="GLOBAL",
                defaults={
                    "category_clusters": cat_clusters,
                    "cross_college_rules": cross_college_rules,
                },
            )
            self.stdout.write(self.style.SUCCESS("[OK] Global cache updated."))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"[ERR] Global analytics error: {e}"))
            traceback.print_exc()

        self.stdout.write(self.style.SUCCESS("\n=== Analytics Pipeline Complete ==="))
