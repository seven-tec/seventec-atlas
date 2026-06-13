import { cookies, headers } from "next/headers";
import { FLASH_COOKIE_NAME, type FlashMessage } from "@/lib/flash-shared";

export { FLASH_COOKIE_NAME, type FlashMessage } from "@/lib/flash-shared";

export async function setFlashMessage(message: FlashMessage) {
  const cookieStore = await cookies();

  cookieStore.set(FLASH_COOKIE_NAME, JSON.stringify(message), {
    path: "/",
    sameSite: "lax",
    maxAge: 60,
  });
}

export async function getFlashMessage(): Promise<FlashMessage | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(FLASH_COOKIE_NAME)?.value;

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as FlashMessage;

    if (
      typeof parsed === "object" &&
      parsed &&
      (parsed.type === "success" || parsed.type === "error" || parsed.type === "info") &&
      typeof parsed.title === "string" &&
      typeof parsed.description === "string"
    ) {
      return parsed;
    }
  } catch {
  }

  return null;
}

export async function getFallbackRedirectPath(defaultPath = "/dashboard") {
  const headerStore = await headers();
  const referer = headerStore.get("referer");

  if (!referer) {
    return defaultPath;
  }

  try {
    const refererUrl = new URL(referer);
    return `${refererUrl.pathname}${refererUrl.search}`;
  } catch {
    return defaultPath;
  }
}
