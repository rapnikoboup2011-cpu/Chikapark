"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const router = useRouter();
  const target = new Date(expiresAt).getTime();
  const [remaining, setRemaining] = useState(() => target - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const next = target - Date.now();
      setRemaining(next);
      if (next <= 0) {
        clearInterval(interval);
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [target, router]);

  if (remaining <= 0) {
    return <span>время истекло</span>;
  }

  return <span>{formatRemaining(remaining)}</span>;
}
