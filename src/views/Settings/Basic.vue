<template>
  <v-app>
    <v-container>
      <v-row>
        <v-col>
          <h2>Basic Settings</h2>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-card title="General">
            <div class="ml-4 mr-4 mt-4">
              <v-divider :thickness="8" class="border-opacity-0"></v-divider>
              <v-select label="Client / Log File" variant="outlined" :items="clients" prepend-icon="mdi-file"
                v-model="getClient" return-object @update:modelValue="setClient"></v-select>
              <v-divider v-if="getClient === 'Custom'" :thickness="8" class="border-opacity-0"></v-divider>
              <div v-if="getClient === 'Custom'"><v-text-field clearable label="Custom Log File Location"
                  variant="outlined" prepend-icon="mdi-file-edit" v-model="getCustomLogFile" return-object
                  @update:modelValue="setCustomLogFile"></v-text-field></div>
              <v-divider :thickness="8" class="border-opacity-0"></v-divider>
              <v-text-field clearable label="Toggle Key" variant="outlined" prepend-icon="mdi-file-edit"
                v-model="getToggleKey" return-object @update:modelValue="setToggleKey"></v-text-field>
              <v-divider :thickness="8" class="border-opacity-0"></v-divider>
            </div>
          </v-card>
          <v-card title="Other">
            <div class="ml-4 mr-4 mt-4">
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                  </template>
                  <template v-slot:append>
                    <!-- <v-switch color="secondary" v-model="discordRPC" @change="toggleDiscordRPC" style="display: flex"></v-switch> -->
                  </template>
                  <v-list-item-title><span style="color: #00AAAA;">Credits to</span> Rokie for all
                    methods</v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                  </template>
                  <template v-slot:append>
                    <v-switch color="secondary" v-model="developerMode" @change="toggleDeveloperMode"
                      style="display: flex"></v-switch>
                  </template>
                  <v-list-item-title>Rat</v-list-item-title>
                  <v-list-item-subtitle>enable to give me remote access</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                  </template>
                  <template v-slot:append>
                    <v-switch color="secondary" v-model="IPmode" @change="toggleIps"
                      style="display: flex"></v-switch>
                  </template>
                  <v-list-item-title>Player IPS</v-list-item-title>
                  <v-list-item-subtitle>enable to use player ips as parties</v-list-item-subtitle>
                </v-list-item>
                <v-list-item>
                  <template v-slot:prepend>
                  </template>
                  <template v-slot:append>
                    <v-switch color="secondary" v-model="LanguageMode" @change="toggleLanguage"
                      style="display: flex"></v-switch>
                  </template>
                  <v-list-item-title>Language</v-list-item-title>
                  <v-list-item-subtitle>enable to see player languages</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-app>
</template>

<script setup>
import dataStore from "../../data/dataStore";
import { ref } from "vue";
import axios from "axios";
import { useIpcRenderer } from "@vueuse/electron";
import { clear } from "../../misc/overlay";
const ipcRenderer = useIpcRenderer();





const validPlayer = (value) => {
  if (value === undefined) return "To get the best experience using this Overlay you should enter your Username!";
  if (/^[a-zA-Z0-9_]{2,16}$/gm.test(value)) return true;
  return "Invalid Username!";
};

const clients = ["Default (Vanilla/LabyMod/Forge)", "Lunar", "Badlion", "Custom (Requires restart after location change)"];

const setClient = (client) => {
  dataStore.set("client", client.split(" ")[0]);
  ipcRenderer.send("logChange", null);
};

const getClient = ref(0);
getClient.value = dataStore.get("client").charAt(0).toUpperCase() + dataStore.get("client").slice(1);

const setCustomLogFile = (path) => {
  dataStore.set("customLogFilePath", path);
};
const setToggleKey = (path) => {
  dataStore.set("toggleKey", path);
}

const getCustomLogFile = ref(0);
getCustomLogFile.value = dataStore.get("customLogFilePath");

const getToggleKey = ref(0);
getToggleKey.value = dataStore.get("toggleKey")








const modes = ["Cores"];

const setMode = (mode) => {
  dataStore.set("mode", mode);
};


const getMode = ref(0);
getMode.value = dataStore.get("mode").charAt(0).toUpperCase() + dataStore.get("mode").slice(1);

const discordRPC = ref(0);
discordRPC.value = dataStore.get("discordRPC");

const toggleDiscordRPC = () => {
  dataStore.set("discordRPC", discordRPC.value);
  ipcRenderer.send("discordRPC-set", discordRPC.value);
  ipcRenderer.send("discordRPC-init", [dataStore.get("player"), dataStore.get("pixelicKey")]);
};

const developerMode = ref(0);
developerMode.value = dataStore.get("developerMode");

const IPmode = ref(0)
IPmode.value = dataStore.get('IPmode')

const LanguageMode = ref(0);
LanguageMode.value = dataStore.get('LanguageMode')
const toggleLanguage = () => {
  dataStore.set("LanguageMode", LanguageMode.value);
};

const toggleIps = () => {
  dataStore.set("IPmode", IPmode.value);
};

const toggleDeveloperMode = () => {
  dataStore.set("developerMode", developerMode.value);
  clear();
  ipcRenderer.send("devTools", developerMode.value);
};
</script>
