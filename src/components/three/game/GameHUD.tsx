import React, { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useGameStore } from '@/hooks/use-game-store';

interface GameHUDProps {
  onAbort: () => void;
}

const GameHUD = ({ onAbort }: GameHUDProps) => {
  const { phase, user, setPhase, setUser, debugInfo } = useGameStore();
//   const [username, setUsername] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const createUser = useMutation(api.users.getOrCreateUser);

//   const handleLoginSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!username.trim() || isSubmitting) return;
//     setIsSubmitting(true);
//     try {
//       const userId = await createUser({ username: username.trim() });
//       setUser({ id: userId, username: username.trim() });
//       setPhase('placement');
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

  // Auto-login for freelook testing
  React.useEffect(() => {
    if (!user) {
        setUser({ id: 'guest', username: 'GUEST' });
        setPhase('placement');
    }
  }, [user, setUser, setPhase]);
  
  const [isLocked, setIsLocked] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // Track if game has started

  useEffect(() => {
      const handleLockChange = () => {
          const locked = !!document.pointerLockElement;
          setIsLocked(locked);
          if (locked) setHasStarted(true); // Mark as started on first lock
      };
      document.addEventListener('pointerlockchange', handleLockChange);
      return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-50">
      {/* Pause Menu / Start Menu (Pointer Lock Disengaged) */}
      {!isLocked && user && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/50 pointer-events-auto backdrop-blur-sm">
              <div className="bg-black/90 border-2 border-cyan-500 p-8 rounded-lg text-center shadow-[0_0_50px_rgba(6,182,212,0.4)] flex flex-col gap-4 min-w-[300px]">
                  <h2 className="text-3xl font-bold text-cyan-400 mb-2 tracking-widest">
                      {hasStarted ? '[ PAUSED ]' : 'DIMSHIFT'}
                  </h2>
                  
                  <button 
                    onClick={() => document.body.requestPointerLock()}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-6 rounded transition-all uppercase tracking-widest"
                  >
                    {hasStarted ? 'Resume Mission' : 'Click To Begin'}
                  </button>
                  
                  {hasStarted && (
                      <button 
                        onClick={onAbort}
                        className="bg-red-900/20 border border-red-500/50 hover:bg-red-900/40 text-red-400 font-bold py-3 px-6 rounded transition-all uppercase tracking-widest"
                      >
                        Abort Mission
                      </button>
                  )}
                  {!hasStarted && (
                      <button 
                        onClick={onAbort}
                        className="bg-red-900/20 border border-red-500/50 hover:bg-red-900/40 text-red-400 font-bold py-3 px-6 rounded transition-all uppercase tracking-widest"
                      >
                        Return to Home
                      </button>
                  )}
              </div>
          </div>
      )}

      {/* Dim Overlay for Login Phase */}
      {phase === 'login' && (
        <div className="absolute inset-0 bg-black/80 z-0 pointer-events-auto transition-opacity duration-1000" />
      )}

      <div className="w-full h-full flex flex-col justify-between p-8 font-mono relative z-10">
        {/* Top Bar */}
        <div className="flex justify-between items-start pointer-events-auto">
            <div className="bg-black/80 border border-cyan-500/50 p-4 rounded-br-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                <h1 className="text-2xl font-bold text-cyan-400 tracking-widest">DimShift</h1>
                <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${user ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-xs text-white/70 uppercase">
                        {user ? `OPERATOR: ${user.username}` : 'OFFLINE'}
                    </span>
                </div>
            </div>
            
            {/* Top Right is now empty or could hold time/score */}
        </div>

        {/* Debug Info */}
        {debugInfo && (
            <div className="absolute top-24 right-8 text-right font-mono text-xs text-green-500/80 pointer-events-auto">
                <div>GRID: [{debugInfo.x}, {debugInfo.y}]</div>
                <div>CAM: [{debugInfo.cam}]</div>
            </div>
        )}

        {/* Center Content (Login or Status) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md pointer-events-auto">
            {/* {phase === 'login' && (
                <div className="bg-black/90 p-8 border-2 border-cyan-500 rounded-lg shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <h2 className="text-center text-cyan-400 text-lg uppercase tracking-widest mb-6 border-b border-cyan-500/30 pb-2">Initialize Pilot Profile</h2>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="CALLSIGN"
                            className="w-full bg-cyan-900/10 border border-cyan-500/50 p-3 text-white text-center font-bold tracking-widest focus:outline-none focus:border-cyan-400 focus:bg-cyan-900/20 transition-all placeholder:text-cyan-500/30"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting || !username.trim()}
                            className="w-full bg-cyan-500 text-black font-bold py-3 hover:bg-cyan-400 disabled:opacity-50 transition-colors uppercase tracking-widest"
                        >
                            {isSubmitting ? 'CONNECTING...' : 'ESTABLISH LINK'}
                        </button>
                    </form>
                </div>
            )} */}
        </div>

        {/* Bottom Bar (Action Deck) */}
        {user && (
            <div className="flex justify-center pointer-events-auto">
                <div className="bg-black/80 border-t-2 border-x-2 border-cyan-500/50 px-12 py-6 rounded-t-3xl shadow-[0_-10px_30px_rgba(6,182,212,0.2)] flex items-center gap-8">
                    {phase === 'placement' && (
                        <>
                            <div className="text-center">
                                <div className="text-xs text-cyan-500 uppercase tracking-widest mb-1">Status</div>
                                <div className="text-white font-bold">DEPLOYMENT PHASE</div>
                            </div>
                            <div className="h-8 w-px bg-cyan-500/30" />
                            <button
                                onClick={() => setPhase('waiting')}
                                className="bg-cyan-500 text-black font-bold px-8 py-3 rounded hover:scale-105 transition-transform uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                            >
                                CONFIRM DEPLOYMENT
                            </button>
                        </>
                    )}
                    {phase === 'waiting' && (
                        <div className="text-center animate-pulse">
                            <div className="text-white font-bold tracking-widest">SCANNING FOR OPPONENTS...</div>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default GameHUD;
