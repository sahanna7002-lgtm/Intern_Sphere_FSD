import test from 'node:test';
import assert from 'node:assert/strict';
import {canCompleteInternship,combineEvaluationScores,escapeCsvCell} from '../src/services/lifecycle.js';
test('completion requires both evaluators and approved reports',()=>{
 assert.equal(canCompleteInternship({mentorEvaluation:true,companyEvaluation:true,unreviewedReports:0,approvedReports:1}),true);
 for(const data of [{mentorEvaluation:false,companyEvaluation:true,unreviewedReports:0,approvedReports:1},{mentorEvaluation:true,companyEvaluation:true,unreviewedReports:1,approvedReports:2},{mentorEvaluation:true,companyEvaluation:true,unreviewedReports:0,approvedReports:0}])assert.equal(canCompleteInternship(data),false);
});
test('weighted score is computed and invalid inputs rejected',()=>{
 assert.equal(combineEvaluationScores(80,90),84);
 assert.throws(()=>combineEvaluationScores(80,120));
 assert.throws(()=>combineEvaluationScores(80,90,70,40));
});
test('CSV output protects formulas and quotes',()=>{
 assert.equal(escapeCsvCell('=HYPERLINK("https://bad")'),`"'=HYPERLINK(""https://bad"")"`);
 assert.equal(escapeCsvCell('Acme, Inc'), '"Acme, Inc"');
});
