import {Router} from 'express';
import {auth,roles} from '../middleware/auth.js';
import {asyncHandler,ok} from '../utils/errors.js';
import {User,StudentProfile,Internship,Application,MentorAllocation,WeeklyReport,Evaluation} from '../models/index.js';
const r=Router();r.use(auth);
const tally=(items,key)=>Object.entries(items.reduce((acc,x)=>{const v=String(typeof key==='function'?key(x):x[key]||'unknown');acc[v]=(acc[v]||0)+1;return acc;},{})).map(([name,count])=>({name,count}));
const dateKey=d=>new Date(d).toISOString().slice(0,7);
const groupDates=items=>tally(items,x=>dateKey(x.createdAt)).sort((a,b)=>a.name.localeCompare(b.name));
const ids=items=>items.map(x=>x._id);
const progress=(reports)=>{const weeks=new Map();for(const x of reports){const key=x.weekNumber;const v=weeks.get(key)||{week:key,submitted:0,approved:0};v.submitted++;if(x.status==='approved')v.approved++;weeks.set(key,v);}return [...weeks.values()].sort((a,b)=>a.week-b.week);};
const scores=es=>{const k=['technical','communication','problemSolving','taskCompletion','professionalism'];return k.map(key=>({name:key,score:es.length?Number((es.reduce((sum,e)=>sum+(Number(e.scores?.[key])||0),0)/es.length).toFixed(2)):0}));};
r.get('/mentor',roles('mentor'),asyncHandler(async(req,res)=>{
 const allocations=await MentorAllocation.find({mentorId:req.user.id}).populate('studentId','name email').lean();
 const active=allocations.filter(x=>x.status==='active');const allocationIds=ids(allocations);
 const [reports,evaluations]=await Promise.all([WeeklyReport.find({allocationId:{$in:allocationIds}}).sort({weekNumber:1}).lean(),Evaluation.find({allocationId:{$in:allocationIds},evaluatorType:'mentor',status:'submitted'}).lean()]);
 const studentMap=new Map(allocations.map(x=>[String(x._id),x.studentId?.name||'Student']));
 const studentPerformance=evaluations.map(x=>({name:studentMap.get(String(x.allocationId))||'Student',score:x.totalScore??0}));
 const statuses=tally(reports,'status');const weekly=progress(reports);
 ok(res,{kpis:{assignedStudents:new Set(active.map(x=>String(x.studentId?._id))).size,activeInternships:active.length,reportsSubmitted:reports.length,pendingReviews:reports.filter(x=>x.status==='submitted').length,approvedReports:reports.filter(x=>x.status==='approved').length,averageStudentProgress:null,completionRate:allocations.length?Math.round(allocations.filter(x=>x.status==='completed').length/allocations.length*100):null},weekly,statuses,studentPerformance,skills:scores(evaluations),completion:tally(allocations,x=>x.status==='completed'?'Completed':x.status==='active'?'In Progress':'Not Started'),reports:reports.map(x=>({...x,studentName:studentMap.get(String(x.allocationId))||'Student'})),students:active.map(x=>({id:String(x.studentId?._id),name:x.studentId?.name||'Student'}))});
}));
r.get('/admin',roles('admin'),asyncHandler(async(req,res)=>{
 const scope={institutionId:req.user.institutionId??null};
 const [students,mentors,internships,applications,allocations,evaluations,profiles]=await Promise.all([User.find({...scope,role:'student'}).lean(),User.find({...scope,role:'mentor'}).lean(),Internship.find(scope).lean(),Application.find(scope).lean(),MentorAllocation.find(scope).populate('mentorId','name').lean(),Evaluation.find({status:'submitted'}).lean(),StudentProfile.find(scope).lean()]);
 const active=allocations.filter(x=>x.status==='active');const studentIds=new Set(active.map(x=>String(x.studentId)));const completion=tally(allocations,x=>x.status==='completed'?'Completed':x.status==='active'?'In Progress':'Not Started');
 const workloads=mentors.map(m=>({name:m.name,count:active.filter(x=>String(x.mentorId?._id)===String(m._id)).length}));
 const profileByUser=new Map(profiles.map(x=>[String(x.userId),x.department]));const allocationById=new Map(allocations.map(x=>[String(x._id),x]));const byDept={};for(const e of evaluations){const a=allocationById.get(String(e.allocationId));if(!a)continue;const d=profileByUser.get(String(a.studentId))||'Unspecified';(byDept[d]??=[]).push(e.totalScore??0);}
 const departmentScores=Object.entries(byDept).map(([name,values])=>({name,score:Number((values.reduce((a,b)=>a+b,0)/values.length).toFixed(1))}));
 ok(res,{kpis:{students:students.length,mentors:mentors.length,opportunities:internships.length,applications:applications.length,activeInternships:active.length,completedInternships:allocations.filter(x=>x.status==='completed').length,assignedStudents:studentIds.size,pendingEvaluations:active.filter(a=>!evaluations.some(e=>String(e.allocationId)===String(a._id)&&e.evaluatorType==='mentor')).length},applicationTrend:groupDates(applications),categories:tally(internships,x=>x.category||'Other'),applicationStatuses:tally(applications,'status'),allocationOverview:[{name:'Assigned',count:studentIds.size},{name:'Unassigned',count:Math.max(0,students.length-studentIds.size)}],participation:groupDates(allocations),completion,departmentScores,workloads});
}));
export default r;
