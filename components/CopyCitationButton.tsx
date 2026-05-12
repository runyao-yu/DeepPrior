"use client";

import { useEffect, useState } from "react";

type CopyCitationButtonProps = {
  text: string;
};

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function CopyCitationButton({ text }: CopyCitationButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timer = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      onClick={async () => {
        await copyToClipboard(text);
        setCopied(true);
      }}
      className="rounded-full border border-black/[0.1] bg-white px-3.5 py-2 text-[12px] font-semibold text-black/56 transition hover:border-black/20 hover:text-black"
      aria-label="Copy citation"
    >
      {copied ? "Copied" : "Citation"}
    </button>
  );
}
