from django.db import migrations, models
class Migration(migrations.Migration):
    initial=True
    dependencies=[]
    operations=[migrations.CreateModel(name="SensorData",fields=[
        ("id",models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name="ID")),
        ("bpm",models.FloatField()),("rmssd",models.FloatField()),("hrv",models.FloatField()),
        ("stress_level",models.CharField(default="Unknown",max_length=20)),
        ("timestamp",models.DateTimeField(auto_now_add=True)),
    ])]
