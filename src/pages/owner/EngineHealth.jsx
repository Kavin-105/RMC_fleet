import { useState, useEffect } from 'react';
import { Activity, Truck, Loader2, Lightbulb, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Badge } from '../../components/ui';
import { vehicleService } from '../../services';
import './EngineHealth.css';

export function EngineHealth() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [healthScores, setHealthScores] = useState({});
    const [predictions, setPredictions] = useState({});
    const [loadingScores, setLoadingScores] = useState(false);

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const res = await vehicleService.getAll();
            setVehicles(res.data || []);
            if (res.data?.length > 0) {
                fetchAllHealthScores(res.data);
                fetchAllPredictions(res.data);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load vehicles');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllHealthScores = async (vehicleList) => {
        setLoadingScores(true);
        const scores = {};
        for (const v of vehicleList) {
            try {
                const res = await vehicleService.getHealthScore(v._id);
                scores[v._id] = res.data;
            } catch {
                scores[v._id] = null;
            }
        }
        setHealthScores(scores);
        setLoadingScores(false);
    };

    const fetchAllPredictions = async (vehicleList) => {
        const preds = {};
        for (const v of vehicleList) {
            try {
                const res = await vehicleService.getLastPrediction(v._id);
                preds[v._id] = res.data;
            } catch {
                preds[v._id] = null;
            }
        }
        setPredictions(preds);
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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Loader2 size={32} className="spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Engine Health & Vehicle Diagnostics</h1>
                <p className="page-subtitle">AI-powered engine health prediction and automated vehicle health scoring</p>
            </div>

            {/* Vehicle Health Score Cards */}
            <h3 style={{ margin: '0 0 16px', color: 'var(--grey-700)' }}>
                <Activity size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Vehicle Health Scores (Automated)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                {vehicles.map(v => {
                    const score = healthScores[v._id];
                    return (
                        <Card key={v._id} style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--grey-900)' }}>{v.vehicleNumber}</div>
                                    <div style={{ fontSize: '13px', color: 'var(--grey-500)', marginTop: '2px' }}>{v.model}</div>
                                </div>
                                <Badge variant={v.status === 'Active' ? 'active' : 'maintenance'}>{v.status}</Badge>
                            </div>
                            {loadingScores ? (
                                <div style={{ textAlign: 'center', padding: '8px' }}><Loader2 size={16} className="spin" /></div>
                            ) : score ? (
                                <>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                                        background: getScoreBg(score.healthScore), borderRadius: '10px', marginBottom: '8px'
                                    }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '50%',
                                            background: getScoreColor(score.healthScore), color: '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, fontSize: '16px'
                                        }}>
                                            {score.healthScore}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, color: getScoreColor(score.healthScore) }}>{score.status}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--grey-500)' }}>
                                                {score.metrics.currentOdometer?.toLocaleString()} km • {score.metrics.engineHours} hrs
                                            </div>
                                        </div>
                                    </div>
                                    {score.recommendations?.[0] && (
                        <div style={{ fontSize: '12px', color: 'var(--blue-700)', background: 'var(--blue-50)', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Lightbulb size={14} /> {score.recommendations[0]}
                        </div>
                    )}
                                </>
                            ) : (
                                <div style={{ fontSize: '13px', color: 'var(--grey-400)', textAlign: 'center', padding: '8px' }}>
                                    Score unavailable
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {vehicles.length === 0 && (
                <Card style={{ padding: '40px', textAlign: 'center' }}>
                    <Truck size={48} style={{ color: 'var(--grey-300)', marginBottom: '12px' }} />
                    <h3 style={{ color: 'var(--grey-600)', marginBottom: '4px' }}>No Vehicles Yet</h3>
                    <p style={{ color: 'var(--grey-400)', fontSize: '14px' }}>Add vehicles to see their health scores</p>
                </Card>
            )}

            {/* ML Prediction Results from Drivers */}
            <h3 style={{ margin: '32px 0 16px', color: 'var(--grey-700)' }}>
                <Activity size={18} style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Driver Prediction Results
            </h3>
            <p style={{ color: 'var(--grey-500)', fontSize: '14px', marginBottom: '16px' }}>
                Latest engine health predictions submitted by drivers
            </p>

            {vehicles.filter(v => predictions[v._id]?.status).length === 0 && (
                <Card style={{ padding: '40px', textAlign: 'center' }}>
                    <Activity size={40} style={{ color: 'var(--grey-300)', marginBottom: '12px' }} />
                    <h3 style={{ color: 'var(--grey-600)', marginBottom: '4px' }}>No Predictions Yet</h3>
                    <p style={{ color: 'var(--grey-400)', fontSize: '14px' }}>Predictions will appear here when drivers check engine health</p>
                </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
                {vehicles.filter(v => predictions[v._id]?.status).map(v => {
                    const pred = predictions[v._id];
                    const isHealthy = pred.status === 'HEALTHY';
                    return (
                        <Card key={v._id} style={{ padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--grey-900)' }}>{v.vehicleNumber}</div>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                                    background: isHealthy ? '#ecfdf5' : '#fef2f2',
                                    color: isHealthy ? '#10b981' : '#ef4444'
                                }}>
                                    {isHealthy ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                                    {pred.status}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--grey-500)' }}>
                                    Confidence: <strong style={{ color: 'var(--grey-800)' }}>{pred.confidence}%</strong>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--grey-500)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Clock size={12} />
                                    {new Date(pred.predictedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            {pred.predictedBy && (
                                <div style={{ fontSize: '12px', color: 'var(--blue-600)', marginBottom: '8px' }}>
                                    Predicted by: {pred.predictedBy.name || 'Driver'}
                                </div>
                            )}

                            {pred.issues?.length > 0 && (
                                <div style={{ borderTop: '1px solid var(--grey-100)', paddingTop: '10px' }}>
                                    {pred.issues.map((issue, i) => (
                                        <div key={i} style={{
                                            fontSize: '12px', padding: '6px 10px', marginBottom: '6px',
                                            borderLeft: `3px solid ${issue.color}`, borderRadius: '4px',
                                            background: `${issue.color}08`
                                        }}>
                                            <span style={{ color: issue.color, fontWeight: 600 }}>
                                                {issue.icon} {issue.severity}: {issue.issue}
                                            </span>
                                            <span style={{ color: 'var(--grey-500)', marginLeft: '8px' }}>{issue.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {pred.issues?.length === 0 && (
                                <div style={{ fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 0' }}>
                                    <CheckCircle size={14} /> All parameters normal
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

export default EngineHealth;
