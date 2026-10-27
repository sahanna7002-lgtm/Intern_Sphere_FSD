import bcrypt from 'bcryptjs';import jwt from 'jsonwebtoken';
import {User,StudentProfile,Company,AuthSession,AuditLog} from '../models/index.js';
import {HttpError,asyncHandler,ok} from '../utils/errors.js';
import {accessToken,refreshToken,hashToken,randomToken,cookieOptions} from '../services/security.js';
import {sendMail} from '../services/email.js';
const publicUser=u=>({id:u.id,name:u.name,email:u.email,role:u.role,status:u.status});
async function issueSession(res,user){const session=await AuthSession.create({userId:user.id,tokenHash:hashToken(randomToken()),expiresAt:new Date(Date.now()+7*86400000)});const token=refreshToken(user,session.id);session.tokenHash=hashToken(token);await session.save();res.cookie('internsphere_refresh',token,cookieOptions());return accessToken(user);}
export const registerStudentController=asyncHandler(async(req,res)=>{
 const {name,email,password,rollNumber,department,year}=req.body;
 if(await User.exists({email}))throw new HttpError(409,'Email already registered','DUPLICATE');
 const user=await User.create({name,email,passwordHash:await bcrypt.hash(password,12),role:'student'});
 try{await StudentProfile.create({userId:user.id,rollNumber,department,year});}catch(e){await User.deleteOne({_id:user.id});throw e;}
 ok(res,{user:publicUser(user)},'Registration successful',201);
});
export const registerCompanyController=asyncHandler(async(req,res)=>{
 const {name,email,password,companyName,industry,website}=req.body;
 if(await User.exists({email}))throw new HttpError(409,'Email already registered','DUPLICATE');
 const user=await User.create({name,email,passwordHash:await bcrypt.hash(password,12),role:'company',status:'pending'});
 try{await Company.create({name:companyName,industry,website,representativeIds:[user.id]});}catch(e){await User.deleteOne({_id:user.id});throw e;}
 ok(res,{user:publicUser(user)},'Company registration pending administrator approval',201);
});
export const loginController=asyncHandler(async(req,res)=>{
 const user=await User.findOne({email:req.body.email}).select('+passwordHash');
 if(!user||!(await bcrypt.compare(req.body.password,user.passwordHash)))throw new HttpError(401,'Invalid email or password','INVALID_CREDENTIALS');
 if(!['student','mentor','admin'].includes(user.role))throw new HttpError(403,'This account role is no longer supported','ROLE_DISABLED');
 if(user.status!=='active')throw new HttpError(403,'Account is pending approval or disabled','ACCOUNT_INACTIVE');
 const token=await issueSession(res,user);ok(res,{accessToken:token,user:publicUser(user)},'Logged in');
});
export const refreshController=asyncHandler(async(req,res)=>{
 const token=req.cookies?.internsphere_refresh;if(!token)throw new HttpError(401,'Refresh token missing','UNAUTHENTICATED');
 let payload;try{payload=jwt.verify(token,process.env.JWT_REFRESH_SECRET,{issuer:'internsphere',algorithms:['HS256']});}catch{throw new HttpError(401,'Invalid refresh token','UNAUTHENTICATED');}
 const session=await AuthSession.findOne({_id:payload.sid,userId:payload.sub,tokenHash:hashToken(token),revokedAt:null});
 if(!session||session.expiresAt<=new Date())throw new HttpError(401,'Session expired','UNAUTHENTICATED');
 const user=await User.findById(payload.sub);if(!user||!['student','mentor','admin'].includes(user.role)||user.status!=='active'||user.tokenVersion!==payload.v)throw new HttpError(401,'Session invalid','UNAUTHENTICATED');
 await AuthSession.updateOne({_id:session.id,tokenHash:hashToken(token),revokedAt:null},{$set:{revokedAt:new Date()}});
 const access=await issueSession(res,user);ok(res,{accessToken:access,user:publicUser(user)},'Session refreshed');
});
export const logoutController=asyncHandler(async(req,res)=>{
 const token=req.cookies?.internsphere_refresh;if(token)await AuthSession.updateOne({tokenHash:hashToken(token)},{$set:{revokedAt:new Date()}});
 res.clearCookie('internsphere_refresh',{...cookieOptions(),maxAge:undefined});ok(res,null,'Logged out');
});
export const meController=asyncHandler(async(req,res)=>ok(res,{user:publicUser(req.user)}));
export const forgotController=asyncHandler(async(req,res)=>{
 const user=await User.findOne({email:req.body.email}).select('+resetTokenHash +resetTokenExpires');
 if(user){const token=randomToken();user.resetTokenHash=hashToken(token);user.resetTokenExpires=new Date(Date.now()+30*60000);await user.save();const url=`${process.env.CLIENT_URL||'http://localhost:5173'}/reset-password?token=${encodeURIComponent(token)}`;await sendMail(user.email,'Reset your InternSphere password',`Use this link within 30 minutes: ${url}`);}
 ok(res,null,'If the account exists, reset instructions have been sent');
});
export const resetController=asyncHandler(async(req,res)=>{
 const user=await User.findOne({resetTokenHash:hashToken(req.body.token),resetTokenExpires:{$gt:new Date()}}).select('+resetTokenHash +resetTokenExpires');
 if(!user)throw new HttpError(400,'Reset link invalid or expired','INVALID_TOKEN');
 user.passwordHash=await bcrypt.hash(req.body.password,12);user.resetTokenHash=undefined;user.resetTokenExpires=undefined;user.tokenVersion++;await user.save();await AuthSession.deleteMany({userId:user.id});await AuditLog.create({actorId:user.id,action:'PASSWORD_RESET',entityType:'User',entityId:user.id});ok(res,null,'Password updated');
});
