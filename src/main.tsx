import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

// Catch unhandled errors and show them visibly instead of a blank screen
window.addEventListener("error", (e) => {
  rootEl.innerHTML = `<div style="font-family:monospace;padding:2rem;color:#f87171;background:#0a0a0a;min-height:100vh">
    <h2 style="color:#fff">App failed to start</h2>
    <pre>${e.message}\n${e.error?.stack ?? ""}</pre>
    <p style="color:#aaa">Check that VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are set in your GitHub repository secrets.</p>
  </div>`;
});

createRoot(rootEl).render(<App />);
