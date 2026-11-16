export function loginReturn(value: string | string[] | undefined) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/";
  }

  const base = "https://wana.invalid";
  const destination = URL.parse(value, base);
  if (!destination) return "/";
  const { pathname, search, hash } = destination;

  if (
    destination.origin !== base ||
    pathname.startsWith("//") ||
    ["/masuk", "/daftar", "/lupa-password", "/atur-password"].includes(pathname.replace(/\/+$/, ""))
  ) {
    return "/";
  }

  return pathname + search + hash;
}
