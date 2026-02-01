# Engine Health Prediction System

## Overview
This ML-powered system predicts engine health status (SAFE vs AT-RISK) and provides remedies to safeguard engine life.

---

## 🎯 Key Features

1. **Machine Learning Classification**
   - Predicts engine condition: HEALTHY (1) or AT RISK (0)
   - Random Forest model with 65% accuracy
   - Provides confidence scores for predictions

2. **Intelligent Remedy System**
   - Severity-based recommendations (CRITICAL, HIGH, MEDIUM, LOW)
   - Specific actions for each detected issue
   - Prioritized remedy suggestions

3. **Comprehensive Analysis**
   - Dataset insights and statistics
   - Feature importance ranking
   - Visual parameter distributions
   - Preventive maintenance guidelines

---

## 📊 Dataset Information

- **Total Records:** 19,535 engine measurements
- **Healthy Engines:** 12,317 (63.1%)
- **At-Risk Engines:** 7,218 (36.9%)

### Monitored Parameters
1. Engine RPM
2. Lub Oil Pressure (bar)
3. Fuel Pressure (bar)
4. Coolant Pressure (bar)
5. Lub Oil Temperature (°C)
6. Coolant Temperature (°C)

---

## 🔧 File Structure

### Core Application Files
- **`app.py`** - Flask web application (main entry point)
- **`engine_data.csv`** - Training dataset (19,535 records)
- **`requirements.txt`** - Python dependencies

### Model Files (Pre-trained)
- **`engine_health_model.pkl`** - Trained Random Forest model
- **`feature_names.pkl`** - Feature list
- **`feature_importance.pkl`** - Feature rankings

### Web Interface
- **`templates/index.html`** - Main web interface
- **`static/css/style.css`** - Styling
- **`static/js/script.js`** - Client-side logic

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Web Application
```bash
python app.py
```

### 3. Open Browser
Navigate to: **http://localhost:5000**

---

## 💻 Usage

### Web Interface
1. Enter current engine parameters:
   - Engine RPM
   - Oil Pressure (bar)
   - Fuel Pressure (bar)
   - Coolant Pressure (bar)
   - Oil Temperature (°C)
   - Coolant Temperature (°C)

2. Click "Analyze Engine Health"

3. View results:
   - Health status (HEALTHY / AT RISK)
   - Confidence percentage
   - Detected issues with severity levels
   - Specific remedies for each issue

1. 🔴 [CRITICAL] Critical Oil Temperature


---

## 📈 Model Performance

- **Accuracy:** 65.17%
- **Precision (At-Risk):** 53%
- **Recall (At-Risk):** 53%
- **Precision (Healthy):** 72%
- **Recall (Healthy):** 72%

### Feature Importance Ranking
1. **Engine RPM** (27.5%) - Most important
2. **Fuel Pressure** (16.4%)
3. **Oil Temperature** (15.3%)
4. **Oil Pressure** (14.2%)
5. **Coolant Temperature** (13.5%)
6. **Coolant Pressure** (13.1%)

---

## 🔍 Critical Thresholds

### CRITICAL (Immediate Action Required)
- Oil Pressure < 1.5 bar → STOP ENGINE
- Oil Temperature > 100°C → STOP ENGINE
- Coolant Temperature > 100°C → STOP ENGINE

### HIGH (Urgent Attention)
- Oil Pressure < 2.5 bar
- Oil Temperature > 90°C
- Coolant Temperature > 90°C
- RPM > 4000

### MEDIUM (Monitor & Plan)
- Fuel Pressure < 10 bar
- RPM > 3500
- Oil Temperature < 70°C

---

## 💡 Preventive Maintenance Schedule

### Daily
- Check oil and coolant levels
- Visual inspection for leaks

### Weekly
- Listen for unusual engine sounds
- Check for visible damage

### Monthly
- Monitor fuel system pressure
- Inspect belts and hoses

### Every 5,000 km
- Change engine oil and filter
- Check air filter

### Every 10,000 km
- Inspect cooling system
- Check spark plugs (if applicable)

### Every 20,000 km
- Replace fuel filter
- Comprehensive professional inspection

---

## 🚨 Understanding Predictions

### ✅ HEALTHY Status
- Engine parameters within normal range
- Continue regular maintenance
- Monitor periodically

