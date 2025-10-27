// /src/actions/index.ts

'use server';

import { ResourceStatus } from "@prisma/client";

/* --- Authentication & User Actions --- */
export async function authenticate(prevState: any, formData: FormData) {
  const mod = await import('./authActions');
  return await mod.authenticate(prevState, formData);
}

export async function registerUser(prevState: any, formData: FormData) {
  const mod = await import('./authActions');
  return await mod.registerUser(prevState, formData);
}

/* --- Contact Actions --- */
export async function sendContactMessage(prevState: any, formData: FormData) {
  const mod = await import('./contactActions');
  return await mod.sendContactMessage(prevState, formData);
}

/* --- Resource Actions --- */
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

export async function submitResource(prevState: any, formData: FormData) {
  const mod = await import('./resourceActions');
  return await mod.submitResource(prevState, formData);
}

export async function toggleSaveResource(resourceId: string) {
  const mod = await import('./resourceActions');
  return await mod.toggleSaveResource(resourceId);
}

export async function updateResourceStatus(id: string, status: ResourceStatus) {
  const mod = await import('./resourceActions');
  return await mod.updateResourceStatus(id, status);
}

/* --- Category Actions --- */
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

/* --- Article Actions --- */
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

/* --- Opportunity Actions --- */
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

export async function submitOpportunity(formData: FormData) {
  const mod = await import('./opportunityActions');
  return await mod.submitOpportunity(formData);
}

export async function updateOpportunityStatus(id: string, status: ResourceStatus) {
  const mod = await import('./opportunityActions');
  return await mod.updateOpportunityStatus(id, status);
}

/* --- Affiliate Actions --- */
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

/* --- Roadmap Actions --- */
export async function createRoadmap(prevState: any, formData: FormData) {
  const mod = await import('./roadmapActions');
  return await mod.createRoadmap(prevState, formData);
}

export async function deleteRoadmap(prevState: any, formData: FormData) {
  const mod = await import('./roadmapActions');
  return await mod.deleteRoadmap(prevState, formData);
}

export async function toggleRoadmapStatus(prevState: any, formData: FormData) {
  const mod = await import('./roadmapActions');
  return await mod.toggleRoadmapStatus(prevState, formData);
}

export async function createRoadmapStep(prevState: any, formData: FormData) {
  const mod = await import('./roadmapActions');
  return await mod.createRoadmapStep(prevState, formData);
}

export async function updateRoadmapStep(prevState: any, formData: FormData) {
  const mod = await import('./roadmapActions');
  return await mod.updateRoadmapStep(prevState, formData);
}

export async function deleteRoadmapStep(prevState: any, formData: FormData) {
  const mod = await import('./roadmapActions');
  return await mod.deleteRoadmapStep(prevState, formData);
}

export async function linkResourcesToStep(formData: FormData) {
  const mod = await import('./roadmapActions');
  return await mod.linkResourcesToStep(formData);
}

/* --- Goal Actions --- */
export async function createGoal(prevState: any, formData: FormData) {
  const mod = await import('./goalActions');
  return await mod.createGoal(prevState, formData);
}

export async function updateGoal(prevState: any, formData: FormData) {
  const mod = await import('./goalActions');
  return await mod.updateGoal(prevState, formData);
}

export async function deleteGoal(prevState: any, formData: FormData) {
  const mod = await import('./goalActions');
  return await mod.deleteGoal(prevState, formData);
}

export async function createMilestone(prevState: any, formData: FormData) {
  const mod = await import('./goalActions');
  return await mod.createMilestone(prevState, formData);
}

export async function updateMilestone(prevState: any, formData: FormData) {
  const mod = await import('./goalActions');
  return await mod.updateMilestone(prevState, formData);
}

export async function deleteMilestone(prevState: any, formData: FormData) {
  const mod = await import('./goalActions');
  return await mod.deleteMilestone(prevState, formData);
}

export async function createTopic(prevState: any, formData: FormData) {
  const mod = await import('./goalActions');
  return await mod.createTopic(prevState, formData);
}

export async function updateTopic(prevState: any, formData: FormData) {
  const mod = await import('./goalActions');
  return await mod.updateTopic(prevState, formData);
}

export async function deleteTopic(prevState: any, formData: FormData) {
  const mod = await import('./goalActions');
  return await mod.deleteTopic(prevState, formData);
}

export async function createSubTopic(prevState: any, formData: FormData) {
  const mod = await import('./goalActions');
  return await mod.createSubTopic(prevState, formData);
}

export async function updateSubTopic(prevState: any, formData: FormData) {
  const mod = await import('./goalActions');
  return await mod.updateSubTopic(prevState, formData);
}

export async function deleteSubTopic(prevState: any, formData: FormData) {
  const mod = await import('./goalActions');
  return await mod.deleteSubTopic(prevState, formData);
}

export async function toggleSubTopicStatus(id: string, isCompleted: boolean) {
  const mod = await import('./goalActions');
  return await mod.toggleSubTopicStatus(id, isCompleted);
}

export async function linkResourcesToSubTopic(subTopicId: string, resources: { resourceId: string, personalNote: string | null }[]) {
  const mod = await import('./goalActions');
  return await mod.linkResourcesToSubTopic(subTopicId, resources);
}

export async function createGoalFromRoadmapTyped(roadmapId: string, title: string, targetDate: string | null) {
  const mod = await import('./goalActions');
  return await mod.createGoalFromRoadmapTyped(roadmapId, title, targetDate);
}

export async function linkResourcesToTopic(topicId: string, resources: { resourceId: string, personalNote: string | null }[]) {
  const mod = await import('./goalActions');
  return await mod.linkResourcesToTopic(topicId, resources);
}

export async function updateTopicNote(topicId: string, note: string | null) {
  const mod = await import('./goalActions');
  return await mod.updateTopicNote(topicId, note);
}

export async function updateSubTopicNote(subTopicId: string, note: string | null) {
  const mod = await import('./goalActions');
  return await mod.updateSubTopicNote(subTopicId, note);
}