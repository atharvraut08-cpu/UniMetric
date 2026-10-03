from rest_framework import views
from rest_framework.response import Response
from django.core.management import call_command
from django.core.cache import cache
from io import StringIO
from .models import CollegeInsightCache, GlobalInsightCache
from .serializers import CollegeInsightSerializer, GlobalInsightSerializer


class CollegeInsightsView(views.APIView):
    """
    GET /api/analytics/college/<id>/insights/
    Returns pre-computed ML insights for a specific college.
    Only reads from CollegeInsightCache — no training happens here.
    """
    def get(self, request, id):
        cache_key = f"college_insights_{id}"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)

        try:
            insight_obj = CollegeInsightCache.objects.get(college_id=id)
        except CollegeInsightCache.DoesNotExist:
            return Response(
                {
                    "error": "No analytics computed yet for this college. "
                             "Run: python manage.py run_analytics_pipeline"
                },
                status=404,
            )
        serializer = CollegeInsightSerializer(insight_obj)
        data = serializer.data
        cache.set(cache_key, data, timeout=600)
        return Response(data)


class OverviewInsightsView(views.APIView):
    """
    GET /api/analytics/overview/
    Returns global analytics (category clusters + cross-college rules).
    """
    def get(self, request):
        cache_key = "global_insights_overview"
        cached_data = cache.get(cache_key)
        if cached_data is not None:
            return Response(cached_data)

        try:
            insight_obj = GlobalInsightCache.objects.get(singleton_key="GLOBAL")
        except GlobalInsightCache.DoesNotExist:
            return Response(
                {"error": "No global analytics computed yet. "
                          "Run: python manage.py run_analytics_pipeline"},
                status=404,
            )
        serializer = GlobalInsightSerializer(insight_obj)
        data = serializer.data
        cache.set(cache_key, data, timeout=600)
        return Response(data)


class RefreshAnalyticsView(views.APIView):
    """
    POST /api/analytics/refresh/
    Synchronously triggers run_analytics_pipeline (acceptable for demo scale).
    No Celery/Redis — kept minimal per PRD Section 3.
    """
    def post(self, request):
        try:
            out = StringIO()
            call_command("run_analytics_pipeline", stdout=out)
            # Clear all cached ML insights and college summaries
            cache.clear()
            global_cache = GlobalInsightCache.objects.first()
            last_run = global_cache.computed_at.isoformat() if global_cache else None
            return Response({
                "status": "success",
                "output": out.getvalue(),
                "last_run": last_run,
            })
        except Exception as e:
            return Response({"status": "error", "detail": str(e)}, status=500)
