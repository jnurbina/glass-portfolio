import React, { useState } from 'react';
import { Html } from '@react-three/drei';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useResponsivePane } from '@/hooks/use-responsive-pane';

interface LoginPaneProps {
  onLogin: (userId: string, username: string) => void;
}

const LoginPane = ({ onLogin }: LoginPaneProps) => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createUser = useMutation(api.users.getOrCreateUser);
  const { style, distanceFactor } = useResponsivePane(500, 400);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const userId = await createUser({ username: username.trim() });
      onLogin(userId, username.trim());
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <group position={[0, 0, 10]}>
      <Html transform distanceFactor={distanceFactor} style={style}>
        <div className="w-full h-full bg-black/90 text-white p-8 rounded-2xl border border-cyan-500/50 backdrop-blur-xl flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold mb-2 text-cyan-400 tracking-tighter">DimShift</h2>
          <p className="text-white/50 text-sm mb-8 uppercase tracking-[0.3em]">Initialize Pilot Profile</p>

          <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-mono text-cyan-500/70 uppercase">Callsign</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ENTER USERNAME..."
                className="w-full bg-cyan-500/10 border border-cyan-500/30 rounded p-3 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-400 transition-colors font-mono"
                maxLength={15}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !username.trim()}
              className="w-full bg-cyan-500 text-black font-bold py-3 rounded hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              {isSubmitting ? 'Verifying...' : 'Establish Link'}
            </button>
          </form>
        </div>
      </Html>
    </group>
  );
};

export default LoginPane;
