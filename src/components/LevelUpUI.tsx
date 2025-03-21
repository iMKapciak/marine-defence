import React, { useEffect, useState } from 'react';
import { socket } from '../services/socket';
import styles from './LevelUpUI.module.css';

interface LevelUpUIProps {
    isVisible: boolean;
    onAttributeSelected: () => void;
}

export const LevelUpUI: React.FC<LevelUpUIProps> = ({ isVisible, onAttributeSelected }) => {
    const [isSelecting, setIsSelecting] = useState(false);

    useEffect(() => {
        console.log('[LevelUpUI] Component mounted');
        return () => console.log('[LevelUpUI] Component unmounted');
    }, []);

    useEffect(() => {
        console.log('[LevelUpUI] Visibility changed:', isVisible);
    }, [isVisible]);

    if (!isVisible) return null;

    const handleAttributeUpgrade = (attribute: string) => {
        if (isSelecting) return; // Prevent multiple selections
        
        console.log('[LevelUpUI] Upgrading attribute:', attribute);
        setIsSelecting(true);
        socket.emit('player:upgradeAttribute', { attribute });
        onAttributeSelected();
    };

    const buttonBaseStyle = {
        border: '1px solid',
        background: 'rgba(74, 144, 226, 0.2)',
        opacity: isSelecting ? 0.5 : 1,
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '20px',
            borderRadius: '10px',
            border: '2px solid #4a90e2',
            zIndex: 1000,
            transition: 'opacity 0.1s ease-out',
            opacity: isSelecting ? 0 : 1,
        }} className={styles.container}>
            <div style={{
                color: '#4a90e2',
                fontSize: '18px',
                marginBottom: '15px',
                textAlign: 'center',
                fontWeight: 'bold',
            }}>
                Level Up! Choose an attribute to upgrade:
            </div>
            <div style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
            }}>
                <button 
                    className={`${styles.button} ${isSelecting ? styles.disabled : ''}`}
                    onClick={() => handleAttributeUpgrade('damagePerShot')}
                    style={{ 
                        ...buttonBaseStyle, 
                        borderColor: '#e74c3c',
                    }}
                    disabled={isSelecting}
                >
                    <span style={{ fontSize: '24px', marginBottom: '5px' }}>⚔️</span>
                    <span style={{ fontSize: '12px', textAlign: 'center' }}>Damage</span>
                </button>
                <button 
                    className={`${styles.button} ${isSelecting ? styles.disabled : ''}`}
                    onClick={() => handleAttributeUpgrade('fireRate')}
                    style={{ 
                        ...buttonBaseStyle, 
                        borderColor: '#f39c12',
                    }}
                    disabled={isSelecting}
                >
                    <span style={{ fontSize: '24px', marginBottom: '5px' }}>🔥</span>
                    <span style={{ fontSize: '12px', textAlign: 'center' }}>Fire Rate</span>
                </button>
                <button 
                    className={`${styles.button} ${isSelecting ? styles.disabled : ''}`}
                    onClick={() => handleAttributeUpgrade('movementSpeed')}
                    style={{ 
                        ...buttonBaseStyle, 
                        borderColor: '#2ecc71',
                    }}
                    disabled={isSelecting}
                >
                    <span style={{ fontSize: '24px', marginBottom: '5px' }}>⚡</span>
                    <span style={{ fontSize: '12px', textAlign: 'center' }}>Speed</span>
                </button>
                <button 
                    className={`${styles.button} ${isSelecting ? styles.disabled : ''}`}
                    onClick={() => handleAttributeUpgrade('shieldAmount')}
                    style={{ 
                        ...buttonBaseStyle, 
                        borderColor: '#3498db',
                    }}
                    disabled={isSelecting}
                >
                    <span style={{ fontSize: '24px', marginBottom: '5px' }}>🛡️</span>
                    <span style={{ fontSize: '12px', textAlign: 'center' }}>Shield</span>
                </button>
            </div>
        </div>
    );
}; 