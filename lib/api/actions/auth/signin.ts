"use server";

import { createClient } from "@/lib/supabase/server";

export const signInAction = async (email: string, password: string) => {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: null };
};
