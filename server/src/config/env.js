import 'dotenv/config';
const required = ['MONGODB_URI','JWT_ACCESS_SECRET','JWT_REFRESH_SECRET'];
export function verifyEnv(){
 const missing=required.filter(k=>!process.env[k] || process.env[k].startsWith('REPLACE_'));
 if(missing.length) throw new Error(`Missing or insecure environment variables: ${missing.join(', ')}`);
 for(const k of ['JWT_ACCESS_SECRET','JWT_REFRESH_SECRET']) if(process.env[k].length<32) throw new Error(`${k} must contain at least 32 characters`);
 if(process.env.JWT_ACCESS_SECRET===process.env.JWT_REFRESH_SECRET) throw new Error('Access and refresh secrets must differ');
 if(process.env.NODE_ENV==='production' && !String(process.env.CLIENT_URL||'').startsWith('https://')) throw new Error('CLIENT_URL must use HTTPS in production');
}
export const config={port:Number(process.env.PORT||5000), clientUrl:process.env.CLIENT_URL||'http://localhost:5173', production:process.env.NODE_ENV==='production'};
