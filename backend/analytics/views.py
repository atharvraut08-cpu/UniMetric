from rest_framework import views
from rest_framework.response import Response
from django.core.management import call_command
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
        try:
            cache = CollegeInsightCache.objects.get(college_id=id)
        except CollegeInsightCache.DoesNotExist:
            return Response(
                {
                    "error": "No analytics computed yet for this college. "
                             "Run: python manage.py run_analytics_pipeline"
                },
                status=404,
            )
        serializer = CollegeInsightSerializer(cache)
        return Response(serializer.data)


class OverviewInsightsView(views.APIView):
    """
    GET /api/analytics/overview/
    Returns global analytics (category clusters + cross-college rules).
    """
    def get(self, request):
        try:
            cache = GlobalInsightCache.objects.get(singleton_key="GLOBAL")
        except GlobalInsightCache.DoesNotExist:
            return Response(
                {"error": "No global analytics computed yet. "
                          "Run: python manage.py run_analytics_pipeline"},
                status=404,
            )
        serializer = GlobalInsightSerializer(cache)
        return Response(serializer.data)


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
            return Response({
                "status": "success",
                "output": out.getvalue(),
            })
        except Exception as e:
            return Response({"status": "error", "detail": str(e)}, status=500)
