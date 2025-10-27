// /src/app/submit-resource/page.tsx

import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SubmitResourcePageClient from "./SubmitResourcePageClient";

export default async function SubmitResourcePage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login?callbackUrl=/submit-resource');
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return <SubmitResourcePageClient categories={categories} />;
}