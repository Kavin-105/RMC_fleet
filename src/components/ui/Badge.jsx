import './Badge.css';

const variantMap = {
    grey: 'badge-grey',
    blue: 'badge-blue',
    green: 'badge-green',
    yellow: 'badge-yellow',
    red: 'badge-red',
    active: 'badge-active',
    inactive: 'badge-inactive',
    pending: 'badge-pending',
    approved: 'badge-approved',
    rejected: 'badge-rejected',
    maintenance: 'badge-maintenance',
    valid: 'badge-valid',
    expiring: 'badge-expiring',
    expired: 'badge-expired'
};

export function Badge({
    children,
    variant = 'grey',
    size = 'md',
    icon: Icon,
    dot = false,
    dotColor,
    className = ''
}) {
    const classes = [
        'badge',
        variantMap[variant] || 'badge-grey',
        size === 'lg' && 'badge-lg',
        className
    ].filter(Boolean).join(' ');

    return (
        <span className={classes}>
            {dot && <span className={`badge-dot ${dotColor || variant}`} />}
            {Icon && <Icon />}
            {children}
        </span>
    );
}

// Helper function to get badge variant from status
export function getStatusVariant(status) {
    const statusMap = {
        'Active': 'active',
        'Inactive': 'inactive',
        'Maintenance': 'maintenance',
        'Pending': 'pending',
        'Approved': 'approved',
        'Rejected': 'rejected',
        'Valid': 'valid',
        'Expiring': 'expiring',
        'Expired': 'expired'
    };
    return statusMap[status] || 'grey';
}

export default Badge;
