import Link from "next/link";
import { ReactNode } from "react";
import { type Locale } from "@/i18n/config";
import { withLocale } from "@/i18n/locale";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { FlashToast } from "@/components/feedback/flash-toast";
import { type FlashMessage } from "@/lib/flash";
import { signOutAction } from "@/modules/auth/actions";

type AppShellProps = {
  children: ReactNode;
  locale: Locale;
  labels: {
    brandTagline: string;
    userFallback: string;
    signOut: string;
    localeEnglish: string;
    localeSpanish: string;
    dismiss: string;
  };
  userName?: string | null;
  flashMessage?: FlashMessage | null;
};

export function AppShell({
  children,
  locale,
  labels,
  userName,
  flashMessage,
}: AppShellProps) {
  return (
    <div className="min-h-screen">
      {flashMessage ? (
        <FlashToast message={flashMessage} dismissLabel={labels.dismiss} />
      ) : null}
      <header className="border-b border-border bg-surface/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <Link
              href={withLocale(locale, "/dashboard")}
              className="text-lg font-semibold text-foreground"
            >
              SevenTec Atlas
            </Link>
            <p className="text-xs text-muted">{labels.brandTagline}</p>
          </div>
          <div className="flex items-center gap-4">
            <LocaleSwitcher
              currentLocale={locale}
              englishLabel={labels.localeEnglish}
              spanishLabel={labels.localeSpanish}
            />
            <span className="text-sm text-muted">{userName ?? labels.userFallback}</span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-md border border-border px-3 py-2 text-sm"
              >
                {labels.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
