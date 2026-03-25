type CodeBlockProps = {
  value: string;
};

export function CodeBlock({ value }: CodeBlockProps) {
  return <pre className="code-block">{value}</pre>;
}
