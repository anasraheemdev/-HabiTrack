'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Activity, Users, Brain, Target, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const FEATURES = [
    {
        icon: <Activity className="w-6 h-6 text-emerald-500" />,
        title: "Daily Habit Tracking",
        description: "Log your spiritual and daily practices consistently over curated 40-day periods."
    },
    {
        icon: <Brain className="w-6 h-6 text-teal-500" />,
        title: "AI-Powered Mentorship",
        description: "Experience dynamic guidance augmented by RAG-based retrieval from trusted Islamic texts."
    },
    {
        icon: <Users className="w-6 h-6 text-cyan-500" />,
        title: "Salik-Murabbi Connection",
        description: "Foster a deep mentor-mentee relationship with structured check-ins and performance insights."
    },
    {
        icon: <Target className="w-6 h-6 text-blue-500" />,
        title: "Deep Analytics",
        description: "Visualize your growth through weekly averages, best streaks, and intelligent summaries."
    }
];

export default function LandingPageUI({ isLoggedIn, role }: { isLoggedIn: boolean, role: string | null }) {
    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-emerald-500/30">
            {/* Nav / Header */}
            <header className="absolute top-0 w-full z-50 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto left-0 right-0">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                        HabiTrack AI
                    </span>
                </div>
                
                <nav>
                    {isLoggedIn ? (
                        <Link href={`/${role || 'login'}`}>
                            <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-md shadow-emerald-500/20">
                                Go to Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-md shadow-emerald-500/20">
                                Sign In / Register
                            </Button>
                        </Link>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <main>
                <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center">
                    {/* Background glows */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none -z-10 dark:bg-emerald-900/20" />
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-400/20 blur-[100px] rounded-full pointer-events-none -z-10 dark:bg-teal-900/20" />
                    
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="max-w-4xl max-auto z-10"
                    >
                        <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 text-sm font-medium mb-6">
                            <Shield className="w-4 h-4" />
                            <span>Structured Islamic Mentorship</span>
                        </motion.div>
                        
                        <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                            Your Spiritual Journey, <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500">Guided by AI.</span>
                        </motion.h1>
                        
                        <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                            HabiTrack is the ultimate Islamic mentorship ecosystem. Track your habits, connect with Murabbis, and grow spiritually over tailored 40-day (Chilla) periods.
                        </motion.p>
                        
                        <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {isLoggedIn ? (
                                <Link href={`/${role || 'login'}`}>
                                    <Button size="lg" className="w-full sm:w-auto text-base rounded-full px-8 py-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-105">
                                        Enter Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login">
                                        <Button size="lg" className="w-full sm:w-auto text-base rounded-full px-8 py-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 transition-all hover:scale-105">
                                            Start Your Journey
                                        </Button>
                                    </Link>
                                    <Link href="/login">
                                        <Button size="lg" variant="outline" className="w-full sm:w-auto text-base rounded-full px-8 py-6 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all">
                                            Learn More
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                </section>

                {/* Features Section */}
                <section className="py-24 px-6 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">Empowering Consistent Growth</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">Our platform provides the perfect blend of traditional spiritual mentorship and modern, AI-driven insights.</p>
                        </div>

                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={staggerContainer}
                            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
                        >
                            {FEATURES.map((feature, idx) => (
                                <motion.div key={idx} variants={fadeIn} className="bg-background bg-opacity-60 backdrop-blur-sm p-6 rounded-3xl border border-border/50 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </section>

                {/* The Chilla Pipeline */}
                <section className="py-24 px-6">
                    <div className="max-w-5xl mx-auto w-full">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">The 40-Day Transformation</h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">Embark on a structured 40-day "Chilla" spiritual retreat designed to build lifelong habits.</p>
                        </div>

                        <div className="relative">
                            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />
                            <div className="space-y-12">
                                {[
                                    { step: 1, title: "Onboarding & Assignment", desc: "Your Murabbi (Mentor) designs a custom set of daily spiritual rituals tailored just for you." },
                                    { step: 2, title: "Daily Logging", desc: "Check in each day, mark your habits, and leave reflections on your mental and spiritual state." },
                                    { step: 3, title: "Mentorship Synergy", desc: "Your Murabbi monitors your weekly progress, offering real-time feedback and guidance." },
                                    { step: 4, title: "AI-Generated Summary", desc: "At the end of exactly 40 days, HabiGuide generates a deep analytical report of your soul's journey." }
                                ].map((item, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, margin: "-50px" }}
                                        transition={{ duration: 0.5, delay: i * 0.1 }}
                                        className={`relative flex items-center md:justify-between flex-col md:flex-row ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
                                    >
                                        <div className="absolute left-8 md:left-1/2 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm transform -translate-x-1/2 border-4 border-background z-10 shadow-sm">
                                            {item.step}
                                        </div>
                                        
                                        <div className="w-full md:w-5/12 pl-20 md:pl-0" />
                                        
                                        <div className={`w-full md:w-5/12 pl-20 md:pl-0 ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                                            <div className="bg-card p-6 rounded-2xl border shadow-sm hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                                                <h4 className="text-lg font-bold mb-2">{item.title}</h4>
                                                <p className="text-muted-foreground text-sm">{item.desc}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="py-8 text-center text-muted-foreground text-sm border-t border-border/50 bg-slate-50 dark:bg-slate-900/20">
                <p>© {new Date().getFullYear()} HabiTrack AI. Powered by Advanced RAG & Next.js.</p>
            </footer>
        </div>
    );
}