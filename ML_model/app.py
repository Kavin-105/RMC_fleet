from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import pandas as pd

app = Flask(__name__)

# Load the trained model
try:
    model = joblib.load("engine_health_model.pkl")
    feature_importance = joblib.load("feature_importance.pkl")
except:
    model = None
    feature_importance = None

def analyze_parameters(data):
    """Analyze parameters and return issues with remedies"""
    rpm, oil_p, fuel_p, cool_p, oil_t, cool_t = data
    issues = []
    
    # Oil Pressure Analysis
    if oil_p < 1.5:
        issues.append({
            "severity": "CRITICAL",
            "icon": "🔴",
            "issue": "Extremely Low Oil Pressure",
            "value": f"{oil_p:.2f} bar",
            "remedy": "STOP ENGINE IMMEDIATELY! Check for oil leaks, inspect oil pump, verify oil level",
            "color": "#dc3545"
        })
    elif oil_p < 2.5:
        issues.append({
            "severity": "HIGH",
            "icon": "🟠",
            "issue": "Low Oil Pressure",
            "value": f"{oil_p:.2f} bar",
            "remedy": "Refill engine oil, check oil filter, inspect oil pump condition",
            "color": "#fd7e14"
        })
    
    # Oil Temperature Analysis
    if oil_t > 100:
        issues.append({
            "severity": "CRITICAL",
            "icon": "🔴",
            "issue": "Critical Oil Temperature",
            "value": f"{oil_t:.1f}°C",
            "remedy": "STOP ENGINE! Replace oil immediately, check oil cooler, inspect lubrication system",
            "color": "#dc3545"
        })
    elif oil_t > 90:
        issues.append({
            "severity": "HIGH",
            "icon": "🟠",
            "issue": "High Oil Temperature",
            "value": f"{oil_t:.1f}°C",
            "remedy": "Change oil and filter, check oil cooler efficiency, reduce engine load",
            "color": "#fd7e14"
        })
    elif oil_t < 70:
        issues.append({
            "severity": "MEDIUM",
            "icon": "🟡",
            "issue": "Low Oil Temperature",
            "value": f"{oil_t:.1f}°C",
            "remedy": "Allow proper warm-up time, check thermostat operation",
            "color": "#ffc107"
        })
    
    # Coolant Temperature Analysis
    if cool_t > 100:
        issues.append({
            "severity": "CRITICAL",
            "icon": "🔴",
            "issue": "Engine Overheating",
            "value": f"{cool_t:.1f}°C",
            "remedy": "STOP ENGINE! Check radiator, inspect water pump, verify coolant level and quality",
            "color": "#dc3545"
        })
    elif cool_t > 90:
        issues.append({
            "severity": "HIGH",
            "icon": "🟠",
            "issue": "High Coolant Temperature",
            "value": f"{cool_t:.1f}°C",
            "remedy": "Flush and replace coolant, check radiator fans, inspect thermostat",
            "color": "#fd7e14"
        })
    
    # Coolant Pressure Analysis
    if cool_p < 1.0:
        issues.append({
            "severity": "HIGH",
            "icon": "🟠",
            "issue": "Low Coolant Pressure",
            "value": f"{cool_p:.2f} bar",
            "remedy": "Check for coolant leaks, inspect radiator cap, verify water pump operation",
            "color": "#fd7e14"
        })
    elif cool_p > 3.5:
        issues.append({
            "severity": "MEDIUM",
            "icon": "🟡",
            "issue": "High Coolant Pressure",
            "value": f"{cool_p:.2f} bar",
            "remedy": "Inspect cooling system for blockages, check radiator cap rating",
            "color": "#ffc107"
        })
    
    # Fuel Pressure Analysis
    if fuel_p < 5:
        issues.append({
            "severity": "HIGH",
            "icon": "🟠",
            "issue": "Very Low Fuel Pressure",
            "value": f"{fuel_p:.2f} bar",
            "remedy": "Check fuel pump, replace fuel filter, inspect fuel lines for blockages",
            "color": "#fd7e14"
        })
    elif fuel_p < 10:
        issues.append({
            "severity": "MEDIUM",
            "icon": "🟡",
            "issue": "Low Fuel Pressure",
            "value": f"{fuel_p:.2f} bar",
            "remedy": "Replace fuel filter, check fuel pump performance, verify fuel quality",
            "color": "#ffc107"
        })
    
    # RPM Analysis
    if rpm > 4000:
        issues.append({
            "severity": "HIGH",
            "icon": "🟠",
            "issue": "Excessive Engine RPM",
            "value": f"{rpm:.0f} RPM",
            "remedy": "Reduce engine load immediately, check throttle control, avoid over-revving",
            "color": "#fd7e14"
        })
    elif rpm > 3500:
        issues.append({
            "severity": "MEDIUM",
            "icon": "🟡",
            "issue": "High Engine RPM",
            "value": f"{rpm:.0f} RPM",
            "remedy": "Reduce load, optimize driving habits, shift to higher gear if applicable",
            "color": "#ffc107"
        })
    elif rpm < 400:
        issues.append({
            "severity": "MEDIUM",
            "icon": "🟡",
            "issue": "Very Low RPM",
            "value": f"{rpm:.0f} RPM",
            "remedy": "Check idle speed adjustment, inspect throttle body, verify air intake",
            "color": "#ffc107"
        })
    
    # Sort by severity
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    issues.sort(key=lambda x: severity_order[x["severity"]])
    
    return issues


