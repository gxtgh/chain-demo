import type { PropsWithChildren } from "react";

type OverviewCardProps = PropsWithChildren<{
  title: string;
  description: string;
}>;

export function OverviewCard({ title, description, children }: OverviewCardProps) {
  return (
    <article className="overview-card">
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </article>
  );
}
