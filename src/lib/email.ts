
"use server";

import nodemailer from "nodemailer";
import type { Registration, Event } from "./types";
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function createRegistrationEmailHtml(body: string, registration: Registration, event: Event, baseUrl: string): string {
    const taskSubmissionUrl = `${baseUrl}/tasks/${registration.id}/submit`;
    
    let processedBody = body
      .replace(/{studentName}/g, registration.studentName)
      .replace(/{eventName}/g, event.name)
      .replace(/\n/g, "<br>");

    const downloadButton = `<a href="${event.taskPdfUrl}" target="_blank" rel="noopener noreferrer" style="background-color:#7c3aed;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block;margin-top:10px;">Download Task PDF</a>`;
    const submissionButton = `<a href="${taskSubmissionUrl}" target="_blank" rel="noopener noreferrer" style="background-color:#7c3aed;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block;margin-top:10px;">Submit Your Task Here</a>`;
    
    const finalHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { text-align: left; }
            .button-container { text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            ${processedBody}
            <div class="button-container">
                <br><br>
                ${downloadButton}
                <br>
                ${submissionButton}
            </div>
          </div>
        </body>
      </html>
    `;

    return finalHtml;
}


export async function sendRegistrationEmail(registration: Registration, event: Event, baseUrl: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email credentials are not set in environment variables.");
    throw new Error("Email service is not configured.");
  }
  
  const emailHtml = createRegistrationEmailHtml(event.mailBody, registration, event, baseUrl);
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: registration.studentEmail,
    subject: event.mailSubject.replace(/{eventName}/g, event.name),
    html: emailHtml,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Registration email sent successfully:", info.response);
  } catch (error) {
    console.error("Failed to send registration email:", error);
    throw new Error(`Could not send email. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function sendPassEmail(registration: Registration, event: Event, baseUrl: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email credentials are not set in environment variables.");
    throw new Error("Email service is not configured.");
  }

  try {
    const publicHostingUrl = process.env.FIREBASE_HOSTING_URL || baseUrl;
    let processedBody = event.passBody
      .replace(/{studentName}/g, registration.studentName)
      .replace(/{eventName}/g, event.name)
      .replace(/\n/g, "<br>");
    
    const qrData = JSON.stringify({
      registrationId: registration.id,
      studentName: registration.studentName,
      studentEmail: registration.studentEmail,
      rollNumber: registration.rollNumber,
      eventId: event.id
    });
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: registration.studentEmail,
      subject: event.passSubject.replace(/{eventName}/g, event.name),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;}
            .email-container { text-align: center; padding: 20px; }
            .card {
              background-color: #ffffff;
              border-radius: 16px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.1);
              max-width: 400px;
              margin: 20px auto;
              overflow: hidden;
              text-align: left;
            }
            .card-header {
              background-color: #BB86FC; /* Primary color */
              padding: 20px;
              position: relative;
              color: #121212;
            }
            .card-header h2 {
                margin: 0;
                font-size: 24px;
            }
            .wave {
                position: absolute;
                bottom: 0;
                left: 0;
                width: 100%;
                height: 50px;
                background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="1" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,133.3C672,117,768,139,864,165.3C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
                background-size: cover;
            }
            .card-body {
              padding: 20px;
              padding-top: 10px;
            }
            .card-body p { 
              margin: 10px 0; 
              font-size: 14px;
              color: #555;
            }
            .card-body strong { color: #121212; font-weight: 600; display: block; margin-bottom: 2px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;}
            .qr-section {
              text-align: center;
              padding: 20px;
              border-top: 1px dashed #ddd;
            }
            .qr-section p { font-size: 12px; color: #666; margin-bottom: 10px; }
            .status { 
                text-transform: capitalize; 
                font-weight: bold; 
                padding: 4px 8px;
                border-radius: 20px;
                color: #fff;
            }
            .status-booked { background-color: #28a745; }
            .status-waitlisted { background-color: #fd7e14; }
          </style>
        </head>
        <body>
          <div class="email-container">
            ${processedBody}
            
            <div class="card">
              <div class="card-header">
                <h2>${event.name}</h2>
                <p style="margin: 4px 0 0; opacity: 0.8;">EVENT PASS</p>
                <div class="wave"></div>
              </div>
              <div class="card-body">
                <p><strong>Attendee</strong>${registration.studentName}</p>
                <p><strong>Email</strong>${registration.studentEmail}</p>
                <p><strong>Roll Number</strong>${registration.rollNumber}</p>
                <p><strong>Branch & Year</strong>${registration.branch} &bull; Year ${registration.yearOfStudy}</p>
                <p><strong>Gender</strong><span style="text-transform: capitalize;">${registration.gender}</span></p>
                <p><strong>Laptop</strong>${registration.laptop ? 'Yes' : 'No'}</p>
                <p><strong>Status</strong><span class="status status-${registration.status}">${registration.status}</span></p>
              </div>
              <div class="qr-section">
                <p>Scan this code for event check-in</p>
                <img src="cid:qrcodepass" alt="Event Pass QR Code" style="max-width:150px; border-radius: 8px;"/>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
            filename: 'qr-code.png',
            path: qrCodeUrl,
            cid: 'qrcodepass'
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Pass email sent successfully:", info.response);
  } catch (error) {
    console.error("Failed to send pass email:", error);
    throw new Error(`Could not send pass email. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
