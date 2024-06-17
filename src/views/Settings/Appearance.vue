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
        <v-divider :thickness="8" class="border-opacity-0"></v-divider>
        <v-divider></v-divider>
        <v-divider :thickness="8" class="border-opacity-0"></v-divider>
        <v-list-item prepend-icon="mdi-application-outline" title="Basic Settings" value="basic-settings" router-link
          to="/basic-settings" @click="turnOffTable"></v-list-item>
        <v-list-item prepend-icon="mdi-palette-outline" title="Appearance Settings" value="appearance-settings"
          router-link to="/appearance-settings" @click="turnOffTable"></v-list-item>
        <v-list-item prepend-icon="mdi-view-column-outline" title="Column Settings" value="column-settings" router-link
          to="/column-settings" @click="turnOffTable"></v-list-item>
        <v-list-item prepend-icon="mdi-bell-outline" title="Notification Settings" value="notification-settings"
          router-link to="/notification-settings" @click="turnOffTable"></v-list-item>
        <v-divider :thickness="8" class="border-opacity-0"></v-divider>
        <v-divider></v-divider>
        <v-divider :thickness="8" class="border-opacity-0"></v-divider>
        <v-list-item style="position: fixed !important; bottom: 0 !important">
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <router-view></router-view>
    <v-data-table v-if="table" :headers="headers" :items="players" :items-per-page="-1" class="datatable elevation-0"
      density="compact" no-data-text="" sort-asc-icon="mdi-chevron-up" sort-desc-icon="mdi-chevron-down"
      style="background-color: rgba(255, 255, 255, 0) !important; opacity: 1 !important;">
      <template v-slot:item="{ item }">
        <tr style="background-color: rgba(255, 255, 255, 0) !important;">
          <td style="color: rgba(0, 0, 0, 1) !important;">
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <span v-bind="props" v-html="item.columns.encounters" style="color: rgba(0, 0, 0, 1) !important;"></span>
              </template>
              <span v-html="item.columns.fullLevel" style="color: rgba(0, 0, 0, 1) !important;"></span>
            </v-tooltip>
          </td>
          <td style="color: rgba(0, 0, 0, 1) !important;">
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <span v-bind="props" v-if="item.columns.fullLevel"
                  v-html="item.columns.fullLevel + item.columns.formattedUsername"
                  style="color: rgba(0, 0, 0, 1) !important;"></span>
                <span v-bind="props" v-else v-html="item.columns.formattedUsername"
                  style="color: rgba(0, 0, 0, 1) !important;"></span>
              </template>
              <span v-html="item.columns.fullUsername" style="color: rgba(0, 0, 0, 1) !important;"></span>
            </v-tooltip>
          </td>
          <td class="align-center justify-center" style="color: rgba(0, 0, 0, 1) !important;">
            <v-tooltip v-for="(tag, index) in item.columns.tags" :key="index" bottom>
              <template v-slot:activator="{ props }">
                <span v-bind="props" v-html="tag.content" style="color: rgba(0, 0, 0, 1) !important;"></span>
              </template>
              <span style="color: rgba(var(--v-theme-primary), 1) !important;">{{ tag.tooltip }}</span>
            </v-tooltip>
          </td>
          <td v-if="headers.some((h) => h.title === 'FKDR')" style="color: rgba(0, 0, 0, 1) !important;">
            <span v-html="item.columns.FKDRFormatted"></span>
          </td>
          <td v-if="headers.some((h) => h.title === 'WS')" style="color: rgba(0, 0, 0, 1) !important;">
            <span v-html="item.columns.WSFormatted"></span>
          </td>
          <td style="color: rgba(0, 0, 0, 1) !important;">
            <v-tooltip location="bottom">
              <template v-slot:activator="{ props }">
                <span v-bind="props" v-html="item.columns.gaps" style="color: rgba(0, 0, 0, 1) !important;"></span>
              </template>
              <span v-html="item.columns.playerGaptooltips" style="color: rgba(0, 0, 0, 1) !important;"></span>
            </v-tooltip>
          </td>
          <td v-if="headers.some((h) => h.title === 'Ping')" style="color: rgba(0, 0, 0, 1) !important;">
            <span v-html="item.columns.Ping"></span>
          </td>
          <td v-if="headers.some((h) => h.title === 'session')" style="color: rgba(0, 0, 0, 1) !important;">
              <span v-html="item.columns.session"></span>
            </td>
          <td v-if="headers.some((h) => h.title === 'Finals')" style="color: rgba(0, 0, 0, 1) !important;">
            <span v-html="item.columns.finalKillsFormatted"></span>
          </td>
          <td>
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn size="small" variant="text" icon="mdi-dots-horizontal" v-bind="props"
                  style="height: calc(var(--v-btn-height)) !important"></v-btn>
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
    </v-data-table>
    <v-snackbar :timeout="snackbarTimeout" :color="snackbarColor" :variant="snackbarVariant" v-model="snackbarShown">
      <v-icon v-if="snackbarIcon !== null">{{ snackbarIcon }}</v-icon>
      {{ snackbarText }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import dataStore from "../../data/dataStore";
import { ref } from "vue";
import { useTheme } from "vuetify";

const opacity = ref(0);
opacity.value = Math.round(dataStore.get("opacity") * 100);

const setOpacity = (value) => {
  document.querySelector(":root").style.setProperty("--opacity", value / 100);
  dataStore.set("opacity", value / 100);
};

const hideIngame = ref(0);
hideIngame.value = dataStore.get("hideIngame");

const toggleHideIngame = () => {
  dataStore.set("hideIngame", hideIngame.value);
};

const theme = useTheme();
const currentTheme = ref(0);
currentTheme.value = theme.global.name.value.charAt(0).toUpperCase() + theme.global.name.value.slice(1);
const themes = ["Dark 🌙", "Light 💡", "Sakura 🌸", "Custom 🎨"];

const setTheme = (selectedTheme) => {
  theme.global.name.value = selectedTheme.split(" ")[0].toLowerCase();
  dataStore.set("selectedTheme", selectedTheme.split(" ")[0].toLowerCase());
};

const themeComponents = ["Background", "Primary", "Secondary", "Error", "Info", "Success", "Warning"];
const selectedComponent = ref(0);
const previewedComponent = ref(0);

previewedComponent.value = "Background";

const setThemeComponent = (component) => {
  selectedComponent.value = component.toLowerCase();
};

setThemeComponent("Background");

var reloadingTheme = false;

const reloadTheme = () => {
  theme.global.name.value = "dark";
  theme.global.name.value = "custom";

  new Promise((r) => setTimeout(r, 100)).then(() => {
    reloadingTheme = false;
  });
};

const setThemeComponentColor = (selectedColor) => {
  if (selectedColor === undefined) return;

  theme.global.current["_value"].colors[selectedComponent.value] = selectedColor;

  dataStore.set("customTheme", { ...dataStore.get("customTheme"), colors: { ...dataStore.get("customTheme").colors, [selectedComponent.value]: selectedColor } });

  if (!reloadingTheme) {
    reloadingTheme = true;
    reloadTheme();
  }
};
</script>