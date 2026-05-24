// src/components/HomePageClient.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // --- [FIX #1] Import the Next.js Image component ---
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  ArrowRight, Book, Briefcase, FileText, Map,
  Clock, Zap, Target, MessageSquare, Award, Star
} from 'lucide-react';
import ParticleForgeBackground from './home/ParticleForgeBackground';
import ArchitectTerminal from './home/ArchitectTerminal';
import ActionSearchBar from './home/ActionSearchBar';

// --- Type Definitions (No change needed) ---
type ResourceForCard = {
  id: string; name: string; description: string; url: string; imageUrl: string | null;
  category: { name: string } | null;
};
type OpportunityForCard = {
  id: string; title: string; description: string; organization: string; imageUrl: string | null;
};
type ArticleForCard = {
  id: string; title: string; excerpt: string | null; slug: string; imageUrl: string | null;
};
type RoadmapForCard = {
  id: string; title: string; description: string; slug: string; imageUrl: string | null;
};
interface HomePageClientProps {
  resources: ResourceForCard[];
  opportunities: OpportunityForCard[];
  articles: ArticleForCard[];
  roadmaps: RoadmapForCard[];
}

// --- Card Component (Updated to use next/image) ---
const ContentCard = ({
  href, imageUrl, placeholderIcon, category, title, description, isExternal = false
}: {
  href: string; imageUrl?: string | null; placeholderIcon: React.ReactNode;
  category?: string; title: string; description?: string | null; isExternal?: boolean
}) => (
  <Link
    href={href}
    target={isExternal ? '_blank' : '_self'}
    rel={isExternal ? 'noopener noreferrer' : ''}
    className="block h-full bg-card rounded-xl border border-border overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5"
  >
    {/* --- [FIX #2] Switched from <img> to <Image /> --- */}
    <div className="relative aspect-video overflow-hidden bg-muted">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill // The 'fill' prop makes the image cover its parent container
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // Helps Next.js choose the right image size
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">{placeholderIcon}</div>
      )}
    </div>
    <div className="p-4">
      {category && <p className="text-xs font-semibold text-primary mb-1">{category}</p>}
      <h3 className="font-semibold text-card-foreground truncate">{title}</h3>
      {description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{description}</p>}
    </div>
  </Link>
);

// --- Rest of the file (No changes needed below) ---

