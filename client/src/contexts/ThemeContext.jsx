import {createContext,useContext,useEffect,useMemo,useState} from 'react';
const ThemeContext=createContext(null);
export function ThemeProvider({children}){
 const [theme,setTheme]=useState(()=>{try{return localStorage.getItem('internsphere-theme')||'system';}catch{return 'system';}});
 useEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)');const apply=()=>{document.documentElement.classList.toggle('dark',theme==='dark'||(theme==='system'&&media.matches));};apply();media.addEventListener('change',apply);try{localStorage.setItem('internsphere-theme',theme);}catch{}return()=>media.removeEventListener('change',apply);},[theme]);
 const value=useMemo(()=>({theme,setTheme}),[theme]);return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export const useTheme=()=>useContext(ThemeContext);
