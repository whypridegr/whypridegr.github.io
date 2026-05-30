import type { AnchorHTMLAttributes, ReactNode } from "react";

// Drop-in shim for TanStack Router's <Link to="..."> — plain anchor for Astro routing.
export function Link({
  to,
  children,
  ...rest
}: { to: string; children?: ReactNode } & Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>) {
  return (
    <a href={to} {...rest}>
      {children}
    </a>
  );
}