const ContentShelf = ({ title, items, renderItem, viewAllLink }: { title: string, items: any[], renderItem: (item: any) => React.ReactNode, viewAllLink: string }) => (
  <section className="py-12 md:py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
        <Link href={viewAllLink} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          >
            {renderItem(item)}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const ValuePropSection = () => {
  const features = [
    { icon: <Clock />, title: "Stop Wasting Time", description: "No more endless searching. We find and vet the best free resources so you can focus on learning." },
    { icon: <Zap />, title: "Build Real Skills", description: "Follow curated learning roadmaps and find high-impact opportunities to build a resume that stands out." },
    { icon: <Target />, title: "Achieve Your Goals", description: "Use the Goal Architect to plan your semester, prepare for exams, and track your progress." },
  ];
  return (
    <section className="py-16 md:py-24 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Why Seniofy?</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">Because every student deserves a clever senior.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-background p-6 rounded-lg border border-border text-center"
            >
              <div className="inline-block p-3 bg-primary/10 text-primary rounded-full mb-4">
                {React.cloneElement(feature.icon, { size: 24 })}
              </div>
              <h3 className="text-xl font-bold text-card-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const TestimonialSection = () => {
  const testimonials = [
    { name: "Priya S.", major: "B.Tech CSE, 3rd Year", quote: "Seniofy is my first stop before starting any new project. The roadmaps saved me hours of confusion for my web dev internship prep.", avatar: <Star /> },
    { name: "Amit K.", major: "Mechanical Engg, 2nd Year", quote: "I found a scholarship through the opportunities board that I never would have known about. It's an essential tool for non-CS students too!", avatar: <Award /> },
    { name: "Rohan D.", major: "B.Tech ECE, 4th Year", quote: "As someone preparing for GATE, the curated resources for core subjects are a lifesaver. It's like having a senior's personal notes.", avatar: <MessageSquare /> },
  ];
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">From the Community</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-card p-6 rounded-lg border border-border"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">{t.avatar}</div>
                <div>
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.major}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">"{t.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const StickyCTA = () => {
  const { status } = useSession();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (status !== 'unauthenticated') return;

    const handleScroll = () => {
      if (window.scrollY > 400) setIsVisible(true);
      else setIsVisible(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [status]);

  if (status !== 'unauthenticated' || !isVisible) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      exit={{ y: 100 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-card/80 backdrop-blur-lg border border-border p-3 rounded-full shadow-lg flex items-center gap-4">
        <p className="text-sm font-medium text-foreground ml-2">Unlock your potential</p>
        <Link href="/signup" className="px-5 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary/90 transition-colors">
          Join Seniofy
        </Link>
      </div>
    </motion.div>
  );
}

export default function HomePageClient({ resources, opportunities, articles, roadmaps }: HomePageClientProps) {
  return (
    <div className="overflow-x-hidden">
      <header className="relative py-24 md:py-32 px-4 overflow-hidden">
        <ParticleForgeBackground />
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="relative z-40 w-full"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Your Digital Senior, <br />
              <span className="text-primary">Always Ready.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Stop searching, start learning. We curate the best free resources, opportunities, and tools so you can focus on building your future.
            </p>
            <ActionSearchBar />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative w-full flex justify-center lg:justify-end z-10 pointer-events-none hidden md:block"
          >
            <div className="pointer-events-auto w-full max-w-lg">
              <ArchitectTerminal />
            </div>
          </motion.div>
        </div>
      </header>

      <ValuePropSection />

      <ContentShelf
        title="Latest Resources"
        items={resources.slice(0, 3)}
        renderItem={(item: ResourceForCard) => <ContentCard href={item.url} isExternal={true} imageUrl={item.imageUrl} placeholderIcon={<Book size={40} />} category={item.category?.name} title={item.name} description={item.description} />}
        viewAllLink="/resources"
      />
      <ContentShelf
        title="New Opportunities"
        items={opportunities.slice(0, 3)}
        renderItem={(item: OpportunityForCard) => <ContentCard href={`/opportunities/${item.id}`} imageUrl={item.imageUrl} placeholderIcon={<Briefcase size={40} />} category={item.organization} title={item.title} description={item.description} />}
        viewAllLink="/opportunities"
      />

      <TestimonialSection />

      <ContentShelf
        title="From the Blog"
        items={articles.slice(0, 3)}
        renderItem={(item: ArticleForCard) => <ContentCard href={`/blog/${item.slug}`} imageUrl={item.imageUrl} placeholderIcon={<FileText size={40} />} title={item.title} description={item.excerpt} />}
        viewAllLink="/blog"
      />
      <ContentShelf
        title="Featured Roadmaps"
        items={roadmaps.slice(0, 3)}
        renderItem={(item: RoadmapForCard) => <ContentCard href={`/roadmaps/${item.slug}`} imageUrl={item.imageUrl} placeholderIcon={<Map size={40} />} title={item.title} description={item.description} />}
        viewAllLink="/roadmaps"
      />

      <section className="py-16 md:py-24 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-foreground">Ready to Build Your Future?</h2>
        <p className="mt-4 max-w-xl mx-auto text-muted-foreground">Create an account to save resources, track your goals, and get personalized recommendations.</p>
        <div className="mt-8">
          <Link href="/signup" className="px-8 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-lg shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 inline-block">
            Join Seniofy for Free
          </Link>
        </div>
      </section>

      <StickyCTA />
    </div>
  );
}

