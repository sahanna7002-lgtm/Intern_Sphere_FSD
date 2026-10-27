import {APPLICATION_TRANSITIONS} from '../constants/roles.js';

export const REVIEWABLE_APPLICATION_STATUSES=['applied','under_review','shortlisted'];
export function canAssignApplicationReviewer(applicationStatus){
  return REVIEWABLE_APPLICATION_STATUSES.includes(applicationStatus);
}
export function canMentorDecideApplication(application,mentor){
  return Boolean(application?.reviewerMentorId && mentor?.id &&
    String(application.reviewerMentorId)===String(mentor.id) &&
    String(application.institutionId??'')===String(mentor.institutionId??''));
}
export function canChangeApplicationStatus(from,to){
  return (APPLICATION_TRANSITIONS[from]||[]).includes(to);
}
