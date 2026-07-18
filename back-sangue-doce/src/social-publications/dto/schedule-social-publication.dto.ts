import { z } from "zod";
import { socialNetworkSchema } from "./update-social-publication.dto";

export const scheduleSocialPublicationSchema = z.object({
  scheduledPublishAt: z.iso.datetime({ offset: true }).optional(),
  socialNetworks: z
    .array(socialNetworkSchema)
    .min(1, "Informe pelo menos uma rede social.")
    .transform((networks) => [...new Set(networks)]),
});

export type ScheduleSocialPublicationDto = z.infer<typeof scheduleSocialPublicationSchema>;
