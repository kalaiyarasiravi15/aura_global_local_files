export const API =
  import.meta.env.VITE_API_URL ||
  "https://api.auraglobaledu.com/api"; 

export const API_ROOT =
  import.meta.env.VITE_API_ROOT ||
  "https://api.auraglobaledu.com";

export const slugify = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};