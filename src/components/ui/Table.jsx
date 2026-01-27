import './Table.css';

export function Table({ children, className = '', responsive = false }) {
    return (
        <div className="table-container">
            <table className={`table ${responsive ? 'table-responsive' : ''} ${className}`}>
                {children}
            </table>
        </div>
    );
}

export function TableHeader({ children }) {
    return <thead>{children}</thead>;
}

export function TableBody({ children }) {
    return <tbody>{children}</tbody>;
}

export function TableRow({ children, onClick, className = '' }) {
    return (
        <tr className={className} onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
            {children}
        </tr>
    );
}

export function TableHead({ children, sortable = false, sorted = false, onSort, className = '' }) {
    return (
        <th
            className={`${sortable ? 'sortable' : ''} ${sorted ? 'sorted' : ''} ${className}`}
            onClick={sortable ? onSort : undefined}
        >
            {children}
        </th>
    );
}

export function TableCell({ children, primary = false, secondary, actions = false, dataLabel, className = '' }) {
    const cellClass = [
        primary && 'table-cell-primary',
        actions && 'table-cell-actions',
        className
    ].filter(Boolean).join(' ');

    return (
        <td className={cellClass} data-label={dataLabel}>
            <div>
                {children}
                {secondary && <p className="table-cell-secondary">{secondary}</p>}
            </div>
        </td>
    );
}

export function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange
}) {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="table-pagination">
            <span className="pagination-info">
                Showing {startItem} to {endItem} of {totalItems} results
            </span>
            <div className="pagination-buttons">
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = i + 1;
                    return (
                        <button
                            key={page}
                            className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => onPageChange(page)}
                        >
                            {page}
                        </button>
                    );
                })}
                <button
                    className="pagination-btn"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default Table;
