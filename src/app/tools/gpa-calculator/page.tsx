// /src/app/tools/gpa-calculator/page.tsx
import GpaCalculator from "@/components/tools/GpaCalculator";

export default function GpaCalculatorPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
          GPA Calculator
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Calculate your SGPA and CGPA with ease. Add or remove courses and see your results update in real-time.
        </p>
      </div>

      {/* The Interactive Component */}
      <GpaCalculator />
    </div>
  );
}