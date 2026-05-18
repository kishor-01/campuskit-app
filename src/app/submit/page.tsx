'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Link as LinkIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitResource } from '@/actions/submissionActions';

export default function SubmitResourcePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  
  const [isScraping, setIsScraping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/submit');
    }
  }, [status, router]);

  useEffect(() => {
    // Fetch categories for the dropdown
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Failed to load categories:", err));
  }, []);

  const handleScrapeInfo = async () => {
    if (!url) return;
    
    // Quick URL validation
    try {
      new URL(url);
    } catch {
      return; // Invalid URL, don't attempt scrape
    }

    setIsScraping(true);
    try {
      const res = await fetch('/api/tools/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.title && !title) setTitle(data.title);
        if (data.description && !description) setDescription(data.description);
      }
    } catch (error) {
      console.error('Scraping error:', error);
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('url', url);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('categoryId', categoryId);

    const result = await submitResource(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => {
        router.push('/profile');
      }, 3000);
    }
    
    setIsSubmitting(false);
  };

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-border p-8 rounded-2xl max-w-md w-full text-center shadow-xl shadow-primary/5"
        >
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Resource Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for contributing. An admin will review your submission shortly. Once approved, it will appear on your passport.
          </p>
          <div className="animate-pulse flex items-center justify-center gap-2 text-sm text-primary font-medium">
            <Loader2 className="w-4 h-4 animate-spin" /> Redirecting to your passport...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight sm:text-5xl mb-4">
            Contribute to the Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Share a valuable resource, guide, or tool. Build your developer passport by contributing high-quality content.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl shadow-xl p-6 sm:p-10"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-foreground mb-2">
                Resource URL
              </label>
              <div className="relative flex items-center group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="url"
                  name="url"
                  id="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onBlur={handleScrapeInfo}
                  className="block w-full pl-10 pr-4 py-3 bg-background border border-input rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
                  placeholder="https://example.com/guide"
                />
                {isScraping && (
                  <div className="absolute right-3 top-3">
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">We'll try to auto-fill the details for you.</p>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="block w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                placeholder="The Ultimate Guide to Advanced React Patterns"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-foreground mb-2">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="block w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none"
              >
                <option value="" disabled>Select a category...</option>
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))
                ) : (
                  // Fallback options in case API fails or is slow
                  <>
                    <option value="frontend">Frontend Development</option>
                    <option value="backend">Backend Development</option>
                    <option value="devops">DevOps & Cloud</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="block w-full px-4 py-3 bg-background border border-input rounded-xl text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-y"
                placeholder="Why is this resource valuable? What will others learn?"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting || isScraping}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Resource'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
