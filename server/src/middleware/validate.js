import {HttpError} from '../utils/errors.js';
export const validate=(schema,source='body')=>(req,res,next)=>{const result=schema.safeParse(req[source]);if(!result.success)return next(new HttpError(400,'Validation failed','VALIDATION_ERROR',result.error.issues.map(i=>({field:i.path.join('.'),message:i.message}))));req[source]=result.data;next();};
