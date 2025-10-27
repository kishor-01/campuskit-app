// /src/app/tools/page.tsx
import Link from 'next/link';
import { Calculator } from 'lucide-react';

const ToolCard = ({ title, description, href, icon }: { title: string, description: string, href: string, icon: React.ReactNode }) => {
  return (
    <Link href={href} className="block group">
      <div className="bg-muted/50 p-6 rounded-lg h-full border-2 border-transparent 
                      group-hover:border-primary group-hover:bg-muted/70 transition-all duration-300">
        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-primary mb-4">
          {icon}
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </Link>
  );
};

export default function ToolsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
          EduLink Tools
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A collection of useful utilities designed to help you succeed in your academic journey.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <ToolCard 
          title="GPA Calculator"
          description="Calculate your semester (SGPA) and cumulative (CGPA) grade point average in real-time."
          href="/tools/gpa-calculator"
          icon={<Calculator size={28} />}
        />
        {/* Future tools will be added here as new cards */}
      </div>
    </div>
  );
}