import { useState, useEffect } from 'react';
import { Activity, Truck, AlertTriangle, CheckCircle, Loader2, Wrench, Gauge, Thermometer, Droplets, Fuel as FuelIcon, RotateCcw, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui';
import { vehicleService, authService } from '../../services';
import './DriverEngineHealth.css';

export function DriverEngineHealth() {
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [predicting, setPredicting] = useState(false);
    const [prediction, setPrediction] = useState(null);
    const [healthScore, setHealthScore] = useState(null);
    const [loadingScore, setLoadingScore] = useState(false);
    const [engineData, setEngineData] = useState({
        rpm: 800,
        oil_pressure: 3.5,
        fuel_pressure: 12,
        coolant_pressure: 2.5,
        oil_temp: 80,
        coolant_temp: 75
    });

    useEffect(() => {
        loadDriverVehicle();
    }, []);

    const loadDriverVehicle = async () => {
        setLoading(true);
        try {
            const driver = authService.getCurrentDriver();
            const assigned = driver?.assignedVehicles?.[0];
            if (assigned) {
                const v = {
                    _id: assigned._id || assigned,
                    vehicleNumber: assigned.vehicleNumber || 'Unknown',
                    model: assigned.model || 'Unknown',
                    status: assigned.status || 'active',
                    currentOdometer: assigned.currentOdometer || 0,
                    engineHours: assigned.engineHours || 0
                };
                setVehicle(v);
                fetchHealthScore(v._id);
            }
        } catch (error) {
            console.error('Error loading vehicle:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchHealthScore = async (vehicleId) => {
        setLoadingScore(true);
        try {
            const res = await vehicleService.getHealthScore(vehicleId);
            setHealthScore(res.data);
        } catch {
            setHealthScore(null);
        } finally {
            setLoadingScore(false);
        }
    };

    const handlePredict = async () => {
        if (!vehicle) return;
        setPredicting(true);
        setPrediction(null);
        try {
            const sanitized = Object.fromEntries(
                Object.entries(engineData).map(([k, v]) => [k, v === '' ? 0 : Number(v)])
            );
            const res = await vehicleService.predictEngineHealth(vehicle._id, sanitized);
            setPrediction(res.data);
            toast.success('Prediction complete!');
        } catch (error) {
            if (error.response?.status === 503) {
                toast.error('ML service is not running. Please contact your fleet manager.');
            } else {
                toast.error('Prediction failed: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setPredicting(false);
        }
    };

    const resetValues = () => {
        setEngineData({ rpm: 800, oil_pressure: 3.5, fuel_pressure: 12, coolant_pressure: 2.5, oil_temp: 80, coolant_temp: 75 });
    };

    const getScoreColor = (score) => {
        if (score >= 90) return '#10b981';
        if (score >= 75) return '#3b82f6';
        if (score >= 60) return '#f59e0b';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    };

    const getScoreBg = (score) => {
        if (score >= 90) return '#ecfdf5';
        if (score >= 75) return '#eff6ff';
        if (score >= 60) return '#fffbeb';
        if (score >= 40) return '#fff7ed';
        return '#fef2f2';
    };

    const sensorParams = [
        { key: 'rpm', label: 'Engine RPM', icon: Gauge, min: 0, max: 5000, step: 50, unit: 'RPM' },
        { key: 'oil_pressure', label: 'Oil Pressure', icon: Droplets, min: 0, max: 10, step: 0.1, unit: 'bar' },
        { key: 'fuel_pressure', label: 'Fuel Pressure', icon: FuelIcon, min: 0, max: 30, step: 0.5, unit: 'bar' },
        { key: 'coolant_pressure', label: 'Coolant Pressure', icon: Droplets, min: 0, max: 5, step: 0.1, unit: 'bar' },
        { key: 'oil_temp', label: 'Oil Temperature', icon: Thermometer, min: 0, max: 150, step: 1, unit: '°C' },
        { key: 'coolant_temp', label: 'Coolant Temperature', icon: Thermometer, min: 0, max: 120, step: 1, unit: '°C' }
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Loader2 size={32} className="spin" />
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="driver-engine-health">
                <div className="deh-no-vehicle">
                    <Truck size={48} />
                    <h3>No Vehicle Assigned</h3>
                    <p>Contact your fleet manager to get a vehicle assigned.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="driver-engine-health">
            <div className="driver-page-header">
                <h1 className="driver-page-title">Vehicle Health</h1>
                <p className="driver-page-subtitle">Check your vehicle's health score and run engine diagnostics</p>
            </div>

            {/* Vehicle Banner */}
            <div className="deh-vehicle-banner">
                <div className="deh-vehicle-banner-icon">
                    <Truck size={24} />
                </div>
                <div className="deh-vehicle-banner-info">
                    <h3>{vehicle.vehicleNumber}</h3>
                    <p>{vehicle.model} &bull; {vehicle.currentOdometer.toLocaleString()} km &bull; {vehicle.engineHours} hrs</p>
                </div>
                <span className="deh-vehicle-status">{vehicle.status}</span>
            </div>

            {/* Health Score */}
            <div className="deh-score-card">
                <div className="deh-score-header">
                    <Activity size={18} />
                    Vehicle Health Score
                </div>
                {loadingScore ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Loader2 size={24} className="spin" />
                    </div>
                ) : healthScore ? (
                    <>
                        <div className="deh-score-body" style={{ background: getScoreBg(healthScore.healthScore) }}>
                            <div className="deh-score-circle" style={{ background: getScoreColor(healthScore.healthScore) }}>
                                {healthScore.healthScore}
                            </div>
                            <div className="deh-score-info">
                                <p className="status-label" style={{ color: getScoreColor(healthScore.healthScore) }}>
                                    {healthScore.status}
                                </p>
                                <p className="score-details">
                                    Based on maintenance, checklists, documents & usage
                                </p>
                            </div>
                        </div>
                        {healthScore.recommendations?.[0] && (
                            <div className="deh-recommendation">
                                <Lightbulb size={16} />
                                {healthScore.recommendations[0]}
                            </div>
                        )}
                    </>
                ) : (
                    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>Score unavailable</p>
                )}
            </div>

            {/* ML Prediction */}
            <div className="deh-predict-card">
                <h3 className="deh-predict-title">
                    <Wrench size={20} />
                    Engine Health Prediction
                </h3>
                <p className="deh-predict-subtitle">
                    Enter your vehicle's current sensor readings to check engine health
                </p>

                <div className="deh-sensor-grid">
                    {sensorParams.map(param => (
                        <div key={param.key} className="deh-sensor-input">
                            <label>
                                <param.icon size={14} /> {param.label}
                            </label>
                            <input
                                type="number"
                                value={engineData[param.key]}
                                onChange={e => setEngineData(prev => ({ ...prev, [param.key]: e.target.value === '' ? '' : parseFloat(e.target.value) }))}
                                min={param.min}
                                max={param.max}
                                step={param.step}
                            />
                            <div className="deh-sensor-range">
                                Range: {param.min} – {param.max} {param.unit}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="deh-actions">
                    <Button onClick={handlePredict} disabled={predicting}>
                        {predicting ? <><Loader2 size={16} className="spin" style={{ marginRight: 6 }} />Predicting...</> : 'Run Prediction'}
                    </Button>
                    <Button variant="secondary" onClick={resetValues}>
                        <RotateCcw size={16} style={{ marginRight: 6 }} /> Reset
                    </Button>
                </div>
            </div>

            {/* Prediction Results */}
            {prediction && (
                <div className="deh-result-card">
                    <h3 className="deh-result-header">
                        {prediction.status === 'HEALTHY' ? <CheckCircle size={20} color="#10b981" /> : <AlertTriangle size={20} color="#ef4444" />}
                        Prediction Result
                    </h3>

                    <div className="deh-result-status" style={{
                        background: prediction.status === 'HEALTHY' ? '#ecfdf5' : '#fef2f2'
                    }}>
                        <div className="status-text" style={{
                            color: prediction.status === 'HEALTHY' ? '#10b981' : '#ef4444'
                        }}>
                            {prediction.status}
                        </div>
                        <div className="confidence-text" style={{ color: '#64748b' }}>
                            Confidence: {prediction.confidence}%
                        </div>
                    </div>

                    {prediction.issues?.length > 0 && (
                        <>
                            <h4 style={{ margin: '0 0 12px', color: '#334155' }}>Detected Issues & Remedies</h4>
                            {prediction.issues.map((issue, i) => (
                                <div key={i} className="deh-issue-item" style={{ borderLeftWidth: '4px', borderLeftColor: issue.color, borderColor: `${issue.color}22` }}>
                                    <div className="deh-issue-top">
                                        <span className="severity" style={{ color: issue.color }}>
                                            {issue.icon} {issue.severity}: {issue.issue}
                                        </span>
                                        <span className="value">{issue.value}</span>
                                    </div>
                                    <div className="deh-issue-remedy">
                                        🔧 <strong>Remedy:</strong> {issue.remedy}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}

                    {prediction.issues?.length === 0 && (
                        <div className="deh-all-good">
                            <CheckCircle size={32} />
                            <p>All parameters are within normal range!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DriverEngineHealth;
