import nodemailer from 'nodemailer';
export async function sendMail(to,subject,text){
 if(!process.env.SMTP_HOST){if(process.env.NODE_ENV==='production')throw new Error('SMTP is required for email delivery');console.info('Development email notification (link not logged):',subject,'to',to);return {delivered:false};}
 const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT||587),secure:Number(process.env.SMTP_PORT)===465,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}});
 return transport.sendMail({from:process.env.SMTP_FROM,to,subject,text});
}
