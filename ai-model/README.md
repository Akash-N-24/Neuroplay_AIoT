# NeuroPlay AI Model Assets

This directory contains the training/evaluation notebook and the trained Random Forest model bundle used by the backend.

Expected files:

- model.ipynb — training and LOSO evaluation workflow.
- feature_columns.pkl — saved feature order.
- stress_model_final.pkl — trained Random Forest model.

The binary model files are pinned to the supplied NeuroPlay source repository and are imported by the repository GitHub Actions workflow when Actions execution is available. The workflow uses a fixed upstream commit so the imported assets remain reproducible.

Current feature order:

1. mean_hr
2. rmssd
3. sdnn
4. mean_nn
5. pnn50

Do not retrain or replace the model merely to change repository structure; model changes should be treated as research changes and reflected in the paper and evaluation records.
