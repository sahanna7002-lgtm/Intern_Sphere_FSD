import crypto from 'node:crypto';import jwt from 'jsonwebtoken';
export const hashToken=t=>crypto.createHash('sha256').update(t).digest('hex');
export const randomToken=()=>crypto.randomBytes(32).toString('hex');
export const accessToken=user=>jwt.sign({sub:String(user.id),role:user.role,v:user.tokenVersion},process.env.JWT_ACCESS_SECRET,{expiresIn:'15m',issuer:'internsphere',algorithm:'HS256'});
export const refreshToken=(user,sessionId)=>jwt.sign({sub:String(user.id),sid:String(sessionId),v:user.tokenVersion},process.env.JWT_REFRESH_SECRET,{expiresIn:'7d',issuer:'internsphere',algorithm:'HS256'});
export const cookieOptions=()=>({httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:process.env.COOKIE_SAMESITE||'lax',path:'/api/v1/auth',maxAge:7*24*3600*1000});
