import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { AppProvider } from "./context/AppContext";
import { router } from "./router";

import "./index.css";
import { registerFocusServiceWorker, setupInstallPromptCapture } from "./lib/pwa";

setupInstallPromptCapture();
void registerFocusServiceWorker();

createRoot(
  document.getElementById("root")!,
).render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </StrictMode>,
);