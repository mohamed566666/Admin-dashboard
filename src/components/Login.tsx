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

            {/* Background Animated Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Animated Gradient Orbs */}
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -40, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute top-1/2 right-1/3 w-64 h-64 bg-success/10 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.3, 0.2],
                        x: [0, 30, 0],
                        y: [0, -40, 0],
                    }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Floating Particles */}
                {Array.from({ length: 20 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-accent/30 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: "easeInOut",
                        }}
                    />
                ))}

                {/* Animated Wave Lines */}
                <svg className="absolute bottom-0 left-0 w-full h-32 opacity-20" preserveAspectRatio="none">
                    <motion.path
                        d="M0,50 Q100,30 200,50 T400,50 T600,50 T800,50 T1000,50 T1200,50 T1400,50"
                        stroke="rgba(124,58,237,0.5)"
                        fill="none"
                        strokeWidth="2"
                        animate={{
                            d: [
                                "M0,50 Q100,30 200,50 T400,50 T600,50 T800,50 T1000,50 T1200,50 T1400,50",
                                "M0,50 Q100,70 200,50 T400,50 T600,50 T800,50 T1000,50 T1200,50 T1400,50",
                                "M0,50 Q100,30 200,50 T400,50 T600,50 T800,50 T1000,50 T1200,50 T1400,50",
                            ]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                </svg>

                {/* Grid Pattern Overlay */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px',
                    }}
                />
            </div>

            {/* Main Card */}
            <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-bg-card/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10 relative overflow-hidden">
                    {/* Card Glow Effect */}
                    <motion.div
                        className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"
                        animate={{
                            scale: [1.3, 1, 1.3],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />

                    {/* Logo */}
                    <div className="text-center mb-8 relative">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center justify-center size-20 bg-gradient-to-br from-accent to-purple-600 rounded-2xl shadow-lg shadow-accent/30 mb-4 relative"
                        >
                            {/* Animated Ring Around Logo */}
                            <motion.div
                                className="absolute inset-0 border-2 border-accent/30 rounded-2xl"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="relative">
                                <Shield className="size-10 text-white" />
                                <motion.div
                                    animate={{ y: [0, -3, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -bottom-1 -right-1"
                                >
                                    <Headphones className="size-4 text-white opacity-80" />
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-2xl font-bold tracking-tight text-text-primary"
                        >
                            SecureFace
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-sm text-text-secondary mt-1"
                        >
                            Call Center Security Console
                        </motion.p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5 relative">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    className="bg-error/10 border border-error/20 rounded-lg p-3"
                                >
                                    <p className="text-error text-sm text-center">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Username */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                            className="space-y-2"
                        >
                            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Username
                            </label>
                            <div className="relative group">
                                <User className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 transition-colors duration-300 ${focusedField === 'username' ? 'text-accent' : 'text-text-secondary'}`} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Enter your username"
                                    disabled={isLoading}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent/50 transition-all duration-300 disabled:opacity-50"
                                />
                                {/* Focus Line Animation */}
                                <motion.div
                                    className="absolute bottom-0 left-0 h-0.5 bg-accent"
                                    initial={{ width: 0 }}
                                    animate={{ width: focusedField === 'username' ? '100%' : '0%' }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                            className="space-y-2"
                        >
                            <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 size-4 transition-colors duration-300 ${focusedField === 'password' ? 'text-accent' : 'text-text-secondary'}`} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                    className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-accent/50 transition-all duration-300 disabled:opacity-50"
                                />
                                <motion.button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                </motion.button>
                                {/* Focus Line Animation */}
                                <motion.div
                                    className="absolute bottom-0 left-0 h-0.5 bg-accent"
                                    initial={{ width: 0 }}
                                    animate={{ width: focusedField === 'password' ? '100%' : '0%' }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>
                        </motion.div>

                        {/* Login Button */}
                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.4 }}
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: isLoading ? 1 : 1.02 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            className="w-full py-2.5 bg-gradient-to-r from-accent to-purple-600 text-white font-medium rounded-lg hover:from-accent/90 hover:to-purple-600/90 transition-all shadow-md shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-2 mt-6 relative overflow-hidden group"
                        >
                            {isLoading ? (
                                <>
                                    <motion.div
                                        className="size-4 border-2 border-white/30 border-t-white rounded-full"
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    />
                                    <span>Authenticating...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn className="size-4" />
                                    <span>Sign In</span>
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="mt-6 pt-5 border-t border-white/5 text-center"
                    >
                        <p className="text-[10px] text-text-secondary uppercase tracking-wider flex items-center justify-center gap-2">
                            <motion.span
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Sparkles className="size-3" />
                            </motion.span>
                            Secure Authentication System
                            <motion.span
                                animate={{ rotate: [0, -10, 10, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            >
                                <Sparkles className="size-3" />
                            </motion.span>
                        </p>
                    </motion.div>
                </div>

                {/* Card Shadow Animation */}
                <motion.div
                    className="absolute -inset-4 bg-accent/20 rounded-3xl blur-2xl -z-10"
                    animate={{
                        opacity: [0.3, 0.5, 0.3],
                        scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>

            {/* CSS for Shake Animation */}
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