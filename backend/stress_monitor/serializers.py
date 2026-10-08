from rest_framework import serializers
from .models import StressLog

class StressLogSerializer(serializers.ModelSerializer):
    stress_level = serializers.CharField(read_only=True)
    class Meta:
        model = StressLog
        fields = ["id","hr","rmssd","hrv","stress_level","timestamp"]
        read_only_fields = ["id","timestamp"]
