// /src/app/post-opportunity/thank-you/page.tsx
import Link from 'next/link'

export default function ThankYouPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
          Submission Received!
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Thank you for posting an opportunity. Our team will review it shortly.
        </p>
        <Link href="/" className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold hover:bg-primary/90 transition-colors">
          Back to Homepage
        </Link>
      </div>
    </div>
  )
}