import { safelistedPlayers } from "./overlay";
const ranks = {
  OWNER: "§c[OWNER]",
  ADMIN: "§c[ADMIN]",
  GAME_MASTER: "§2[GM]",
  YOUTUBER: "§c[§fYOUTUBE§c]",
  PIG_PLUS_PLUS_PLUS: "§d[PIG§b+++§d]",
  MVP: "§b[MVP]",
  VIP: "§a[VIP]",
};

const ranksSimple = {
  OWNER: "§c",
  ADMIN: "§c",
  GAME_MASTER: "§2",
  YOUTUBER: "§c",
  PIG_PLUS_PLUS_PLUS: "§d",
  MVP: "§b",
  VIP: "§a",
};

const plusColors = {
  GREEN: "§a",
  AQUA: "§b",
  RED: "§c",
  LIGHT_PURPLE: "§d",
  YELLOW: "§e",
  WHITE: "§f",
  BLACK: "§0",
  DARK_BLUE: "§1",
  DARK_GREEN: "§2",
  DARK_AQUA: "§3",
  DARK_RED: "§4",
  DARK_PURPLE: "§5",
  GOLD: "§6",
  GRAY: "§7",
  DARK_GRAY: "§8",
  BLUE: "§9",
};

export default (rank, plusColor, plusPlusColor) => {
  if (rank === null) {
    return ["§7", "§7"];
  }
  if (rank === "PIG+++"){
    return ["§d", "§d"];
  }
  
  if (rank === "MVP++") {
    return [`${plusColors[plusPlusColor]}[MVP${plusColors[plusColor]}++${plusColors[plusPlusColor]}]`, "§6"];
  }
  if (rank === "MVP+") {
    return [`§b[MVP${plusColors[plusColor]}+§b]`, "§b"];
  }
  if (rank === "VIP+"){
    return [`§a[VIP${plusColors[plusColor]}+§a]`,"§a"]
  }

  if (ranks[rank] !== undefined) {
    return [ranks[rank], ranksSimple[rank]];
  }
  return "";
};
