"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";
import { IOrganisationUsage } from "@/types/usage";

export const getOrganisationUsageAction = async (idOrSlug: string): Promise<IOrganisationUsage> => {
    const axios = await createAuthenticatedAxios();

    const response = await axios.get(`/v1/organisation/${idOrSlug}/usage`);

    return response.data.data;
};
