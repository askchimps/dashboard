import axios from "axios";

import { createClient } from "@/lib/supabase/server";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;
const API_KEY = process.env.NEXT_PUBLIC_BACKEND_API_KEY;

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
      "x-api-key": API_KEY,
    },
  });
}
