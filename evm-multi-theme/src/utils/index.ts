
//字符串省略号截取
export function formatText(addr: string, s: number = 6, e: number = 4) {
  if (!addr) {
    return "";
  }
  const start = addr.substring(0, s);
  const end = addr.substring(addr.length - e, addr.length);
  addr = `${start}...${end}`;

  return addr;
}