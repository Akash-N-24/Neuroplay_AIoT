from django.db import models
from django.utils import timezone

class SensorData(models.Model):
    bpm = models.FloatField()
    rmssd = models.FloatField()
    hrv = models.FloatField()
    stress_level = models.CharField(max_length=20, default="Unknown")
    timestamp = models.DateTimeField(auto_now_add=True)

class StressLog(models.Model):
    hr = models.FloatField()
    hrv = models.FloatField()
    rmssd = models.FloatField()
    stress_level = models.CharField(max_length=20, default="Unknown")
    timestamp = models.DateTimeField(default=timezone.now)
