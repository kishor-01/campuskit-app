// src/components/Footer.tsx
"use client";

import Link from "next/link";
import { Youtube, Twitter, Facebook, Instagram, Send, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function Footer() {
  const socialIcons = [
    { icon: <Youtube />, href: "#", label: "YouTube" },
    { icon: <Twitter />, href: "#", label: "Twitter" },
    { icon: <Facebook />, href: "#", label: "Facebook" },
    { icon: <Instagram />, href: "#", label: "Instagram" },
    { icon: <Send />, href: "#", label: "Telegram" },
    { icon: <Linkedin />, href: "#", label: "LinkedIn" },
  ];

  function placeholder(e: React.MouseEvent) {
    e.preventDefault();
    toast("Link not configured yet.");
  }

  return (
    <footer className="app-footer text-foreground" role="contentinfo">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center font-bold text-primary text-xl">
                C
              </div>
              <h3 className="text-2xl font-bold">CampusKit</h3>
            </div>
            <p className="text-muted-foreground">Your digital senior, curating the best resources for your success.</p>
          </div>

          {/* Column 2 & 3: Links */}
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold">Platform</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/resources" className="text-muted-foreground hover:text-primary transition-colors">
                    Resources
                  </Link>
                </li>
                <li>
                  <a href="#" onClick={placeholder} className="text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" onClick={placeholder} className="text-muted-foreground hover:text-primary transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Community</h4>
              <ul className="mt-4 space-y-2">
                <li>
                  <a href="#" onClick={placeholder} className="text-muted-foreground hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" onClick={placeholder} className="text-muted-foreground hover:text-primary transition-colors">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#" onClick={placeholder} className="text-muted-foreground hover:text-primary transition-colors">
                    Contribute
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="font-semibold">Contact</h4>
              <a
                href="#"
                onClick={placeholder}
                className="inline-block mt-4 bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary/90 transition-colors"
              >
                Get In Touch
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-surface-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">&copy; {new Date().getFullYear()} CampusKit. All rights reserved.</p>

          <motion.div className="flex space-x-4 mt-4 md:mt-0" initial="rest" whileHover="hover">
            {socialIcons.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                onClick={(e) => {
                  if (social.href === "#") {
                    e.preventDefault();
                    toast("Social link not configured");
                  }
                }}
                className="text-muted-foreground hover:text-primary transition-colors"
                whileHover={{ scale: 1.15, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
                aria-label={social.label}
                target={social.href === "#" ? undefined : "_blank"}
                rel={social.href === "#" ? undefined : "noopener noreferrer"}
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>

      {/*
        Optional: add JSON-LD organization schema for SEO.
        Uncomment and customize below if desired.
      */}
      {/* <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "CampusKit",
        "url": "https://your-site.example",
      })}} /> */}
    </footer>
  );
}
