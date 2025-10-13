// /src/app/post-opportunity/page.tsx

import { OpportunityType } from "@prisma/client";
import { submitOpportunity } from "@/actions/opportunityActions";

// This helper creates a user-friendly label from an enum value
// e.g., FULL_TIME -> Full Time
const formatEnumLabel = (enumValue: string) => {
  return enumValue
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function PostOpportunityPage() {
  return (
    <div className="bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Post an Opportunity
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Reach thousands of ambitious students and recent graduates. Fill out the form below and we'll review your submission shortly.
          </p>
        </div>

        {/* Form */}
        <form 
          action={submitOpportunity}
          className="bg-background p-8 rounded-lg shadow-sm space-y-6"
        >
          {/* Row 1: Title & Organization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">Job Title / Event Name</label>
              <input type="text" name="title" id="title" required className="w-full p-2 bg-input rounded-md" />
            </div>
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-foreground mb-1">Company / Organization</label>
              <input type="text" name="organization" id="organization" required className="w-full p-2 bg-input rounded-md" />
            </div>
          </div>

          {/* Row 2: Location & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-foreground mb-1">Location (e.g., Remote, Pune)</label>
              <input type="text" name="location" id="location" required className="w-full p-2 bg-input rounded-md" />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-foreground mb-1">Opportunity Type</label>
              <select name="type" id="type" required className="w-full p-2 bg-input rounded-md">
                {/* Dynamically populate options from the OpportunityType enum */}
                {Object.values(OpportunityType).map(type => (
                  <option key={type} value={type}>{formatEnumLabel(type)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">Description</label>
            <textarea name="description" id="description" rows={6} required className="w-full p-2 bg-input rounded-md"></textarea>
          </div>
          
          {/* Row 4: Apply URL */}
          <div>
            <label htmlFor="applyUrl" className="block text-sm font-medium text-foreground mb-1">Application URL</label>
            <input type="url" name="applyUrl" id="applyUrl" required placeholder="https://yourcompany.com/careers" className="w-full p-2 bg-input rounded-md" />
          </div>

          {/* Submission Button */}
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