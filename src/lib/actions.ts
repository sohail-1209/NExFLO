
"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createEventInData, createRegistration, updateRegistration, getRegistrationById as getRegistrationByIdData, getEventById, updateEvent } from "./data";
import type { Registration, Event } from "./types";
import { sendRegistrationEmail, sendPassEmail, sendManualPassEmail, sendBulkPassesEmail, type AttendeeData } from "./email";
import { suggestEmailCorrection as suggestEmailCorrectionFlow } from '@/ai/flows/suggest-email-flow';
import type { EmailInput } from '@/ai/schemas/email-suggestion-schema';


const eventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  venue: z.string().min(3, "Venue must be at least 3 characters long"),
  confirmationMessage: z.string().min(10, "Confirmation message must be at least 10 characters long"),
  mailSubject: z.string().min(5, "Mail subject must be at least 5 characters long"),
  mailBody: z.string().min(20, "Mail body must be at least 20 characters long"),
  taskPdfUrl: z.instanceof(File).optional(),
  appMail: z.string().email().optional().or(z.literal('')),
  appPass: z.string().optional(),
  allowedYears: z.array(z.coerce.number()).optional(),
});

export async function createEvent(prevState: any, formData: FormData) {
  
  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
    date: formData.get("date"),
    venue: formData.get("venue"),
    confirmationMessage: formData.get("confirmationMessage"),
    mailSubject: formData.get("mailSubject"),
    mailBody: formData.get("mailBody"),
    taskPdfUrl: formData.get("taskPdfUrl"),
    appMail: formData.get("appMail"),
    appPass: formData.get("appPass"),
    allowedYears: formData.getAll("allowedYears"),
  };

  // If taskPdfUrl is an empty file, set it to undefined so validation passes
  if (rawData.taskPdfUrl instanceof File && rawData.taskPdfUrl.size === 0) {
      rawData.taskPdfUrl = undefined;
  }

  const validatedFields = eventSchema.safeParse(rawData);

  if (!validatedFields.success) {
    console.error('Validation Errors:', validatedFields.error.flatten().fieldErrors);
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
      taskPdfFile: taskPdfUrl || null,
      passSubject: "Your Event Pass for {eventName}",
      passBody: "Hi {studentName},\n\nHere is your event pass. Please have it ready for check-in.\n\nThank you!",
    });

    revalidatePath("/admin");
    
    if (newEvent.id) {
        redirect(`/admin/events/${newEvent.id}`);
    }

    return { message: "success", eventId: newEvent.id, errors: {} };

  } catch (e: any) {
    if (e.message.includes('NEXT_REDIRECT')) {
      throw e;
    }
    console.error(e);
    return { message: `Error: Failed to create event: ${e.message}`, errors: {} };
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
  if (!event) {
    // Event not found, though this is unlikely if the page loaded
    return { message: "Error: Event not found." };
  }
  
  if (!event.isLive) {
    redirect('/events/closed');
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
  
  // Check year restriction
  if (event.allowedYears.length > 0 && !event.allowedYears.includes(validatedFields.data.yearOfStudy)) {
    return {
      errors: { yearOfStudy: ["Registration is not open for your year of study."] },
      message: "Error: Registration is not open for your year of study.",
    };
  }


  try {
    const taskRequired = !!event.taskPdfUrl;
    const newRegistration = await createRegistration({
      eventId,
      ...validatedFields.data,
    }, taskRequired);

    const headersList = headers();
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || "";
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    if (taskRequired) {
        await sendRegistrationEmail(newRegistration, event, baseUrl);
    } else {
        await sendPassEmail(newRegistration, event, baseUrl);
    }


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
        
        const event = await getEventById(eventId);
        if(!event) {
            throw new Error("Event not found");
        }

        await updateRegistration(registrationId, { status });

        // If status is booked or waitlisted, send the pass email
        if (status === 'booked' || status === 'waitlisted') {
            const registration = await getRegistrationByIdData(registrationId);
            if(registration) {
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
        
        if (event.taskPdfUrl) {
            await sendRegistrationEmail(registration, event, baseUrl);
        } else {
             await sendPassEmail(registration, event, baseUrl);
        }


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

const manualPassSchema = z.object({
  studentName: z.string().min(2, "Attendee name is required"),
  studentEmail: z.string().email("Invalid email address"),
  eventName: z.string().min(3, "Event name is required"),
  eventDate: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  eventVenue: z.string().min(3, "Event venue is required"),
  emailSubject: z.string().min(5, "Email subject is required"),
  emailBody: z.string().min(10, "Email body is required"),
  sendWithoutPass: z.preprocess((val) => val === 'on', z.boolean()),
  appMail: z.string().email().optional().or(z.literal('')),
  appPass: z.string().optional(),
});

export async function sendManualPass(prevState: any, formData: FormData) {
  const validatedFields = manualPassSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error: Please check your input.",
    };
  }

  try {
    const headersList = headers();
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || "";
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    
    await sendManualPassEmail({ ...validatedFields.data, eventDate: new Date(validatedFields.data.eventDate) }, baseUrl);

    return { message: `Email sent successfully to ${validatedFields.data.studentEmail}!` };
  } catch (e: any) {
    console.error("Failed to send manual pass:", e);
    return { message: `Error: Failed to send email: ${e.message}` };
  }
}

const bulkPassSchema = manualPassSchema.omit({ studentName: true, studentEmail: true }).extend({
  attendees: z.string().min(1, "CSV file is required and must contain attendees.")
});


export async function sendBulkPasses(prevState: any, formData: FormData) {
  const validatedFields = bulkPassSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error: Please check your input.",
    };
  }
  
  let attendees: AttendeeData[] = [];
  try {
    attendees = JSON.parse(validatedFields.data.attendees);
     if (!Array.isArray(attendees) || attendees.length === 0) {
      return { message: "Error: No valid attendees found in the CSV." };
    }
  } catch (e) {
    return { message: "Error: Invalid attendee data format." };
  }


  try {
    const { attendees: _, ...emailDetails } = validatedFields.data;
    
    const headersList = headers();
    const host = headersList.get('x-forwarded-host') || headersList.get('host') || "";
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    
    // Call a new email function designed for bulk sending
    await sendBulkPassesEmail(
      attendees,
      { ...emailDetails, eventDate: new Date(emailDetails.eventDate) },
      baseUrl
    );

    return { message: `Emails are being sent to ${attendees.length} attendees!` };
  } catch (e: any) {
    console.error("Failed to send bulk passes:", e);
    return { message: `Error: Failed to send emails: ${e.message}` };
  }
}


export async function toggleEventStatus(eventId: string, isLive: boolean) {
  try {
    await updateEvent(eventId, { isLive });
    revalidatePath(`/admin/events/${eventId}`);
    revalidatePath(`/events/${eventId}/register`);
    revalidatePath('/admin');
    revalidatePath('/events');
    return { success: true, message: `Event status updated.` };
  } catch (e: any) {
    console.error("Failed to toggle event status", e);
    return { success: false, message: `Failed to update status: ${e.message}` };
  }
}


    

    