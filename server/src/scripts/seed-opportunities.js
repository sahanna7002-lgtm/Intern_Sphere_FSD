import 'dotenv/config';
import {connectDB} from '../config/db.js';
import {Company,Internship,User} from '../models/index.js';
if(process.env.NODE_ENV==='production')throw new Error('Demo opportunities may only be seeded in development');
await connectDB();
const admin=await User.findOne({role:'admin',status:'active'});
if(!admin)throw new Error('Create an admin account with npm run seed first');
// Fictional development listings, never presented as verified external vacancies.
const rows=[
['Full Stack Web Development','NovaTech Solutions','Web Development','Bengaluru','hybrid',['React','Node.js','MongoDB'],18000],
['Frontend Development','PixelForge Labs','Frontend','Chennai','remote',['React','TypeScript','CSS'],16000],
['Backend Development','CloudNest Systems','Backend','Hyderabad','hybrid',['Node.js','Express','PostgreSQL'],19000],
['Data Science','InsightPeak Analytics','Data Science','Pune','onsite',['Python','Pandas','SQL'],22000],
['Machine Learning','NeuralBridge Research','Machine Learning','Bengaluru','hybrid',['Python','scikit-learn','PyTorch'],24000],
['Artificial Intelligence','CortexSpring Labs','Artificial Intelligence','Hyderabad','remote',['Python','NLP','Deep Learning'],25000],
['Cybersecurity','SecureGrid Technologies','Cybersecurity','Chennai','onsite',['Linux','Networking','OWASP'],20000],
['Cloud Computing','SkyStack Cloud','Cloud Computing','Mumbai','hybrid',['AWS','Linux','Docker'],20000],
['UI/UX Design','CanvasBloom Studio','Design','Bengaluru','remote',['Figma','Wireframing','Prototyping'],14000],
['Mobile App Development','AppTrail Technologies','Mobile Development','Chennai','hybrid',['Flutter','Dart','REST API'],17000],
['DevOps Engineering','PipelineWorks','DevOps','Pune','hybrid',['GitHub Actions','Docker','CI/CD'],22000],
['Data Analytics','MetricFlow Analytics','Data Analytics','Hyderabad','remote',['SQL','Power BI','Excel'],15000],
['Software Testing','QualityOrbit','Quality Assurance','Chennai','onsite',['Selenium','Playwright','Testing'],14000],
['Database Administration','DataHarbor Systems','Databases','Mumbai','hybrid',['MongoDB','SQL','Indexing'],17000],
['Python Development','PyCraft Solutions','Python','Remote','remote',['Python','FastAPI','Git'],16000],
['Java Development','EnterpriseByte','Java','Bengaluru','onsite',['Java','Spring Boot','SQL'],18000],
['Internet of Things','SensorWave Labs','IoT','Coimbatore','onsite',['Arduino','C++','MQTT'],15000],
['Business Analytics','DecisionPath Consulting','Business Analytics','Pune','hybrid',['Excel','SQL','Tableau'],15000],
['Software Engineering','CodeHarbor Technologies','Software Engineering','Hyderabad','hybrid',['DSA','Git','JavaScript'],21000],
['Generative AI','PromptSpring Research','Generative AI','Bengaluru','remote',['Python','LLMs','RAG'],26000]
];
let added=0;
for(const [title,companyName,category,location,mode,skills,stipend] of rows){
 const company=await Company.findOneAndUpdate({name:companyName},{$setOnInsert:{name:companyName,industry:category,verificationStatus:'approved',institutionId:admin.institutionId??null}},{upsert:true,new:true,setDefaultsOnInsert:true});
 const key={companyId:company.id,title:`${title} Intern`};
 const result=await Internship.updateOne(key,{$setOnInsert:{...key,category,positions:5,location,mode,skills,stipend,durationWeeks:12,description:`Practice ${category.toLowerCase()} on supervised industry-style projects. Work with mentors, document your progress weekly, and present a final project deliverable. This is a fictional demonstration opportunity for testing InternSphere.`,deadline:new Date('2027-12-31T23:59:59Z'),status:'open',institutionId:admin.institutionId??null,createdBy:admin.id}},{upsert:true,setDefaultsOnInsert:true});
 added+=result.upsertedCount;
}
console.log(`Demo internships ready: ${rows.length}; newly inserted: ${added}. Existing listings preserved.`);
process.exit(0);
