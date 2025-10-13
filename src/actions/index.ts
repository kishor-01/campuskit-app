// /src/actions/index.ts
'use server';

import { ResourceStatus } from "@prisma/client";

/* ------------------------------
   Authentication & User Actions
   ------------------------------ */
export async function authenticate(prevState: any, formData: FormData) {
  const mod = await import('./authActions');
  return await mod.authenticate(prevState, formData);
}
export async function registerUser(prevState: any, formData: FormData) {
  const mod = await import('./authActions');
  return await mod.registerUser(prevState, formData);
}
export async function sendContactMessage(prevState: any, formData: FormData) {
  const mod = await import('./authActions');
  return await mod.sendContactMessage(prevState, formData);
}

/* ------------------------------
   Resource Actions
   ------------------------------ */
export async function createResource(prevState: any, formData: FormData) {
  const mod = await import('./resourceActions');
  return await mod.createResource(prevState, formData);
}
export async function updateResource(prevState: any, formData: FormData) {
  const mod = await import('./resourceActions');
  return await mod.updateResource(prevState, formData);
}
export async function deleteResource(prevState: any, formData: FormData) {
  const mod = await import('./resourceActions');
  return await mod.deleteResource(prevState, formData);
}
export async function approveResource(formData: FormData) {
  const mod = await import('./resourceActions');
  return await mod.approveResource(formData);
}
export async function rejectResource(formData: FormData) {
  const mod = await import('./resourceActions');
  return await mod.rejectResource(formData);
}
export async function submitResource(formData: FormData) {
  const mod = await import('./resourceActions');
  return await mod.submitResource(formData);
}
export async function toggleSaveResource(resourceId: string) {
  const mod = await import('./resourceActions');
  return await mod.toggleSaveResource(resourceId);
}
export async function updateResourceStatus(id: string, status: ResourceStatus) {
  const mod = await import('./resourceActions');
  return await mod.updateResourceStatus(id, status);
}

/* ------------------------------
   Category Actions
   ------------------------------ */
export async function manageCategory(prevState: any, formData: FormData) {
  const mod = await import('./categoryActions');
  return await mod.manageCategory(prevState, formData);
}
export async function deleteCategory(prevState: any, formData: FormData) {
  const mod = await import('./categoryActions');
  return await mod.deleteCategory(prevState, formData);
}

export async function createCategory(prevState: any, formData: FormData) {
  const mod = await import('./categoryActions');
  return await mod.createCategory(prevState, formData);
}

export async function updateCategory(prevState: any, formData: FormData) {
  const mod = await import('./categoryActions');
  return await mod.updateCategory(prevState, formData);
}


/* ------------------------------
   Article Actions
   ------------------------------ */
export async function createArticle(prevState: any, formData: FormData) {
  const mod = await import('./articleActions');
  return await mod.createArticle(prevState, formData);
}
export async function updateArticle(prevState: any, formData: FormData) {
  const mod = await import('./articleActions');
  return await mod.updateArticle(prevState, formData);
}
export async function deleteArticle(prevState: any, formData: FormData) {
  const mod = await import('./articleActions');
  return await mod.deleteArticle(prevState, formData);
}
export async function publishArticle(formData: FormData) {
    const mod = await import('./articleActions');
    return await mod.publishArticle(formData);
}

/* ------------------------------
   Opportunity Actions
   ------------------------------ */
export async function createOpportunity(prevState: any, formData: FormData) {
  const mod = await import('./opportunityActions');
  return await mod.createOpportunity(prevState, formData);
}
export async function updateOpportunity(prevState: any, formData: FormData) {
  const mod = await import('./opportunityActions');
  return await mod.updateOpportunity(prevState, formData);
}
export async function deleteOpportunity(prevState: any, formData: FormData) {
  const mod = await import('./opportunityActions');
  return await mod.deleteOpportunity(prevState, formData);
}
export async function approveOpportunity(formData: FormData) {
  const mod = await import('./opportunityActions');
  return await mod.approveOpportunity(formData);
}
export async function rejectOpportunity(formData: FormData) {
  const mod = await import('./opportunityActions');
  return await mod.rejectOpportunity(formData);
}
export async function submitOpportunity(formData: FormData) {
  const mod = await import('./opportunityActions');
  return await mod.submitOpportunity(formData);
}
/* ------------------------------
   Affiliate Actions
   ------------------------------ */

// --- Affiliate Partner Actions ---

export async function createAffiliatePartner(prevState: any, formData: FormData) {
  const mod = await import('./affiliateActions');
  return await mod.createAffiliatePartner(prevState, formData);
}

export async function updateAffiliatePartner(prevState: any, formData: FormData) {
  const mod = await import('./affiliateActions');
  return await mod.updateAffiliatePartner(prevState, formData);
}

export async function deleteAffiliatePartner(prevState: any, formData: FormData) {
  const mod = await import('./affiliateActions');
  return await mod.deleteAffiliatePartner(prevState, formData);
}

// --- Affiliate Link Actions ---

export async function createAffiliateLink(prevState: any, formData: FormData) {
  const mod = await import('./affiliateActions');
  return await mod.createAffiliateLink(prevState, formData);
}

export async function updateAffiliateLink(prevState: any, formData: FormData) {
  const mod = await import('./affiliateActions');
  return await mod.updateAffiliateLink(prevState, formData);
}

export async function deleteAffiliateLink(prevState: any, formData: FormData) {
  const mod = await import('./affiliateActions');
  return await mod.deleteAffiliateLink(prevState, formData);
}

/* ------------------------------
   Roadmap Actions
   ------------------------------ */

// FIX: Added 'prevState' to match the useFormState hook signature
export async function createRoadmap(prevState: any, formData: FormData) {
  const mod = await import('./roadmapActions');
  return await mod.createRoadmap(prevState, formData);
}

// FIX: Added 'prevState'
export async function deleteRoadmap(prevState: any, formData: FormData) {
  const mod = await import('./roadmapActions');
  return await mod.deleteRoadmap(prevState, formData);
}

// FIX: Added 'prevState'
export async function toggleRoadmapStatus(prevState: any, formData: FormData) {
  const mod = await import('./roadmapActions');
  return await mod.toggleRoadmapStatus(prevState, formData);
}

// FIX: Added 'prevState'
export async function createRoadmapStep(prevState: any, formData: FormData) {
  const mod = await import('./roadmapActions');
  return await mod.createRoadmapStep(prevState, formData);
}

// FIX: Added 'prevState'
export async function updateRoadmapStep(prevState: any, formData: FormData) {
  const mod = await import('./roadmapActions');
  return await mod.updateRoadmapStep(prevState, formData);
}

// FIX: Added 'prevState'
export async function deleteRoadmapStep(prevState: any, formData: FormData) {
  const mod = await import('./roadmapActions');
  return await mod.deleteRoadmapStep(prevState, formData);
}

// This action is called by useTransition, which doesn't pass prevState, so its signature is correct.
export async function linkResourcesToStep(formData: FormData) {
  const mod = await import('./roadmapActions');
  return await mod.linkResourcesToStep(formData);
}




/* ------------------------------
   Goal Actions
   ------------------------------ */
// ... your goal action wrappers ...