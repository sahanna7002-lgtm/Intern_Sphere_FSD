/** Pure internship completion and scoring rules; no database dependency. */
export function canCompleteInternship({mentorEvaluation,companyEvaluation,unreviewedReports,approvedReports}) {
 return Boolean(mentorEvaluation && companyEvaluation && unreviewedReports === 0 && approvedReports > 0);
}
export function combineEvaluationScores(mentorScore,companyScore,mentorWeight=60,companyWeight=40) {
 if (![mentorScore,companyScore,mentorWeight,companyWeight].every(Number.isFinite)) throw new Error('Non-finite evaluation value');
 if(mentorScore<0||mentorScore>100||companyScore<0||companyScore>100||mentorWeight<0||companyWeight<0||mentorWeight+companyWeight!==100) throw new Error('Invalid evaluation scores or weights');
 return Number(((mentorScore*mentorWeight+companyScore*companyWeight)/100).toFixed(2));
}
export function escapeCsvCell(value) {
 const text=String(value??'');
 const safe=/^\s*[=+@\-]/.test(text)?"'"+text:text;
 return '"'+safe.replaceAll('"','""')+'"';
}
