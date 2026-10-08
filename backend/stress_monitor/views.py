from django.http import HttpResponse
from django.utils.html import escape
from rest_framework import status
from rest_framework.parsers import FormParser,MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .csv_importer import import_stress_csv_file
from .inference import predict_stress_label
from .models import StressLog
from .serializers import StressLogSerializer

class SensorDataCreateView(APIView):
    permission_classes=[AllowAny]
    def get(self,request,*args,**kwargs):
        return Response(StressLogSerializer(StressLog.objects.order_by("-timestamp"),many=True).data)
    def post(self,request,*args,**kwargs):
        s=StressLogSerializer(data=request.data); s.is_valid(raise_exception=True)
        label=predict_stress_label(s.validated_data["hr"],s.validated_data["rmssd"],s.validated_data["hrv"])
        obj=s.save(stress_level=label)
        return Response(StressLogSerializer(obj).data,status=status.HTTP_201_CREATED)

class HistoryView(APIView):
    permission_classes=[AllowAny]
    def get(self,request,*args,**kwargs):
        try: limit=int(request.query_params.get("limit",10))
        except (TypeError,ValueError): limit=10
        if limit<1: limit=10
        qs=StressLog.objects.order_by("-timestamp")[:limit]
        return Response(StressLogSerializer(qs,many=True).data)

class CsvImportView(APIView):
    permission_classes=[AllowAny]
    parser_classes=[MultiPartParser,FormParser]
    def get(self,request,*args,**kwargs):
        return HttpResponse("<h1>Import Stress CSV</h1><form method='post' enctype='multipart/form-data'><input type='file' name='file' accept='.csv,text/csv' required><button>Upload</button></form>",content_type="text/html")
    def post(self,request,*args,**kwargs):
        f=request.FILES.get("file")
        if f is None: return Response({"detail":"Upload a CSV file using the 'file' field."},status=400)
        try: imported=import_stress_csv_file(f)
        except ValueError as exc: return Response({"detail":escape(str(exc))},status=400)
        return Response({"imported":imported},status=status.HTTP_201_CREATED)
