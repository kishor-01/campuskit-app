// /src/components/shared/AffiliateLink.tsx
import prisma from "@/lib/prisma";
import { ExternalLink } from "lucide-react";

type AffiliateLinkProps = {
  slug: string;
  children: React.ReactNode;
};

export default async function AffiliateLink({ slug, children }: AffiliateLinkProps) {
  // Fetch the link from the database using its unique slug
  const link = await prisma.affiliateLink.findUnique({
    where: { slug },
  });

  // If no link is found for the slug, gracefully fall back to plain text
  // This prevents the site from crashing if a link is deleted or a slug is mistyped
  if (!link) {
    return <span>{children}</span>;
  }

  // Render a standard anchor tag with the affiliate URL
  // We add rel="noopener noreferrer" for security and target="_blank" to open in a new tab
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
    >
      {children}
      <ExternalLink size={14} />
    </a>
  );
}