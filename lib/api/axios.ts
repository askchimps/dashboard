import axios from "axios";

import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export const axiosAuth = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export async function createAuthenticatedAxios() {
  const supabase = await createClient();
  const { data: session } = await supabase.auth.getSession();
  const accessToken = session?.session?.access_token;

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "x-api-key":
        "askchimps-api-7xN9mK2pQ8vR3wE6yT1uI4oP0sA5zX8cV7bN2mK9pQ3wE6yT1uI4oP0sA5zX8cV7bN2mK9pQ3wE6yT1uI4oP0sA5z",
    },
  });
}
