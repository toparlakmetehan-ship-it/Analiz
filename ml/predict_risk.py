# predict_risk.py
"""
Load the trained XGBoost model (model.pkl) and enriched horse data.
For each horse, predict `finish_time` and compute a simple risk score:
    risk = 100 * (pred - mean) / std
Clipped to 0‑100.
The script writes a new JSON per horse into `public/data/with_risk/` with an added
`risk_score` field.
"""
import os, json, glob
import joblib
import numpy as np
import pandas as pd

MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), 'model.pkl'))
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../public/data/enriched'))
OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '../public/data/with_risk'))
os.makedirs(OUT_DIR, exist_ok=True)

model = joblib.load(MODEL_PATH)

records = []
for fp in glob.glob(os.path.join(DATA_DIR, '*.json')):
    with open(fp, 'r', encoding='utf-8') as f:
        rec = json.load(f)
        records.append(rec)

df = pd.DataFrame(records)
# Apply same featurization as training
from train_model import featurize
X = featurize(df.drop(columns=['finish_time']))
X = X.apply(pd.to_numeric, errors='coerce').fillna(0)

preds = model.predict(X)
mean, std = preds.mean(), preds.std()

for rec, pred in zip(records, preds):
    risk = 100 * (pred - mean) / std
    risk = max(0, min(100, risk))
    rec['predicted_finish_time'] = float(pred)
    rec['risk_score'] = round(risk, 2)
    out_path = os.path.join(OUT_DIR, f"{rec['horse_id']}.json")
    with open(out_path, 'w', encoding='utf-8') as f:
        # Convert possible numpy scalar types to native Python types
        safe_rec = {}
        for k, v in rec.items():
            if isinstance(v, (np.floating, np.integer)):
                safe_rec[k] = float(v)
            else:
                safe_rec[k] = v
        json.dump(safe_rec, f, ensure_ascii=False, indent=2)

print(f'Generated risk scores for {len(records)} horses in {OUT_DIR}')
