import django.utils.timezone
from django.db import migrations, models
class Migration(migrations.Migration):
    dependencies=[("stress_monitor","0002_stresslog")]
    operations=[migrations.AlterField(model_name="stresslog",name="timestamp",field=models.DateTimeField(default=django.utils.timezone.now))]
