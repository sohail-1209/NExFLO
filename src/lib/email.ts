
"use server";

import nodemailer from "nodemailer";
import type { Registration, Event } from "./types";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

function replacePlaceholders(body: string, registration: Registration, event: Event): string {
    // Basic placeholder replacement
    let finalBody = body.replace(/{studentName}/g, registration.studentName);
    finalBody = finalBody.replace(/{eventName}/g, event.name);

    // Create the submission link
    const taskSubmissionUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/tasks/${registration.id}/submit`;
    finalBody = finalBody.replace(/{taskSubmissionLink}/g, `<a href="${taskSubmissionUrl}">${taskSubmissionUrl}</a>`);
    
    return finalBody;
}


export async function sendRegistrationEmail(registration: Registration, event: Event) {
  const emailHtml = replacePlaceholders(event.mailBody, registration, event);
  
  const mailOptions = {
    from: process.env.EMAIL_SERVER_USER,
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

