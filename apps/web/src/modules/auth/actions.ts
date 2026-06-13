"use server";

import { signIn, signOut } from "@/auth";
import { getCurrentLocale } from "@/i18n/server";
import { withLocale } from "@/i18n/locale";

export async function signInWithGithub() {
  const locale = await getCurrentLocale();
  await signIn("github", { redirectTo: withLocale(locale, "/dashboard") });
}

export async function signInWithDev(formData: FormData) {
  const locale = await getCurrentLocale();
  await signIn("dev", {
    email: String(formData.get("email") ?? "architect@seventec.dev"),
    name: String(formData.get("name") ?? "SevenTec Architect"),
    redirectTo: withLocale(locale, "/dashboard"),
  });
}

export async function signOutAction() {
  const locale = await getCurrentLocale();
  await signOut({ redirectTo: withLocale(locale, "/") });
}
