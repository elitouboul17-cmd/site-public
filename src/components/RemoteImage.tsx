"use client";
import { useState } from "react";

/** Image distante (fournie par un flux) : masquée proprement si elle ne se charge pas. */
export function RemoteImage({ src, className = "", alt = "" }: { src: string; className?: string; alt?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" className={className} onError={() => setFailed(true)} />;
}
