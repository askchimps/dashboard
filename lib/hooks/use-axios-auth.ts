"use client";

import { useEffect } from "react";

import { axiosAuth } from "@/lib/api/axios";
import { createClient } from "@/lib/supabase/client";

const useAxiosAuth = () => {
  const supabase = createClient();

  useEffect(() => {
    const requestIntercept = axiosAuth.interceptors.request.use(
      async config => {
        const { data: session } = await supabase.auth.getSession();
        const accessToken = session?.session?.access_token;

        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = `bearer ${accessToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
    return () => {
      axiosAuth.interceptors.request.eject(requestIntercept);
    };
  }, [supabase.auth]);

  return axiosAuth;
};

export default useAxiosAuth;
