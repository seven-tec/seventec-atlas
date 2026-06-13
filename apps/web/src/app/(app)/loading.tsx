function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-surface p-6">
      <div className="h-3 w-28 rounded bg-background/70" />
      <div className="mt-4 h-8 w-64 rounded bg-background/70" />
      <div className="mt-3 h-4 w-full max-w-2xl rounded bg-background/60" />
      <div className="mt-2 h-4 w-full max-w-xl rounded bg-background/60" />
    </div>
  );
}

export default function AppLoading() {
  return (
    <div className="space-y-6">
      <LoadingCard />
      <div className="grid gap-4 md:grid-cols-3">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
      <LoadingCard />
    </div>
  );
}
