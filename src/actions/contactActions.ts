// src/actions/contactActions.ts

"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";

// Zod schema for validating form data
const ContactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

export async function sendContactMessage(prevState: any, formData: FormData) {
  const validatedFields = ContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
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
      data: validatedFields.data,
    });

    return { success: true, message: "Thank you! Your message has been sent." };
  } catch (error) {
    console.error("Contact form error:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }
}