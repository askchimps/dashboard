"use server";

import { IInitiateCallForm } from "@/lib/types/form";

export const initiateCallAction = async (
  callData: IInitiateCallForm,
  orgSlug: string
) => {
  try {
    // Make POST request to n8n webhook URL with dynamic organization slug
    const response = await fetch(
      `https://www.ai.askchimps.com/webhook/${orgSlug}/call-initiate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: callData.firstName,
          last_name: callData.lastName,
          mobile_number: callData.mobileNumber,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        message:
          errorData.message || "Failed to initiate call. Please try again.",
      };
    }

    // For webhook, we might not get response data, so handle accordingly
    let data = {};
    try {
      data = await response.json();
    } catch {
      // Webhook might not return JSON, which is fine
    }

    return {
      success: true,
      message: "Call initiated successfully! You will receive a call shortly.",
      data,
    };
  } catch (error) {
    console.error("Error initiating call:", error);
    return {
      success: false,
      message: "Network error. Please check your connection and try again.",
    };
  }
};
