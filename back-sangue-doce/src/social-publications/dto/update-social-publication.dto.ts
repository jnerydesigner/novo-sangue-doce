import { z } from "zod";

export const socialNetworkSchema = z.enum(["LINKEDIN", "INSTAGRAM", "FACEBOOK"]);

export const updateSocialPublicationSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "A descricao nao pode ficar vazia.")
    .max(5_000, "A descricao deve ter no maximo 5.000 caracteres."),
  socialNetworks: z.array(socialNetworkSchema).transform((networks) => [...new Set(networks)]),
});

export type UpdateSocialPublicationDto = z.infer<typeof updateSocialPublicationSchema>;
export type SocialNetwork = z.infer<typeof socialNetworkSchema>;
