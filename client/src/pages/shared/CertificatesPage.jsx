import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api,apiError} from '../../services/api';
import {PageHeader} from '../../components/common/PageHeader';
import {DashboardCard} from '../../components/dashboard/DashboardCard';
import {Button} from '../../components/ui/Button';
export function CertificatesPage(){
 const [chosen,setChosen]=useState('');
 const allocations=useQuery({queryKey:['allocations'],queryFn:async()=>(await api.get('/mentor-allocations')).data.data});
 const completed=(allocations.data||[]).filter(a=>a.status==='completed');
 const active=completed.some(a=>a._id===chosen)?chosen:completed[0]?._id;
 const cert=useQuery({queryKey:['certificate',active],enabled:!!active,queryFn:async()=>(await api.get(`/certificates/${active}`)).data.data});
 return <div className="space-y-6"><PageHeader title="Completion certificates" description="Certificates are available only after verified internship completion."/><DashboardCard title="Your certificates">{allocations.isLoading?<p>Loading…</p>:!completed.length?<p className="text-muted-foreground">No completed internships yet. Complete your reports and evaluations first.</p>:<><select className="mb-5 rounded-xl border border-border bg-card p-3" value={active} onChange={e=>setChosen(e.target.value)}>{completed.map(a=><option key={a._id} value={a._id}>{a.internshipId?.title||a._id}</option>)}</select>{cert.isLoading?<p>Loading certificate…</p>:cert.error?<p role="alert">{apiError(cert.error)}</p>:cert.data&&<div className="space-y-4"><div id="internsphere-certificate" className="rounded-2xl border-4 border-indigo-300 bg-white p-8 text-center text-slate-900"><p className="text-sm font-bold uppercase tracking-widest text-indigo-600">InternSphere</p><h2 className="mt-4 text-3xl font-bold">Certificate of Completion</h2><p className="mt-6">This certifies that</p><h3 className="mt-2 text-2xl font-bold">{cert.data.studentName}</h3><p className="mt-4">successfully completed the internship</p><p className="mt-2 text-xl font-semibold">{cert.data.internshipTitle}</p><p>at {cert.data.companyName}</p><p className="mt-5">Final evaluation: {cert.data.finalScore}/100</p><p className="mt-5 text-xs">Certificate ID: {cert.data.certificateId}</p></div><Button onClick={()=>window.print()}>Print / Save as PDF</Button></div>}</>}</DashboardCard></div>;
}
