import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Truck,
    MapPin,
    Fuel,
    Wrench,
    BarChart3,
    Shield,
    Clock,
    Users,
    ChevronRight,
    Phone,
    Mail,
    Building2,
    CheckCircle,
    Play,
    ArrowRight,
    Star
} from 'lucide-react';
import './Landing.css';

// Import images from assets folder
import heroImage from '../../assets/hero-transit-mixer.png';
import fleetOverviewImage from '../../assets/fleet-overview.png';
import liveTrackingImage from '../../assets/live-tracking.png';
import dashboardImage from '../../assets/dashboard-preview.png';
import truck1Image from '../../assets/truck-1.png';
import truck2Image from '../../assets/truck-2.png';

// Images object for easy access
const IMAGES = {
    hero: heroImage,
    fleetOverview: fleetOverviewImage,
    liveTracking: liveTrackingImage,
    dashboard: dashboardImage,
    truck1: truck1Image,
    truck2: truck2Image,
    truck3: truck1Image, // Reusing truck1 as placeholder for truck3
};

export function Landing() {
    const navigate = useNavigate();
    const [activeFeature, setActiveFeature] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [countersStarted, setCountersStarted] = useState(false);
    const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);
    const statsRef = useRef(null);

    // Scroll detection for navbar
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Counter animation with Intersection Observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !countersStarted) {
                        setCountersStarted(true);
                        animateCounters();
                    }
                });
            },
            { threshold: 0.3 }
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => observer.disconnect();
    }, [countersStarted]);

    // Animate counters from 0 to target values
    const animateCounters = () => {
        const targets = [500, 98.5, 2, 150]; // Target values
        const duration = 1500; // 2 seconds
        const steps = 50;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);

            setAnimatedStats(targets.map(target =>
                Math.min(target * easeOutQuart, target)
            ));

            if (currentStep >= steps) {
                clearInterval(timer);
            }
        }, stepDuration);
    };

    // Format stat values with proper display
    const formatStatValue = (index, value) => {
        switch (index) {
            case 0: return `${Math.floor(value)}+`; // 500+
            case 1: return `${value.toFixed(1)}%`; // 98.5%
            case 2: return `₹${Math.floor(value)}Cr+`; // ₹2Cr+
            case 3: return `${Math.floor(value)}+`; // 150+
            default: return Math.floor(value);
        }
    };

    const features = [
        {
            icon: MapPin,
            title: 'Live GPS Tracking',
            description: 'Real-time location tracking of all your transit mixers with detailed route history and geofencing alerts.',
            image: IMAGES.liveTracking
        },
        {
            icon: Fuel,
            title: 'Fuel Management',
            description: 'Track fuel consumption, identify inefficiencies, and reduce operational costs with smart analytics.',
            image: IMAGES.fleetOverview
        },
        {
            icon: Wrench,
            title: 'Maintenance Scheduling',
            description: 'Automated maintenance reminders based on mileage and time intervals to keep your fleet running.',
            image: IMAGES.dashboard
        },
        {
            icon: BarChart3,
            title: 'Advanced Analytics',
            description: 'Comprehensive reports on fleet performance, driver efficiency, and operational insights.',
            image: IMAGES.fleetOverview
        }
    ];

    const stats = [
        { value: '500+', label: 'Active Vehicles', icon: Truck },
        { value: '98.5%', label: 'Uptime Rate', icon: Clock },
        { value: '₹2Cr+', label: 'Fuel Saved', icon: Fuel },
        { value: '150+', label: 'Happy Clients', icon: Users }
    ];

    const benefits = [
        'Real-time fleet visibility across all locations',
        'Reduce fuel costs by up to 25%',
        'Minimize vehicle downtime with predictive maintenance',
        'Improve delivery efficiency and customer satisfaction',
        'Digital documentation and expense tracking',
        'Mobile app for drivers with offline support'
    ];

    const testimonials = [
        {
            name: 'Rajesh Patel',
            role: 'Fleet Owner, Mumbai',
            content: 'RMC Fleet Manager has transformed how we manage our 50+ transit mixers. We\'ve seen 20% reduction in operational costs.',
            rating: 5
        },
        {
            name: 'Amit Singh',
            role: 'Operations Head, Delhi',
            content: 'The real-time tracking and fuel monitoring features are game changers. Highly recommended for any RMC business.',
            rating: 5
        },
        {
            name: 'Priya Sharma',
            role: 'Business Owner, Bangalore',
            content: 'Finally, a fleet management solution built specifically for transit mixers. The team understands our industry.',
            rating: 5
        }
    ];

    return (
        <div className="landing-page">
            {/* Navigation Bar */}
            <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="nav-brand">
                        <div className="nav-logo">
                            <Truck size={28} />
                        </div>
                        <span className="nav-title">RMC Fleet Manager</span>
                    </div>
                    <div className="nav-links">
                        <a href="#features">Features</a>
                        <a href="#benefits">Benefits</a>
                        <a href="#testimonials">Testimonials</a>
                        <a href="#contact">Contact</a>
                    </div>
                    <div className="nav-actions">
                        <button className="btn-nav-secondary" onClick={() => navigate('/login')}>
                            Sign In
                        </button>
                        <button className="btn-nav-primary" onClick={() => navigate('/login')}>
                            Get Started <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="hero-gradient"></div>
                    <div className="hero-pattern"></div>
                </div>
                <div className="hero-content">
                    <div className="hero-text">
                        <div className="hero-badge">
                            <Shield size={16} />
                            <span>Trusted by 150+ Fleet Owners</span>
                        </div>
                        <h1 className="hero-title">
                            Smart Fleet Management for
                            <span className="hero-highlight"> Transit Mixers</span>
                        </h1>
                        <p className="hero-description">
                            Streamline your ready-mix concrete operations with real-time tracking,
                            fuel management, and comprehensive fleet analytics. Built specifically
                            for the RMC industry.
                        </p>
                        <div className="hero-buttons">
                            <button className="btn-hero-primary" onClick={() => navigate('/login')}>
                                Start Free Trial
                                <ArrowRight size={20} />
                            </button>
                            <button className="btn-hero-secondary">
                                <Play size={18} />
                                Watch Demo
                            </button>
                        </div>
                        <div className="hero-trust">
                            <div className="hero-trust-avatars">
                                <div className="trust-avatar">RS</div>
                                <div className="trust-avatar">AP</div>
                                <div className="trust-avatar">MK</div>
                                <div className="trust-avatar">+</div>
                            </div>
                            <span>Join 500+ drivers already using our platform</span>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-image-container">
                            <div className="hero-image-wrapper">
                                <img src={IMAGES.hero} alt="Transit Mixer Truck" className="hero-image" />
                            </div>
                            <div className="hero-stats-card">
                                <div className="stats-card-header">
                                    <div className="stats-indicator live"></div>
                                    <span>Live Fleet Status</span>
                                </div>
                                <div className="stats-card-value">47</div>
                                <div className="stats-card-label">Active Vehicles</div>
                            </div>
                            <div className="hero-fuel-card">
                                <Fuel size={24} />
                                <div>
                                    <span className="fuel-label">Today's Fuel</span>
                                    <span className="fuel-value">2,450 L</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero-wave">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
                    </svg>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section" ref={statsRef}>
                <div className="stats-container">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-icon">
                                <stat.icon size={28} />
                            </div>
                            <div className="stat-value">
                                {formatStatValue(index, animatedStats[index])}
                            </div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-badge">Features</span>
                        <h2 className="section-title">Everything You Need to Manage Your Fleet</h2>
                        <p className="section-description">
                            Powerful tools designed specifically for transit mixer fleet operations
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="features-tabs">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className={`feature-tab ${activeFeature === index ? 'active' : ''}`}
                                    onClick={() => setActiveFeature(index)}
                                >
                                    <div className="feature-tab-icon">
                                        <feature.icon size={24} />
                                    </div>
                                    <div className="feature-tab-content">
                                        <h3>{feature.title}</h3>
                                        <p>{feature.description}</p>
                                    </div>
                                    <ChevronRight size={20} className="feature-arrow" />
                                </div>
                            ))}
                        </div>
                        <div className="features-preview">
                            <div className="preview-image-wrapper">
                                <img
                                    src={features[activeFeature].image}
                                    alt={features[activeFeature].title}
                                    className="preview-image"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section id="benefits" className="benefits-section">
                <div className="section-container">
                    <div className="benefits-grid">
                        <div className="benefits-content">
                            <span className="section-badge">Why Choose Us</span>
                            <h2 className="section-title">Built for the RMC Industry</h2>
                            <p className="benefits-description">
                                Unlike generic fleet management solutions, RMC Fleet Manager is
                                purpose-built for ready-mix concrete operations with features
                                that matter to your business.
                            </p>
                            <ul className="benefits-list">
                                {benefits.map((benefit, index) => (
                                    <li key={index} className="benefit-item">
                                        <CheckCircle size={20} />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                            <button className="btn-benefits" onClick={() => navigate('/login')}>
                                Start Managing Your Fleet
                                <ArrowRight size={18} />
                            </button>
                        </div>
                        <div className="benefits-visual">
                            <div className="benefits-image-wrapper">
                                <img src={IMAGES.dashboard} alt="Dashboard Preview" className="benefits-image" />
                            </div>
                            <div className="benefits-feature-card card-1">
                                <MapPin size={20} />
                                <span>Live Tracking</span>
                            </div>
                            <div className="benefits-feature-card card-2">
                                <BarChart3 size={20} />
                                <span>Analytics</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Fleet Gallery Section */}
            <section className="gallery-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-badge">Our Fleet</span>
                        <h2 className="section-title">Managing Fleets Across India</h2>
                    </div>
                    <div className="gallery-grid">
                        <div className="gallery-item large">
                            <img src={IMAGES.fleetOverview} alt="Fleet Overview" className="gallery-image" />
                        </div>
                        <div className="gallery-item">
                            <img src={IMAGES.truck1} alt="Transit Mixer" className="gallery-image" />
                        </div>
                        <div className="gallery-item">
                            <img src={IMAGES.truck2} alt="Transit Mixer on Highway" className="gallery-image" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="testimonials-section">
                <div className="section-container">
                    <div className="section-header">
                        <span className="section-badge">Testimonials</span>
                        <h2 className="section-title">What Our Clients Say</h2>
                    </div>
                    <div className="testimonials-grid">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="testimonial-card">
                                <div className="testimonial-rating">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="#F59E0B" color="#F59E0B" />
                                    ))}
                                </div>
                                <p className="testimonial-content">"{testimonial.content}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">
                                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="author-info">
                                        <strong>{testimonial.name}</strong>
                                        <span>{testimonial.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <div className="cta-content">
                        <h2>Ready to Transform Your Fleet Operations?</h2>
                        <p>Get started with a free trial. No credit card required.</p>
                        <div className="cta-buttons">
                            <button className="btn-cta-primary" onClick={() => navigate('/login')}>
                                Start Free Trial
                                <ArrowRight size={20} />
                            </button>
                            <button className="btn-cta-secondary">
                                <Phone size={18} />
                                Schedule Demo
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer id="contact" className="landing-footer">
                <div className="footer-container">
                    <div className="footer-main">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <Truck size={32} />
                                <span>RMC Fleet Manager</span>
                            </div>
                            <p className="footer-description">
                                Smart fleet management solution for the ready-mix concrete industry.
                                Track, manage, and optimize your transit mixer operations.
                            </p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Product</h4>
                                <a href="#features">Features</a>
                                <a href="#benefits">Benefits</a>
                                <a href="#testimonials">Testimonials</a>
                                <a href="#contact">Pricing</a>
                            </div>
                            <div className="footer-column">
                                <h4>Company</h4>
                                <a href="#about">About Us</a>
                                <a href="#contact">Contact</a>
                                <a href="#careers">Careers</a>
                                <a href="#blog">Blog</a>
                            </div>
                            <div className="footer-column">
                                <h4>Contact</h4>
                                <a href="mailto:support@rmcfleet.com">
                                    <Mail size={16} /> support@rmcfleet.com
                                </a>
                                <a href="tel:+911234567890">
                                    <Phone size={16} /> +91 12345 67890
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>© 2026 RMC Fleet Manager. All rights reserved.</p>
                        <div className="footer-legal">
                            <a href="#privacy">Privacy Policy</a>
                            <a href="#terms">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
