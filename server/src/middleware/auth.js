import jwt from 'jsonwebtoken';
import {User} from '../models/index.js';import {HttpError,asyncHandler} from '../utils/errors.js';
export const auth=asyncHandler(async(req,res,next)=>{
 const header=req.headers.authorization||'';if(!header.startsWith('Bearer '))throw new HttpError(401,'Login required','UNAUTHENTICATED');
 let payload;try{payload=jwt.verify(header.slice(7),process.env.JWT_ACCESS_SECRET,{algorithms:['HS256'],issuer:'internsphere'});}catch{throw new HttpError(401,'Session expired or invalid','UNAUTHENTICATED');}
 const user=await User.findById(payload.sub).select('-passwordHash');if(!user || !['student','mentor','admin'].includes(user.role) || user.status!=='active' || user.tokenVersion!==payload.v)throw new HttpError(401,'Account is unavailable','UNAUTHENTICATED');req.user=user;next();
});
export const roles=(...allowed)=>(req,res,next)=>allowed.includes(req.user?.role)?next():next(new HttpError(403,'Insufficient permissions','FORBIDDEN'));
export function assertOwner(req,ids){if(req.user.role==='admin')return; if(!ids.some(id=>id && String(id)===String(req.user.id)))throw new HttpError(403,'Resource is not accessible','FORBIDDEN');}
