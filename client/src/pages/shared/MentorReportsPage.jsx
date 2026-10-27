import {useState} from 'react';
import {ReportsPage} from './ReportsPage';
import {WeeklyReportsPage} from './WeeklyReportsPage';
export function MentorReportsPage(){const [tab,setTab]=useState('insights');return <div className="space-y-6"><div className="flex flex-wrap gap-2">{[['insights','Progress & insights'],['review','Review weekly reports']].map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${tab===id?'bg-primary text-primary-foreground':'bg-secondary text-foreground'}`}>{label}</button>)}</div>{tab==='insights'?<ReportsPage/>:<WeeklyReportsPage/>}</div>}
