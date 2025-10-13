// src/app/submit-resource/page.tsx
import { submitResource } from "@/actions/resourceActions";
import prisma from "@/lib/prisma";
// This page should be protected so only logged-in users can access it.
// You would typically handle this in your middleware.

export default async function SubmitResourcePage() {
  // Fetch categories to populate the dropdown
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Submit a Resource
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Found a great tool, course, or article? Share it with the community! All submissions are reviewed by our team.
          </p>
        </div>

        <form 
          action={submitResource}
          className="bg-background p-8 rounded-lg shadow-sm space-y-6"
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">Resource Name</label>
            <input type="text" name="name" id="name" required className="w-full p-2 bg-input rounded-md" />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-foreground mb-1">URL</label>
            <input type="url" name="url" id="url" required placeholder="https://example.com" className="w-full p-2 bg-input rounded-md" />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-foreground mb-1">Image URL (optional)</label>
            <input type="url" name="imageUrl" id="imageUrl" placeholder="https://example.com/image.jpg" className="w-full p-2 bg-input rounded-md" />
            <p className="text-xs text-muted-foreground mt-1">Optional: an image to display on resource cards.</p>
          </div>

          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-foreground mb-1">Category</label>
            <select name="categoryId" id="categoryId" required className="w-full p-2 bg-input rounded-md">
              <option value="" disabled>Select a category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">Why is this useful? (Description)</label>
            <textarea name="description" id="description" rows={4} required className="w-full p-2 bg-input rounded-md"></textarea>
          </div>

          <div className="pt-4">
            <button type="submit" className="w-full p-3 bg-primary text-primary-foreground rounded-md font-semibold text-lg hover:bg-primary/90 transition-colors">
              Submit for Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
