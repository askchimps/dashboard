"use server";

import { createClient } from "@/lib/supabase/server";

export const signUpAction = async (
  name: string,
  email: string,
  password: string
) => {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
      },
    },
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: null };
};
