"use client";
import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const customRedirects = {
  cs: {
    href: "/categories",
    displayName: "Categories",
  },
  ps: {
    displayName: "Products",
    action: "back", // special flag to indicate we should go back
  },
  // add more as needed
};

export function Breadcrumb() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
        <li>
          <Link href="/" className="font-medium">
            <Home size={20} />
          </Link>
        </li>
        {segments.map((segment, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");
          const defaultLabel = segment
            .replace(/-/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          // Check if this segment has a custom redirect configuration
          const redirectConfig = customRedirects[segment] || {};
          const label = redirectConfig.displayName || defaultLabel;
          const isBackAction = redirectConfig.action === "back";
          const customHref = redirectConfig.href;

          return (
            <li key={href} className="flex items-center">
              <span className="mx-2">/</span>
              {idx === segments.length - 1 ? (
                <span>{label}</span>
              ) : (
                <>
                  {isBackAction ? (
                    <button
                      onClick={() => router.back()}
                      className="font-medium hover:text-foreground cursor-pointer"
                    >
                      {label}
                    </button>
                  ) : (
                    <Link
                      href={customHref || href}
                      className="font-medium hover:text-foreground"
                    >
                      {label}
                    </Link>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