@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')


@app.route('/predict', methods=['POST'])
def predict():
    """Handle prediction requests"""
    try:
        data = request.json
        
        # Extract parameters
        rpm = float(data.get('rpm', 0))
        oil_p = float(data.get('oil_pressure', 0))
        fuel_p = float(data.get('fuel_pressure', 0))
        cool_p = float(data.get('coolant_pressure', 0))
        oil_t = float(data.get('oil_temp', 0))
        cool_t = float(data.get('coolant_temp', 0))
        
        # Prepare input for model
        input_data = np.array([[rpm, oil_p, fuel_p, cool_p, oil_t, cool_t]])
        
        # Make prediction
        prediction = model.predict(input_data)[0]
        probability = model.predict_proba(input_data)[0]
        
        # Get status
        status = "HEALTHY" if prediction == 1 else "AT RISK"
        confidence = float(probability[1]) if prediction == 1 else float(probability[0])
        
        # Analyze parameters for issues
        issues = analyze_parameters([rpm, oil_p, fuel_p, cool_p, oil_t, cool_t])
        
        # Prepare response
        response = {
            'status': status,
            'confidence': round(confidence * 100, 1),
            'prediction': int(prediction),
            'issues': issues,
            'parameters': {
                'rpm': rpm,
                'oil_pressure': oil_p,
                'fuel_pressure': fuel_p,
                'coolant_pressure': cool_p,
                'oil_temp': oil_t,
                'coolant_temp': cool_t
            }
        }
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/stats')
def get_stats():
    """Get dataset statistics"""
    try:
        df = pd.read_csv("engine_data.csv")
        
        stats = {
            'total_records': len(df),
            'healthy': int((df['Engine Condition'] == 1).sum()),
            'at_risk': int((df['Engine Condition'] == 0).sum()),
            'healthy_pct': round((df['Engine Condition'] == 1).sum() / len(df) * 100, 1),
            'at_risk_pct': round((df['Engine Condition'] == 0).sum() / len(df) * 100, 1)
        }
        
        # Get feature importance
        if feature_importance is not None:
            stats['feature_importance'] = feature_importance.to_dict('records')
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'OK',
        'model_loaded': model is not None
    })


if __name__ == '__main__':
    print("="*60)
    print("🚀 ENGINE HEALTH PREDICTION WEB APPLICATION")
    print("="*60)
    print("\n✓ Server starting...")
    print("✓ Open your browser and navigate to:")
    print("\n   👉 http://localhost:5000")
    print("\n" + "="*60)
    app.run(debug=True, host='0.0.0.0', port=5000)
