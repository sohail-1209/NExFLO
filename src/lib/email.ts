
"use server";

import nodemailer from "nodemailer";
import type { Registration, Event } from "./types";
import 'dotenv/config';

interface TransporterOptions {
    service: string;
    auth: {
        user: string;
        pass: string;
    };
}

function getTransporter(customMail?: string | null, customPass?: string | null) {
    const useDefault = !customMail || !customPass;

    const user = useDefault ? process.env.EMAIL_USER : customMail;
    const pass = useDefault ? process.env.EMAIL_PASS : customPass;
    
    if (!user || !pass) {
        console.error("Email credentials are not set in environment variables or provided.");
        throw new Error("Email service is not configured.");
    }
    
    return nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
    });
}

function createRegistrationEmailHtml(body: string, registration: Registration, event: Event, baseUrl: string): string {
    const taskSubmissionUrl = `${baseUrl}/tasks/${registration.id}/submit`;
    const primaryColor = event.primaryColor || '#BB86FC';
    const accentColor = event.accentColor || '#121212';
    
    let processedBody = body
      .replace(/{studentName}/g, registration.studentName)
      .replace(/{eventName}/g, event.name)
      .replace(/\n/g, "<br>");

    const downloadButton = `<a href="${event.taskPdfUrl}" target="_blank" rel="noopener noreferrer" style="background-color:${primaryColor};color:${accentColor};padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;margin:10px 5px;">Download Task PDF</a>`;
    const submissionButton = `<a href="${taskSubmissionUrl}" target="_blank" rel="noopener noreferrer" style="background-color:${primaryColor};color:${accentColor};padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;display:inline-block;margin:10px 5px;">Submit Your Task</a>`;
    
    const finalHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
              line-height: 1.6; 
              color: #e0e0e0;
              background-color: #121212;
              margin: 0;
              padding: 0;
            }
            .email-container { 
              text-align: center; 
              padding: 20px;
            }
            .card {
              background-color: #1e1e1e;
              border: 1px solid #333;
              border-radius: 16px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.2);
              max-width: 600px;
              margin: 20px auto;
              overflow: hidden;
              text-align: left;
            }
            .card-header {
              background-color: #333;
              padding: 24px;
            }
            .card-header h2 {
                margin: 0;
                font-size: 28px;
                color: ${primaryColor};
            }
             .card-header p {
                margin: 4px 0 0;
                font-size: 16px;
                color: #b0b0b0;
            }
            .card-body {
              padding: 24px;
              color: #c0c0c0;
            }
            .button-container { 
              text-align: center; 
              margin-top: 24px;
              padding-top: 24px;
              border-top: 1px solid #333;
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="card">
                <div class="card-header">
                    <h2>Registration for ${event.name}</h2>
                    <p>Thank you for your interest!</p>
                </div>
                <div class="card-body">
                    ${processedBody}
                </div>
                <div class="button-container">
                    <p style="margin:0 0 16px; color: #b0b0b0;">Please complete the next steps to secure your spot:</p>
                    ${downloadButton}
                    ${submissionButton}
                </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return finalHtml;
}


