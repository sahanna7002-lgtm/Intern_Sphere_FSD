import {Router} from 'express';
import {auth,roles} from '../middleware/auth.js';
import {asyncHandler,ok,HttpError} from '../utils/errors.js';
import {User,StudentProfile,MentorAllocation,Application,Internship,AuditLog} from '../models/index.js';
const r=Router();r.use(auth,roles('admin'));
r.get('/overview',asyncHandler(async(req,res)=>{
 const scope={institutionId:req.user.institutionId??null};
 const [students,mentors,allocations,selected]=await Promise.all([
 User.find({...scope,role:'student',status:'active'}).select('name email').sort({name:1}).lean(),
 User.find({...scope,role:'mentor',status:'active'}).select('name email').sort({name:1}).lean(),
 MentorAllocation.find(scope).populate('studentId','name email').populate('mentorId','name email').populate('internshipId','title').sort({createdAt:-1}).lean(),
 Application.find({...scope,status:'selected'}).populate('studentId','name email').populate('internshipId','title').lean()
 ]);
 const active=allocations.filter(a=>a.status==='active');const assigned=new Set(active.map(a=>String(a.studentId?._id)));
 ok(res,{students,mentors,allocations,selectedApplications:selected,stats:{totalStudents:students.length,assignedStudents:assigned.size,unassignedStudents:students.length-assigned.size,availableMentors:mentors.length},workload:mentors.map(m=>({id:m._id,name:m.name,count:active.filter(a=>String(a.mentorId?._id)===String(m._id)).length}))});
}));
r.patch('/:id/clear',asyncHandler(async(req,res)=>{
 const a=await MentorAllocation.findById(req.params.id);if(!a)throw new HttpError(404,'Allocation not found');if(String(a.institutionId??'')!==String(req.user.institutionId??''))throw new HttpError(403,'Forbidden');if(a.status!=='active')throw new HttpError(409,'Allocation is not active');
 // Soft-deactivate, preserving all weekly reports, evaluations, and allocation history.
 a.status='discontinued';a.history.push({mentorId:a.mentorId,changedBy:req.user.id});await a.save();await AuditLog.create({actorId:req.user.id,action:'ALLOCATION_CLEARED',entityType:'MentorAllocation',entityId:a.id});ok(res,a,'Allocation cleared; historical reports retained');
}));
export default r;
