"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const THEME_CHANGE_EVENT = "theme-change";

function subscribe(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

function applyTheme(theme: Theme) {
  localStorage.setItem("theme", theme);
  document.documentElement.setAttribute("data-theme", theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Re-apply after React's dev-mode remount clears the data-theme attribute the inline script set.
  useLayoutEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored && document.documentElement.getAttribute("data-theme") !== stored) {
      document.documentElement.setAttribute("data-theme", stored);
      window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
    }
  }, []);

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="ダークモード切り替え"
      onClick={() => applyTheme(isDark ? "light" : "dark")}
      className={
        isDark
          ? "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-zinc-700 transition-colors"
          : "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-zinc-300 transition-colors"
      }
    >
      <span
        className={
          isDark
            ? "inline-block h-4 w-4 translate-x-6 transform rounded-full bg-white transition-transform"
            : "inline-block h-4 w-4 translate-x-1 transform rounded-full bg-white transition-transform"
        }
      />
    </button>
  );
}
