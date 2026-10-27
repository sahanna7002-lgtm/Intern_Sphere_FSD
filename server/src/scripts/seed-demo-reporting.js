import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { verifyEnv } from '../config/env.js';
import { User, StudentProfile, Internship, Application, MentorAllocation, WeeklyReport, Evaluation } from '../models/index.js';

// Add-only, repeatable DEVELOPMENT demo data. Never reset or overwrite existing accounts or work.
if (process.env.NODE_ENV !== 'development') throw new Error('Demo reporting data is permitted only with NODE_ENV=development');
verifyEnv();
if (!process.env.SEED_DEMO_PASSWORD || process.env.SEED_DEMO_PASSWORD.length < 10 || process.env.SEED_DEMO_PASSWORD === 'CHANGE_DEMO_PASSWORD_HERE') throw new Error('Set a development SEED_DEMO_PASSWORD of at least 10 characters');
await connectDB();
try {
  const admin = await User.findOne({ role: 'admin', status: 'active' });
  if (!admin) throw new Error('Admin not found. Run original development seed first.');
  const internships = await Internship.find({ status: 'open', institutionId: admin.institutionId ?? null }).sort({ title: 1 });
  if (internships.length < 10) throw new Error('Run npm run seed:opportunities first; at least 10 active internships are required');
  const hash = await bcrypt.hash(process.env.SEED_DEMO_PASSWORD, 12);
  const departmentNames = ['Computer Science', 'Information Technology', 'Electronics', 'Artificial Intelligence', 'Data Science'];
  const names = [
    'Aditi Narayanan','Arjun Menon','Bhavana Iyer','Charan Reddy','Deepika Nair','Eshan Gupta','Farah Khan','Gautham Krishnan',
    'Harini Subramanian','Ishaan Varma','Janani Raj','Karthik Srinivasan','Lavanya Mohan','Manoj Prasad','Nithya Raman','Omkar Patil',
    'Pavithra S','Rahul Desai','Sanjana Balaji','Tarun Kumar','Uma Devi','Varun Shetty','Yamini Bose','Zoya Siddiqui',
    'Akash Mehta','Divya Rao','Neeraj Singh','Meghana R','Pranav Joshi','Keerthana P'
  ];
  const faculty = ['Dr Kavitha Raman','Dr Sanjay Kumar','Dr Nivedita Iyer','Prof Arun Menon','Dr Priya Suresh','Dr Rohit Varma',
    'Prof Leena Nair','Dr Vikram Shah','Dr Sahana Reddy','Prof Ramesh Iyer','Dr Sneha Bose'];
  let newStudents = 0, newMentors = 0, newApplications = 0, newAllocations = 0, newReports = 0, newEvaluations = 0;
  const mentorIds=[];
  for (let i=0; i<faculty.length; i++) {
    const email=`demo.faculty${String(i+1).padStart(2,'0')}@internsphere.demo`;
    const result=await User.updateOne({email},{$setOnInsert:{name:faculty[i],email,role:'mentor',status:'active',institutionId:admin.institutionId??null,passwordHash:hash}},{upsert:true});
    newMentors+=result.upsertedCount;
    mentorIds.push((await User.findOne({email}).select('_id')).id);
  }
  for (let i=0;i<names.length;i++) {
    const email=`demo.student${String(i+1).padStart(2,'0')}@internsphere.demo`;
    const result=await User.updateOne({email},{$setOnInsert:{name:names[i],email,role:'student',status:'active',institutionId:admin.institutionId??null,passwordHash:hash}},{upsert:true});
    newStudents+=result.upsertedCount;
    const student=await User.findOne({email}).select('_id');
    await StudentProfile.updateOne({userId:student.id},{$setOnInsert:{userId:student.id,institutionId:admin.institutionId??null,rollNumber:`DEMO26${String(i+1).padStart(3,'0')}`,department:departmentNames[i%departmentNames.length],year:3,skills:['Communication','JavaScript','Python']}},{upsert:true});
    const internship=internships[i%internships.length];
    // Four candidates are in applied/review/shortlisted stages, 26 selected; 18 selected candidates have mentors.
    const status=i<26?'selected':['applied','under_review','shortlisted','rejected'][i-26];
    const applicationResult=await Application.updateOne({studentId:student.id,internshipId:internship.id},{$setOnInsert:{studentId:student.id,internshipId:internship.id,institutionId:admin.institutionId??null,status,appliedAt:new Date(Date.UTC(2026,5+(i%5),3+(i%22))),statusHistory:[{status:'applied',changedBy:admin.id},{status,changedBy:admin.id}]}},{upsert:true});
    newApplications+=applicationResult.upsertedCount;
    if(i>=18)continue;
    const mentorId=mentorIds[i%mentorIds.length];
    const allocationResult=await MentorAllocation.updateOne({studentId:student.id,internshipId:internship.id},{$setOnInsert:{studentId:student.id,internshipId:internship.id,mentorId,assignedBy:admin.id,institutionId:admin.institutionId??null,status:'active'}},{upsert:true});
    newAllocations+=allocationResult.upsertedCount;
    const allocation=await MentorAllocation.findOne({studentId:student.id,internshipId:internship.id});
    // Historical records for existing allocations are never modified or augmented.
    if (!allocationResult.upsertedCount) continue;
    for(let w=1;w<=4;w++) {
      const status=w===4?'submitted':w===3&&i%4===0?'revision_requested':'approved';
      const reportResult=await WeeklyReport.updateOne({allocationId:allocation.id,weekNumber:w},{$setOnInsert:{allocationId:allocation.id,studentId:student.id,weekNumber:w,hoursWorked:24+(i+w)%17,tasksCompleted:`Development sprint ${w}: prototype, testing, documentation and implementation`,skillsLearned:'API integration, version control and structured problem solving',challenges:'Debugging and managing development milestones',nextGoals:'Finish the next module and review feedback',status, ...(status==='approved'?{reviewedBy:mentorId,mentorFeedback:'Milestones reviewed; continue documenting evidence.'}:{})}},{upsert:true});
      newReports+=reportResult.upsertedCount;
    }
    if(i<12) {
      const score= n => Math.min(10, Math.max(1, 6+(n%5)));
      const scores={technical:score(i),communication:score(i+2),problemSolving:score(i+3),attendance:score(i+4),professionalism:score(i+1),taskCompletion:score(i+3),overall:score(i+2)};
      const totalScore=Math.round(Object.values(scores).reduce((sum,n)=>sum+n,0)/7*10);
      const e=await Evaluation.updateOne({allocationId:allocation.id,evaluatorType:'mentor'},{$setOnInsert:{allocationId:allocation.id,evaluatorId:mentorId,evaluatorType:'mentor',status:'submitted',scores,totalScore,comments:'Fictional development demonstration score, not a real student assessment.'}},{upsert:true});
      newEvaluations+=e.upsertedCount;
    }
  }
  console.log(JSON.stringify({message:'Add-only development demo data ready',newStudents,newMentors,newApplications,newAllocations,newReports,newEvaluations},null,2));
} finally { await (await import('mongoose')).default.disconnect(); }
