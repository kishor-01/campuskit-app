// src/components/ResourceList.tsx

"use client"; // This directive marks the component as a Client Component

import { useState, useMemo } from "react";
import type { Prisma } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";
import { Search } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";

// Define the types for our props
type ResourceWithDetails = Prisma.ResourceGetPayload<{
  include: { category: true };
}>;
type ResourceListProps = {
  resources: (ResourceWithDetails & { isInitiallySaved: boolean })[]
};

export default function ResourceList({ resources }: ResourceListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(resources.map(r => r.category.name)))];

  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      const categoryMatch = selectedCategory === "All" || resource.category.name === selectedCategory;
      const searchMatch = searchQuery === "" ||
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [resources, searchQuery, selectedCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center border-b border-muted pb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
        >
          Find the Best Tools & Resources
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground"
        >
          A curated collection to help you succeed in college and beyond.
        </motion.p>
      </div>

      <div className="mt-8 space-y-6">
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-12 bg-background border border-muted rounded-full focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 hover:bg-muted text-muted-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={selectedCategory + searchQuery}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence>
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                isInitiallySaved={resource.isInitiallySaved}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-12"
            >
              <p className="text-muted-foreground">
                No resources found. Try a different search or category!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}