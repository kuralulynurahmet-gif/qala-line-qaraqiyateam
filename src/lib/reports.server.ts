export function assertAdmin(u: string, p: string) {
  if (u !== "admin" || p !== "1234") throw new Error("Логин немесе құпиясөз қате");
}

export function distanceM(a: [number, number], b: [number, number]) {
  const R = 6371000, toR = (x: number) => (x * Math.PI) / 180;
  const dLat = toR(b[0] - a[0]), dLng = toR(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
