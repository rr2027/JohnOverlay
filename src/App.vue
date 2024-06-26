<template>
  <v-app>
    <v-toolbar density="compact"
      style="-webkit-app-region: drag; background-color: rgba(var(--v-theme-background), var(--opacity)) !important">
      <v-app-bar-nav-icon variant="text" @click.stop="sidebar = !sidebar"
        style="-webkit-app-region: no-drag"></v-app-bar-nav-icon>

      <v-toolbar-title v-if="!sidebar" class="grow" style="color: #C62828;">Johnify</v-toolbar-title>
      <v-toolbar-title v-if="sidebar" class="grow" style="-webkit-app-region: no-drag"> Johnify </v-toolbar-title>

      <v-btn v-if="table" icon @click="refreshPlayers" style="-webkit-app-region: no-drag">
        <v-icon color="error">mdi-refresh</v-icon>
      </v-btn>

      <v-btn v-if="table" icon @click="clear" style="-webkit-app-region: no-drag">
        <v-icon color="error">mdi-account-multiple-minus</v-icon>
      </v-btn>

      <v-text-field v-if="table || route.path === '/statistics'" class="ml-2" variant="outlined" density="compact"
        single-line hide-details prepend-inner-icon="mdi-account-search" persistent-placeholder
        placeholder="Search player(s)" v-model="searchQuery" @keydown.enter.prevent:modelValue="forceAddPlayer"
        :error-messages="searchErrors" style="-webkit-app-region: no-drag; max-width: 25%"></v-text-field>

      <v-btn icon @click="minimizeWindow" style="-webkit-app-region: no-drag">
        <v-icon>mdi-minus</v-icon>
      </v-btn>

      <v-btn icon @click="closeWindow" style="-webkit-app-region: no-drag">
        <v-icon>mdi-window-close</v-icon>
      </v-btn>
    </v-toolbar>
    <v-navigation-drawer temporary v-model="sidebar">
      <v-list nav>
        <v-list-item prepend-icon="mdi-table" title="Overlay" value="overlay" router-link to="/"
          @click="turnOnTable"></v-list-item>
        <!-- <v-list-item prepend-icon="mdi-chart-line" title="Statistics" value="statistics" router-link to="/statistics"
          @click="turnOffTable"></v-list-item> -->
        <v-divider :thickness="8" class="border-opacity-0"></v-divider>
        <v-divider></v-divider>
        <v-divider :thickness="8" class="border-opacity-0"></v-divider>
        <v-list-item prepend-icon="mdi-application-outline" title="Basic Settings" value="basic-settings" router-link
          to="/basic-settings" @click="turnOffTable"></v-list-item>
        <!-- <v-list-item prepend-icon="mdi-format-list-bulleted" title="Blacklist Settings" value="blacklist-settings"
          router-link to="/blacklist-settings" @click="turnOffTable"></v-list-item> -->
        <v-list-item prepend-icon="mdi-palette-outline" title="Appearance Settings" value="appearance-settings"
          router-link to="/appearance-settings" @click="turnOffTable"></v-list-item>
        <v-list-item prepend-icon="mdi-view-column-outline" title="Column Settings" value="column-settings" router-link
          to="/column-settings" @click="turnOffTable"></v-list-item>
        <v-list-item prepend-icon="mdi-bell-outline" title="Notification Settings" value="notification-settings"
          router-link to="/notification-settings" @click="turnOffTable"></v-list-item>
        <v-divider :thickness="8" class="border-opacity-0"></v-divider>
        <v-divider></v-divider>
        <v-divider :thickness="8" class="border-opacity-0"></v-divider>
        <!-- <v-list-item> v{{ PackageJSON.version }}</v-list-item> -->
        <v-list-item style="position: fixed !important; bottom: 0 !important">
          <!-- <v-btn color="#5865F2" variant="tonal" class="ml-1 mr-2"
            @click="ipcRenderer.send('openURL', 'https://discord.com/invite/2vAuyVvdwj')">Discord</v-btn>
          <v-btn color="#6e5494" variant="tonal" class="ml-2 mr-1"
            @click="ipcRenderer.send('openURL', 'https://github.com/pixelicc/pixelic-overlay')">GitHub</v-btn> -->
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <router-view></router-view>
    <v-data-table v-if="table" :headers="headers" :items="players" :items-per-page="-1" class="datatable elevation-0"
      density="compact" no-data-text="" sort-asc-icon="mdi-chevron-up" sort-desc-icon="mdi-chevron-down">
      <template v-slot:item="{ item }">
        <tr>
          <td>
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <span v-bind="props" v-html="item.columns.encounters"></span>
              </template>
              <span v-html="item.columns.fullLevel"></span> <!-- Updated Tooltip -->
            </v-tooltip>
          </td>
          <td>
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <span v-bind="props" v-if="item.columns.fullLevel"
                  v-html="item.columns.fullLevel + item.columns.formattedUsername"></span>
                <span v-bind="props" v-else v-html="item.columns.formattedUsername"></span>
              </template>
              <span v-html="item.columns.fullUsername"></span>
            </v-tooltip>

          </td>
          <td class="align-center justify-center">
            <v-tooltip v-for="(tag, index) in item.columns.tags" :key="index" bottom>
              <template v-slot:activator="{ props }">
                <!-- Use span with v-html for displaying the tag content as in the first part -->
                <span v-bind="props" v-html="tag.content"></span>
              </template>
              <!-- Use the tooltip structure from the second part -->
              <span style="color: rgba(var(--v-theme-primary))">{{ tag.tooltip }}</span>
            </v-tooltip>



            <!-- <v-tooltip v-for="tag in item.columns.tags" location="bottom">
              <template v-slot:activator="{ props }">
                <v-chip v-bind="props" class="ma-1" size="x-small" :color="tag.color" :prepend-icon="tag.prependIcon"
                  :append-icon="tag.appendIcon">{{ "" }}</v-chip>
              </template>
              <span style="color: rgba(var(--v-theme-primary))">{{ tag.tooltip }}</span>
            </v-tooltip> -->
            <!-- <v-tooltip v-for="icon in item.columns.icons" location="bottom">
              <template v-slot:activator="{ props }">
                <v-icon v-bind="props" class="ma-1" size="x-small" :color="icon.color">{{ icon.name }}</v-icon>
              </template>
              <span style="color: rgba(var(--v-theme-primary))">{{ icon.tooltip }}</span>
            </v-tooltip> -->
          </td>


          <td v-if="headers.some((h) => h.title === 'FKDR')"><span v-html="item.columns.FKDRFormatted"></span></td>
          <td v-if="headers.some((h) => h.title === 'WS')"><span v-html="item.columns.WSFormatted"></span></td>
          <td>
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <span v-bind="props" v-html="item.columns.gaps"></span>
              </template>
              <span v-html="item.columns.playerGaptooltips"></span> <!-- Updated Tooltip -->
            </v-tooltip>
          </td>
          <td v-if="headers.some((h) => h.title === 'Ping')"><span v-html="item.columns.Ping"></span></td>
          <td v-if="headers.some((h) => h.title === 'Finals')"><span v-html="item.columns.finalKillsFormatted"></span>
          </td>
          <td>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn size="small" variant="text" icon="mdi-dots-horizontal" v-bind="props"
                  style="height: calc(var(--v-btn-height)) !important"> </v-btn>
              </template>
              <v-list>
                <v-list-item>
                  <v-btn variant="flat" prepend-icon="mdi-chart-timeline-variant-shimmer"
                    @click="viewStatistics(item.columns.username)">
                    <v-list-item-title>Hide</v-list-item-title>
                  </v-btn>
                </v-list-item>
              </v-list>
            </v-menu>
          </td>
        </tr>
      </template>
      <template #bottom></template>
    </v-data-table>
    <v-snackbar :timeout="snackbarTimeout" :color="snackbarColor" :variant="snackbarVariant" v-model="snackbarShown">
      <v-icon v-if="snackbarIcon !== null">{{ snackbarIcon }}</v-icon>
      {{ snackbarText }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { useIpcRenderer } from "@vueuse/electron";
import { defineComponent } from 'vue';

import { playerNCDictionary,playerFriendsDictionaries, queueDictionaries, legacyQueuesDictionaries, playerProfileDictionaries, playerRecentgamesDictionaries, questCompletionTimes, playerChecksDictionary, playerChannel, playerSlumberTickets, playerBridgingTimes, playerActiveChallenges, ipDictionary, safelistedDict } from "./misc/overlay";
import { persistentPlayerEncounters } from "./misc/overlay"; // Import the whole object
import { pingAvgTotal } from "./misc/overlay"; // Import the whole objectim
import { playerGuildDictionary } from "./misc/overlay";
import { playerDataDictionary } from "./misc/overlay";
import { who } from "./misc/overlay"; // Import the whole object
import { pingDays } from "./misc/overlay"; // Import the whole object
import { excludedPlayers } from "./misc/overlay"; // Import the whole object
import { playerLanguages } from "./misc/overlay"; // Import the whole object
import { safelistJson } from "./misc/overlay";
import { excludedPlayersString } from "./misc/overlay"; // Import the whole object
import { safelistedPlayers } from "./misc/overlay"

import dataStore from "./data/dataStore";
import { parseMessage, getPlayers, addPlayer, refreshPlayers, clear } from "./misc/overlay";
import { ref } from "vue";
import mcColorParser from "./misc/mcColorParser";
import rankParser from "./misc/rankParser";
import starParser from "./misc/starParser";

//import blacklistParser from "./misc/blacklistParser";
import statColorParser from "./misc/statColorParser";
import { snackbarTimeout, snackbarColor, snackbarVariant, snackbarText, snackbarIcon, snackbarShown, sendNotification } from "./misc/snackbarNotification";
import router from "./router";
import axios from "axios";
import PackageJSON from "../package.json";
import { useRoute } from "vue-router";
import { toHandlers } from "vue";



function pingColorParser(ping) {
  if (ping < 100) return "§a" + ping + "ms";
  if (ping < 160) return "§2" + ping + "ms";
  if (ping < 200) return "§e" + ping + "ms"
  if (ping == "ND") return "§c" + ping;
  return "§c" + ping + "ms";
}
function checkPartyTime(partyTime) {
  // Regular expression to match a number followed by 'd'
  const matchDays = partyTime.match(/(\d+)d/);
  if (matchDays) {
    const numberDays = parseInt(matchDays[1], 10);
    if (numberDays >= 7 && numberDays <= 31) {
      return "§e" + partyTime;
    }
  }

  // Regular expression to match a number followed by 'm'
  const matchMinutes = partyTime.match(/(\d+)m/);
  if (matchMinutes) {
    const numberMinutes = parseInt(matchMinutes[1], 10);
    if (numberMinutes >= 1 && numberMinutes <= 59) {
      return "§4" + partyTime;
    }
  }

  return partyTime;
}
/**
 * parses party tags into colors
 * 
 * @param partyTime a string of party tags
 * @returns string with a mc color code in front
 */
function partyParser(partyTime) {
  checkPartyTime(partyTime)

  if (partyTime.includes("1y")) return "§d" + partyTime
  if (partyTime.includes("2y")) return "§d" + partyTime
  if (partyTime.includes("3y")) return "§5" + partyTime
  if (partyTime.includes("4y")) return "§5" + partyTime
  if (partyTime.includes("5y")) return "§9" + partyTime
  if (partyTime.includes("6y")) return "§9" + partyTime
  if (partyTime.includes("7y")) return "§9" + partyTime
  if (partyTime.includes("8y")) return "§9" + partyTime
  if (partyTime.includes("9y")) return "§9" + partyTime
  if (partyTime.includes("10y")) return "§9" + partyTime
  if (partyTime.includes("11y")) return "§9" + partyTime
  if (partyTime.includes("1mo")) return "§a" + partyTime
  if (partyTime.includes("2mo")) return "§a" + partyTime
  if (partyTime.includes("3mo")) return "§a" + partyTime
  if (partyTime.includes("4mo")) return "§a" + partyTime
  if (partyTime.includes("5mo")) return "§a" + partyTime
  if (partyTime.includes("5mo")) return "§a" + partyTime
  if (partyTime.includes("6mo")) return "§2" + partyTime
  if (partyTime.includes("7mo")) return "§2" + partyTime
  if (partyTime.includes("8mo")) return "§2" + partyTime
  if (partyTime.includes("9mo")) return "§2" + partyTime
  if (partyTime.includes("10mo")) return "§2" + partyTime
  if (partyTime.includes("11mo")) return "§2" + partyTime
  if (partyTime.includes("1d")) return "§6" + partyTime
  if (partyTime.includes("2d")) return "§6" + partyTime
  if (partyTime.includes("3d")) return "§6" + partyTime
  if (partyTime.includes("4d")) return "§6" + partyTime
  if (partyTime.includes("5d")) return "§6" + partyTime
  if (partyTime.includes("6d")) return "§6" + partyTime
  if (partyTime.includes("6d")) return "§6" + partyTime
  if (partyTime.includes("7d")) return "§e" + partyTime
  if (partyTime.includes("8d")) return "§e" + partyTime
  if (partyTime.includes("9d")) return "§e" + partyTime
  if (partyTime.includes("10d")) return "§e" + partyTime
  if (partyTime.includes("11d")) return "§e" + partyTime
  if (partyTime.includes("12d")) return "§e" + partyTime
  if (partyTime.includes("13d")) return "§e" + partyTime
  if (partyTime.includes("14d")) return "§e" + partyTime
  if (partyTime.includes("15d")) return "§e" + partyTime
  if (partyTime.includes("16d")) return "§e" + partyTime
  if (partyTime.includes("17d")) return "§e" + partyTime
  if (partyTime.includes("18d")) return "§e" + partyTime
  if (partyTime.includes("19d")) return "§e" + partyTime
  if (partyTime.includes("20d")) return "§e" + partyTime
  if (partyTime.includes("21d")) return "§e" + partyTime
  if (partyTime.includes("22d")) return "§e" + partyTime
  if (partyTime.includes("23d")) return "§e" + partyTime
  if (partyTime.includes("24d")) return "§e" + partyTime
  if (partyTime.includes("25d")) return "§e" + partyTime
  if (partyTime.includes("26d")) return "§e" + partyTime
  if (partyTime.includes("27d")) return "§e" + partyTime
  if (partyTime.includes("28d")) return "§e" + partyTime
  if (partyTime.includes("29d")) return "§e" + partyTime
  if (partyTime.includes("30d")) return "§e" + partyTime
  if (partyTime.includes("31d")) return "§e" + partyTime
  if (partyTime.includes("1h")) return "§c" + partyTime
  if (partyTime.includes("2h")) return "§c" + partyTime
  if (partyTime.includes("3h")) return "§c" + partyTime
  if (partyTime.includes("4h")) return "§c" + partyTime
  if (partyTime.includes("5h")) return "§c" + partyTime
  if (partyTime.includes("6h")) return "§c" + partyTime
  if (partyTime.includes("7h")) return "§c" + partyTime
  if (partyTime.includes("8h")) return "§c" + partyTime
  if (partyTime.includes("9h")) return "§c" + partyTime
  if (partyTime.includes("10h")) return "§c" + partyTime
  if (partyTime.includes("11h")) return "§c" + partyTime
  if (partyTime.includes("12h")) return "§c" + partyTime
  if (partyTime.includes("13h")) return "§c" + partyTime
  if (partyTime.includes("14h")) return "§c" + partyTime
  if (partyTime.includes("15h")) return "§c" + partyTime
  if (partyTime.includes("16h")) return "§c" + partyTime
  if (partyTime.includes("17h")) return "§c" + partyTime
  if (partyTime.includes("18h")) return "§c" + partyTime
  if (partyTime.includes("19h")) return "§c" + partyTime
  if (partyTime.includes("20h")) return "§c" + partyTime
  if (partyTime.includes("21h")) return "§c" + partyTime
  if (partyTime.includes("22h")) return "§c" + partyTime
  if (partyTime.includes("23h")) return "§c" + partyTime

  return "§4" + partyTime

}

/**
 * parses gap tags into colors
 * 
 * @param gaps a string representing gaps in human time
 * @returns gaps with mc color coding   
 */
function gapColorParser(gaps) {
  if (gaps.includes("y")) return "§4" + gaps
  if (gaps.includes("mo")) return "§4" + gaps
  if (gaps.includes("15d")) return "§e" + gaps
  if (gaps.includes("16d")) return "§e" + gaps
  if (gaps.includes("17d")) return "§e" + gaps
  if (gaps.includes("18d")) return "§e" + gaps
  if (gaps.includes("19d")) return "§e" + gaps
  if (gaps.includes("20d")) return "§e" + gaps
  if (gaps.includes("21d")) return "§e" + gaps
  if (gaps.includes("22d")) return "§e" + gaps
  if (gaps.includes("23d")) return "§e" + gaps
  if (gaps.includes("24d")) return "§e" + gaps
  if (gaps.includes("25d")) return "§e" + gaps
  if (gaps.includes("26d")) return "§e" + gaps
  if (gaps.includes("27d")) return "§e" + gaps
  if (gaps.includes("28d")) return "§e" + gaps
  if (gaps.includes("29d")) return "§e" + gaps
  if (gaps.includes("30d")) return "§e" + gaps
  if (gaps.includes("31d")) return "§e" + gaps
  if (gaps.includes("ND")) return "§c" + gaps


  return "§a" + gaps;
}
function encounterColorParser(encounters) {
  if (encounters < 2) return "§f" + encounters;
  if (encounters < 3) return "§e" + encounters;
  if (encounters < 5) return "§c" + encounters;
  return "§4" + encounters;

}


/**
 * Formats epoch milliseconds into human readable time ago
 * eg.. 6y3mo
 * @param epochTimestamp epoch in milliseconds
 * 
 * @returns string of time ago
 */
function formatTimeAgo(epochTimestamp) {
  const now = Date.now(); 
  let diff = now - epochTimestamp; 

  const msInSecond = 1000;
  const msInMinute = msInSecond * 60;
  const msInHour = msInMinute * 60;
  const msInDay = msInHour * 24;
  const msInMonth = msInDay * 30; 
  const msInYear = msInDay * 365; 

  let formatted = "";
  let unitsAdded = 0; 

  if (diff >= msInYear && unitsAdded < 2) {
    const years = Math.floor(diff / msInYear);
    diff -= years * msInYear;
    formatted += `${years}y`;
    unitsAdded++;
  }

  if (diff >= msInMonth && unitsAdded < 2) {
    const months = Math.floor(diff / msInMonth);
    diff -= months * msInMonth;
    if (formatted) formatted += ""; 
    formatted += `${months}mo`;
    unitsAdded++;
  }

  if (diff >= msInDay && unitsAdded < 2) {
    const days = Math.floor(diff / msInDay);
    diff -= days * msInDay;
    if (formatted) formatted += ""; 
    formatted += `${days}d`;
    unitsAdded++;
  }

  if (diff >= msInHour && unitsAdded < 2) {
    const hours = Math.floor(diff / msInHour);
    diff -= hours * msInHour;
    if (formatted) formatted += ""; 
    formatted += `${hours}h`;
    unitsAdded++;
  }


  if (diff >= msInMinute && unitsAdded < 2) {
    const minutes = Math.floor(diff / msInMinute);
    diff -= minutes * msInMinute;
    if (formatted) formatted += ""; 
    formatted += `${minutes}m`;
    unitsAdded++;
  }

  if (formatted === "" && diff >= msInSecond && unitsAdded < 2) {
    const seconds = Math.floor(diff / msInSecond);
    if (formatted) formatted += ""; 
    formatted += `${seconds}s`;
    unitsAdded++;
  }

  return formatted.trim();
}

const route = useRoute();

const ipcRenderer = useIpcRenderer();

var table = ref(0);
table.value = true;

const turnOnTable = () => {
  table.value = true;
  if (dataStore.get("player") !== "" && dataStore.get("pixelicKey") !== "") {
    addPlayer(dataStore.get("player"), { forced: true });
  }
};

const turnOffTable = () => {
  table.value = false;
};

// if (dataStore.get("pixelicKey") === "") {
//   router.push("/basic-settings");
//   turnOffTable();
//   ipcRenderer.send("discordAuth");
//   ipcRenderer.on("pixelicKey", (event, msg) => {
//     dataStore.set("pixelicKey", msg);
//   });
// }

ipcRenderer.send("windowEvent", dataStore.get("windowLocation"));

ipcRenderer.send("logPath", [dataStore.get("client"), dataStore.get("customLogFilePath")]);
if (dataStore.get("developerMode") === true) ipcRenderer.send("devTools", true);
//ipcRenderer.send("discordRPC-set", dataStore.get("discordRPC"));
//if (dataStore.get("player") !== "" && dataStore.get("pixelicKey") !== "" && dataStore.get("discordRPC") === true) ipcRenderer.send("discordRPC-init", [dataStore.get("player"), dataStore.get("pixelicKey")]);

var sidebar = ref(0);
sidebar.value = false;

var players = ref(0);
players.value = [];


ipcRenderer.on("mcLog", (event, msg) => {
  parseMessage(msg);
});

ipcRenderer.on("windowLocation", (event, msg) => {
  dataStore.set("windowLocation", msg);
});

const minimizeWindow = () => {
  ipcRenderer.send("windowEvent", "minimizeWindow");
};
const closeWindow = () => {
  ipcRenderer.send("windowEvent", "closeWindow");
};

const searchQuery = ref(0);
searchQuery.value = "";

const searchErrors = ref(0);
searchErrors.value = [];

const forceAddPlayer = (player) => {
  searchQuery.value = "";

  if (/^[a-zA-Z0-9_]{2,16}$/gm.test(player.target["_value"])) {
    if (!table.value) {
      ipcRenderer.send("viewStatistics", player.target["_value"]);
      return;
    } else {
      addPlayer(player.target["_value"], { forced: true });

      return;
    }
  } else if (player.target["_value"] === "") {
    if (!table.value) {
      ipcRenderer.send("viewStatistics", dataStore.get("player"));
      return;
    }
  } else {
    searchErrors.value = ["Invalid Username!"];
    setTimeout(() => {
      searchErrors.value = [];
    }, 500);
    return;
  }
};



const viewStatistics = (player) => {
  excludedPlayers.push(player); // Add the 'player' parameter to the 'excludedPlayers' array
};


setInterval(() => {
  const Players = [];
  for (var Player of getPlayers(who)) {
    if (excludedPlayers.includes(Player.username)) {
      continue;
    }
    if (Player?.cause) {
      if (Player.cause.toLowerCase() === "invalid uuid or username") {
        Players.push({
          formattedUsername: mcColorParser(`§c${Player.username}`),
          tags: [{ text: "NICKED", tooltip: "This player is hiding their name!", color: "red-lighten-1" }],
        });
      } else if (Player.cause.toLowerCase() === "this player never played hypixel") {
        Players.push({
          formattedUsername: mcColorParser(`§c${Player.username}`),
          tags: [{ text: "NO-DATA", tooltip: "This player never played on Hypixel!", color: "red-lighten-1" }],
        });
      } else if (Player.cause.toLowerCase() === "invalid api-key") {
        Players.push({
          formattedUsername: mcColorParser(`§c${Player.username}`),
          tags: [{ text: "INVALID API-KEY", tooltip: "You are using an invalid API-Key!", color: "red-lighten-1" }],
        });
      }
      else {
        Player.exists === false
        Players.push({
          formattedUsername: Player.username,
          username: Player.username,
          encounters: `${mcColorParser('§cNicked')}`
        });
      }
    } else {
      var tags = [];
      const johns = [];

      let isSafelisted = false
      let isFriend = false;
      let friendTagName = ''

      

      for (const [friendName, friendData] of Object.entries(playerNCDictionary)) {
        if (friendData.friends.includes(Player.username)) {
          isFriend = true;
          friendTagName = friendName;

          if (!playerNCDictionary[Player.username]) {
            playerNCDictionary[Player.username] = {
              ign: Player.username,
              friends: [friendName] 
            };
          } else {
            if (!playerNCDictionary[Player.username].friends.includes(friendName)) {
              playerNCDictionary[Player.username].friends.push(friendName);
            }
          }

          break; 
        }
      }
      let isMatchingServer = false;
      let matchingServerDetails = {};

      let isMatchingServerMember = ""
      let isMatchingServerIP = ""

      let isMatchingServerTime = 0

      for (const [playerName, playerData] of Object.entries(ipDictionary)) {
        if (!Array.isArray(playerData) || playerData.length === 0 || playerName != Player.username) {
          continue;  // Skip if playerData is not an array or is empty
        }

        for (const { server, last_seen } of playerData) {
          const [serverIp] = server.split(':');

          for (const [otherPlayerName, otherPlayerData] of Object.entries(ipDictionary)) {
            if (playerName === otherPlayerName) continue;

            if (!Array.isArray(otherPlayerData) || otherPlayerData.length === 0) {
              continue;  // Skip if otherPlayerData is not an array or is empty
            }

            for (const { server: otherServer, last_seen: other_last_seen } of otherPlayerData) {
              const [otherServerIp] = otherServer.split(':');
              if (serverIp === otherServerIp) {
                isMatchingServer = true;
                isMatchingServerMember = otherPlayerName 
                isMatchingServerIP = serverIp
                isMatchingServerTime = last_seen
                matchingServerDetails = {
                  player1: playerName,
                  player2: otherPlayerName,
                  server: serverIp
                };
                break;
              }
            }
            if (isMatchingServer) break;
          }
          if (isMatchingServer) break;
        }
        if (isMatchingServer) break;
      }

      if (!isMatchingServer) {
      }

      let nondasheduuid = Player.UUID.replace(/-/g, "")
      let isFriended = false;
      let friendedTagName = ''; // Initialize the variable
      let friendedTime = 0;

      for (const [friendName, friendData] of Object.entries(playerFriendsDictionaries)) {
        if (friendData.friends && Object.keys(friendData.friends).length > 0) {
          const friendUUID = Object.keys(friendData.friends).find(uuid => uuid === nondasheduuid);

          if (friendUUID) {
            const friend = friendData.friends[friendUUID];
            isFriended = true;
            friendedTagName = friendName; // The friend's name associated with the UUID
            friendedTime = friend.time;

            // Check if the player's friends list exists
            if (!playerFriendsDictionaries[Player.username]) {
              playerFriendsDictionaries[Player.username] = {
                ign: Player.username,
                friends: { [friendUUID]: { name: friendedTagName, time: friendedTime } }
              };
            } else {
              // Check if the friend (by UUID) already exists in the player's friends list
              if (!playerFriendsDictionaries[Player.username].friends[friendUUID]) {
                playerFriendsDictionaries[Player.username].friends[friendUUID] = { name: friendedTagName, time: friendedTime };
              }
            }
            break;
          }
        }
      }




      
      
      let sharedQuestTimesCount = 0;
      let hasSharedQuestTime = false;
      let firstSharedQuestTime = null; 
      let sharedQuestTimePlayerName = ''
      const currentPlayerTimes = questCompletionTimes[Player.username.toLowerCase()]?.times || [];
      for (const [playerName, playerData] of Object.entries(questCompletionTimes)) {
        if (playerName.toLowerCase() === Player.username.toLowerCase()) {
          continue;
        }
        const sharedTimes = playerData.times.filter(time =>
          currentPlayerTimes.includes(time));

        if (sharedTimes.length > 0) {
          hasSharedQuestTime = true;
          sharedQuestTimesCount += sharedTimes.length;
          sharedQuestTimePlayerName = playerName; 

          if (firstSharedQuestTime === null || sharedTimes[0] < firstSharedQuestTime) {
            firstSharedQuestTime = sharedTimes[0]; 
          }
        }
      }
      let maxCloseTimestampsCount = 0;
      let maxCloseTimestampPlayerName = "";
      let hasCloseTimestamp = false;
      let firstCloseTimestamp = null; 

      const currentPlayerTimestamps = playerChecksDictionary[Player.username]?.timestamps || [];

      for (const [playerName, playerData] of Object.entries(playerChecksDictionary)) {
        if (playerName.toLowerCase() === Player.username.toLowerCase()) {
          continue;
        }

        let currentCloseTimestampsCount = 0;

        for (const currentTimestamp of currentPlayerTimestamps) {
          const closeTimes = playerData.timestamps.filter(otherTimestamp =>
            Math.abs(otherTimestamp - currentTimestamp) <= 0);
          if (closeTimes.length > 0) {
            hasCloseTimestamp = true;
            currentCloseTimestampsCount += closeTimes.length;
            maxCloseTimestampPlayerName = playerName
            const earliestCloseTime = Math.min(...closeTimes.map(time => time * 1000)); // Convert to milliseconds
            if (firstCloseTimestamp === null || earliestCloseTime < firstCloseTimestamp) {
              firstCloseTimestamp = earliestCloseTime;
            }
          }
        }
        if (currentCloseTimestampsCount > maxCloseTimestampsCount) {
          maxCloseTimestampsCount = currentCloseTimestampsCount;
          maxCloseTimestampPlayerName = playerName;
        }
      }

      // let safelistTime = 0
      // for (const [username] of Object.entries(safelistJson)) {
      //   if (username.toLowerCase() == Player.username.toLowerCase()) {

      //     safelistTime = ((safelistJson[username]))
      //     isSafelisted = true
      //     continue
      //   }


      // }

      let safe = false;
      let safeTime = 0;

      for (const username of Object.keys(safelistedDict)) {
        if(username.toLowerCase() == Player.username.toLowerCase()) {
          safe = true
          safeTime = safelistedDict[username]
        }
      }
      let sharedGameDatesCount = 0;
      let hasSharedGameDate = false
      let firstSharedGameDate = null; // Initialize as null to indicate no date found yet


      // Get the current player's recent game dates from the dictionary
      const currentPlayerDates = playerRecentgamesDictionaries[Player.username]?.recentGamesDates || [];

      for (const [playerName, playerData] of Object.entries(playerRecentgamesDictionaries)) {
        // Skip the iteration if the playerName is the same as the current player's username
        if (playerName.toLowerCase() === Player.username.toLowerCase()) {
          continue;
        }


        // Accumulate all dates in playerData.recentGamesDates that are also in currentPlayerDates
        const sharedDates = playerData.recentGamesDates.filter(date =>
          currentPlayerDates.includes(date));

        // If there are shared dates, update the count and note the player name
        if (sharedDates.length > 0) {
          hasSharedGameDate = true
          sharedGameDatesCount += sharedDates.length;
          sharedGameDatePlayerName = playerName; // Note: This will only store the last player with shared dates

          if (firstSharedGameDate === null || sharedDates[0] < firstSharedGameDate) {
            firstSharedGameDate = sharedDates[0]; // Update to the earliest shared game date found

          }
        }
      }

      let isGuilded = false;
      let guildedMemberName = "";

      for (const [guildedPlayerName, guildedPlayerData] of Object.entries(playerGuildDictionary)) {
        if (guildedPlayerName.toLowerCase() === Player.username.toLowerCase()) {
          continue;
        }

        if (guildedPlayerData.length > 0) {
          const playerInGuild = guildedPlayerData.find(member => member.name.toLowerCase() === Player.username.toLowerCase());
          const currentTime = new Date().getTime();

          if (playerInGuild) {
            const joinedEpochTime = playerInGuild.joined;
            const joinDate = new Date(joinedEpochTime).getTime();
            const timeDifference = currentTime - joinDate;

            if (timeDifference > 90 * 24 * 60 * 60 * 1000) {
              const otherPlayerInGuild = guildedPlayerData.find(member => member.name.toLowerCase() === guildedPlayerName.toLowerCase());

              if (otherPlayerInGuild) {
                const otherPlayerJoinedEpochTime = otherPlayerInGuild.joined;
                const otherPlayerJoinDate = new Date(otherPlayerJoinedEpochTime).getTime();
                const otherPlayerTimeDifference = currentTime - otherPlayerJoinDate;

                if (otherPlayerTimeDifference > 90 * 24 * 60 * 60 * 1000) {
                  isGuilded = true;
                  guildedMemberName = guildedPlayerName;
                  break;
                }
              }
            }
          }
        }
      }
      function findEntriesWithIcon(dictionary, searchText) {
        let results = {};

        for (const playerName in dictionary) {
          if (dictionary.hasOwnProperty(playerName)) {
            const tags = dictionary[playerName];
            for (const index in tags) {
              if (tags.hasOwnProperty(index)) {
                const tag = tags[index];
                if (tag.icon && tag.icon.includes(searchText)) { // Check the tooltip field
                  if (!results[playerName]) {
                    results[playerName] = [];
                  }
                  results[playerName].push({
                    index: index,
                    text: tag.text || '', // Handle missing text field
                    textColor: tag.textColor || 0,
                    tooltip: tag.tooltip,
                    icon: tag.icon || '',
                    color: tag.color || 0
                  });
                }
              }
            }
          }
        }

        return results;
      }

      let changedName = false
      let nameVal = ''
      let nameEntries = findEntriesWithIcon(playerDataDictionary, 'mdi-tag') || []
      if (nameEntries != {} && nameVal != "ND") {
        changedName = true
        nameVal = nameEntries[Player.username] ? nameEntries[Player.username][0]['tooltip'] || 'ND' : 'ND'
      }

      let isPartied = false
      let partyval = ''
      let partyEntries = findEntriesWithIcon(playerDataDictionary, 'mdi-account-group') || []
      if (nameEntries != {}) {
        isPartied = true
        partyval = partyEntries[Player.username] ? partyEntries[Player.username][0]['tooltip'] || 'ND' : 'ND'
      }

      let isLunar = false
      let cosmeticsnumber = ""

      let lunarEntries = findEntriesWithIcon(playerDataDictionary, "mdi-weather-night") || []
      if (lunarEntries[Player.username] != {}) {
        isLunar = true
        cosmeticsnumber = lunarEntries[Player.username] ? lunarEntries[Player.username][0]['tooltip'] || 'ND' : 'ND'
      }

      function findEntriesWithTooltip(dictionary, searchText) {
        let results = {};

        for (const playerName in dictionary) {
          if (dictionary.hasOwnProperty(playerName)) {
            const tags = dictionary[playerName];
            for (const index in tags) {
              if (tags.hasOwnProperty(index)) {
                const tag = tags[index];
                if (tag.tooltip && tag.tooltip.includes(searchText)) { // Check the tooltip field
                  if (!results[playerName]) {
                    results[playerName] = [];
                  }
                  results[playerName].push({
                    index: index,
                    text: tag.text || '', // Handle missing text field
                    textColor: tag.textColor || 0,
                    tooltip: tag.tooltip,
                    icon: tag.icon || '',
                    color: tag.color || 0
                  });
                }
              }
            }
          }
        }

        return results;
      }
      let highFkdr = false
      let fkdrVal = ''
      let fkdrEntries = findEntriesWithTooltip(playerDataDictionary, 'FKDR') || []

      if (fkdrEntries != {}) {
        fkdrVal = fkdrEntries[Player.username] ? fkdrEntries[Player.username][0]['tooltip'] || 'ND' : 'ND'
        highFkdr = true



      }

      function findEntriesWithText(dictionary, searchText) {
        let results = {};

        for (const playerName in dictionary) {
          if (dictionary.hasOwnProperty(playerName)) {
            const tags = dictionary[playerName];
            for (const index in tags) {
              if (tags.hasOwnProperty(index)) {
                const tag = tags[index];
                if (tag.text.includes(searchText)) {
                  if (!results[playerName]) {
                    results[playerName] = [];
                  }
                  results[playerName].push({
                    index: index,
                    text: tag.text,
                    textColor: tag.textColor,
                    tooltip: tag.tooltip,
                    icon: tag.icon,
                    color: tag.color
                  });
                }
              }
            }
          }
        }

        return results;
      }
      let msEntries = findEntriesWithText(playerDataDictionary, 'ms');
      let gapEntries
      let playerGap = '';
      const timeUnits = ['d', 'mo', 'y'];

      for (let unit of timeUnits) {
        gapEntries = findEntriesWithText(playerDataDictionary, unit);
        if (gapEntries[Player.username] && gapEntries[Player.username][0]['text']) {
          playerGap = gapEntries[Player.username][0]['text'];
          break; // Exit the loop once a match is found
        }
      }


      let playerGaptooltip = gapEntries[Player.username] ? gapEntries[Player.username][0]['tooltip'] || '' : '';


      let playerPing = msEntries[Player.username] ? msEntries[Player.username][0]['text'] || 'ND' : 'ND';
      if (playerPing !== 'ND') {
        playerPing = playerPing.replace('ms', '').trim();
      }




      // Conditional blacklistedT
      let blacklistedS = '';
      let isSniper = false;
      if (playerDataDictionary[Player.username] && playerDataDictionary[Player.username][0] && playerDataDictionary[Player.username][0]['tooltip']) {
        let tooltip = playerDataDictionary[Player.username][0]['tooltip'];
        if (tooltip.includes('Sniper')) {
          blacklistedS = tooltip;
          isSniper = true;
        }
      }


      let blacklistedC = '';
      let isCheater = false;
      if (playerDataDictionary[Player.username] && playerDataDictionary[Player.username][0] && playerDataDictionary[Player.username][0]['tooltip']) {
        let tooltip = playerDataDictionary[Player.username][0]['tooltip'];
        if (tooltip.includes('Cheater')) {
          blacklistedC = tooltip;
          isCheater = true;
        }
      }
      let blacklistedR
      let isRisky = ''
      if (playerDataDictionary[Player.username] && playerDataDictionary[Player.username][0] && playerDataDictionary[Player.username][0]['tooltip']) {
        let tooltip = playerDataDictionary[Player.username][0]['tooltip'];
        if (tooltip.includes('Cheater')) {
          blacklistedR= tooltip;
          isRisky = true;
          }
        }













     let isMember = false;
      let memberOfPlayerName = '';
      let firstJoinTimestamp = null;
      let normalizedPlayerUUID = Player.UUID.replace(/-/g, '');

      if (Player.exists === false) {
        console.log("Player does not exist, skipping membership check.");
      } else {
        for (const [playerName, playerInfo] of Object.entries(playerProfileDictionaries)) {
          // Skip if the player name is the same as the current player's name
          if (playerName.toLowerCase() === Player.username.toLowerCase()) {
            continue;
          }

          if (playerInfo.members && playerInfo.members[normalizedPlayerUUID] && playerInfo.members[normalizedPlayerUUID].first_join) {
            let currentMemberFirstJoinTimestamp = parseInt(playerInfo.members[normalizedPlayerUUID].first_join, 10);
            let currentFirstJoinTimestamp = parseInt(Player.first_join, 10);

            const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;

            if (Date.now() - currentMemberFirstJoinTimestamp > oneWeekInMilliseconds) {
              isMember = true;
              memberOfPlayerName = playerName;

              // Set both timestamps to the lower (earlier) one
              let earliestTimestamp = Math.min(currentFirstJoinTimestamp, currentMemberFirstJoinTimestamp);

              // Update the timestamps
              playerInfo.members[normalizedPlayerUUID].first_join = earliestTimestamp.toString();
              Player.first_join = earliestTimestamp.toString();

              break;
            }
          }
        }
      }

      if (isMember) {
      }



    let legacyQueued = false;
      let Lqueuedmember = '';
      let LqueueCount = 0;
      let LqueueTimestamps = [];
      let earliestTimestamp = 0

      if (Player.exists === false) {
        console.log("Skipping invalid player");
      } else {
        let normalizedPlayerUUID = Player.UUID.replace(/-/g, '');

        for (const playerName in legacyQueuesDictionaries) {
          if (legacyQueuesDictionaries.hasOwnProperty(playerName)) {
            if (playerName.toLowerCase() === Player.username.toLowerCase()) {
              continue;
            }

            const tablistEntries = legacyQueuesDictionaries[playerName].tablistEntries;
            const matchingEntries = tablistEntries.filter(entry => entry.uuid === normalizedPlayerUUID);

            if (matchingEntries.length > 0) {
              legacyQueued = true;
              Lqueuedmember = playerName;

              if (matchingEntries.length > LqueueCount) {
                LqueueCount = matchingEntries.length;
                LqueueTimestamps = matchingEntries.map(entry => entry.timestamp);
              }

              // Mark the other player as queued
              legacyQueuesDictionaries[playerName].legacyQueued = true;
              legacyQueuesDictionaries[playerName].queueCount = LqueueCount;
              legacyQueuesDictionaries[playerName].queueTimestamps = LqueueTimestamps;
            }
          }
        }

        if (legacyQueued) {
          earliestTimestamp = (Math.min(...LqueueTimestamps.map(timestamp => (timestamp))));
        }
      }


      const parseFormattedTime = (formattedTime) => {
        const now = Date.now();
        let totalMilliseconds = 0;

        const timeUnits = {
          'y': 365 * 24 * 60 * 60 * 1000,  // years to milliseconds
          'mo': 30 * 24 * 60 * 60 * 1000,  // months to milliseconds
          'd': 24 * 60 * 60 * 1000,        // days to milliseconds
          'h': 60 * 60 * 1000,             // hours to milliseconds
          'm': 60 * 1000,                  // minutes to milliseconds
          's': 1000                       // seconds to milliseconds
        };

        const regex = /(\d+)(y|mo|d|h|m|s)/g;
        let match;

        while ((match = regex.exec(formattedTime)) !== null) {
          const value = parseInt(match[1], 10);
          const unit = match[2];
          totalMilliseconds += value * timeUnits[unit];
        }

        return now - totalMilliseconds;
      };
      let formattedGaptooltip = parseFormattedTime(playerGaptooltip)


     let shopChange = false;
     let changedTime = 0;

      // Process shop changes for the current player
      if (playerChecksDictionary.hasOwnProperty(Player.username)) {
        let oldShop = null;
        let oldTime = null;
        const playerDataArray = playerChecksDictionary[Player.username].data.data; // Access the array directly

        if (Array.isArray(playerDataArray)) {
          for (const pd of playerDataArray) {
            const shop = pd.shop; // Access the 'shop' property
            const timestamp = pd.timestamp; // Access the 'timestamp' property

            if (oldShop !== null && shop !== oldShop) {
              shopChange = true;
              if (oldTime === null || timestamp > oldTime) {
                oldTime = timestamp;
              }
            }

            oldShop = shop;
          }

          if (oldTime !== null) {
            if (changedTime === 0 || oldTime > changedTime) {
              changedTime = oldTime;
            }
          } else {
            // console.log(`No shop change detected for player: ${Player.username}`);
          }
        } else {
          console.error(`playerData is not an array for player ${Player.username}:`, playerDataArray);
        }
      }

      let Queued = false;
      let queuedmember = '';
      let queueCount = 0;
      let queuedMembers = [];
      let q = '';

      if (Player.exists === false) {
        console.log("skipping invalid player");
      } else {
        let normalizedPlayerUUID = Player.UUID.replace(/-/g, '');

        for (const playerName in queueDictionaries) {
          if (queueDictionaries.hasOwnProperty(playerName)) {
            if (playerName.toLowerCase() === Player.username.toLowerCase() || Player.UUID === playerName) {
              continue;
            }

            const playerData = queueDictionaries[playerName];
            const count = playerData.queue.filter(uuid => uuid === normalizedPlayerUUID).length;

            if (count > 0) {
              Queued = true;

              if (count > queueCount) {
                queueCount = count;
              }

            }
          }
        }
      }


      const tenDayAgo = Date.now() - (240 * 60 * 60 * 1000); // 24 hours, 60 minutes, 60 seconds, 1000 milliseconds
      // if (isSafelisted) {
      //   johns.push({ text: `§dSafe ${formatTimeAgo(safelistTime)}`, tooltip: ``, color: "#55FF55" })
      // }
      if(safe){
        johns.push({ text: `§dSafe ${formatTimeAgo(safeTime[0].time)}`, tooltip: ``, color: "#55FF55" })

      }
      if (shopChange && (changedTime*1000) > formattedGaptooltip){
        johns.push({ text: `§0${formatTimeAgo(changedTime * 1000)}`, tooltip: 'shop', color: '#FF5733' })
      }
      if (isFriended) {
        johns.push({ text: `§9${partyParser(formatTimeAgo(friendedTime))}`, tooltip: `F ${friendedTagName}`, color: "#5555FF" });
      }
      else if (isPartied && partyval != 'ND') {
        johns.push({ text: `${partyParser(partyval)}`, tooltip: 'pug', color: '#FF5733' })
      }
      else if(isMatchingServer) {
        johns.push({ text: `§9server${formatTimeAgo(isMatchingServerTime * 1000)}`, tooltip: `${isMatchingServerIP}`, color: "#5555FF" });

      }
      else if (hasSharedGameDate) {
        johns.push({ text: `§d${formatTimeAgo(firstSharedGameDate)}`, tooltip: ``, color: "green-accent-3" })
      }
      else if (hasCloseTimestamp && maxCloseTimestampsCount >= 0 && firstCloseTimestamp < tenDayAgo) {
        johns.push({ text: `§6${formatTimeAgo(firstCloseTimestamp)}`, tooltip: `${maxCloseTimestampPlayerName} ${maxCloseTimestampsCount}`, color: "green-accent-3" })

      }
      else if (hasSharedQuestTime) {
        johns.push({ text: `§a${partyParser(formatTimeAgo(firstSharedQuestTime))}`, tooltip: `${sharedQuestTimesCount}`, color: "#55FF55" });
      }
      else if (isFriend) {
        johns.push({ text: "§9N", tooltip: `C`, color: "#5555FF" });

      }
      

      else if (isMember) {
        johns.push({ text: `§d${partyParser(formatTimeAgo((firstJoinTimestamp)))}`, tooltip: `C ${memberOfPlayerName}`, color: "#55FF55" });

      }else if (isGuilded) {
        johns.push({ text: "§aC", tooltip: `C ${guildedMemberName}`, color: "#55FF55" })
      }
      else if (legacyQueued) {
        johns.push({
          text: `${(partyParser(formatTimeAgo(earliestTimestamp)))}`,
          tooltip: `L ${Lqueuedmember}-${LqueueCount}`,
          color: "#55FF55"
        })
      }
      else if (Queued && queueCount >= 1) {
        johns.push({
          text: `§aQ-${queueCount}`,
          tooltip: `Q-${queueCount}`,
          color: "#55FF55"
        });
      }
      if (isCheater) {
        johns.push({ text: '§4S', tooltip: 'cheater', color: '#FF5733' })
      }
      if (isSniper) {
        johns.push({ text: '§4S', tooltip: 'sniper', color: '#FF5733' })

      }
      
      // else if (pingAvgTotal[Player.username] && Math.abs(Player.ping - pingAvgTotal[Player.username]) > 40) {
      //   console.log(pingAvgTotal[Player.username])
      //   johns.push({ text: "§4S", tooltip: `${Math.abs(Player.ping - pingAvgTotal[Player.username])}`, color: "#AA0000" });
      // }

      // else if (pingDays[Player.username] < 3) {
      //   tags.push({ text: "LD", tooltip: `LowData`, color: "#AA0000" });
      // }
      if (changedName && nameVal != "ND") {
        johns.push({ text: '§cNC', tooltip: `${nameVal}`, color: '#FF5733' })
      }



      if (highFkdr && fkdrVal != "ND") {
        johns.push({ text: '§cHM', tooltip: `${fkdrVal}`, color: '#FF5733' })
      }
      if(isLunar == true && cosmeticsnumber != "ND") {
        johns.push({text: "🌙", tooltip: `${cosmeticsnumber}`, color: '#FF5733'})
      }




      


      const tagsString = johns.map(tag => tag.text).join(' §f+ ');
      const tooltipString = johns.map(tag => tag.tooltip).join(' + ');
      const parsedContent = mcColorParser(tagsString);

      if (tagsString != "") {
        tags.push({ content: parsedContent, tooltip: tooltipString })
      }





      // if (dataStore.get("developerMode") === true) {
      //   if (Player.headers["cf-cache-status"] === "HIT") {
      //     tags.push({ text: "CF", tooltip: "CF-Cache-HIT", color: "green-lighten-1" });
      //   } else if (Player.headers["cf-cache-status"] === "MISS") {
      //     tags.push({ text: "CF", tooltip: "CF-Cache-MISS", color: "red-lighten-1" });
      //   } else {
      //     tags.push({ text: "CF", tooltip: "CF-Cache-EXPIRED", color: "orange-lighten-2" });
      //   }
      //   if (Player.headers["px-cache-status"] === "HIT") {
      //     tags.push({ text: "PX", tooltip: "PX-Cache-HIT", color: "green-lighten-1" });
      //   } else {
      //     tags.push({ text: "PX", tooltip: "PX-Cache-MISS", color: "red-lighten-1" });
      //   }
      // }

      Players.push({
        isYou: Player.username.toLowerCase() === dataStore.get("player").toLowerCase() || Player.UUID.toLowerCase() === dataStore.get("player").replace(/-/g, "").toLowerCase(),
        //blacklisted: blacklisted,
        encounters: mcColorParser(encounterColorParser(persistentPlayerEncounters[Player.username])),
        UUID: Player.UUID,
        username: Player.username,
        fullUsername: isCheater ? mcColorParser(`§c${blacklistedC}`) : isSniper ? mcColorParser(`§c${blacklistedS}`) : mcColorParser(`${rankParser(Player.rank, Player.plusColor, Player.plusPlusColor)[0]} ${Player.username}`),
        formattedUsername: safe ? mcColorParser(`§d${Player.username}`) : isCheater ? mcColorParser(`§c${Player.username}`) : isSniper ? mcColorParser(`§c${Player.username}`) : mcColorParser(`${rankParser(Player.rank, Player.plusColor, Player.plusPlusColor)[1]} ${Player.username}`),
        level: Math.floor(Player.level),
        fullLevel: mcColorParser(starParser(Math.floor(Player.level))[0]) || 0,
        levelFormatted: mcColorParser(starParser(Math.floor(Player.level))[1]) || 0,
        WS: Player[dataStore.get("mode").toLowerCase()].winstreak,
        WSFormatted: mcColorParser(statColorParser(Player[dataStore.get("mode").toLowerCase()].winstreak, "WS", dataStore.get("mode").toLowerCase())),
        gaps: mcColorParser(gapColorParser(playerGap || '')),
        winsFormatted: mcColorParser(statColorParser(Player[dataStore.get("mode").toLowerCase()].wins, "wins")),
        WLR: Player[dataStore.get("mode").toLowerCase()].WLR.toFixed(1),
        WLRFormatted: mcColorParser(statColorParser(Player[dataStore.get("mode").toLowerCase()].WLR.toFixed(1), "WLR")),
        Ping: mcColorParser(pingColorParser(playerPing || "ND")), // Replace with the actual property name for ping data
        finalKills: Player[dataStore.get("mode").toLowerCase()].finalKills,
        finalKillsFormatted: mcColorParser(statColorParser(Player[dataStore.get("mode").toLowerCase()].finalKills, "finalKills")),
        FKDR: Player[dataStore.get("mode").toLowerCase()].FKDR.toFixed(1),
        FKDRFormatted: mcColorParser(statColorParser(Player[dataStore.get("mode").toLowerCase()].FKDR.toFixed(1), "FKDR")),
        BBLR: Player[dataStore.get("mode").toLowerCase()].BBLR.toFixed(1),
        BBLRFormatted: mcColorParser(statColorParser(Player[dataStore.get("mode").toLowerCase()].BBLR.toFixed(1), "BBLR")),
        tags: tags,
        playerGaptooltips: mcColorParser(`§f${playerGaptooltip}`)
        // party: party,
      });
    }
  }

  players.value = Players;
}, 250);

var headers = ref(0);

const updateHeaders = () => {
  const selectedHeaders = dataStore.get("colums");

  // TODO: Dynamically adjust header width //

  headers.value = [
    { title: "E", align: "center", key: "encounters", width: "5%" }, // Encounters column
    { title: "Name", align: "center", key: "formattedUsername", sortable: false, width: "25%" },
    { key: "fullUsername", align: " d-none" },
    { key: 'playerGaptooltips', align: ' d-none' },
    { key: "username", align: " d-none" },
    { key: "UUID", align: " d-none" },
    { title: "Tags", align: "center", key: "gaps", width: "25%" },
    { key: "isYou", align: " d-none" },
    { key: "blacklisted", align: " d-none" },
    { key: "levelFormatted", align: " d-none" },
    { key: "fullLevel", align: " d-none" },
    { title: "FKDR", align: "center", key: "tags", sortable: false, width: "20%" }
    // { title: "Party", align: "center", key: "party", sortable: false, width: "20%" }


  ];

  if (selectedHeaders.includes("WS")) headers.value.push({ title: "WS", align: "center", key: "FKDR", width: "10%" }, { key: "FKDRFormatted", align: " d-none" });

  if (selectedHeaders.includes("Gaps")) headers.value.push({ title: "Gaps", align: "left", key: "WS", width: "8%" }, { key: "WSFormatted", align: " d-none" });

  if (selectedHeaders.includes("Ping")) headers.value.push({ title: "Ping", align: "center", key: "Ping", width: "10%" });
  if (selectedHeaders.includes("WLR")) headers.value.push({ title: "Ping", align: "center", key: "Ping", width: "10%" });
  if (selectedHeaders.includes("Finals")) headers.value.push({ title: "Finals", align: "center", key: "finalKills", width: "12%" }, { title: "Finals", key: "finalKillsFormatted", align: " d-none" });

  headers.value.push({ width: "5%" });
};

updateHeaders();

setInterval(() => updateHeaders(), 1000);

document.querySelector(":root").style.setProperty("--opacity", dataStore.get("opacity"));
</script>

<style>
.v-application {
  background-color: rgba(var(--v-theme-background), var(--opacity)) !important;
}

.v-tooltip .v-overlay__content {
  background: rgba(var(--v-theme-background), 1) !important;
}

.datatable table {
  text-align: center;
  table-layout: fixed;
}

.datatable thead th {
  font-size: 12px !important;
}

.v-data-table .v-table__wrapper>table>thead>tr>th:not(.v-data-table__th--sorted) .v-data-table-header__sort-icon,
.v-data-table .v-table__wrapper>table tbody>tr>th:not(.v-data-table__th--sorted) .v-data-table-header__sort-icon {
  width: 0;
}

.v-data-table .v-table__wrapper>table>thead>tr>th:not(.v-data-table__th--sorted):hover .v-data-table-header__sort-icon,
.v-data-table .v-table__wrapper>table tbody>tr>th:not(.v-data-table__th--sorted):hover .v-data-table-header__sort-icon {
  opacity: 0 !important;
}</style>
