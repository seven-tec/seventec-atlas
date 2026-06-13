import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { withLocale } from "@/i18n/locale";
import { getCurrentLocale } from "@/i18n/server";

export default async function MarketingHomePage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24">
      <div className="space-y-10">
        <div className="max-w-4xl space-y-6">
          <p className="text-sm uppercase tracking-[0.24em] text-muted">
            {dict.marketing.eyebrow}
          </p>
          <h1 className="text-5xl font-semibold leading-tight">
            {dict.marketing.title}
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted">
            {dict.marketing.description}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href={withLocale(locale, "/sign-in")}
              className="rounded-md border border-accent bg-accent px-4 py-2 text-background"
            >
              {dict.marketing.enterPlatform}
            </Link>
            <Link
              href={withLocale(locale, "/dashboard")}
              className="rounded-md border border-border px-4 py-2 text-foreground"
            >
              {dict.marketing.openDashboard}
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {dict.marketing.cards.map((card) => (
            <div key={card.eyebrow} className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {card.eyebrow}
              </p>
              <h2 className="mt-3 text-xl font-semibold">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
