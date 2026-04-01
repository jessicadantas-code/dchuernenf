import { downloadJson } from "./helpers.js";
import { renderApp } from "./ui.js";
import { loadState, seedData, serializeState, syncAtividades } from "./state.js";

const STORAGE_KEY = "dch_uern_sprint2_v1";

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState()));
}
function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  loadState(JSON.parse(raw));
  return true;
}
function render() {
  syncAtividades();
  renderApp(() => { save(); render(); });
  save();
}

document.getElementById("btn-seed").onclick = () => { seedData(); render(); };
document.getElementById("btn-export").onclick = () => { downloadJson("dch_uern_dados.json", serializeState()); };
document.getElementById("input-import").onchange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { loadState(JSON.parse(reader.result)); render(); };
  reader.readAsText(file);
};

if (!load()) seedData();
render();
