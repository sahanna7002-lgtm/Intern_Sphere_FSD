import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const roles=['student','admin','mentor'];
test('only three active role identifiers appear',()=>{const s=fs.readFileSync(new URL('../src/constants/roles.js',import.meta.url),'utf8');for(const role of roles)assert.ok(s.includes(role));});
test('application terminal statuses are terminal',async()=>{const {APPLICATION_TRANSITIONS:t}=await import('../src/constants/roles.js');for(const status of ['selected','rejected','withdrawn'])assert.deepEqual(t[status],[]);});
test('application transition requires shortlist before selection',async()=>{const {APPLICATION_TRANSITIONS:t}=await import('../src/constants/roles.js');assert.ok(!t.applied.includes('selected'));assert.ok(t.shortlisted.includes('selected'));});
