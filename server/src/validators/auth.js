import {z} from 'zod';
const email=z.string().email().max(254).transform(v=>v.toLowerCase());const password=z.string().min(10).max(128);
export const registerStudent=z.object({name:z.string().min(2).max(100),email,password,rollNumber:z.string().min(2).max(40),department:z.string().min(2).max(80),year:z.number().int().min(1).max(6)}).strict();
export const registerCompany=z.object({name:z.string().min(2).max(100),email,password,companyName:z.string().min(2).max(120),industry:z.string().max(120).optional(),website:z.string().url().optional()}).strict();
export const loginSchema=z.object({email,password:z.string().min(1)}).strict();
export const forgotSchema=z.object({email}).strict();
export const resetSchema=z.object({token:z.string().min(20),password}).strict();
