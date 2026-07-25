"use client";

import dynamic from "next/dynamic";

const Need = dynamic(() => import("./Need"), { ssr: false });

export default function NeedWrapper() {
  return <Need />;
}
