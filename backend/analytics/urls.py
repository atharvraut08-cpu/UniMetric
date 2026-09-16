from django.urls import path
from .views import CollegeInsightsView, OverviewInsightsView, RefreshAnalyticsView

urlpatterns = [
    path("college/<int:id>/insights/", CollegeInsightsView.as_view(), name="college-insights"),
    path("overview/", OverviewInsightsView.as_view(), name="overview-insights"),
    path("refresh/", RefreshAnalyticsView.as_view(), name="refresh-analytics"),
]
