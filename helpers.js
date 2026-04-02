export function uid(){return Math.random().toString(36).slice(2,10)}
export function roundInt(value){return Math.round(Number(value||0))}
export function weeklyHours(totalHours,weeks=15){return Number(totalHours||0)/Number(weeks||15)}
export function downloadJson(filename,data){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download=filename;link.click()}
export function timeToMinutes(value){if(!value)return 0;const [h,m]=value.split(":").map(Number);return h*60+m}
export function csvEscape(value){const raw=String(value??"");const escaped=raw.replace(/"/g,'""');return /[",;\n]/.test(escaped)?`"${escaped}"`:escaped}
export function downloadCsv(filename,rows){const csv="\uFEFF"+rows.map(row=>row.map(csvEscape).join(";")).join("\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download=filename;link.click()}
