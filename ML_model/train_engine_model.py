import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from xgboost import XGBClassifier
import joblib

print("="*60)
print("ENGINE HEALTH PREDICTION MODEL - TRAINING (XGBOOST)")
print("="*60)

# 1. Load dataset
df = pd.read_csv("engine_data.csv")

print(f"\n✓ Loaded dataset: {df.shape[0]} records, {df.shape[1]} features")

print("\nDataset Info:")
print(f"Healthy Engines (1): {(df['Engine Condition'] == 1).sum()}")
print(f"At-Risk Engines (0): {(df['Engine Condition'] == 0).sum()}")

# 2. Split features and target
X = df.drop("Engine Condition", axis=1)
y = df["Engine Condition"]

# 3. Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\n✓ Data split: {len(X_train)} training, {len(X_test)} testing samples")

# 4. Train model
print("\n⏳ Training XGBoost model...")

model = XGBClassifier(
    n_estimators=500,
    max_depth=2,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    n_jobs=-1,
    eval_metric="logloss"
)

model.fit(X_train, y_train)

print("✓ Model training completed!")

# 5. Evaluate
y_pred = model.predict(X_test)

print("\n" + "="*60)
print("MODEL PERFORMANCE")
print("="*60)

print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")

print("\nClassification Report:")
print(classification_report(
    y_test,
    y_pred,
    target_names=['At Risk (0)', 'Healthy (1)']
))

# Confusion Matrix
cm = confusion_matrix(y_test, y_pred)

print("\nConfusion Matrix:")
print(f"              Predicted At-Risk  Predicted Healthy")
print(f"Actual At-Risk      {cm[0][0]:6d}            {cm[0][1]:6d}")
print(f"Actual Healthy      {cm[1][0]:6d}            {cm[1][1]:6d}")

# 6. Feature Importance
feature_importance = pd.DataFrame({
    'Feature': X.columns,
    'Importance': model.feature_importances_
}).sort_values(by="Importance", ascending=False)

print("\n" + "="*60)
print("FEATURE IMPORTANCE")
print("="*60)

for idx, row in feature_importance.iterrows():
    print(f"{row['Feature']:25s} : {row['Importance']:.4f}")

# 7. Save model
joblib.dump(model, "engine_health_model_xgboost.pkl")
joblib.dump(list(X.columns), "feature_names.pkl")
joblib.dump(feature_importance, "feature_importance.pkl")

print("\n✓ Model saved as engine_health_model_xgboost.pkl")
print("✓ Feature names saved")
print("✓ Feature importance saved")

print("="*60)