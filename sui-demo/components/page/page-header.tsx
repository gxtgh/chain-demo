type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}
