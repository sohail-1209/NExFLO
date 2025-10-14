
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createEventInData, createRegistration, updateRegistration, getRegistrationById as getRegistrationByIdData, getEventById, updateEvent } from "./data";
import type { Registration, Event } from "./types";
import { sendRegistrationEmail, sendPassEmail } from "./email";
import { suggestEmailCorrection as suggestEmailCorrectionFlow } from '@/ai/flows/suggest-email-flow';
import type { EmailInput } from '@/ai/schemas/email-suggestion-schema';


const eventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  confirmationMessage: z.string().min(10, "Confirmation message must be at least 10 characters long"),
  mailSubject: z.string().min(5, "Mail subject must be at least 5 characters long"),
  mailBody: z.string().min(20, "Mail body must be at least 20 characters long"),
  taskPdfUrl: z.instanceof(File).refine(file => file.size > 0, "A task PDF is required.").or(z.string().url()),
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
  });

  if (!validatedFields.success) {
    console.log(validatedFields.error.flatten().fieldErrors);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error: Please check your input.",
    };
  }

  try {
    const { taskPdfUrl, ...eventData } = validatedFields.data;
    
    const newEvent = await createEventInData({
      ...eventData,
      date: new Date(validatedFields.data.date),
      taskPdfFile: taskPdfUrl as File,
      passSubject: "Your Event Pass for {eventName}",
      passBody: "Hi {studentName},\n\nHere is your event pass. Please have it ready for check-in.\n\nThank you!",
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

const passDetailsSchema = z.object({
  passSubject: z.string().min(5, "Pass subject must be at least 5 characters long"),
  passBody: z.string().min(20, "Pass body must be at least 20 characters long"),
});

export async function updateEventPassDetails(eventId: string, prevState: any, formData: FormData) {
  const validatedFields = passDetailsSchema.safeParse({
    passSubject: formData.get("passSubject"),
    passBody: formData.get("passBody"),
  });

  if (!validatedFields.success) {
     return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error: Please check your input.",
    };
  }

  try {
    await updateEvent(eventId, validatedFields.data);
    revalidatePath(`/admin/events/${eventId}`);
    return { message: "Pass details updated successfully!", errors: {} };
  } catch (e:any) {
    console.error(e);
    return { message: `Error: Failed to update pass details: ${e.message}`, errors: {} };
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

    const headersList = headers();
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || "";
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

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
                return hostname.includes('github.com') || hostname.includes('docs.google.com') || hostname.endsWith('github.io');
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
            return {
              errors: { email: ["The email provided does not match the registered email for this submission."] },
              message: "Error: The email provided does not match the registered email for this submission."
            };
        }

        await updateRegistration(registrationId, { 
            taskSubmission: validatedFields.data.taskSubmission,
            taskSubmittedAt: new Date(),
         });
        revalidatePath(`/admin`); // Revalidate admin pages
        return { message: "Task submitted successfully!", errors: {} };
    } catch (e: any) {
        console.error(e);
        return { message: `Error: Failed to submit task: ${e.message}` };
    }
}

export async function updateRegistrationStatus(registrationId: string, eventId: string, status: Registration['status']) {
    try {
        await updateRegistration(registrationId, { status });

        // If status is booked or waitlisted, send the pass email
        if (status === 'booked' || status === 'waitlisted') {
            const registration = await getRegistrationByIdData(registrationId);
            const event = await getEventById(eventId);
            if(registration && event) {
                const headersList = headers();
                const host = headersList.get('x-forwarded-host') || headersList.get('host') || "";
                const protocol = headersList.get('x-forwarded-proto') || 'http';
                const baseUrl = `${protocol}://${host}`;
                await sendPassEmail(registration, event, baseUrl);
            }
        }
        revalidatePath(`/admin/events/${eventId}`);
        return { success: true, message: `Status updated to ${status}.` };
    } catch (e: any) {
        console.error("Failed to update status", e);
        return { success: false, message: `Failed to update status: ${e.message}` };
    }
}


export async function markAttendance(registrationId: string, eventId: string): Promise<{ success: boolean, message: string }> {
    try {
        const registration = await getRegistrationByIdData(registrationId);
        if (!registration) {
             return { success: false, message: 'Registration not found.' };
        }
        
        // Update both attended and status if they were waitlisted
        const updates: Partial<Registration> = { 
            attended: true,
            attendedAt: new Date(),
        };
        if (registration.status === 'waitlisted') {
            updates.status = 'booked';
        }
        
        await updateRegistration(registrationId, updates);

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


export async function suggestEmailCorrection(
  input: EmailInput
): Promise<{ suggestion: string | null }> {
  try {
    const result = await suggestEmailCorrectionFlow(input);
    return { suggestion: result.suggestion };
  } catch (error) {
    console.error('Error in AI suggestion flow:', error);
    // Return no suggestion in case of an error
    return { suggestion: null };
  }
}
    

    
