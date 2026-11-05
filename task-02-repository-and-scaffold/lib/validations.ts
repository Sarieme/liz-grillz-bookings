import { z } from "zod";

/**
 * Booking Schema
 * Enforces all business rules derived for Liz's Grillz catering.
 */
export const bookingSchema = z.object({
  clientName: z
    .string()
    .trim()
    .min(5, "Client name must be at least 5 characters.")
    .regex(
      /^[a-zA-Z\s'-]+(?:\s+[a-zA-Z\s'-]+)+$/,
      "Please provide legal first and last name (at least two words)."
    ),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:0\d{10}|\+234\d{10})$/,
      "Phone number must be an 11-digit Nigerian format (e.g. 08031234567 or +2348031234567)."
    ),
  eventDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date format.")
    .refine((val) => {
      const event = new Date(val);
      const now = new Date();
      // Must be at least 48 hours in the future
      return event.getTime() > now.getTime() + 48 * 3600 * 1000;
    }, "Event date must be at least 48 hours in the future to allow kitchen preparation."),
  guestCount: z
    .number()
    .int("Guest count must be an integer.")
    .min(20, "Minimum catering guest count is 20 guests.")
    .max(2000, "Maximum single catering capacity is 2,000 guests."),
  organizationType: z
    .enum(["Individual", "Corporate", "Wedding", "Religious", "Church", "Corporate Office"])
    .default("Individual"),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters.").optional(),
});

/**
 * Registration Schema
 */
export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(5, "Full name must be at least 5 characters.")
    .regex(
      /^[a-zA-Z\s'-]+(?:\s+[a-zA-Z\s'-]+)+$/,
      "Full name must contain both first and last name."
    ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address format.")
    .refine((val) => {
      const parts = val.split(".");
      return parts.length > 1 && parts[parts.length - 1].length >= 2;
    }, "Email top-level domain must be at least 2 characters."),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:0\d{10}|\+234\d{10})$/,
      "Enter a valid 11-digit Nigerian phone number."
    ),
  password: z
    .string()
    .trim()
    .min(8, "Password must be at least 8 characters.")
    .refine((val) => val.length > 0 && !/^\s+$/.test(val), "Password cannot consist solely of spaces."),
  organizationType: z.string().default("Individual"),
});

/**
 * Login Schema
 */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email format."),
  password: z.string().trim().min(1, "Password is required."),
});

export type BookingInput = z.infer<typeof bookingSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
