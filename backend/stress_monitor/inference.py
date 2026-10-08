from functools import lru_cache
from django.conf import settings
import joblib
import pandas as pd

LABEL_MAP={0:"Normal",1:"Moderate",2:"High"}

def _heuristic_stress_label(hr,rmssd,hrv):
    hr,rmssd,hrv=float(hr),float(rmssd),float(hrv)
    if hr>=105 and hrv<=45 and rmssd<=35: return "High"
    if hr>=90 and hrv<=55 and rmssd<=45: return "Moderate"
    return "Normal"

def _model_dir():
    return settings.BASE_DIR.parent/"ai-model"

@lru_cache(maxsize=1)
def load_model_bundle():
    return joblib.load(_model_dir()/"stress_model_final.pkl"), joblib.load(_model_dir()/"feature_columns.pkl")

def build_feature_frame(hr,rmssd,hrv):
    mean_hr=float(hr); rmssd_value=float(rmssd); hrv_value=float(hrv)
    mean_nn=60000.0/mean_hr if mean_hr>0 else 0.0
    # Preserves the supplied deployment implementation; not a raw-interval pNN50 recomputation.
    pnn50=(rmssd_value/hrv_value*100.0) if hrv_value>0 else 0.0
    pnn50=max(0.0,min(100.0,pnn50))
    _,feature_columns=load_model_bundle()
    values={"mean_hr":mean_hr,"rmssd":rmssd_value,"sdnn":hrv_value,"mean_nn":mean_nn,"pnn50":pnn50}
    return pd.DataFrame([[values[c] for c in feature_columns]],columns=feature_columns)

def predict_stress_label(hr,rmssd,hrv):
    model,_=load_model_bundle()
    model_label=LABEL_MAP.get(int(model.predict(build_feature_frame(hr,rmssd,hrv))[0]),"Unknown")
    heuristic=_heuristic_stress_label(hr,rmssd,hrv)
    if heuristic=="High": return "High"
    if heuristic=="Moderate" and model_label=="Normal": return "Moderate"
    return model_label if model_label!="Unknown" else heuristic
