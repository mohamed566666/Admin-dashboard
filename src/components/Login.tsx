import React, { useState } from 'react';
import { Shield, Eye, EyeOff, LogIn, Sparkles, Lock, User, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';

interface LoginProps {
    onLogin: (username: string, password: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);

    const { login, isLoading } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password');
            const form = e.currentTarget as HTMLElement;
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
            return;
        }

        const result = await login(username, password);

        if (result.success) {
            onLogin(username, password);
        } else {
            setError(result.error || 'Invalid username or password');
            const form = document.querySelector('form');
            form?.classList.add('shake');
            setTimeout(() => form?.classList.remove('shake'), 500);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-bg-deep via-bg-deep to-bg-sidebar flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background with call center theme */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <svg className="absolute bottom-0 left-0 w-full h-1/2" preserveAspectRatio="none">
                    <motion.path
                        d="M0,100 Q50,80 100,100 T200,90 T300,100 T400,85 T500,100 T600,95 T700,100 T800,90 T900,100 T1000,95"
                        stroke="rgba(124,58,237,0.3)"
                        fill="none"
                        strokeWidth="1"
                        animate={{ pathLength: [0, 1, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                </svg>
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-bg-card/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <motion.div
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center justify-center size-20 bg-gradient-to-br from-accent to-purple-600 rounded-2xl shadow-lg shadow-accent/20 mb-4 relative"
                        >
                            <div className="relative">
                                <Shield className="size-10 text-white" />
                                <Headphones className="size-4 text-white absolute -bottom-1 -right-1 opacity-80" />
                            </div>
                        </motion.div>

                        <h1 className="text-2xl font-bold tracking-tight text-text-primary">SecureFace</h1>
                        <p className="text-sm text-text-secondary mt-1">Call Center Security Console</p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-error/10 border border-error/20 rounded-lg p-3"
                                >
                                    <p className="text-error text-sm text-center">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Enter your username"
                                    disabled={isLoading}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent/50 transition-colors disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent/50 transition-colors disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 bg-gradient-to-r from-accent to-purple-600 text-white font-medium rounded-lg hover:from-accent/90 hover:to-purple-600/90 transition-all shadow-md shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="size-4" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-6 pt-5 border-t border-white/5 text-center">
                        <p className="text-[10px] text-text-secondary uppercase tracking-wider flex items-center justify-center gap-2">
                            <Sparkles className="size-3" />
                            Secure Authentication System
                            <Sparkles className="size-3" />
                        </p>
                    </div>
                </div>
            </motion.div>

            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .shake { animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97); }
      `}</style>
        </div>
    );
}