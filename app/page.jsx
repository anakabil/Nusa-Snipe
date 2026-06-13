"use client";

import { useState } from "react";
import { installClientRuntime } from "@/lib/client-runtime";
import NusaSnipe from "@/components/NusaSnipe";

export default function Page() {
  // Install the storage + AI-proxy bridge exactly once, during the first
  // render — i.e. BEFORE the app component renders and BEFORE its data-loading
  // effect runs. (Parent render + useState initializer run before child render
  // and before any effects, so window.storage is guaranteed to exist in time.)
  useState(() => {
    installClientRuntime();
    return null;
  });

  return <NusaSnipe />;
}
