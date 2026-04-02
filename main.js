import { downloadJson } from "./helpers.js";
import { loadState, saveState, seedData, serializeState, syncAtividades } from "./state.js";
import { renderApp } from "./ui.js";
function render(){syncAtividades();renderApp(render);saveState()}
document.getElementById("btnSeed").onclick=()=>{seedData();render()}
document.getElementById("btnExportJson").onclick=()=>{downloadJson("dch_uern_dados.json",serializeState())}
document.getElementById("inputImport").onchange=(event)=>{const file=event.target.files?.[0]; if(!file) return; const reader=new FileReader(); reader.onload=()=>{localStorage.setItem("dch_uern_sprint13", reader.result); loadState(); render();}; reader.readAsText(file);}
document.getElementById("btnReset").onclick=()=>{if(!confirm("Limpar todos os dados salvos?")) return; localStorage.removeItem("dch_uern_sprint13"); seedData(); render();}
if(!loadState()) seedData(); render();
