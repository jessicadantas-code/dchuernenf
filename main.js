import { downloadJson } from "./helpers.js";
import { loadState, saveState, seedData, serializeState, syncAtividades } from "./state.js";
import { renderApp } from "./ui.js";

function render() {
  syncAtividades();
  renderApp(render);
  saveState();
}

document.getElementById("btnSeed").onclick = () => {
  seedData();
  render();
};

document.getElementById("btnExportJson").onclick = () => {
  downloadJson("dch_uern_dados.json", serializeState());
};

document.getElementById("inputImport").onchange = (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    localStorage.setItem("dch_uern_sprint12", reader.result);
    loadState();
    render();
  };
  reader.readAsText(file);
};

document.getElementById("btnReset").onclick = () => {
  const ok = confirm("Limpar todos os dados salvos?");
  if (!ok) return;
  localStorage.removeItem("dch_uern_sprint12");
  seedData();
  render();
};

if (!loadState()) {
  seedData();
}

render();
