from django.urls import path
from .views import CsvImportView, HistoryView, SensorDataCreateView

urlpatterns=[
    path("import-csv/",CsvImportView.as_view(),name="import-csv"),
    path("history/",HistoryView.as_view(),name="history"),
    path("sensor-data/",SensorDataCreateView.as_view(),name="sensor-data-create"),
]
