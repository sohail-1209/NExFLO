
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

    // Simple placeholder replacement for name and event
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
