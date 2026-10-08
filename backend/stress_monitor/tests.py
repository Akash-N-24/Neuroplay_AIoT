from django.core.management import call_command
from django.urls import reverse
from rest_framework.test import APITestCase
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile
from .inference import predict_stress_label
from .models import StressLog

class SensorDataApiTests(APITestCase):
    def test_moderate_rule(self):
        self.assertEqual(predict_stress_label(95,40,50),"Moderate")

    def test_high_rule(self):
        self.assertEqual(predict_stress_label(120,20,30),"High")

    def test_csv_upload(self):
        data=b"hr,rmssd,hrv,timestamp\n78.5,42.1,57.3,2026-07-09T10:15:30Z\n72,50,60,2026-07-09T10:16:30Z\n"
        response=self.client.post(reverse("import-csv"),{"file":SimpleUploadedFile("stress.csv",data,content_type="text/csv")},format="multipart")
        self.assertEqual(response.status_code,201)
        self.assertEqual(response.data["imported"],2)

    def test_history_limit(self):
        for i in range(5): StressLog.objects.create(hr=70+i,rmssd=45+i,hrv=58+i,stress_level="Normal")
        response=self.client.get(reverse("history")+"?limit=3")
        self.assertEqual(response.status_code,200)
        self.assertEqual(len(response.data),3)

    def test_post_sensor_data(self):
        payload={"hr":78.5,"rmssd":42.1,"hrv":57.3}
        response=self.client.post(reverse("sensor-data-create"),payload,format="json")
        self.assertEqual(response.status_code,201)
        self.assertEqual(StressLog.objects.count(),1)
        self.assertEqual(response.data["stress_level"],predict_stress_label(**payload))
