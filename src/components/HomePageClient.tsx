// src/components/HomePageClient.tsx

"use client";

import { Clock, Rocket, Compass, Briefcase, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePageClient() {
    // CORRECTED: Restored the detailed category list
    const featuredItems = [
        { name: "Resources", href: "/resources", icon: <Compass size={32} /> },
        { name: "Opportunities", href: "/opportunities", icon: <Briefcase size={32} /> },
        { name: "Blog", href: "/blog", icon: <FileText size={32} /> },
        { name: "Programming", href: "/resources?category=Programming", icon: <Rocket size={32} /> },
        { name: "Productivity", href: "/resources?category=Productivity", icon: <Clock size={32} /> },
    ];

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

    return (
        <>
            <header className="bg-background py-20 sm:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                        CampusKit: Your Digital Senior
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
                        Curated resources, tools, and opportunities to help you save time, save money, and build valuable skills.
                    </motion.p>
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="mt-8">
                        <Link href="/opportunities" className="inline-block bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-lg shadow-md hover:bg-primary/90 transition-colors duration-300">
                            Explore Opportunities
                        </Link>
                    </motion.div>
                </div>
            </header>

            <section id="explore" className="pb-16 sm:pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
                            Start Exploring
                        </h2>
                    </div>
                    <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} className="grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 lg:max-w-none">
                        {featuredItems.map((item) => (
                            <motion.div variants={itemVariants} key={item.name}>
                                <Link href={item.href} className="block p-6 bg-muted/50 rounded-xl shadow-sm hover:shadow-lg hover:bg-primary/10 transition duration-300 text-center">
                                    <div className="w-16 h-16 mx-auto text-primary mb-4 flex items-center justify-center">{item.icon}</div>
                                    <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>
        </>
    );
}