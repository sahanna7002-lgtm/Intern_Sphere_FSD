import axios from 'axios';
export const api=axios.create({baseURL:import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',withCredentials:true,timeout:15000});
let accessToken=null; let refreshPromise=null;
export const setAccessToken=value=>{accessToken=value;};
api.interceptors.request.use(config=>{if(accessToken)config.headers.Authorization=`Bearer ${accessToken}`;return config;});
api.interceptors.response.use(response=>response,async error=>{
 const original=error.config;const endpoint=original?.url || '';
 if(error.response?.status===401 && !original?._retry && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/logout')){
  original._retry=true;
  try {refreshPromise??=axios.post(`${api.defaults.baseURL}/auth/refresh`,{}, {withCredentials:true}).finally(()=>{refreshPromise=null;});const {data}=await refreshPromise;setAccessToken(data.data.accessToken);original.headers.Authorization=`Bearer ${accessToken}`;return api(original);}catch{setAccessToken(null);window.dispatchEvent(new Event('internsphere:session-expired'));}
 }
 return Promise.reject(error);
});
export const apiError=e=>e?.response?.data?.message || (e?.code==='ERR_NETWORK'?'Cannot connect to the backend. Check that Express is running.':e?.message || 'Something went wrong');
