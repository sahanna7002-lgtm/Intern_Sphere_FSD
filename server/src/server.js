import {verifyEnv,config} from './config/env.js';import {connectDB} from './config/db.js';import app from './app.js';
verifyEnv();await connectDB();app.listen(config.port,()=>console.log(`InternSphere API listening on http://localhost:${config.port}`));
