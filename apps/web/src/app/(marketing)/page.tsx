import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { withLocale } from "@/i18n/locale";
import { getCurrentLocale } from "@/i18n/server";

export default async function MarketingHomePage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const reportProofImage =
    locale === "es" ? "/images/marketing/report-proof-es.png" : "/images/marketing/report-proof-en.png";

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-24">
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

        <section className="grid gap-8 rounded-3xl border border-border bg-surface/70 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)] lg:grid-cols-[1.35fr,0.65fr] lg:p-8">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                {dict.marketing.productInActionEyebrow}
              </p>
              <h2 className="text-3xl font-semibold leading-tight">
                {dict.marketing.productInActionTitle}
              </h2>
              <p className="max-w-3xl text-base leading-7 text-muted">
                {dict.marketing.productInActionDescription}
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-background/80">
              <Image
                src={reportProofImage}
                alt={dict.marketing.productInActionImageAlt}
                width={1600}
                height={1000}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>

          <aside className="flex flex-col justify-between rounded-2xl border border-border bg-background/60 p-6">
            <div className="space-y-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  {dict.marketing.proofPointsEyebrow}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">
                  {dict.marketing.proofPointsTitle}
                </h3>
              </div>

              <ul className="space-y-3">
                {dict.marketing.proofPoints.map((point) => (
                  <li
                    key={point}
                    className="rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-muted"
                  >
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 space-y-3">
              <p className="text-sm leading-7 text-muted">
                {dict.marketing.proofAside}
              </p>
              <Link
                href={withLocale(locale, "/sign-in")}
                className="inline-flex w-fit rounded-md border border-accent bg-accent px-4 py-2 text-background"
              >
                {dict.marketing.reviewDemoReport}
              </Link>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
