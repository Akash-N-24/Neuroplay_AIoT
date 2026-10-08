from django.contrib import admin
from .inference import predict_stress_label
from .models import SensorData,StressLog

@admin.register(SensorData)
class SensorDataAdmin(admin.ModelAdmin):
    list_display=("bpm","rmssd","hrv","stress_level","timestamp")
    readonly_fields=("stress_level","timestamp")

@admin.register(StressLog)
class StressLogAdmin(admin.ModelAdmin):
    list_display=("hr","rmssd","hrv","stress_level","timestamp")
    readonly_fields=("stress_level","timestamp")
    def save_model(self,request,obj,form,change):
        obj.stress_level=predict_stress_label(obj.hr,obj.rmssd,obj.hrv)
        super().save_model(request,obj,form,change)
