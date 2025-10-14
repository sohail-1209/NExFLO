"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createEvent as dbCreateEvent, createRegistration, updateRegistration } from "./data";
import type { Registration } from "./types";

const eventSchema = z.object({
  name: z.string().min(3, "Event name must be at least 3 characters long"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
  confirmationMessage: z.string().min(10, "Confirmation message must be at least 10 characters long"),
  taskPdfUrl: z.string().url("Must be a valid URL (use /mock-task.pdf for now)"),
});

export async function createEvent(prevState: any, formData: FormData) {
  const validatedFields = eventSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    date: formData.get("date"),
    confirmationMessage: formData.get("confirmationMessage"),
    taskPdfUrl: formData.get("taskPdfUrl"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Error: Please check your input.",
    };
  }

  try {
    const newEvent = await dbCreateEvent({
      ...validatedFields.data,
      date: new Date(validatedFields.data.date),
    });
    revalidatePath("/admin");
    return { message: "success", eventId: newEvent.id };
  } catch (e) {
    return { message: "Failed to create event." };
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
});


export async function registerForEvent(eventId: string, prevState: any, formData: FormData) {
  const validatedFields = registrationSchema.safeParse({
    studentName: formData.get("studentName"),
    studentEmail: formData.get("studentEmail"),
    rollNumber: formData.get("rollNumber"),
    gender: formData.get("gender"),
    branch: formData.get("branch"),
    yearOfStudy: formData.get("yearOfStudy"),
    mobileNumber: formData.get("mobileNumber"),
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
  } catch (e) {
    return { message: "Failed to register." };
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
    } catch (e) {
        return { message: "Failed to submit task." };
    }
}

export async function updateRegistrationStatus(registrationId: string, eventId: string, status: Registration['status']) {
    try {
        await updateRegistration(registrationId, { status });
        revalidatePath(`/admin/events/${eventId}`);
    } catch (e) {
        // Handle error
        console.error("Failed to update status");
    }
}


export async function markAttendance(registrationId: string, eventId: string) {
    try {
        const registration = await updateRegistration(registrationId, { attended: true });
        if (registration) {
            revalidatePath(`/admin/events/${eventId}`);
            return { success: true, message: `${registration.studentName} checked in.` };
        }
        return { success: false, message: 'Registration not found.' };
    } catch (e) {
        return { success: false, message: 'Failed to mark attendance.' };
    }
}
