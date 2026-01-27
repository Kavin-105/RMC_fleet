import './Input.css';

export function Input({
    label,
    type = 'text',
    error,
    helper,
    required = false,
    icon: Icon,
    className = '',
    ...props
}) {
    const inputId = props.id || props.name;

    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label htmlFor={inputId} className={`form-label ${required ? 'required' : ''}`}>
                    {label}
                </label>
            )}
            <div className={Icon ? 'input-wrapper' : ''}>
                {Icon && (
                    <span className="input-icon">
                        <Icon />
                    </span>
                )}
                <input
                    id={inputId}
                    type={type}
                    className={`form-input ${error ? 'error' : ''}`}
                    {...props}
                />
            </div>
            {error && <p className="form-error">{error}</p>}
            {helper && !error && <p className="form-helper">{helper}</p>}
        </div>
    );
}

export function Select({
    label,
    options = [],
    error,
    required = false,
    placeholder = 'Select an option',
    className = '',
    ...props
}) {
    const selectId = props.id || props.name;

    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label htmlFor={selectId} className={`form-label ${required ? 'required' : ''}`}>
                    {label}
                </label>
            )}
            <select id={selectId} className="form-select" {...props}>
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}

export function Textarea({
    label,
    error,
    required = false,
    className = '',
    ...props
}) {
    const textareaId = props.id || props.name;

    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label htmlFor={textareaId} className={`form-label ${required ? 'required' : ''}`}>
                    {label}
                </label>
            )}
            <textarea id={textareaId} className="form-textarea" {...props} />
            {error && <p className="form-error">{error}</p>}
        </div>
    );
}

export function Checkbox({
    label,
    checked,
    onChange,
    className = '',
    ...props
}) {
    return (
        <label className={`form-checkbox-group ${className}`}>
            <input
                type="checkbox"
                className="form-checkbox"
                checked={checked}
                onChange={onChange}
                {...props}
            />
            <span className="checkbox-label">{label}</span>
        </label>
    );
}

export default Input;
