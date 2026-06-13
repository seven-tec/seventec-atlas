export function getAssessmentStatusTone(status: string) {
  switch (status) {
    case "ANALYZED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
    case "SUBMITTED":
      return "border-amber-500/30 bg-amber-500/10 text-amber-100";
    default:
      return "border-slate-500/30 bg-slate-500/10 text-slate-200";
  }
}

export function getRunStatusTone(status: string) {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
    case "PROCESSING":
      return "border-sky-500/30 bg-sky-500/10 text-sky-100";
    case "FAILED":
      return "border-rose-500/30 bg-rose-500/10 text-rose-100";
    default:
      return "border-slate-500/30 bg-slate-500/10 text-slate-200";
  }
}

export function getDeltaTone(direction: string) {
  switch (direction) {
    case "improved":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-100";
    case "regressed":
      return "border-rose-500/30 bg-rose-500/10 text-rose-100";
    default:
      return "border-slate-500/30 bg-slate-500/10 text-slate-200";
  }
}
