"use server";

import { createAuthenticatedAxios } from "@/lib/api/axios";

export interface OrganisationTag {
    id: number;
    name: string;
    organisation_id: number;
    is_deleted: number;
    created_at: string;
    updated_at: string;
}

export interface OrganisationTagsResponse {
    data: {
        success: boolean;
        message: string;
        data: {
            organisation: {
                id: number;
                name: string;
                slug: string;
            };
            tags: OrganisationTag[];
        };
    }
}

export const getOrganisationTagsAction = async (
    orgSlug: string
): Promise<OrganisationTag[]> => {
    const axios = await createAuthenticatedAxios();
    const response = await axios.get<OrganisationTagsResponse>(
        `/v1/organisation/${orgSlug}/tags`
    );

    return response.data.data.data.tags;
};
