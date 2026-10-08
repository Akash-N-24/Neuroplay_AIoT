from django.core.management.base import BaseCommand,CommandError
from stress_monitor.csv_importer import import_stress_csv_file

class Command(BaseCommand):
    help="Import sensor readings from a CSV file into StressLog."
    def add_arguments(self,parser): parser.add_argument("csv_path")
    def handle(self,*args,**options):
        p=options["csv_path"]
        try:
            with open(p,encoding="utf-8-sig",newline="") as f: imported=import_stress_csv_file(f)
        except FileNotFoundError as exc: raise CommandError(f"CSV file not found: {p}") from exc
        except ValueError as exc: raise CommandError(str(exc)) from exc
        self.stdout.write(self.style.SUCCESS(f"Imported {imported} rows from {p}"))
