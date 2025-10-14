
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

function createEmailHtml(body: string, registration: Registration, event: Event, baseUrl: string): string {
    const taskSubmissionUrl = `${baseUrl}/tasks/${registration.id}/submit`;

    // Replace basic placeholders in the user's custom body
    let processedBody = body
      .replace(/{studentName}/g, registration.studentName)
      .replace(/{eventName}/g, event.name);

    // Convert newlines to <br> tags for HTML formatting
    processedBody = processedBody.replace(/\n/g, "<br>");

    // Generate the HTML for the buttons
    const downloadButton = `<a href="${event.taskPdfUrl}" target="_blank" rel="noopener noreferrer" style="background-color:#7c3aed;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block;margin-top:10px;">Download Task PDF</a>`;
    const submissionButton = `<a href="${taskSubmissionUrl}" target="_blank" rel="noopener noreferrer" style="background-color:#7c3aed;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:5px;font-weight:bold;display:inline-block;margin-top:10px;">Submit Your Task Here</a>`;
    
    // Construct the final HTML, explicitly adding the buttons after the main body
    const finalHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          </style>
        </head>
        <body>
          ${processedBody}
          <br><br>
          ${downloadButton}
          <br>
          ${submissionButton}
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
  
  const emailHtml = createEmailHtml(event.mailBody, registration, event, baseUrl);
  
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
    // Re-throw the error to be caught by the calling server action
    throw new Error(`Could not send email. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function sendPassEmail(registration: Registration, event: Event) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email credentials are not set in environment variables.");
    throw new Error("Email service is not configured.");
  }

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
    const imageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

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
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .details { margin: 20px 0; padding: 20px; border-left: 4px solid #7c3aed; background-color: #f8f9fa; border-radius: 8px; }
            .details p { margin: 5px 0; }
            .qr-container { text-align: center; margin-top: 15px; }
            .status { text-transform: capitalize; font-weight: bold; }
          </style>
        </head>
        <body>
          ${processedBody}
          
          <div class="details">
            <p><strong>Name:</strong> ${registration.studentName}</p>
            <p><strong>Roll Number:</strong> ${registration.rollNumber}</p>
            <p><strong>Branch:</strong> ${registration.branch}</p>
            <p><strong>Year of Study:</strong> ${registration.yearOfStudy}</p>
            <p><strong>Status:</strong> <span class="status">${registration.status}</span></p>
            <div class="qr-container">
              <p style="font-size: 0.9em; color: #666;">Scan for event check-in:</p>
              <img src="${imageUrl}" alt="Event Pass QR Code" style="max-width:150px; border-radius: 8px;"/>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Pass email sent successfully:", info.response);
  } catch (error) {
    console.error("Failed to send pass email:", error);
    throw new Error(`Could not send pass email. Reason: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
