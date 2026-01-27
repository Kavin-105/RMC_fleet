import './Button.css';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props 
}) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size !== 'md' && `btn-${size}`,
    fullWidth && 'btn-full',
    !children && Icon && 'btn-icon',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {Icon && iconPosition === 'left' && <Icon />}
      {children}
      {Icon && iconPosition === 'right' && <Icon />}
    </button>
  );
}

export default Button;
