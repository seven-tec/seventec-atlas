import { signInWithDev, signInWithGithub } from "@/modules/auth/actions";
import {
  FormSubmissionHint,
  PendingFieldset,
} from "@/components/form/form-pending-state";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCurrentLocale } from "@/i18n/server";
import { PendingSubmitButton } from "@/components/form/pending-submit-button";

const devAuthEnabled = process.env.DEV_AUTH_ENABLED === "true";
const githubConfigured =
  !!process.env.AUTH_GITHUB_ID &&
  !!process.env.AUTH_GITHUB_SECRET &&
  process.env.AUTH_GITHUB_ID !== "replace-me" &&
  process.env.AUTH_GITHUB_SECRET !== "replace-me";

export default async function SignInPage() {
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <div className="w-full rounded-xl border border-border bg-surface p-8">
        <div className="mb-8 space-y-2">
          <p className="text-sm uppercase tracking-[0.24em] text-muted">
            SevenTec Atlas
          </p>
          <h1 className="text-3xl font-semibold">{dict.signIn.title}</h1>
          <p className="text-sm text-muted">
            {dict.signIn.description}
          </p>
        </div>
        <div className="space-y-6">
          {devAuthEnabled ? (
            <form action={signInWithDev} className="space-y-4">
              <PendingFieldset className="space-y-4">
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm font-medium">{dict.signIn.devAccessTitle}</p>
                  <p className="mt-1 text-sm text-muted">
                    {dict.signIn.devAccessDescription}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    {dict.signIn.name}
                  </label>
                  <input
                    id="name"
                    name="name"
                    defaultValue="SevenTec Architect"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    {dict.signIn.email}
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue="architect@seventec.dev"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <PendingSubmitButton
                    pendingLabel={dict.signIn.openingWorkspace}
                    className="w-full font-medium"
                  >
                    {dict.signIn.enterDevMode}
                  </PendingSubmitButton>
                  <FormSubmissionHint
                    idleMessage={dict.signIn.devIdleHint}
                    pendingMessage={dict.signIn.devPendingHint}
                    idleLabel={dict.common.ready}
                    pendingLabel={dict.common.processing}
                  />
                </div>
              </PendingFieldset>
            </form>
          ) : null}

          {githubConfigured ? (
            <form action={signInWithGithub}>
              <PendingFieldset className="space-y-3">
                <PendingSubmitButton
                  pendingLabel={dict.signIn.redirectingGithub}
                  className="w-full font-medium"
                  variant="secondary"
                >
                  {dict.signIn.continueGithub}
                </PendingSubmitButton>
                <FormSubmissionHint
                  idleMessage={dict.signIn.githubIdleHint}
                  pendingMessage={dict.signIn.githubPendingHint}
                  idleLabel={dict.common.ready}
                  pendingLabel={dict.common.processing}
                />
              </PendingFieldset>
            </form>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
              {dict.signIn.githubNotConfigured}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
