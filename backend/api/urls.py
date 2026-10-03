from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CollegeViewSet, 
    CollegeSummaryView, 
    CollegeCompareView, 
    CollegeReviewsView, 
    CollegeDashboardBundleView,
    ProgramViewSet, 
    SubmitReviewView,
    StudentRegisterView,
    AdminSystemSummaryView
)

router = DefaultRouter()
router.register(r'colleges', CollegeViewSet, basename='college')
router.register(r'programs', ProgramViewSet, basename='program')

urlpatterns = [
    # Admin system analytics
    path('admin/system-summary/', AdminSystemSummaryView.as_view(), name='admin-system-summary'),

    # Custom endpoints (must come before router.urls to prevent /colleges/<pk>/ from capturing /colleges/compare/)
    path('colleges/compare/', CollegeCompareView.as_view(), name='college-compare'),
    path('colleges/<int:id>/dashboard-bundle/', CollegeDashboardBundleView.as_view(), name='college-dashboard-bundle'),
    path('colleges/<int:id>/summary/', CollegeSummaryView.as_view(), name='college-summary'),
    path('colleges/<int:id>/reviews/', CollegeReviewsView.as_view(), name='college-reviews'),
    path('reviews/', SubmitReviewView.as_view(), name='submit-review'),
    path('students/register/', StudentRegisterView.as_view(), name='student-register'),

    # API Router for basic list endpoints
    path('', include(router.urls)),
]
