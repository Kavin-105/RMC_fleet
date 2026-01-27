import './Card.css';

export function Card({
    children,
    className = '',
    clickable = false,
    compact = false,
    onClick,
    ...props
}) {
    const classes = [
        'card',
        clickable && 'clickable',
        compact && 'compact',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} onClick={onClick} {...props}>
            {children}
        </div>
    );
}

export function CardHeader({ children, title, subtitle, action, className = '' }) {
    return (
        <div className={`card-header ${className}`}>
            <div>
                {title && <h3 className="card-title">{title}</h3>}
                {subtitle && <p className="card-subtitle">{subtitle}</p>}
                {children}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}

export function CardBody({ children, className = '' }) {
    return (
        <div className={`card-body ${className}`}>
            {children}
        </div>
    );
}

export function CardFooter({ children, className = '' }) {
    return (
        <div className={`card-footer ${className}`}>
            {children}
        </div>
    );
}

export function StatsCard({
    icon: Icon,
    iconColor = 'blue',
    label,
    title,
    value,
    subtitle,
    change,
    changeType = 'positive',
    variant = 'primary'
}) {
    // Support both 'label' and 'title' props for backward compatibility
    const displayLabel = label || title;

    // Map variant to color for icon
    const colorMap = {
        primary: 'blue',
        success: 'green',
        warning: 'yellow',
        danger: 'red',
        secondary: 'grey'
    };
    const displayColor = iconColor || colorMap[variant] || 'blue';

    return (
        <Card>
            <div className="stats-card">
                {Icon && (
                    <div className={`stats-icon ${displayColor}`}>
                        <Icon size={24} />
                    </div>
                )}
                <div className="stats-content">
                    <p className="stats-label">{displayLabel}</p>
                    <p className="stats-value">{value}</p>
                    {subtitle && (
                        <span className="stats-subtitle">{subtitle}</span>
                    )}
                    {change && (
                        <span className={`stats-change ${changeType}`}>
                            {change}
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
}

export default Card;
