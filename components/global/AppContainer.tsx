import { cn } from "@/lib/utils";
import React from "react";

export default function AppContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("px-8", className)}>{children}</div>;
}
