from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies=[("stress_monitor","0001_initial")]
    operations=[migrations.CreateModel(name="StressLog",fields=[
        ("id",models.BigAutoField(auto_created=True,primary_key=True,serialize=False,verbose_name="ID")),
        ("hr",models.FloatField()),("hrv",models.FloatField()),("rmssd",models.FloatField()),
        ("stress_level",models.CharField(default="Unknown",max_length=20)),
        ("timestamp",models.DateTimeField(auto_now_add=True)),
    ])]
