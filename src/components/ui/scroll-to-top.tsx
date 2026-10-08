"use client";

import { useEffect } from "react";

// Opens the page at its top, also when a long form redirected here from further down
export function ScrollToTop() {
  useEffect(() => window.scrollTo({ top: 0 }), []);
  return null;
}
