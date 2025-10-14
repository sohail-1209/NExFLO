
"use server";

import nodemailer from "nodemailer";
import type { Registration, Event } from "./types";

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
  const emailHtml = replacePlaceholders(event.mailBody, registration, event, baseUrl);
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: registration.studentEmail,
    subject: event.mailSubject.replace(/{eventName}/g, event.name),
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Registration email sent to:", registration.studentEmail);
  } catch (error) {
    console.error("Failed to send registration email:", error);
    // We don't want to block the registration if the email fails,
    // so we just log the error for now.
  }
}
