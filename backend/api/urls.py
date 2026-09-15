from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CollegeViewSet, 
    CollegeSummaryView, 
    CollegeCompareView, 
    CollegeReviewsView, 
    ProgramViewSet, 
    SubmitReviewView
)

router = DefaultRouter()
router.register(r'colleges', CollegeViewSet, basename='college')
router.register(r'programs', ProgramViewSet, basename='program')

urlpatterns = [
    # API Router for basic list endpoints
    path('', include(router.urls)),
    
    # Custom endpoints
    path('colleges/<int:id>/summary/', CollegeSummaryView.as_view(), name='college-summary'),
    path('colleges/<int:id>/reviews/', CollegeReviewsView.as_view(), name='college-reviews'),
    path('colleges/compare/', CollegeCompareView.as_view(), name='college-compare'),
    path('reviews/', SubmitReviewView.as_view(), name='submit-review'),
]
