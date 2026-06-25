import { THEME_STORAGE_KEY } from "./constants";

// A tiny synchronous script injected at the top of <body>. It resolves the
// theme from the stored choice (or the OS preference) and writes it to the
// <html> element *before first paint*, so there's no flash of the wrong theme
// on load. Kept dependency-free and stringified — it runs before React.
export const THEME_NO_FLASH_SCRIPT = `(function(){try{var c=localStorage.getItem("${THEME_STORAGE_KEY}");var t=(c==="light"||c==="dark")?c:(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");var r=document.documentElement;r.setAttribute("data-theme",t);r.style.colorScheme=t;}catch(e){}})();`;