### ⚠️ AT-RISK Status
- One or more parameters abnormal
- Follow recommended remedies immediately
- Priority based on severity level

### Severity Levels
- 🔴 **CRITICAL** - Stop engine, immediate action
- 🟠 **HIGH** - Urgent attention required
- 🟡 **MEDIUM** - Plan maintenance soon
- 🟢 **LOW** - Monitor and maintain schedule

---

## 📊 Key Insights from Analysis

### Healthy Engines Characteristics
- Average RPM: 736
- Average Oil Pressure: 3.35 bar
- Average Fuel Pressure: 6.90 bar
- Average Oil Temp: 77.4°C
- Average Coolant Temp: 78.2°C

### At-Risk Engines Characteristics
- Average RPM: 885 (Higher)
- Average Oil Pressure: 3.22 bar (Lower)
- Average Fuel Pressure: 6.24 bar (Lower)
- Average Oil Temp: 78.0°C (Higher)
- Average Coolant Temp: 78.8°C (Higher)

**Key Difference:** At-risk engines typically run at higher RPM with slightly elevated temperatures and lower fuel pressure.

---

## 🔧 Troubleshooting

### Common Issues

**1. Import errors (joblib, numpy, pandas)**
```
Solution: Install dependencies with: pip install -r requirements.txt
```

**2. Model performance questions**
```
The model achieves ~65% accuracy. Use as a diagnostic aid along with professional inspection.
```

**3. Port already in use**
```
Change the port in app.py: app.run(port=5001) or stop other services using port 5000
```

---

## 📝 Best Practices

1. **Regular Monitoring**
   - Check engine parameters weekly
   - Log readings for trend analysis
   - Act on warnings immediately

2. **Preventive Maintenance**
   - Follow the maintenance schedule
   - Use quality fluids and parts
   - Don't ignore warning signs

3. **Operating Guidelines**
   - Allow proper warm-up time
   - Avoid aggressive acceleration
   - Keep RPM in optimal range (< 3500)
   - Monitor temperature gauges

4. **When to Seek Professional Help**
   - CRITICAL severity warnings
   - Multiple HIGH severity issues
   - Recurring problems
   - Unusual engine behavior

---

## 🎓 Understanding the Model

### How It Works
1. Collects 6 engine parameters
2. Applies Random Forest algorithm
3. Classifies as HEALTHY (1) or AT RISK (0)
4. Provides confidence score
5. Analyzes parameters for issues
6. Suggests prioritized remedies

### Model Limitations
- 65% accuracy means some predictions may be uncertain
- Use as a diagnostic aid, not replacement for professional inspection
- Best combined with regular maintenance
- Confidence scores indicate prediction reliability

---

## 📞 Next Steps

### For Users
1. Train the model with your data
2. Test with sample scenarios
3. Use for real-time monitoring
4. Follow recommended maintenance

### For Developers
1. Improve model accuracy with more training data
2. Add real-time sensor integration
3. Implement historical tracking and trend analysis
4. Add mobile app support
5. Integrate with IoT devices

---

## ⚙️ Technical Requirements

- **Python 3.7+**
- **Dependencies:** Listed in `requirements.txt`

### Installation
```bash
pip install -r requirements.txt
```

Required packages:
- flask
- pandas
- numpy
- scikit-learn
- joblib
- matplotlib

---

## 🏆 Benefits

1. **Proactive Maintenance**
   - Predict issues before failure
   - Extend engine lifespan
   - Reduce repair costs

2. **Safety**
   - Identify critical issues
   - Prevent catastrophic failures
   - Ensure safe operation

3. **Cost Savings**
   - Avoid expensive repairs
   - Optimize maintenance timing
   - Reduce downtime

4. **Data-Driven Decisions**
   - Objective health assessment
   - Evidence-based recommendations
   - Performance tracking

---

## 📄 License & Disclaimer

This system is for diagnostic assistance only. Always consult qualified mechanics for critical engine issues. The model provides predictions based on historical data and should be used as one tool in a comprehensive maintenance program.

---

**Created:** January 2026
**Model Type:** Random Forest Classifier
**Dataset Size:** 19,535 engine measurements
**Accuracy:** 65.17%
