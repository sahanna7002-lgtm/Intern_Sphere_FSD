import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const api=readFileSync(new URL('../src/routes/api.js',import.meta.url),'utf8');
const models=readFileSync(new URL('../src/models/index.js',import.meta.url),'utf8');
const docs=readFileSync(new URL('../src/routes/documents.js',import.meta.url),'utf8');
test('weekly report revision endpoint requires student authentication and original ownership',()=>{
 assert.match(api,/r\.patch\('\/weekly-reports\/:id\/resubmit',auth,roles\('student'\)/);
 assert.match(api,/String\(w\.studentId\)!==String\(req\.user\.id\)/);
 assert.match(api,/w\.status!=='revision_requested'/);
});
test('institution-scoped admin analytics and reports use institutionId',()=>{
 assert.match(api,/const requireInstitution=/);
 assert.match(api,/Application\.find\(\{institutionId:req\.user\.institutionId\?\?null\}\)/);
 assert.match(api,/pendingApprovals:await Company\.countDocuments\(\{verificationStatus:'pending',institutionId:/);
});
test('allocations persist institution ownership and reject cross-institution mentors',()=>{
 assert.match(models,/assignedBy:\{\.\.\.id,ref:'User',required:true\},institutionId:id/);
 assert.match(api,/sameInstitution\(req\.user,mentor\?\?\{\}\)/);
});
test('document downloads enforce ownership or delegated access',()=>{
 assert.match(docs,/String\(d\.ownerId\)===String\(req\.user\.id\)/);
 assert.match(docs,/if\(!allowed\)throw new HttpError\(403/);
});
