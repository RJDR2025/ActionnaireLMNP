import React, { useState } from 'react';

export default function Counter(props) {
    const [count, setCount] = useState(props.initialValue || 0);

    const increment = () => setCount(count + 1);
    const decrement = () => setCount(count - 1);
    const reset = () => setCount(props.initialValue || 0);

    return React.createElement('div', { style: styles.container },
        React.createElement('h2', { style: styles.title }, props.title || 'Compteur React'),
        React.createElement('div', { style: styles.countDisplay },
            React.createElement('span', { style: styles.countNumber }, count)
        ),
        React.createElement('div', { style: styles.buttonGroup },
            React.createElement('button', { style: styles.button, onClick: decrement }, '- Décrémenter'),
            React.createElement('button', { style: { ...styles.button, ...styles.resetButton }, onClick: reset }, 'Réinitialiser'),
            React.createElement('button', { style: styles.button, onClick: increment }, '+ Incrémenter')
        ),
        React.createElement('p', { style: styles.info }, 'Composant React géré par Symfony UX')
    );
}

const styles = {
    container: {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '500px',
        margin: '2rem auto',
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
    },
    title: {
        color: '#2c3e50',
        marginBottom: '1.5rem',
        fontSize: '1.8rem',
    },
    countDisplay: {
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    },
    countNumber: {
        fontSize: '3rem',
        fontWeight: 'bold',
        color: '#3498db',
    },
    buttonGroup: {
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    button: {
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        border: 'none',
        borderRadius: '6px',
        backgroundColor: '#3498db',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    resetButton: {
        backgroundColor: '#95a5a6',
    },
    info: {
        marginTop: '1.5rem',
        color: '#7f8c8d',
        fontSize: '0.9rem',
    },
};
