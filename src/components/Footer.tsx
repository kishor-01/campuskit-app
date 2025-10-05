"use client"; 

import { Youtube, Twitter, Facebook, Instagram, Send, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  const socialIcons = [
    { icon: <Youtube />, href: "#" },
    { icon: <Twitter />, href: "#" },
    { icon: <Facebook />, href: "#" },
    { icon: <Instagram />, href: "#" },
    { icon: <Send />, href: "#" }, // Using Send for Telegram
    { icon: <Linkedin />, href: "#" },
  ];

  return (
    <footer className="bg-muted/50 text-foreground border-t border-muted">
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
                <li><a href="/resources" className="text-muted-foreground hover:text-primary transition-colors">Resources</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Community</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Events</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contribute</a></li>
              </ul>
            </div>
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-semibold">Contact</h4>
               <a href="#" className="inline-block mt-4 bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary/90 transition-colors">Get In Touch</a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-muted pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">&copy; 2025 CampusKit. All rights reserved.</p>
          <motion.div className="flex space-x-4 mt-4 md:mt-0">
            {socialIcons.map((social, index) => (
              <motion.a 
                key={index} 
                href={social.href} 
                className="text-muted-foreground hover:text-primary transition-colors"
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>
        </div>
      </div>
    </footer>
  );
}