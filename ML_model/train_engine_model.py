import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib

print("="*60)
print("ENGINE HEALTH PREDICTION MODEL - TRAINING")
print("="*60)

# 1. Load dataset
df = pd.read_csv("engine_data.csv")
print(f"\n✓ Loaded dataset: {df.shape[0]} records, {df.shape[1]} features")
print(f"\nDataset Info:")
print(f"  - Healthy Engines (1): {(df['Engine Condition'] == 1).sum()}")
print(f"  - At-Risk Engines (0): {(df['Engine Condition'] == 0).sum()}")

# 2. Split features and target
X = df.drop("Engine Condition", axis=1)
y = df["Engine Condition"]

# 3. Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\n✓ Data split: {len(X_train)} training, {len(X_test)} testing samples")

# 4. Train model
print("\n⏳ Training Random Forest model...")
model = RandomForestClassifier(
    n_estimators=200,
    max_depth=15,
    min_samples_split=5,
    random_state=42,
    class_weight="balanced",
    n_jobs=-1
)
model.fit(X_train, y_train)
print("✓ Model training completed!")

# 5. Evaluate
y_pred = model.predict(X_test)
y_pred_proba = model.predict_proba(X_test)

print("\n" + "="*60)
print("MODEL PERFORMANCE")
print("="*60)
print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
print("\nDetailed Classification Report:")
print(classification_report(y_test, y_pred, 
                          target_names=['At Risk (0)', 'Healthy (1)']))

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
}).sort_values('Importance', ascending=False)

print("\n" + "="*60)
print("FEATURE IMPORTANCE (Impact on Engine Health)")
print("="*60)
for idx, row in feature_importance.iterrows():
    print(f"{row['Feature']:25s} : {row['Importance']:.4f}")

# 7. Save model and feature names
joblib.dump(model, "engine_health_model.pkl")
joblib.dump(list(X.columns), "feature_names.pkl")
joblib.dump(feature_importance, "feature_importance.pkl")

print("\n" + "="*60)
print("✓ Model saved as: engine_health_model.pkl")
print("✓ Feature names saved as: feature_names.pkl")
print("✓ Feature importance saved as: feature_importance.pkl")
print("="*60)
