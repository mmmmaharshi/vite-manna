import { Surface, Typography } from "@heroui/react";
import type { ReactNode, Ref } from "react";

import { cn } from "../lib/cn";

/** The main landmark id, mirrored by the skip link in index.html. */
export const MAIN_CONTENT_ID = "main-content";

/**
 * Full-screen page frame every tab shares.
 *
 * @returns The page element.
 */
export const Page = ({ children }: { children: ReactNode }) => (
  <main id={MAIN_CONTENT_ID} className="flex h-dvh flex-col">
    {children}
  </main>
);

interface PageHeaderProps {
  title?: string;
  children?: ReactNode;
  className?: string;
  innerClassName?: string;
}

/**
 * Sticky header band. Title pages pass `title`; the reader passes controls.
 *
 * @returns The header element.
 */
export const PageHeader = ({
  title,
  children,
  className,
  innerClassName,
}: PageHeaderProps) => (
  <Surface
    className={cn(
      "bg-surface sticky top-0 z-30 border border-b py-3",
      className
    )}
  >
    <div className={cn("page-shell mx-auto w-full px-2", innerClassName)}>
      {title !== undefined && (
        <Typography.Heading level={1} className="text-xl">
          {title}
        </Typography.Heading>
      )}
      {children}
    </div>
  </Surface>
);

interface PageSectionProps {
  children: ReactNode;
  className?: string;
  /** Announces list updates (search results, highlights) to screen readers. */
  live?: boolean;
  ref?: Ref<HTMLElement>;
}

/**
 * Width-constrained content band inside a page.
 *
 * @returns The section element.
 */
export const PageSection = ({
  children,
  className,
  live,
  ref,
}: PageSectionProps) => (
  <section
    ref={ref}
    className={cn("page-shell mx-auto w-full px-2", className)}
    aria-live={live ? "polite" : undefined}
    aria-atomic={live ? "true" : undefined}
  >
    {children}
  </section>
);

interface PageMessageProps {
  title?: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  tone?: "default" | "danger";
  /** "alert" interrupts (errors); "live" announces (loading skeletons). */
  announce?: "alert" | "live";
  className?: string;
}

/**
 * Centered empty / error / loading state.
 *
 * @returns The message element.
 */
export const PageMessage = ({
  title,
  hint,
  icon,
  children,
  tone = "default",
  announce,
  className,
}: PageMessageProps) => (
  <section
    className={cn(
      "page-shell mx-auto flex w-full flex-col items-center gap-2 px-2 py-24 text-center",
      className
    )}
    role={announce === "alert" ? "alert" : undefined}
    aria-live={announce === "live" ? "polite" : undefined}
    aria-busy={announce === "live" ? "true" : undefined}
  >
    {icon}
    {title !== undefined && (
      <Typography
        className={cn(
          "text-base font-medium",
          tone === "danger" && "text-danger"
        )}
      >
        {title}
      </Typography>
    )}
    {hint !== undefined && (
      <Typography.Paragraph size="sm" color="muted">
        {hint}
      </Typography.Paragraph>
    )}
    {children}
  </section>
);

/**
 * Reserves room for the bottom nav so last rows stay reachable.
 *
 * @returns The spacer element.
 */
export const BottomSpacer = () => (
  <div className="h-[calc(4rem+env(safe-area-inset-bottom))]" />
);
