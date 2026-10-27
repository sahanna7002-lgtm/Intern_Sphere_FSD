import {createContext,useCallback,useContext,useEffect,useMemo,useState} from 'react';
import {api,setAccessToken} from '../services/api';
const Context=createContext(null);
export function AuthProvider({children}){
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true);
 const logout=useCallback(async()=>{try{await api.post('/auth/logout');}catch{}setAccessToken(null);setUser(null);},[]);
 useEffect(()=>{let live=true;api.post('/auth/refresh').then(({data})=>{if(!live)return;setAccessToken(data.data.accessToken);setUser(data.data.user);}).catch(()=>{}).finally(()=>{if(live)setLoading(false);});const expire=()=>{setUser(null);setAccessToken(null);};window.addEventListener('internsphere:session-expired',expire);return()=>{live=false;window.removeEventListener('internsphere:session-expired',expire);};},[]);
 const login=useCallback(async(email,password)=>{const {data}=await api.post('/auth/login',{email,password});setAccessToken(data.data.accessToken);setUser(data.data.user);return data.data.user;},[]);
 const updateUser=useCallback(user=>setUser(user),[]);
 const value=useMemo(()=>({user,loading,login,logout,updateUser,isAuthenticated:!!user}),[user,loading,login,logout,updateUser]);
 return <Context.Provider value={value}>{children}</Context.Provider>;
}
export const useAuth=()=>{const ctx=useContext(Context);if(!ctx)throw Error('useAuth must be used inside AuthProvider');return ctx;};
