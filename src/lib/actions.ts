
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createEventInData, createRegistration, updateRegistration, getRegistrationById as getRegistrationByIdData, getEventById } from "./data";
import type { Registration, Event } from "./types";
import { sendRegistrationEmail } from "./email";


const eventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  confirmationMessage: z.string().min(10, "Confirmation message must be at least 10 characters long"),
  mailSubject: z.string().min(5, "Mail subject must be at least 5 characters long"),
  mailBody: z.string().min(20, "Mail body must be at least 20 characters long"),
  taskPdfUrl: z.instanceof(File).refine(file => file.size > 0, "A task PDF is required.").or(z.string().url()),
  passSubject: z.string().min(5, "Pass subject must be at least 5 characters long"),
  passBody: z.string().min(20, "Pass body must be at least 20 characters long"),
  passLayoutUrl: z.instanceof(File).refine(file => file.size > 0 && file.type.startsWith("image/"), "A pass layout image is required."),
  nameX: z.coerce.number(),
  nameY: z.coerce.number(),
  rollNumberX: z.coerce.number(),
  rollNumberY: z.coerce.number(),
  branchX: z.coerce.number(),
  branchY: z.coerce.number(),
  statusX: z.coerce.number(),
  statusY: z.coerce.number(),
});

export async function createEvent(prevState: any, formData: FormData) {
  const validatedFields = eventSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    date: formData.get("date"),
    confirmationMessage: formData.get("confirmationMessage"),
    mailSubject: formData.get("mailSubject"),
    mailBody: formData.get("mailBody"),
    taskPdfUrl: formData.get("taskPdfUrl"),
    passSubject: formData.get("passSubject"),
    passBody: formData.get("passBody"),
    passLayoutUrl: formData.get("passLayoutUrl"),
    nameX: formData.get("nameX"),
    nameY: formData.get("nameY"),
    rollNumberX: formData.get("rollNumberX"),
    rollNumberY: formData.get("rollNumberY"),
    branchX: formData.get("branchX"),
    branchY: formData.get("branchY"),
    statusX: formData.get("statusX"),
    statusY: formData.get("statusY"),
  });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error: Please check your input.",
    };
  }

  try {
    const { taskPdfUrl, passLayoutUrl, ...eventData } = validatedFields.data;
    
    const newEvent = await createEventInData({
      ...eventData,
      date: new Date(validatedFields.data.date),
      taskPdfFile: taskPdfUrl,
      passLayoutFile: passLayoutUrl,
    });
    revalidatePath("/admin");
    
    if (newEvent.id) {
        redirect(`/admin/events/${newEvent.id}`);
    }

    return { message: "success", eventId: newEvent.id };

  } catch (e: any) {
    if (e.message.includes('NEXT_REDIRECT')) {
      throw e;
    }
    console.error(e);
    return { message: `Error: Failed to create event: ${e.message}` };
  }
}

const registrationSchema = z.object({
  studentName: z.string().min(2, "Name is required"),
  studentEmail: z.string().email("Invalid email address"),
  rollNumber: z.string().min(1, "Roll number is required"),
  gender: z.string().min(1, "Gender is required"),
  branch: z.string().min(1, "Branch is required"),
  yearOfStudy: z.coerce.number().min(1, "Year of study is required"),
  mobileNumber: z.string().min(10, "A valid mobile number is required"),
  laptop: z.enum(['true', 'false']).transform(val => val === 'true').refine(val => typeof val === 'boolean', {
    message: "You must select an option for laptop.",
  }),
});


