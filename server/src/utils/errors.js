export class HttpError extends Error {constructor(status,message,code='BAD_REQUEST',details=[]){super(message);this.status=status;this.code=code;this.details=details;}}
export const asyncHandler=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
export function ok(res,data,message='Success',status=200,meta){return res.status(status).json({success:true,message,data,...(meta?{meta}:{})});}
export function notFound(req,res,next){next(new HttpError(404,'Route not found','NOT_FOUND'));}
export function errorHandler(err,req,res,next){
 let status=err.status||500, code=err.code||'INTERNAL_ERROR', message=err.message||'Unexpected error',details=err.details||[];
 if(err.name==='ValidationError'){status=400;code='VALIDATION_ERROR';message='Database validation failed';details=Object.values(err.errors).map(x=>({field:x.path,message:x.message}));}
 if(err.code===11000){status=409;code='DUPLICATE';message='A record with this value already exists';details=[];}
 if(err.name==='CastError'){status=400;code='INVALID_ID';message='Invalid identifier';}
 if(status===500){console.error(err);message='Internal server error';}
 res.status(status).json({success:false,message,error:{code,details}});
}
