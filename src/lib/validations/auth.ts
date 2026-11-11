import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Inserisci un indirizzo email valido." }),
  password: z
    .string()
    .min(8, { message: "La password deve contenere almeno 8 caratteri." }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: "Inserisci un indirizzo email valido." }),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
