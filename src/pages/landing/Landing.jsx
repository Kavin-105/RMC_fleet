import { useNavigate } from 'react-router-dom';
import {
    Truck, Shield, Clock, BarChart3, ChevronRight, ArrowRight,
    CheckCircle, Brain, FileText, Activity, Gauge, Wrench,
    Bell, Fuel, ClipboardCheck, Users, Zap
} from 'lucide-react';
import './Landing.css';

export function Landing() {
    const navigate = useNavigate();

    return (
        <div className="lp">
            {/* Navbar */}
            <nav className="lp-nav">
                <div className="lp-nav-inner">
                    <div className="lp-brand">
                        <div className="lp-logo"><Truck size={22} /></div>
                        <span>RMC Fleet</span>
                    </div>
                    <div className="lp-nav-links">
                        <a href="#features">Features</a>
                        <a href="#how">How It Works</a>
                        <a href="#ml">AI & ML</a>
                    </div>
                    <button className="lp-nav-btn" onClick={() => navigate('/login')}>
                        Sign In <ArrowRight size={16} />
                    </button>
                </div>
            </nav>

            {/* Hero */}
            <section className="lp-hero">
                <div className="lp-hero-inner">
                    <div className="lp-hero-content">
                        <div className="lp-hero-chip">
                            <Zap size={14} />
                            AI-Powered Fleet Management
                        </div>
                        <h1>
                            Manage Your <span>Transit Mixer</span> Fleet Smarter
                        </h1>
                        <p>
                            Complete fleet management platform for RMC operations — track vehicles,
                            predict engine health with ML, manage documents, and control expenses,
                            all in one place.
                        </p>
                        <div className="lp-hero-actions">
                            <button className="lp-btn-primary" onClick={() => navigate('/login')}>
                                Get Started <ArrowRight size={18} />
                            </button>
                            <a href="#features" className="lp-btn-ghost">
                                Explore Features <ChevronRight size={18} />
                            </a>
                        </div>
                        <div className="lp-hero-badges">
                            <div className="lp-hero-badge"><CheckCircle size={14} /> Real-time Monitoring</div>
                            <div className="lp-hero-badge"><CheckCircle size={14} /> ML Predictions</div>
                            <div className="lp-hero-badge"><CheckCircle size={14} /> Email Alerts</div>
                        </div>
                    </div>
                    <div className="lp-hero-graphic">
                        <div className="lp-hero-card-main">
                            <div className="lp-hero-card-top">
                                <div className="lp-dot green"></div>
                                <span>Fleet Dashboard</span>
                            </div>
                            <div className="lp-hero-card-grid">
                                <div className="lp-mini-card">
                                    <Truck size={20} />
                                    <div><strong>Vehicles</strong><span>Track & Monitor</span></div>
                                </div>
                                <div className="lp-mini-card">
                                    <Brain size={20} />
                                    <div><strong>Engine AI</strong><span>Health Prediction</span></div>
                                </div>
                                <div className="lp-mini-card">
                                    <FileText size={20} />
                                    <div><strong>Documents</strong><span>Expiry Alerts</span></div>
                                </div>
                                <div className="lp-mini-card">
                                    <BarChart3 size={20} />
                                    <div><strong>Analytics</strong><span>Cost Insights</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="lp-float-card lp-float-1">
                            <Activity size={18} />
                            <div>
                                <strong>Engine Health</strong>
                                <span className="lp-status-ok">Healthy</span>
                            </div>
                        </div>
                        <div className="lp-float-card lp-float-2">
                            <Bell size={18} />
                            <div>
                                <strong>Alerts Active</strong>
                                <span>Document Expiry</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="lp-features">
                <div className="lp-section-inner">
                    <div className="lp-section-head">
                        <span className="lp-chip">Core Features</span>
                        <h2>Everything Your Fleet Needs</h2>
                        <p>Purpose-built for ready-mix concrete fleet operations</p>
                    </div>
                    <div className="lp-features-grid">
                        {[
                            { icon: Truck, title: 'Vehicle Management', desc: 'Track all vehicles with odometer, engine hours, status, and assigned drivers in real-time.', color: '#3b82f6' },
                            { icon: Brain, title: 'Engine Health AI', desc: 'ML model analyzes sensor data (RPM, oil pressure, coolant temp) to predict engine health and issues.', color: '#8b5cf6' },
                            { icon: FileText, title: 'Document Tracking', desc: 'Insurance, permits, RC books — get automatic email alerts before documents expire.', color: '#10b981' },
                            { icon: BarChart3, title: 'Fleet Analytics', desc: 'Expense breakdown by type, monthly trends, vehicle-wise cost ranking — all in one dashboard.', color: '#f59e0b' },
                            { icon: ClipboardCheck, title: 'Daily Checklists', desc: 'Drivers complete daily vehicle inspections. Owners see compliance rates for each vehicle.', color: '#ef4444' },
                            { icon: Fuel, title: 'Expense Tracking', desc: 'Fuel, maintenance, tolls — submit with bill photos. Owner approval workflow built in.', color: '#0891b2' },
                            { icon: Users, title: 'Driver Management', desc: 'Add drivers, assign vehicles, extract license details using OCR from uploaded images.', color: '#7c3aed' },
                            { icon: Bell, title: 'Smart Notifications', desc: 'In-app + email alerts for document expiry, license expiry, and fleet health warnings.', color: '#dc2626' }
                        ].map((f, i) => (
                            <div key={i} className="lp-feature-card">
                                <div className="lp-feature-icon" style={{ background: f.color + '15', color: f.color }}>
                                    <f.icon size={22} />
                                </div>
                                <h3>{f.title}</h3>
                                <p>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how" className="lp-how">
                <div className="lp-section-inner">
                    <div className="lp-section-head">
                        <span className="lp-chip">How It Works</span>
                        <h2>Simple Setup, Powerful Results</h2>
                    </div>
                    <div className="lp-steps">
                        {[
                            { step: '01', title: 'Add Vehicles & Drivers', desc: 'Register your fleet vehicles and assign drivers. Upload license images — OCR extracts details automatically.' },
                            { step: '02', title: 'Upload Documents', desc: 'Add insurance, permits, RC books with expiry dates. System sends email alerts at 30, 15, 7, 3, and 1 day before expiry.' },
                            { step: '03', title: 'Daily Operations', desc: 'Drivers complete pre-trip checklists and submit expenses with bill photos. Owners approve or reject in the dashboard.' },
                            { step: '04', title: 'AI Predictions & Analytics', desc: 'Run engine health predictions using ML. View fleet analytics — expense breakdowns, monthly trends, vehicle health scores.' }
                        ].map((s, i) => (
                            <div key={i} className="lp-step-card">
                                <div className="lp-step-num">{s.step}</div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ML Section */}
            <section id="ml" className="lp-ml">
                <div className="lp-section-inner">
                    <div className="lp-section-head">
                        <span className="lp-chip">Machine Learning</span>
                        <h2>AI-Powered Intelligence</h2>
                        <p>Trained ML models working behind the scenes to keep your fleet running</p>
                    </div>
                    <div className="lp-ml-grid">
                        <div className="lp-ml-card">
                            <div className="lp-ml-card-header">
                                <Brain size={28} />
                                <h3>Engine Health Prediction</h3>
                            </div>
                            <p>Random Forest classifier trained on engine sensor data — RPM, oil pressure, fuel pressure, coolant temperature. Predicts health status with confidence score and provides issue remedies.</p>
                            <div className="lp-ml-tags">
                                <span>Random Forest</span>
                                <span>6 Sensor Inputs</span>
                                <span>Real-time</span>
                            </div>
                        </div>
                        <div className="lp-ml-card">
                            <div className="lp-ml-card-header">
                                <Gauge size={28} />
                                <h3>Fuel Efficiency Prediction</h3>
                            </div>
                            <p>Gradient Boosting model predicts fuel consumption (km/l) based on vehicle age, load, speed, idle time, and maintenance score. Provides optimization tips.</p>
                            <div className="lp-ml-tags">
                                <span>Gradient Boosting</span>
                                <span>9 Features</span>
                                <span>Optimization Tips</span>
                            </div>
                        </div>
                        <div className="lp-ml-card">
                            <div className="lp-ml-card-header">
                                <FileText size={28} />
                                <h3>License OCR Extraction</h3>
                            </div>
                            <p>EasyOCR-powered extraction of driver name, license number, and expiry date from uploaded license images or PDFs. Supports Indian DL formats.</p>
                            <div className="lp-ml-tags">
                                <span>EasyOCR</span>
                                <span>Image + PDF</span>
                                <span>Auto-fill</span>
                            </div>
                        </div>
                        <div className="lp-ml-card">
                            <div className="lp-ml-card-header">
                                <Activity size={28} />
                                <h3>Vehicle Health Scoring</h3>
                            </div>
                            <p>Automated health score combining maintenance costs, checklist compliance, document status, and vehicle age. Provides actionable recommendations.</p>
                            <div className="lp-ml-tags">
                                <span>Multi-factor</span>
                                <span>Automated</span>
                                <span>Recommendations</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="lp-cta">
                <div className="lp-cta-inner">
                    <h2>Ready to Manage Your Fleet?</h2>
                    <p>Start tracking vehicles, predicting engine health, and controlling costs today.</p>
                    <button className="lp-btn-primary lp-btn-lg" onClick={() => navigate('/login')}>
                        Get Started Now <ArrowRight size={20} />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="lp-footer">
                <div className="lp-footer-inner">
                    <div className="lp-footer-brand">
                        <Truck size={20} />
                        <span>RMC Fleet Manager</span>
                    </div>
                    <p>&copy; 2026 RMC Fleet Manager. Built for the RMC industry.</p>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
