export const FLASH_COOKIE_NAME = "atlas_flash";

export type FlashMessage = {
  type: "success" | "error" | "info";
  title: string;
  description: string;
};
