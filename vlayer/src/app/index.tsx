import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Analytics } from "@vercel/analytics/react";
import * as Sentry from "@sentry/react";

import Providers from "./providers";
import Router from "./router";
import "./index.css";

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [],
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/*
    <Providers>
      <Router />
    </Providers>
    <Analytics />
    */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        maxWidth: 600,
        margin: "2rem auto",
      }}
    >
      <input
        type="file"
        accept=".eml"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const text = await file.text();
          (
            document.getElementById("file-content") as HTMLTextAreaElement
          ).value = text;
        }}
      />
      <textarea
        id="file-content"
        rows={10}
        style={{ width: "100%" }}
        readOnly
        placeholder="File content will appear here..."
      />
      <button
        onClick={() => {
          const content = (
            document.getElementById("file-content") as HTMLTextAreaElement
          ).value;
          //alert("Processing file content:\n" + content);

          
        }}
      >
        Process File
      </button>
    </div>
  </StrictMode>
);
