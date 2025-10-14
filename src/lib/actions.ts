"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createEvent as dbCreateEvent, createRegistration, updateRegistration } from "./data";
import type { Registration } from "./types";
import { getEventById } from "./data";

const eventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  confirmationMessage: z.string().min(10, "Confirmation message must be at least 10 characters long"),
  mailSubject: z.string().min(5, "Mail subject must be at least 5 characters long"),
  mailBody: z.string().min(20, "Mail body must be at least 20 characters long"),
  taskPdfUrl: z.instanceof(File).refine(file => file.size > 0, "A task PDF is required."),
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
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error: Please check your input.",
    };
  }

  try {
    const { taskPdfUrl, ...eventData } = validatedFields.data;
    
    const newEvent = await dbCreateEvent({
      ...eventData,
      date: new Date(validatedFields.data.date),
      taskPdfFile: taskPdfUrl,
    });
    revalidatePath("/admin");
    return { message: "success", eventId: newEvent.id };
  } catch (e: any) {
    console.error(e);
    return { message: `Failed to create event: ${e.message}` };
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
  if (new Date() > event!.date) {
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
    revalidatePath(`/admin/events/${eventId}`);
    redirect(`/register/success/${newRegistration.id}`);
  } catch (e: any) {
    console.error(e);
    return { message: `Failed to register: ${e.message}` };
  }
}

const taskSubmissionSchema = z.object({
    taskSubmission: z.string().url("Please provide a valid URL for your submission."),
});

export async function submitTask(registrationId: string, prevState: any, formData: FormData) {
    const validatedFields = taskSubmissionSchema.safeParse({
        taskSubmission: formData.get("taskSubmission"),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Error: Please check your input.",
        };
    }

    try {
        await updateRegistration(registrationId, { taskSubmission: validatedFields.data.taskSubmission });
        revalidatePath(`/admin`); // Revalidate admin pages
        return { message: "Task submitted successfully!" };
    } catch (e: any) {
        console.error(e);
        return { message: `Failed to submit task: ${e.message}` };
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


export async function markAttendance(registrationId: string, eventId: string) {
    try {
        const registration = await updateRegistration(registrationId, { attended: true });
        if (registration) {
            revalidatePath(`/admin/events/${eventId}/attendance`);
            return { success: true, message: `${registration.studentName} checked in.` };
        }
        return { success: false, message: 'Registration not found.' };
    } catch (e: any) {
        console.error(e);
        return { success: false, message: `Failed to mark attendance: ${e.message}` };
    }
}
