import { useProgress, Html } from '@react-three/drei';
import { useEffect } from 'react';

interface LoaderProps {
    onLoaded: () => void;
}

function Loader({ onLoaded }: LoaderProps) {
    const { progress } = useProgress();

    useEffect(() => {
        if (progress === 100) {
            onLoaded();
        }
    }, [progress, onLoaded]);

    return (
        <Html center>
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#00ffff',
                fontFamily: 'monospace',
            }}>
                <div style={{
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    border: '2px solid #00ffff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '20px',
                    position: 'relative'
                }}>
                    <div style={{
                        fontSize: '12px',
                        transform: 'rotate(90deg)',
                        position: 'absolute',
                        top: '5px',
                        left: '50%',
                        transformOrigin: '0 0'
                    }}>
                        "I thought what I'd do was, I'd pretend I was one of those deaf-mutes"
                    </div>
                    <div style={{ fontSize: '24px' }}>{Math.round(progress)}%</div>
                </div>
            </div>
        </Html>
    );
}

export default Loader;
