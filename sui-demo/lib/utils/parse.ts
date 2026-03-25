export function parseLineItems(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function parseCsvLikeLine(line: string) {
  return line
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
