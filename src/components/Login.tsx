import React, { useState, useEffect } from 'react';
import { Shield, Eye, EyeOff, LogIn, Sparkles, Fingerprint, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LoginProps {
    onLogin: (username: string, password: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [focusedField, setFocusedField] = useState<'username' | 'password' | null>(null);
    const [floatingParticles, setFloatingParticles] = useState<Array<{ x: number; y: number; size: number; delay: number }>>([]);

    // Generate floating particles - slower movement
    useEffect(() => {
        const particles = Array.from({ length: 30 }, () => ({
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            delay: Math.random() * 8,
        }));
        setFloatingParticles(particles);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!username.trim() || !password.trim()) {
            setError('Please enter both username and password');
            const form = e.currentTarget as HTMLElement;
            form.classList.add('shake');
            setTimeout(() => form.classList.remove('shake'), 500);
            return;
        }

        setIsLoading(true);
        setError('');

        setTimeout(() => {
            setIsLoading(false);
            if (username === 'admin' && password === 'admin') {
                onLogin(username, password);
            } else {
                setError('Invalid username or password');
                const form = document.querySelector('form');
                form?.classList.add('shake');
                setTimeout(() => form?.classList.remove('shake'), 500);
            }
        }, 1800); // Slower authentication
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.97 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8, // Slower entrance
                ease: [0.25, 0.1, 0.25, 1],
                staggerChildren: 0.12 // More delay between children
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6, // Slower item appearance
                ease: [0.25, 0.1, 0.25, 1]
            }
        }
    };

    const glowVariants = {
        initial: { opacity: 0.5, scale: 1 },
        animate: {
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.08, 1],
            transition: {
                duration: 5, // Slower glow animation
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-bg-deep via-bg-deep to-bg-sidebar flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated Background Particles - Slower */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {floatingParticles.map((particle, i) => (
                    <motion.div
                        key={i}
                        initial={{ x: `${particle.x}%`, y: `${particle.y}%`, opacity: 0 }}
                        animate={{
                            y: [`${particle.y}%`, `${(particle.y + 20) % 100}%`],
                            opacity: [0, 0.4, 0],
                        }}
                        transition={{
                            duration: 12, // Slower particle movement
                            repeat: Infinity,
                            delay: particle.delay,
                            ease: "linear"
                        }}
                        className="absolute rounded-full bg-accent/15"
                        style={{
                            width: particle.size,
                            height: particle.size,
                            left: `${particle.x}%`,
                        }}
                    />
                ))}
            </div>

            {/* Animated Gradient Orbs - Slower */}
            <motion.div
                variants={glowVariants}
                initial="initial"
                animate="animate"
                className="absolute top-20 -left-20 w-96 h-96 bg-accent/25 rounded-full blur-[150px]"
            />
            <motion.div
                variants={glowVariants}
                initial="initial"
                animate="animate"
                className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-[150px]"
                transition={{ delay: 2 }}
            />

            {/* Main Card */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md relative z-10"
            >
                {/* Glow Effect Behind Card - Slower */}
                <motion.div
                    animate={{
                        scale: [1, 1.03, 1],
                        opacity: [0.25, 0.4, 0.25],
                    }}
                    transition={{
                        duration: 6, // Slower card glow
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute -inset-4 bg-accent/15 rounded-3xl blur-2xl"
                />

                <div className="relative bg-bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 md:p-10 overflow-hidden">
                    {/* Animated Border Gradient - Slower */}
                    <motion.div
                        animate={{
                            background: [
                                "linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)",
                                "linear-gradient(270deg, transparent, rgba(124,58,237,0.4), transparent)",
                                "linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)",
                            ]
                        }}
                        transition={{
                            duration: 5, // Slower border animation
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute inset-0 opacity-25 pointer-events-none"
                    />

                    {/* Logo & Header */}
                    <motion.div
                        variants={itemVariants}
                        className="text-center mb-8"
                    >
                        <motion.div
                            whileHover={{ scale: 1.04, y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ duration: 0.3 }}
                            className="inline-flex items-center justify-center size-20 bg-gradient-to-br from-accent to-purple-600 rounded-2xl shadow-lg shadow-accent/20 mb-4 relative"
                        >
                            <Shield className="size-10 text-white" />
                            <motion.div
                                animate={{
                                    scale: [1, 1.18, 1],
                                    opacity: [0.4, 0, 0.4],
                                }}
                                transition={{
                                    duration: 3.5, // Slower pulse
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute inset-0 rounded-2xl bg-white/20"
                            />
                            <motion.div
                                animate={{
                                    rotate: 360,
                                }}
                                transition={{
                                    duration: 25, // Slower rotation
                                    repeat: Infinity,
                                    ease: "linear"
                                }}
                                className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-accent to-purple-600 opacity-40 blur-sm"
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: -15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.6 }}
                            className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent"
                        >
                            SecureFace
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.45, duration: 0.6 }}
                            className="text-sm text-text-secondary mt-2"
                        >
                            Enterprise Admin Console
                        </motion.p>
                    </motion.div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Error Message with Animation - Slower */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, x: -15, scale: 0.96 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 15, scale: 0.96 }}
                                    transition={{ duration: 0.4 }}
                                    className="bg-error/10 border border-error/20 rounded-xl p-3"
                                >
                                    <div className="flex items-center gap-2">
                                        <motion.div
                                            animate={{ scale: [1, 1.15, 1] }}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <Lock className="size-4 text-error" />
                                        </motion.div>
                                        <p className="text-error text-sm text-center flex-1">{error}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Username Field */}
                        <motion.div variants={itemVariants} className="space-y-2">
                            <motion.label
                                htmlFor="username"
                                className="block text-xs font-bold text-text-secondary uppercase tracking-widest"
                                animate={{
                                    color: focusedField === 'username' ? '#7C3AED' : '#9CA3AF'
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center gap-2">
                                    <User className="size-3" />
                                    Username
                                </div>
                            </motion.label>
                            <motion.div
                                whileHover={{ scale: 1.008 }}
                                whileTap={{ scale: 0.992 }}
                                transition={{ duration: 0.25 }}
                                className="relative"
                            >
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onFocus={() => setFocusedField('username')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Enter your username"
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed pl-11"
                                    autoComplete="off"
                                />
                                <motion.div
                                    animate={{
                                        scale: focusedField === 'username' ? 1.08 : 1,
                                        color: focusedField === 'username' ? '#7C3AED' : '#9CA3AF'
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute left-3 top-1/2 -translate-y-1/2"
                                >
                                    <User className="size-5" />
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        {/* Password Field */}
                        <motion.div variants={itemVariants} className="space-y-2">
                            <motion.label
                                htmlFor="password"
                                className="block text-xs font-bold text-text-secondary uppercase tracking-widest"
                                animate={{
                                    color: focusedField === 'password' ? '#7C3AED' : '#9CA3AF'
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="flex items-center gap-2">
                                    <Lock className="size-3" />
                                    Password
                                </div>
                            </motion.label>
                            <motion.div
                                whileHover={{ scale: 1.008 }}
                                whileTap={{ scale: 0.992 }}
                                transition={{ duration: 0.25 }}
                                className="relative"
                            >
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={() => setFocusedField('password')}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Enter your password"
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-sm focus:outline-none focus:border-accent/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed pl-11 pr-11"
                                    autoComplete="off"
                                />
                                <motion.div
                                    animate={{
                                        scale: focusedField === 'password' ? 1.08 : 1,
                                        color: focusedField === 'password' ? '#7C3AED' : '#9CA3AF'
                                    }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute left-3 top-1/2 -translate-y-1/2"
                                >
                                    <Lock className="size-5" />
                                </motion.div>
                                <motion.button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.94 }}
                                    transition={{ duration: 0.2 }}
                                    disabled={isLoading}
                                >
                                    <AnimatePresence mode="wait">
                                        {showPassword ? (
                                            <motion.div
                                                key="eye-off"
                                                initial={{ opacity: 0, rotate: -60 }}
                                                animate={{ opacity: 1, rotate: 0 }}
                                                exit={{ opacity: 0, rotate: 60 }}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <EyeOff className="size-5" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="eye"
                                                initial={{ opacity: 0, rotate: -60 }}
                                                animate={{ opacity: 1, rotate: 0 }}
                                                exit={{ opacity: 0, rotate: 60 }}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <Eye className="size-5" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </motion.div>
                        </motion.div>

                        {/* Login Button */}
                        <motion.div variants={itemVariants}>
                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                whileHover={{ scale: 1.015 }}
                                whileTap={{ scale: 0.985 }}
                                transition={{ duration: 0.25 }}
                                className="w-full py-3 bg-gradient-to-r from-accent to-purple-600 text-white font-bold rounded-xl hover:from-accent/90 hover:to-purple-600/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
                            >
                                <motion.div
                                    animate={{
                                        x: isLoading ? [0, 150, 300] : 0,
                                        opacity: isLoading ? [1, 0.6, 0] : 0,
                                    }}
                                    transition={{
                                        duration: 1.5, // Slower shine effect
                                        repeat: isLoading ? Infinity : 0,
                                        ease: "linear"
                                    }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    style={{ x: '-100%' }}
                                />

                                {isLoading ? (
                                    <>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Fingerprint className="size-5" />
                                        </motion.div>
                                        <motion.span
                                            animate={{ opacity: [1, 0.6, 1] }}
                                            transition={{ duration: 1.2, repeat: Infinity }}
                                        >
                                            Authenticating...
                                        </motion.span>
                                    </>
                                ) : (
                                    <>
                                        <LogIn className="size-5" />
                                        <span>Sign In</span>
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </form>

                    {/* Animated Footer - Slower */}
                    <motion.div
                        variants={itemVariants}
                        className="mt-8 pt-6 border-t border-white/5 text-center"
                    >
                        <motion.p
                            animate={{
                                opacity: [0.5, 0.9, 0.5],
                            }}
                            transition={{
                                duration: 3, // Slower footer pulse
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="text-[10px] text-text-secondary uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <Sparkles className="size-3" />
                            Secure Authentication System
                            <Sparkles className="size-3" />
                        </motion.p>
                    </motion.div>
                </div>
            </motion.div>

            {/* Shake Animation CSS */}
            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-8px); }
                    75% { transform: translateX(8px); }
                }
                
                .shake {
                    animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97);
                }
            `}</style>
        </div>
    );
}