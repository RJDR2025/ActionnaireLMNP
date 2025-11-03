import React from 'react';

export default function TestSimple(props) {
    return React.createElement('div', {
        style: {
            padding: '2rem',
            margin: '2rem auto',
            maxWidth: '600px',
            backgroundColor: '#4CAF50',
            color: 'white',
            borderRadius: '8px',
            textAlign: 'center',
            fontSize: '1.5rem',
            fontWeight: 'bold'
        }
    }, 'React fonctionne ! Message : ', props.message || 'Pas de message');
}
