from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("api/", include("stress_monitor.urls")),
    path("admin/", admin.site.urls),
]
