import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {canAssignApplicationReviewer,canMentorDecideApplication,canChangeApplicationStatus} from '../src/services/applicationApproval.js';

test('mentor reviews only an application explicitly assigned to their account and institution',()=>{
  const app={reviewerMentorId:'mentor-1',institutionId:'college-A'};
  assert.equal(canMentorDecideApplication(app,{id:'mentor-1',institutionId:'college-A'}),true);
  assert.equal(canMentorDecideApplication(app,{id:'mentor-2',institutionId:'college-A'}),false);
  assert.equal(canMentorDecideApplication(app,{id:'mentor-1',institutionId:'college-B'}),false);
  assert.equal(canMentorDecideApplication({...app,reviewerMentorId:null},{id:'mentor-1',institutionId:'college-A'}),false);
});
test('reviewers can only be assigned before a final decision',()=>{
  for(const status of ['applied','under_review','shortlisted'])assert.equal(canAssignApplicationReviewer(status),true);
  for(const status of ['selected','rejected','withdrawn'])assert.equal(canAssignApplicationReviewer(status),false);
});
test('mentor confirmation follows existing shortlist-first lifecycle',()=>{
  assert.equal(canChangeApplicationStatus('applied','selected'),false);
  assert.equal(canChangeApplicationStatus('applied','under_review'),true);
  assert.equal(canChangeApplicationStatus('under_review','shortlisted'),true);
  assert.equal(canChangeApplicationStatus('shortlisted','selected'),true);
  assert.equal(canChangeApplicationStatus('selected','rejected'),false);
});
test('only students or mentors can change application statuses, and admins only assign reviewers',()=>{
  const api=fs.readFileSync(new URL('../src/routes/api.js',import.meta.url),'utf8');
  assert.match(api,/applications\/:id\/status',auth,roles\('student','mentor'\)/);
  assert.match(api,/applications\/:id\/reviewer',auth,roles\('admin'\)/);
});
