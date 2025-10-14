
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

function replacePlaceholders(body: string, registration: Registration, event: Event, baseUrl: string): string {
    // Basic placeholder replacement
    let finalBody = body.replace(/{studentName}/g, registration.studentName);
    finalBody = finalBody.replace(/{eventName}/g, event.name);

    // Create the submission link
    const taskSubmissionUrl = `${baseUrl}/tasks/${registration.id}/submit`;
    finalBody = finalBody.replace(/{taskSubmissionLink}/g, `<a href="${taskSubmissionUrl}">${taskSubmissionUrl}</a>`);
    
    return finalBody;
}


export async function sendRegistrationEmail(registration: Registration, event: Event, baseUrl: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Email credentials are not set in environment variables.");
    throw new Error("Email service is not configured.");
  }
  
  const emailHtml = replacePlaceholders(event.mailBody, registration, event, baseUrl);
  
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
