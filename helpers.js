export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
export function round2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}
export function weeklyHours(totalHours, weeks) {
  if (!weeks || weeks <= 0) return 0;
  return Number(totalHours || 0) / Number(weeks);
}
export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
export function timeToMinutes(value) {
  if (!value) return 0;
  const [h, m] = value.split(":").map(Number);
  return (h * 60) + m;
}