export async function sendRegistrationEmail(registration: Registration, event: Event, baseUrl: string) {
  const transporter = getTransporter(event.appMail, event.appPass);
  
  const emailHtml = createRegistrationEmailHtml(event.mailBody, registration, event, baseUrl);
  
  const mailOptions = {
    from: event.appMail || process.env.EMAIL_USER,
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
    const transporter = getTransporter(event.appMail, event.appPass);
    const primaryColor = event.primaryColor || '#BB86FC';
    const accentColor = event.accentColor || '#121212';

    try {
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
            from: event.appMail || process.env.EMAIL_USER,
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
                    background-color: ${primaryColor};
                    padding: 20px 20px 10px 20px;
                    position: relative;
                    color: ${accentColor};
                    }
                    .card-header h2 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .wave {
                        position: absolute;
                        bottom: -1px;
                        left: 0;
                        width: 100%;
                        height: 20px;
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
                        ${event.venue ? `<p><strong>Venue</strong>${event.venue}</p>` : ''}
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

export interface ManualPassDetails {
    studentName: string;
    studentEmail: string;
    eventName: string;
    eventDate: Date;
    eventVenue: string;
    emailSubject: string;
    emailBody: string;
    sendWithoutPass: boolean;
    appMail?: string | null;
    appPass?: string | null;
    primaryColor?: string;
    accentColor?: string;
}

export async function sendManualPassEmail(details: ManualPassDetails, baseUrl: string) {
    const transporter = getTransporter(details.appMail, details.appPass);
    const primaryColor = details.primaryColor || '#BB86FC';
    const accentColor = details.accentColor || '#121212';
    
    let processedBody = details.emailBody
      .replace(/{studentName}/g, details.studentName)
      .replace(/{eventName}/g, details.eventName)
      .replace(/\n/g, "<br>");
      
    const subject = details.emailSubject
      .replace(/{studentName}/g, details.studentName)
      .replace(/{eventName}/g, details.eventName);

    const attachments = [];
    let html = processedBody;

    if (!details.sendWithoutPass) {
        const qrData = JSON.stringify({
            studentName: details.studentName,
            studentEmail: details.studentEmail,
            eventName: details.eventName,
            eventDate: details.eventDate.toISOString(),
            eventVenue: details.eventVenue,
        });
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

        attachments.push({
            filename: 'qr-code.png',
            path: qrCodeUrl,
            cid: 'qrcodepass'
        });

        html = `
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
              background-color: ${primaryColor};
              padding: 20px 20px 10px 20px;
              position: relative;
              color: ${accentColor};
            }
            .card-header h2 {
                margin: 0;
                font-size: 24px;
            }
            .wave {
                position: absolute;
                bottom: -1px;
                left: 0;
                width: 100%;
                height: 20px;
                background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="%23ffffff" fill-opacity="1" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,133.3C672,117,768,139,864,165.3C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
                background-size: cover;
            }
            .card-body {
              padding: 20px;
              padding-top: 10px;
            }
            .card-body p { margin: 10px 0; font-size: 14px; color: #555; }
            .card-body strong { color: #121212; font-weight: 600; display: block; margin-bottom: 2px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;}
            .qr-section { text-align: center; padding: 20px; border-top: 1px dashed #ddd; }
            .qr-section p { font-size: 12px; color: #666; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="email-container">
            ${processedBody}
            <div class="card">
              <div class="card-header">
                <h2>${details.eventName}</h2>
                <p style="margin: 4px 0 0; opacity: 0.8;">EVENT PASS</p>
                <div class="wave"></div>
              </div>
              <div class="card-body">
                <p><strong>Attendee</strong>${details.studentName}</p>
                <p><strong>Date</strong>${details.eventDate.toLocaleString()}</p>
                <p><strong>Venue</strong>${details.eventVenue}</p>
              </div>
              <div class="qr-section">
                <p>Scan this code for event check-in</p>
                <img src="cid:qrcodepass" alt="Event Pass QR Code" style="max-width:150px; border-radius: 8px;"/>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const mailOptions = {
      from: details.appMail || process.env.EMAIL_USER,
      to: details.studentEmail,
      subject: subject,
      html: html,
      attachments: attachments
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Manual pass email sent successfully:", info.response);
    } catch (error) {
        console.error("Failed to send manual pass email:", error);
        throw new Error(`Could not send email. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}


export type AttendeeData = {
    "Full Name": string;
    "E - Mail": string;
    [key: string]: any;
};

export interface BulkEmailDetails {
    eventName: string;
    eventDate: Date;
    eventVenue: string;
    emailSubject: string;
    emailBody: string;
    sendWithoutPass: boolean;
    appMail?: string | null;
    appPass?: string | null;
    primaryColor?: string;
    accentColor?: string;
}

function replacePlaceholders(template: string, attendee: AttendeeData, eventDetails: Omit<BulkEmailDetails, 'eventDate' | 'sendWithoutPass' | 'emailSubject' | 'emailBody' | 'appMail' | 'appPass' | 'primaryColor' | 'accentColor'> & {date: Date}): string {
    let result = template;
    const allPlaceholders = {...attendee, ...eventDetails};

    // Replace {key} with value from attendee or eventDetails
    for (const key in allPlaceholders) {
        // Normalize key to be safe for regex: remove spaces and handle special characters
        const placeholder = `{${key}}`;
        result = result.replace(new RegExp(placeholder.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), "g"), (allPlaceholders as any)[key]);
    }

    return result;
}


export async function sendBulkPassesEmail(attendees: AttendeeData[], details: BulkEmailDetails, baseUrl: string) {
    const transporter = getTransporter(details.appMail, details.appPass);
    const primaryColor = details.primaryColor || '#BB86FC';
    
    // Process each attendee. Don't await here to send emails in parallel.
    for (const attendee of attendees) {
        // Await inside the loop for each email to be sent sequentially.
        // For parallel sending, you would use Promise.all
        try {
            const studentName = attendee["Full Name"];
            const studentEmail = attendee["E - Mail"];

            if (!studentName || !studentEmail) {
                console.warn("Skipping row due to missing name or email:", attendee);
                continue;
            }
            
            const eventDataForTemplate = {
              eventName: details.eventName,
              eventVenue: details.eventVenue,
              date: details.eventDate
            };

            let processedBody = replacePlaceholders(details.emailBody, attendee, eventDataForTemplate);
            const subject = replacePlaceholders(details.emailSubject, attendee, eventDataForTemplate);

            const attachments: any[] = [];
            let html = processedBody.replace(/\n/g, "<br>");

            if (!details.sendWithoutPass) {
                const qrData = JSON.stringify({
                    studentName: studentName,
                    studentEmail: studentEmail,
                    eventName: details.eventName,
                    eventDate: details.eventDate.toISOString(),
                    eventVenue: details.eventVenue,
                    ...attendee // include all other csv data in qr
                });
                const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

                attachments.push({
                    filename: 'qr-code.png',
                    path: qrCodeUrl,
                    cid: 'qrcodepass'
                });
                
                html = `
                    <!DOCTYPE html><html><head><style>body{font-family:Arial,sans-serif;background-color:#f4f4f4;color:#333;}.card{background-color:#fff;max-width:400px;margin:20px auto;border-radius:16px;overflow:hidden;box-shadow:0 10px 25px rgba(0,0,0,0.1);}.card-header{background-color:${primaryColor};color:#121212;padding:20px;font-size:24px;} .card-body{padding:20px;} .qr-section{text-align:center;padding:20px;border-top:1px dashed #ddd;}</style></head>
                    <body><div class="email-container">${html}<div class="card"><div class="card-header">${details.eventName}</div><div class="card-body"><strong>Attendee:</strong> ${studentName}<br><strong>Date:</strong> ${details.eventDate.toLocaleString()}<br><strong>Venue:</strong> ${details.eventVenue}</div><div class="qr-section"><p>Scan this for check-in</p><img src="cid:qrcodepass" alt="QR Code"/></div></div></div></body></html>`;

            }

            const mailOptions = {
                from: details.appMail || process.env.EMAIL_USER,
                to: studentEmail,
                subject: subject,
                html: html,
                attachments: attachments
            };

            // Send email
            await transporter.sendMail(mailOptions);
            console.log(`Email sent successfully to ${studentEmail}`);

        } catch (error) {
            console.error(`Failed to send email to ${attendee["E - Mail"]}:`, error);
            // Decide if you want to throw or just log the error and continue
        }
    }
}
