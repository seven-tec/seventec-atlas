import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCurrentLocale } from "@/i18n/server";
import { withLocale } from "@/i18n/locale";
import { getFlashMessage } from "@/lib/flash";

export default async function ProtectedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const flashMessage = await getFlashMessage();

  if (!session?.user) {
    redirect(withLocale(locale, "/sign-in"));
  }

  return (
    <AppShell
      locale={locale}
      labels={dict.common}
      userName={session.user.name}
      flashMessage={flashMessage}
    >
      {children}
    </AppShell>
  );
}
