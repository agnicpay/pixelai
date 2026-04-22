"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";

export default function SessionAwareHeader() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((d) => setAuthenticated(d.authenticated))
      .catch(() => {});
  }, []);

  return <Header authenticated={authenticated} />;
}
