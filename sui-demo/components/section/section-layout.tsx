import type { PropsWithChildren } from "react";
import { NavLink } from "react-router-dom";

import { PageHeader } from "../page/page-header";

type SectionLayoutProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
  links: Array<{ label: string; to: string }>;
}>;

export function SectionLayout({
  eyebrow,
  title,
  description,
  links,
  children
}: SectionLayoutProps) {
  return (
    <div className="page-stack">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <nav className="subnav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) => (isActive ? "subnav-link active" : "subnav-link")}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      {children}
    </div>
  );
}