export async function registerForEvent(eventId: string, prevState: any, formData: FormData) {
  const headersList = headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || "";
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const baseUrl = `${protocol}://${host}`;

  const event = await getEventById(eventId);
  if (!event || new Date() > event.date) {
    return {
      errors: {},
      message: "Error: Registration for this event has closed.",
    };
  }
  
  const validatedFields = registrationSchema.safeParse({
    studentName: formData.get("studentName"),
    studentEmail: formData.get("studentEmail"),
    rollNumber: formData.get("rollNumber"),
    gender: formData.get("gender"),
    branch: formData.get("branch"),
    yearOfStudy: formData.get("yearOfStudy"),
    mobileNumber: formData.get("mobileNumber"),
    laptop: formData.get("laptop"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error: Please check your input.",
    };
  }

  try {
    const newRegistration = await createRegistration({
      eventId,
      ...validatedFields.data,
    });

    // Send the confirmation email
    await sendRegistrationEmail(newRegistration, event, baseUrl);

    revalidatePath(`/admin/events/${eventId}`);
    redirect(`/register/success/${newRegistration.id}`);
  } catch (e: any) {
    if (e.message.includes('NEXT_REDIRECT')) {
      throw e;
    }
    console.error(e);
    // Return a more specific error message if it's an email issue
    return { message: `Error: Failed to register. ${e.message}` };
  }
}

const taskSubmissionSchema = z.object({
    email: z.string().email("Please provide a valid email address."),
    taskSubmission: z.string().url("Please provide a valid URL.").refine(
        (url) => {
            try {
                const hostname = new URL(url).hostname;
                return hostname.includes('github.com') || hostname.includes('docs.google.com') || hostname.endsWith('.github.io');
            } catch {
                return false;
            }
        },
        {
            message: "Submission must be a valid URL from GitHub (including github.io) or Google Docs."
        }
    ),
});

export async function submitTask(registrationId: string, prevState: any, formData: FormData) {
    const validatedFields = taskSubmissionSchema.safeParse({
        email: formData.get("email"),
        taskSubmission: formData.get("taskSubmission"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error: Please check your input.",
        };
    }

    try {
        const registration = await getRegistrationByIdData(registrationId);
        if (!registration) {
             return { message: "Error: Registration not found." };
        }

        if (registration.studentEmail.toLowerCase() !== validatedFields.data.email.toLowerCase()) {
            return { message: "Error: The email provided does not match the registered email for this submission." };
        }

        await updateRegistration(registrationId, { taskSubmission: validatedFields.data.taskSubmission });
        revalidatePath(`/admin`); // Revalidate admin pages
        return { message: "Task submitted successfully!" };
    } catch (e: any) {
        console.error(e);
        return { message: `Error: Failed to submit task: ${e.message}` };
    }
}

export async function updateRegistrationStatus(registrationId: string, eventId: string, status: Registration['status']) {
    try {
        await updateRegistration(registrationId, { status });
        revalidatePath(`/admin/events/${eventId}`);
    } catch (e) {
        // Handle error
        console.error("Failed to update status", e);
    }
}


export async function markAttendance(registrationId: string, eventId: string): Promise<{ success: boolean, message: string }> {
    try {
        const registration = await getRegistrationByIdData(registrationId);
        if (!registration) {
             return { success: false, message: 'Registration not found.' };
        }
        
        await updateRegistration(registrationId, { attended: true });

        revalidatePath(`/admin/events/${eventId}`);
        revalidatePath(`/admin/events/${eventId}/attendance`);
        return { success: true, message: `${registration.studentName} checked in.` };
    } catch (e: any) {
        console.error(e);
        return { success: false, message: `Error: Failed to mark attendance: ${e.message}` };
    }
}

export async function resendRegistrationEmail(registrationId: string) {
    try {
        const registration = await getRegistrationByIdData(registrationId);
        if (!registration) {
            return { success: false, message: "Registration not found." };
        }

        const event = await getEventById(registration.eventId);
        if (!event) {
            return { success: false, message: "Event not found." };
        }

        const headersList = headers();
        const host = headersList.get('x-forwarded-host') || headersList.get('host') || "";
        const protocol = headersList.get('x-forwarded-proto') || 'http';
        const baseUrl = `${protocol}://${host}`;

        await sendRegistrationEmail(registration, event, baseUrl);

        return { success: true, message: `Email sent successfully to ${registration.studentEmail}. Please check your inbox (and spam folder).` };

    } catch (error: any) {
        console.error("Failed to resend email:", error);
        return { success: false, message: `Failed to send email. Please check server logs for details: ${error.message}` };
    }
}
