
//src/components/Footer.tsx

"use client";

import Link from "next/link";
import { Youtube, Twitter, Linkedin, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function Footer() {
  const socialIcons = [
    { icon: <Twitter />, href: "https://x.com/GetSeniofy", label: "X (Twitter)" },
    { icon: <Instagram />, href: "https://www.instagram.com/getSeniofy/", label: "Instagram" },
    { icon: <Linkedin />, href: "#", label: "LinkedIn" },
    { icon: <Youtube />, href: "#", label: "YouTube" },
  ];

  function onSocialClick(e: React.MouseEvent, href: string) {
    if (href === "#") {
      e.preventDefault();
      toast.error("Social link not configured yet.");
    }
  }

  async function onNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const email = (formData.get('email') as string || '').trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to subscribe');

      toast.success(json?.message || 'Subscribed! Check your inbox for confirmation.');
      form.reset();
    } catch (err: any) {
      console.error('Newsletter error:', err);
      toast.error(err?.message || 'Failed to subscribe. Try again later.');
    }
  }

  return (
    <footer className="bg-background border-t border-border mt-16">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand & Newsletter */}
          <div className="md:col-span-5 lg:col-span-4 space-y-4">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center font-bold text-primary-foreground">CK</div>
                <h3 className="text-2xl font-bold">Seniofy</h3>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Your digital senior, curating the best resources for your success.
            </p>
            <form onSubmit={onNewsletterSubmit} className="mt-4">
                <label htmlFor="email-newsletter" className="font-semibold text-sm">Stay Updated</label>
                <div className="flex gap-2 mt-2">
                    <input name="email" id="email-newsletter" type="email" placeholder="your.email@college.edu" required className="w-full p-2 text-sm bg-input rounded-md border-border focus:ring-primary focus:border-primary"/>
                    <button type="submit" className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md font-semibold hover:bg-primary/90">
                        Subscribe
                    </button>
                </div>
            </form>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-foreground">Navigate</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/resources" className="text-muted-foreground hover:text-primary">Resources</Link></li>
                <li><Link href="/opportunities" className="text-muted-foreground hover:text-primary">Opportunities</Link></li>
                <li><Link href="/roadmaps" className="text-muted-foreground hover:text-primary">Roadmaps</Link></li>
              </ul>
            </div>
             <div>
              <h4 className="font-semibold text-foreground">Tools</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/tools" className="text-muted-foreground hover:text-primary">All Tools</Link></li>
                <li><Link href="/tools/gpa-calculator" className="text-muted-foreground hover:text-primary">GPA Calculator</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Community</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><Link href="/submit-resource" className="text-muted-foreground hover:text-primary">Contribute</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">About</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/about" className="text-muted-foreground hover:text-primary">Our Mission</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} Seniofy. All rights reserved.</p>
          <div className="flex space-x-4">
            {socialIcons.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                onClick={(e) => onSocialClick(e, social.href)}
                className="text-muted-foreground hover:text-primary"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={social.label}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
