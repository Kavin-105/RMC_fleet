"""
Fuel Efficiency Prediction Model
Predicts fuel consumption (km/l) based on vehicle & driving patterns.
Uses synthetic training data based on fleet parameters.
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

def generate_fuel_data(n_samples=5000):
    """Generate realistic synthetic fuel efficiency data for fleet vehicles"""
    np.random.seed(42)
    
    # Features
    vehicle_age = np.random.uniform(0, 15, n_samples)  # years
    odometer = vehicle_age * np.random.uniform(15000, 40000, n_samples)  # km
    engine_hours = vehicle_age * np.random.uniform(300, 800, n_samples)  # hours
    load_factor = np.random.uniform(0.2, 1.0, n_samples)  # fraction of max capacity
    avg_speed = np.random.uniform(20, 80, n_samples)  # km/h
    idle_time_pct = np.random.uniform(5, 40, n_samples)  # % of total time idling
    tire_pressure_ok = np.random.choice([0, 1], n_samples, p=[0.2, 0.8])
    ac_usage = np.random.choice([0, 1], n_samples, p=[0.4, 0.6])
    maintenance_score = np.random.uniform(40, 100, n_samples)  # maintenance compliance
    
    # Base efficiency (km/l) - typical for fleet trucks/vehicles
    base_efficiency = 8.0
    
    # Factors affecting efficiency
    efficiency = base_efficiency \
        - vehicle_age * 0.15 \
        - (odometer / 100000) * 0.3 \
        - load_factor * 2.5 \
        + np.where((avg_speed > 40) & (avg_speed < 60), 1.0, -0.5) \
        - idle_time_pct * 0.05 \
        + tire_pressure_ok * 0.4 \
        - ac_usage * 0.3 \
        + maintenance_score * 0.02 \
        + np.random.normal(0, 0.5, n_samples)  # noise
    
    efficiency = np.clip(efficiency, 2.0, 14.0)
    
    df = pd.DataFrame({
        'vehicle_age': np.round(vehicle_age, 1),
        'odometer_km': np.round(odometer, 0).astype(int),
        'engine_hours': np.round(engine_hours, 0).astype(int),
        'load_factor': np.round(load_factor, 2),
        'avg_speed_kmh': np.round(avg_speed, 1),
        'idle_time_pct': np.round(idle_time_pct, 1),
        'tire_pressure_ok': tire_pressure_ok,
        'ac_usage': ac_usage,
        'maintenance_score': np.round(maintenance_score, 1),
        'fuel_efficiency_kml': np.round(efficiency, 2)
    })
    
    return df

def train_model():
    data_file = 'fuel_data.csv'
    
    if os.path.exists(data_file):
        print(f"Loading data from {data_file}...")
        df = pd.read_csv(data_file)
    else:
        print("Generating synthetic fuel efficiency data...")
        df = generate_fuel_data()
        df.to_csv(data_file, index=False)
        print(f"Saved {len(df)} records to {data_file}")
    
    features = ['vehicle_age', 'odometer_km', 'engine_hours', 'load_factor',
                 'avg_speed_kmh', 'idle_time_pct', 'tire_pressure_ok', 'ac_usage',
                 'maintenance_score']
    
    X = df[features]
    y = df['fuel_efficiency_kml']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training Gradient Boosting model...")
    model = GradientBoostingRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.1,
        min_samples_split=10,
        random_state=42
    )
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"\n--- Model Performance ---")
    print(f"MAE: {mae:.3f} km/l")
    print(f"R² Score: {r2:.3f}")
    
    # Feature importance
    importance = pd.DataFrame({
        'feature': features,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    print(f"\nFeature Importance:\n{importance.to_string(index=False)}")
    
    joblib.dump(model, 'fuel_efficiency_model.pkl')
    joblib.dump(importance, 'fuel_feature_importance.pkl')
    print("\nModel saved to fuel_efficiency_model.pkl")
    
    return model, importance

if __name__ == '__main__':
    train_model()
