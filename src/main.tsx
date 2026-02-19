import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

// Catch unhandled errors and show them visibly instead of a blank screen
window.addEventListener("error", (e) => {
  // Ignore ResizeObserver loop errors as they are typically benign but can be noisy
  if (e.message.includes("ResizeObserver loop")) {
    return;
  }

  if (rootEl) {
    rootEl.innerHTML = `<div style="font-family:monospace;padding:2rem;color:#f87171;background:#0a0a0a;min-height:100vh">
      <h2 style="color:#fff">App failed to start</h2>
      <pre style="white-space:pre-wrap;word-break:break-all">${e.message}\n${e.error?.stack ?? ""}</pre>
      <p style="color:#aaa;margin-top:1rem">If you see environment variable missing errors, check that VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in your GitHub repository secrets.</p>
    </div>`;
  }
});

createRoot(rootEl).render(<App />);
