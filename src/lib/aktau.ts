export const AKTAU_CENTER: [number, number] = [43.655, 51.18];

export const CATEGORIES = [
  { id: "pothole", label: "Жол тесігі", icon: "🕳️", group: "road" },
  { id: "manhole", label: "Ашық люк", icon: "⚠️", group: "manhole" },
  { id: "light", label: "Көше жарығы", icon: "💡", group: "light" },
  { id: "bus_stop", label: "Аялдама", icon: "🚏", group: "road" },
  { id: "trash", label: "Қоқыс", icon: "🗑️", group: "trash" },
  { id: "signs", label: "Жол белгісі", icon: "🚸", group: "road" },
  { id: "water", label: "Су / кәріз", icon: "💧", group: "water" },
  { id: "yard", label: "Аула абаттандыру", icon: "🌳", group: "yard" },
  { id: "other", label: "Басқа", icon: "📌", group: "other" },
] as const;
export type CategoryId = (typeof CATEGORIES)[number]["id"];
export const catById = (id: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[8];

export const STATUSES = [
  { id: "new", label: "Жаңа", dot: "bg-status-new", text: "text-status-new", soft: "bg-status-new/15" },
  { id: "in_progress", label: "Жұмыста", dot: "bg-status-progress", text: "text-status-progress", soft: "bg-status-progress/15" },
  { id: "done", label: "Орындалды", dot: "bg-status-done", text: "text-status-done", soft: "bg-status-done/15" },
  { id: "rejected", label: "Қабылданбады", dot: "bg-status-rejected", text: "text-status-rejected", soft: "bg-status-rejected/15" },
] as const;
export type StatusId = (typeof STATUSES)[number]["id"];
export const statusById = (id: string) => STATUSES.find((s) => s.id === id) ?? STATUSES[0];
export const STATUS_HEX: Record<string, string> = {
  new: "#e0a91b",
  in_progress: "#2f6fd6",
  done: "#23a26d",
  rejected: "#d6453b",
};

// Approximate centroids of Aktau microdistricts (coast lies to the west/south-west)
const MK: Record<string, [number, number]> = {
  "1": [43.6605, 51.1435], "2": [43.6645, 51.1495], "3": [43.6583, 51.1532], "4": [43.6555, 51.1575],
  "5": [43.6512, 51.1601], "6": [43.6478, 51.1552], "7": [43.6528, 51.1685], "8": [43.6572, 51.1722],
  "9": [43.6462, 51.1622], "10": [43.6402, 51.1605], "11": [43.6475, 51.1655], "12": [43.645, 51.1728],
  "13": [43.6412, 51.1762], "14": [43.6391, 51.1802], "15": [43.6348, 51.1858], "16": [43.6312, 51.1802],
  "17": [43.6622, 51.1852], "18": [43.6592, 51.1812], "19": [43.6672, 51.1832], "20": [43.6602, 51.1922],
  "21": [43.6562, 51.1882], "22": [43.6552, 51.1952], "23": [43.6502, 51.1982], "24": [43.6642, 51.1972],
  "25": [43.6682, 51.1922], "26": [43.6712, 51.2002], "27": [43.669, 51.2105], "28": [43.6752, 51.1922],
  "29": [43.6788, 51.199], "30": [43.6832, 51.2052], "31": [43.6862, 51.2122], "32": [43.6902, 51.2202],
  "33": [43.6942, 51.2262], "34": [43.6982, 51.2322], "35": [43.7022, 51.2382],
};
export const NEW_DISTRICTS: Record<string, [number, number]> = {
  "Шығыс-1": [43.6712, 51.2352], "Шығыс-2": [43.6772, 51.2452], "Самал": [43.6352, 51.2102],
  "Приморский": [43.6222, 51.2002], "Өндіріс аймағы": [43.6452, 51.2402],
};
export const DISTRICTS: { id: string; label: string; center: [number, number] }[] = [
  ...Object.entries(MK).map(([k, v]) => ({ id: k, label: `${k}-шағынаудан`, center: v })),
  ...Object.entries(NEW_DISTRICTS).map(([k, v]) => ({ id: k, label: k, center: v })),
];
export const districtLabel = (id: string) => (MK[id] ? `${id}-шағынаудан` : id);
export const districtCenter = (id: string): [number, number] =>
  MK[id] ?? NEW_DISTRICTS[id] ?? AKTAU_CENTER;

export const MAIN_STREETS = ["Тәуелсіздік даңғылы", "Н. Назарбаев даңғылы", "Абай даңғылы", "Жағалау жолы", "Ақтау-Жаңаөзен тас жолы"];

export const fmtDate = (s: string) =>
  new Date(s).toLocaleString("kk-KZ", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
