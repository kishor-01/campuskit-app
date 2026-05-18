// src/actions/contactActions.ts

"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";

// Zod schema for validating form data — strict spam protection
const ContactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100, { message: "Name must be under 100 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }).max(255, { message: "Email too long." }).refine(val => !val.endsWith('.xyz') && !val.endsWith('.top'), { message: "Suspicious email domain." }),
  subject: z.string().max(200, { message: "Subject too long." }).optional(),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }).max(2000, { message: "Message cannot exceed 2000 characters." }),
});

export async function sendContactMessage(prevState: any, formData: FormData) {
  const validatedFields = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject") || undefined,
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Please correct the errors below.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.contactMessage.create({
      data: {
        name: validatedFields.data.name,
        email: validatedFields.data.email,
        subject: validatedFields.data.subject || null,
        message: validatedFields.data.message,
      },
    });

    return { success: true, message: "Thank you! Your message has been sent." };
  } catch (error) {
    console.error("Contact form error:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}