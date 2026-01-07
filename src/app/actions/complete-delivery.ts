"use server";

import { createClient } from "@/lib/supabase/server";
import { sendMail } from "@/lib/mail";
import {
  getDeliveryConfirmationTemplate,
  getDeliveryReportTemplate,
} from "@/lib/mail/templates";
import { checkRole } from "@/lib/auth/role-check";

export async function completeDelivery(sessionId: string) {
  try {
    await checkRole(["driver", "admin", "super_admin"]);
    const supabase = await createClient();

    const { data: session } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();
    const { data: artworks } = await supabase
      .from("artworks")
      .select("*")
      .eq("session_id", sessionId);

    if (!session || !artworks) return { error: "Session not found" };

    const delivered = artworks.filter((a) => a.status === "delivered");
    const returned = artworks.filter(
      (a) =>
        a.status === "returned" ||
        a.status === "in_truck" ||
        a.status === "in_stock"
    );

    // Only send email to client if there are delivered items
    if (session.client_email && delivered.length > 0) {
      await sendMail({
        to: session.client_email,
        subject: `Delivery Confirmation - ${session.client_name}`,
        html: getDeliveryConfirmationTemplate(
          session.client_name,
          session.address,
          delivered
        ),
        successMessage: `Email sent to client ${session.client_email}`,
        errorMessage: `Failed to send email to client ${session.client_email}`,
      });
    }

    // Send to Admin (using a placeholder email or env var)
    await sendMail({
      to: process.env.ADMIN_EMAIL || "admin@example.com",
      subject: `Delivery Report: ${session.client_name}`,
      html: getDeliveryReportTemplate(
        session.client_name,
        session.address,
        delivered,
        returned
      ),
      successMessage: "Delivery report sent to admin",
      errorMessage: "Failed to send delivery report to admin",
    });

    await supabase
      .from("sessions")
      .update({ status: "archived" })
      .eq("id", sessionId);

    return { success: true };
  } catch (error: any) {
    console.error("Email/Auth error:", error);
    return { error: error.message || "Failed to send emails" };
  }
}
