import { uid } from "./helpers.js";
import { calcDisciplinaParaDocente, calcResumoDocente, detectHorarioConflicts, getOfertaDocentes, getOfertaTurma } from "./rules.js";
import { addOfertaFromCatalogo, addPeriodoFromCatalogo, state, syncAtividades } from "./state.js";

const tabs = [
  { key: "docentes", label: "Docentes" },
  { key: "oferta", label: "Oferta 26.2" },
  { key: "atividades", label: "Atividades" },
  { key: "resumo", label: "Resumo" },
  { key: "horarios", label: "Horários" },
  { key: "grade", label: "Grade semanal" },
  { key: "relatorios", label: "Relatórios" },
];
const dias = ["Segunda","Terça","Quarta","Quinta","Sexta"];
const turnos = ["Manhã","Tarde","Noite"];

export function renderApp(render) {
  renderTabs();
  renderDocentesPanel(render);
  renderOfertaPanel(render);
  renderAtividadesPanel(render);
  renderResumoPanel();
  renderHorariosPanel(render);
  renderGradePanel(render);
  renderRelatoriosPanel(render);
}

function renderTabs() {
  const nav = document.getElementById("tabs");
  nav.innerHTML = tabs.map((tab, index) => `<button class="tab ${index === 0 ? "active" : ""}" data-tab="${tab.key}">${tab.label}</button>`).join("");
  nav.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
      nav.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(`panel-${button.dataset.tab}`).classList.add("active");
    });
  });
}

function renderDocentesPanel(render) {
  const panel = document.getElementById("panel-docentes");
  panel.innerHTML = `<div class="bar"><h2>Docentes</h2><button id="add-docente">Adicionar docente</button></div>
  <div class="card"><table><thead><tr><th>Nome</th><th>Regime</th><th>Mínimo sala</th><th>Função</th><th>CH função</th><th></th></tr></thead><tbody id="docentes-tbody"></tbody></table></div>`;
  panel.querySelector("#add-docente").onclick = () => {
    state.docentes.push({ id: uid(), nome: "", regime: "40h", minimoSala: 12, funcao: "", chFuncao: 0 });
    syncAtividades();
    render();
  };
  const tbody = panel.querySelector("#docentes-tbody");
  tbody.innerHTML = "";
  state.docentes.forEach((docente) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td><input value="${docente.nome}" data-field="nome" /></td>
      <td><select data-field="regime"><option value="20h" ${docente.regime === "20h" ? "selected" : ""}>20h</option><option value="40h" ${docente.regime === "40h" ? "selected" : ""}>40h</option><option value="DE" ${docente.regime === "DE" ? "selected" : ""}>DE</option></select></td>
      <td><input type="number" step="1" value="${docente.minimoSala}" data-field="minimoSala" /></td>
      <td><input value="${docente.funcao || ""}" data-field="funcao" /></td>
      <td><input type="number" step="1" value="${docente.chFuncao || 0}" data-field="chFuncao" /></td>
      <td><button data-remove>Excluir</button></td>`;
    row.querySelectorAll("[data-field]").forEach((input) => input.addEventListener("input", () => {
      const field = input.dataset.field;
      docente[field] = input.type === "number" ? Number(input.value) : input.value;
      render();
    }));
    row.querySelector("[data-remove]").onclick = () => {
      state.docentes = state.docentes.filter((item) => item.id !== docente.id);
      state.oferta.forEach((oferta) => { oferta.docentes = (oferta.docentes || []).filter((id) => id !== docente.id); });
      syncAtividades();
      render();
    };
    tbody.appendChild(row);
  });
}

function renderChoiceList(selectedIds, docentes, onToggle) {
  const wrapper = document.createElement("div");
  wrapper.className = "choice-wrap";
  docentes.forEach((docente) => {
    const label = document.createElement("label");
    label.className = "choice";
    label.innerHTML = `<input type="checkbox" ${selectedIds.includes(docente.id) ? "checked" : ""} /><span>${docente.nome || "(sem nome)"}</span>`;
    label.querySelector("input").onchange = (event) => onToggle(docente.id, event.target.checked);
    wrapper.appendChild(label);
  });
  return wrapper;
}

function renderOfertaPanel(render) {
  const panel = document.getElementById("panel-oferta");
  const periodosCatalogo = [...new Set(state.catalogo.map(item => item.periodo))];
  panel.innerHTML = `<div class="bar"><h2>Oferta 26.2</h2></div>
    <div class="help">Agora você puxa a disciplina direto do catálogo do PPC. Não é mais preciso marcar os mesmos docentes duas vezes para teoria e prática. A prática acompanha os docentes selecionados da oferta.</div>
    <div class="card" style="margin-bottom:.8rem">
      <div class="grid">
        <div><label>Adicionar disciplina do catálogo</label><select id="catalogo-disciplina"><option value="">Selecione</option>${state.catalogo.map(item => `<option value="${item.codigo}">${item.periodo} — ${item.codigo} — ${item.nome}</option>`).join("")}</select></div>
        <div style="align-self:end"><button id="add-catalogo-disciplina">Adicionar disciplina</button></div>
        <div><label>Adicionar período inteiro</label><select id="catalogo-periodo"><option value="">Selecione</option>${periodosCatalogo.map(p => `<option value="${p}">${p}</option>`).join("")}</select></div>
        <div style="align-self:end"><button id="add-catalogo-periodo">Adicionar período</button></div>
      </div>
    </div>
    <div class="bar"><button id="add-oferta">Adicionar disciplina manual</button></div>
    <div class="card"><table><thead><tr><th>Período</th><th>Tipo</th><th>Especial</th><th>Código</th><th>Disciplina</th><th>CH Teórica</th><th>CH Prática</th><th>CH Orientação</th><th>Semanas</th><th>Docentes</th><th></th></tr></thead><tbody id="oferta-tbody"></tbody></table></div>`;

  panel.querySelector("#add-catalogo-disciplina").onclick = () => {
    const codigo = panel.querySelector("#catalogo-disciplina").value;
    if (!codigo) return;
    addOfertaFromCatalogo(codigo);
    render();
  };
  panel.querySelector("#add-catalogo-periodo").onclick = () => {
    const periodo = panel.querySelector("#catalogo-periodo").value;
    if (!periodo) return;
    addPeriodoFromCatalogo(periodo);
    render();
  };
  panel.querySelector("#add-oferta").onclick = () => {
    state.oferta.push({ id: uid(), periodo: "", tipo: "obrigatoria", especial: "nao", codigo: "", nome: "", teorica: 0, pratica: 0, orientacao: 0, total: 0, semanas: 15, docentes: [] });
    render();
  };

  const tbody = panel.querySelector("#oferta-tbody");
  tbody.innerHTML = "";
  state.oferta.forEach((oferta) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td><input value="${oferta.periodo}" data-field="periodo" /></td>
      <td><select data-field="tipo"><option value="obrigatoria" ${oferta.tipo==="obrigatoria"?"selected":""}>Obrigatória</option><option value="optativa" ${oferta.tipo==="optativa"?"selected":""}>Optativa</option><option value="especial" ${oferta.tipo==="especial"?"selected":""}>Especial</option></select></td>
      <td><select data-field="especial"><option value="nao" ${oferta.especial==="nao"?"selected":""}>Não</option><option value="individual" ${oferta.especial==="individual"?"selected":""}>Individual (50%)</option><option value="turma" ${oferta.especial==="turma"?"selected":""}>Turma especial (100%)</option></select></td>
      <td><input value="${oferta.codigo}" data-field="codigo" /></td>
      <td><input value="${oferta.nome}" data-field="nome" /></td>
      <td><input type="number" step="1" value="${oferta.teorica}" data-field="teorica" /></td>
      <td><input type="number" step="1" value="${oferta.pratica}" data-field="pratica" /></td>
      <td><input type="number" step="1" value="${oferta.orientacao}" data-field="orientacao" /></td>
      <td><input type="number" step="1" value="${oferta.semanas}" data-field="semanas" /></td>
      <td class="docentes-cell"></td>
      <td><button data-remove>Excluir</button></td>`;
    row.querySelectorAll("[data-field]").forEach((input) => input.addEventListener((input.tagName === "SELECT" || input.type === "number") ? "change" : "input", () => {
      const field = input.dataset.field;
      oferta[field] = input.type === "number" ? Number(input.value) : input.value;
      render();
    }));
    row.querySelector("[data-remove]").onclick = () => {
      state.oferta = state.oferta.filter((item) => item.id !== oferta.id);
      state.horarios = state.horarios.filter((item) => item.ofertaId !== oferta.id);
      render();
    };
    row.querySelector(".docentes-cell").appendChild(renderChoiceList(oferta.docentes || [], state.docentes, (docenteId, checked) => {
      oferta.docentes = oferta.docentes || [];
      if (checked && !oferta.docentes.includes(docenteId)) oferta.docentes.push(docenteId);
      if (!checked) oferta.docentes = oferta.docentes.filter((id) => id !== docenteId);
      render();
    }));
    tbody.appendChild(row);
  });
}

function renderAtividadesPanel(render) {
  const panel = document.getElementById("panel-atividades");
  panel.innerHTML = `<div class="bar"><h2>Atividades por docente</h2></div>
    <div class="help">Extensão: coordenação 8h por ação e membro 4h por ação. Grupo de pesquisa: 1h por grupo e líder 2h por grupo. Outras comissões podem ser acrescentadas livremente.</div>
    <div class="grid" id="atividades-grid"></div>`;

  const grid = panel.querySelector("#atividades-grid");
  state.docentes.forEach((docente) => {
    const acts = state.atividades[docente.id];
    const card = document.createElement("div");
    card.className = "doc-card";
    card.innerHTML = `<h3>${docente.nome || "(sem nome)"}</h3>
      <div class="grid">
        <label><input type="checkbox" data-f="projetoPesquisa" ${acts.projetoPesquisa ? "checked" : ""}> Projeto de pesquisa <span class="small">(4h)</span></label>
        <label><input type="checkbox" data-f="projetoEnsino" ${acts.projetoEnsino ? "checked" : ""}> Projeto de ensino <span class="small">(4h)</span></label>
        <label><input type="checkbox" data-f="coordProjetoPibic" ${acts.coordProjetoPibic ? "checked" : ""}> Coordenação de projeto PIBIC <span class="small">(8h)</span></label>
        <div><label>Extensão — coordenação (quantidade)</label><input type="number" min="0" step="1" data-f="extCoordCount" value="${acts.extCoordCount || 0}"></div>
        <div><label>Extensão — membro (quantidade)</label><input type="number" min="0" step="1" data-f="extMembroCount" value="${acts.extMembroCount || 0}"></div>
        <div><label>Grupo de pesquisa — membro (quantidade)</label><input type="number" min="0" step="1" data-f="grupoPesquisaCount" value="${acts.grupoPesquisaCount || 0}"></div>
        <div><label>Grupo de pesquisa — líder (quantidade)</label><input type="number" min="0" step="1" data-f="grupoPesquisaLiderCount" value="${acts.grupoPesquisaLiderCount || 0}"></div>
        <div><label>NDE</label><select data-f="nde"><option value="none" ${acts.nde === "none" ? "selected" : ""}>Não</option><option value="membro" ${acts.nde === "membro" ? "selected" : ""}>Membro (2h)</option><option value="coordenacao" ${acts.nde === "coordenacao" ? "selected" : ""}>Coordenação (4h)</option></select></div>
        <label><input type="checkbox" data-f="fiel" ${acts.fiel ? "checked" : ""}> FIEL <span class="small">(2h)</span></label>
        <label><input type="checkbox" data-f="fieb" ${acts.fieb ? "checked" : ""}> FIEB <span class="small">(2h)</span></label>
        <label><input type="checkbox" data-f="comiteEtica" ${acts.comiteEtica ? "checked" : ""}> Comitê de Ética <span class="small">(2h)</span></label>
        <div><label>Orientações TCC (nº de alunos)</label><input type="number" min="0" step="1" data-f="orientacoesTcc" value="${acts.orientacoesTcc || 0}"></div>
        <div><label>Orientações PIBIC (nº de alunos)</label><input type="number" min="0" step="1" data-f="orientacoesPibic" value="${acts.orientacoesPibic || 0}"></div>
      </div>
      <div style="margin-top:.8rem">
        <div class="bar"><strong>Outras comissões</strong><button data-add-outra>Adicionar comissão</button></div>
        <div data-outras></div>
      </div>`;
    card.querySelectorAll("[data-f]").forEach((input) => input.addEventListener(input.type === "checkbox" ? "change" : "input", () => {
      const field = input.dataset.f;
      acts[field] = input.type === "checkbox" ? input.checked : (input.tagName === "SELECT" ? input.value : Number(input.value));
      render();
    }));
    const outrasWrap = card.querySelector("[data-outras]");
    (acts.outras || []).forEach((item, idx) => {
      const row = document.createElement("div");
      row.className = "grid";
      row.style.marginBottom = ".5rem";
      row.innerHTML = `<input data-idx="${idx}" data-kind="nome" value="${item.nome || ""}" placeholder="Nome da comissão" />
        <input data-idx="${idx}" data-kind="ch" type="number" min="0" step="1" value="${item.ch || 0}" placeholder="CH" />
        <button data-remove-outra="${idx}">Remover</button>`;
      row.querySelectorAll("[data-kind]").forEach((input) => input.addEventListener("input", () => {
        const i = Number(input.dataset.idx);
        const kind = input.dataset.kind;
        acts.outras[i][kind] = kind === "ch" ? Number(input.value) : input.value;
        render();
      }));
      row.querySelector("[data-remove-outra]").onclick = () => {
        acts.outras.splice(idx, 1);
        render();
      };
      outrasWrap.appendChild(row);
    });
    card.querySelector("[data-add-outra]").onclick = () => {
      acts.outras.push({ nome: "", ch: 0 });
      render();
    };
    grid.appendChild(card);
  });
}

function renderResumoPanel() {
  const panel = document.getElementById("panel-resumo");
  const resumo = state.docentes.map((docente) => calcResumoDocente(docente, state));
  const conflicts = detectHorarioConflicts(state.horarios, state.oferta);
  panel.innerHTML = `<div class="bar"><h2>Resumo docente</h2></div>
    <div class="kpis">
      <div class="kpi"><div class="kpi-label">Docentes</div><div class="kpi-value">${state.docentes.length}</div></div>
      <div class="kpi"><div class="kpi-label">Disciplinas</div><div class="kpi-value">${state.oferta.length}</div></div>
      <div class="kpi"><div class="kpi-label">Carga total</div><div class="kpi-value">${resumo.reduce((sum, item) => sum + item.total, 0)}</div></div>
      <div class="kpi"><div class="kpi-label">Choques docente</div><div class="kpi-value">${conflicts.filter((item) => item.docenteConflict).length}</div></div>
      <div class="kpi"><div class="kpi-label">Choques turma</div><div class="kpi-value">${conflicts.filter((item) => item.turmaConflict).length}</div></div>
    </div>
    <div class="card"><table><thead><tr><th>Docente</th><th>Sala</th><th>Regência</th><th>Pesquisa</th><th>Extensão</th><th>Ensino</th><th>Orient. TCC</th><th>Orient. PIBIC</th><th>Coord. PIBIC</th><th>Total orient./pesquisa</th><th>Comissões</th><th>Função</th><th>Total</th><th>Mín. sala</th><th>Status</th></tr></thead><tbody>
      ${resumo.map((item) => `<tr><td>${item.docente}</td><td>${item.sala}</td><td>${item.regencia}</td><td>${item.pesquisa}</td><td>${item.extensao}</td><td>${item.ensino}</td><td>${item.orientTcc}</td><td>${item.orientPibic}</td><td>${item.coordProjetoPibic}</td><td>${item.orientTotal}</td><td>${item.comissoes}</td><td>${item.funcao}</td><td><strong>${item.total}</strong></td><td>${item.minimoSala}</td><td><span class="badge ${item.status === "Atende mínimo" ? "ok" : "bad"}">${item.status}</span></td></tr>`).join("")}
    </tbody></table></div>`;
}

function renderHorariosPanel(render) {
  const panel = document.getElementById("panel-horarios");
  const conflictMap = new Map(detectHorarioConflicts(state.horarios, state.oferta).map((item) => [item.id, item]));
  const ofertaveis = state.oferta.filter((o) => !(o.tipo === "especial" && o.especial === "individual"));
  panel.innerHTML = `<div class="bar"><h2>Horários</h2><button id="add-horario">Adicionar bloco</button></div>
    <div class="help">Selecione a disciplina. A turma/período e os professores vêm automaticamente da oferta.</div>
    <div class="card"><table><thead><tr><th>Disciplina</th><th>Turma</th><th>Docentes</th><th>Dia</th><th>Turno</th><th>Início</th><th>Fim</th><th>Status</th><th></th></tr></thead><tbody id="horarios-tbody"></tbody></table></div>`;
  panel.querySelector("#add-horario").onclick = () => {
    state.horarios.push({ id: uid(), ofertaId: "", dia: "Segunda", turno: "Manhã", inicio: "08:00", fim: "10:00" });
    render();
  };
  const tbody = panel.querySelector("#horarios-tbody");
  tbody.innerHTML = "";
  state.horarios.forEach((horario) => {
    const info = conflictMap.get(horario.id);
    const oferta = state.oferta.find((o) => o.id === horario.ofertaId);
    const docentesTexto = (getOfertaDocentes(oferta) || []).map((id) => state.docentes.find((d) => d.id === id)?.nome).filter(Boolean).join(", ");
    const turma = getOfertaTurma(oferta);
    let badge = '<span class="badge ok">OK</span>';
    if (info?.docenteConflict && info?.turmaConflict) badge = '<span class="badge bad">Docente + Turma</span>';
    else if (info?.docenteConflict) badge = '<span class="badge bad">Docente</span>';
    else if (info?.turmaConflict) badge = '<span class="badge warn">Turma</span>';
    const row = document.createElement("tr");
    row.innerHTML = `<td><select data-field="ofertaId"><option value="">Selecione</option>${ofertaveis.map((item) => `<option value="${item.id}" ${horario.ofertaId === item.id ? "selected" : ""}>${item.periodo} - ${item.nome}</option>`).join("")}</select></td>
      <td>${turma || "-"}</td>
      <td>${docentesTexto || "<span class='small'>Sem docentes vinculados</span>"}</td>
      <td><select data-field="dia">${dias.map((dia) => `<option value="${dia}" ${horario.dia === dia ? "selected" : ""}>${dia}</option>`).join("")}</select></td>
      <td><select data-field="turno">${turnos.map((turno) => `<option value="${turno}" ${horario.turno === turno ? "selected" : ""}>${turno}</option>`).join("")}</select></td>
      <td><input type="time" data-field="inicio" value="${horario.inicio || "08:00"}" /></td>
      <td><input type="time" data-field="fim" value="${horario.fim || "10:00"}" /></td>
      <td>${badge}</td>
      <td><button data-remove>Excluir</button></td>`;
    row.querySelectorAll("[data-field]").forEach((input) => input.addEventListener((input.type === "time" || input.tagName === "SELECT") ? "change" : "input", () => {
      horario[input.dataset.field] = input.value;
      render();
    }));
    row.querySelector("[data-remove]").onclick = () => {
      state.horarios = state.horarios.filter((item) => item.id !== horario.id);
      render();
    };
    tbody.appendChild(row);
  });
}

function renderGradePanel(render) {
  const panel = document.getElementById("panel-grade");
  const filteredHorarios = state.horarios.filter((item) => {
    const oferta = state.oferta.find((o) => o.id === item.ofertaId);
    if (state.gradeFilters.view === "turma") return !state.gradeFilters.turma || getOfertaTurma(oferta) === state.gradeFilters.turma;
    return !state.gradeFilters.docente || getOfertaDocentes(oferta).includes(state.gradeFilters.docente);
  });
  const turmas = [...new Set(state.oferta.map((o) => o.periodo).filter(Boolean))];
  panel.innerHTML = `<div class="bar"><h2>Grade semanal</h2>
    <div class="filters">
      <div><label>Visualizar por</label><select id="grade-view"><option value="turma" ${state.gradeFilters.view === "turma" ? "selected" : ""}>Turma</option><option value="docente" ${state.gradeFilters.view === "docente" ? "selected" : ""}>Docente</option></select></div>
      <div id="filter-turma-wrap"><label>Turma</label><select id="grade-turma"><option value="">Todas</option>${turmas.map((turma) => `<option value="${turma}" ${state.gradeFilters.turma === turma ? "selected" : ""}>${turma}</option>`).join("")}</select></div>
      <div id="filter-docente-wrap"><label>Docente</label><select id="grade-docente"><option value="">Todos</option>${state.docentes.map((docente) => `<option value="${docente.id}" ${state.gradeFilters.docente === docente.id ? "selected" : ""}>${docente.nome || "(sem nome)"}</option>`).join("")}</select></div>
    </div>
  </div>
  <div class="help">A grade usa a disciplina para descobrir turma e docentes automaticamente.</div>
  <div class="card"><table class="grade-table"><thead><tr><th>Turno</th>${dias.map((dia) => `<th>${dia}</th>`).join("")}</tr></thead><tbody>
    ${turnos.map((turno) => `<tr><th>${turno}</th>${dias.map((dia) => `<td class="grade-cell">${filteredHorarios.filter((item) => item.turno === turno && item.dia === dia).map((item) => renderGradeSlot(item)).join("")}</td>`).join("")}</tr>`).join("")}
  </tbody></table></div>`;
  panel.querySelector("#grade-view").onchange = (e) => { state.gradeFilters.view = e.target.value; render(); };
  panel.querySelector("#grade-turma").onchange = (e) => { state.gradeFilters.turma = e.target.value; render(); };
  panel.querySelector("#grade-docente").onchange = (e) => { state.gradeFilters.docente = e.target.value; render(); };
  panel.querySelector("#filter-turma-wrap").style.display = state.gradeFilters.view === "turma" ? "block" : "none";
  panel.querySelector("#filter-docente-wrap").style.display = state.gradeFilters.view === "docente" ? "block" : "none";
}

function renderRelatoriosPanel(render) {
  const panel = document.getElementById("panel-relatorios");
  const resumo = state.docentes.map((docente) => ({ id: docente.id, ...calcResumoDocente(docente, state) }));
  const selectedDocente = state.reportDocenteId || (state.docentes[0]?.id || "");
  const selectedPeriodo = state.reportPeriodo || "P2";
  const resumoDocente = resumo.find(r => r.id === selectedDocente);
  const salaDetalhada = buildSalaAulaDetalhada();
  const periodos = [...new Set(state.oferta.map(o => o.periodo).filter(Boolean))];
  panel.innerHTML = `<div class="bar"><h2>Relatórios</h2></div>
    <div class="card" style="margin-bottom:.8rem" id="rel-docente">
      <div class="bar"><h3>Quadro resumo por docente</h3><div style="display:flex; gap:.5rem; min-width:420px"><select id="report-docente">${state.docentes.map(d => `<option value="${d.id}">${d.nome || "(sem nome)"}</option>`).join("")}</select><button id="export-docente">CSV</button><button id="print-docente">Imprimir</button></div></div>
      ${resumoDocente ? `<table><thead><tr><th>Docente</th><th>Sala</th><th>Regência</th><th>Pesquisa</th><th>Extensão</th><th>Ensino</th><th>Orient. TCC</th><th>Orient. PIBIC</th><th>Coord. PIBIC</th><th>Comissões</th><th>Função</th><th>Total</th></tr></thead><tbody><tr><td>${resumoDocente.docente}</td><td>${resumoDocente.sala}</td><td>${resumoDocente.regencia}</td><td>${resumoDocente.pesquisa}</td><td>${resumoDocente.extensao}</td><td>${resumoDocente.ensino}</td><td>${resumoDocente.orientTcc}</td><td>${resumoDocente.orientPibic}</td><td>${resumoDocente.coordProjetoPibic}</td><td>${resumoDocente.comissoes}</td><td>${resumoDocente.funcao}</td><td><strong>${resumoDocente.total}</strong></td></tr></tbody></table>` : '<div class="small">Sem docente selecionado.</div>'}
    </div>
    <div class="card" style="margin-bottom:.8rem" id="rel-todos"><div class="bar"><h3>Quadro resumo de todos os docentes</h3><div style="display:flex; gap:.5rem"><button id="export-todos">CSV</button><button id="print-todos">Imprimir</button></div></div>
      <table><thead><tr><th>Docente</th><th>Sala</th><th>Regência</th><th>Pesquisa</th><th>Extensão</th><th>Ensino</th><th>Orient.</th><th>Comissões</th><th>Função</th><th>Total</th><th>Status</th></tr></thead><tbody>${resumo.map(r => `<tr><td>${r.docente}</td><td>${r.sala}</td><td>${r.regencia}</td><td>${r.pesquisa}</td><td>${r.extensao}</td><td>${r.ensino}</td><td>${r.orientTotal}</td><td>${r.comissoes}</td><td>${r.funcao}</td><td><strong>${r.total}</strong></td><td><span class="badge ${r.status === "Atende mínimo" ? "ok" : "bad"}">${r.status}</span></td></tr>`).join("")}</tbody></table>
    </div>
    <div class="card" style="margin-bottom:.8rem" id="rel-sala"><div class="bar"><h3>Quadro só sala de aula</h3><div style="display:flex; gap:.5rem"><button id="export-sala">CSV</button><button id="print-sala">Imprimir</button></div></div>
      <table><thead><tr><th>Docente</th><th>Disciplinas</th><th>CH sala de aula</th></tr></thead><tbody>${salaDetalhada.map(r => `<tr><td>${r.docente}</td><td>${r.disciplinas}</td><td><strong>${r.sala}</strong></td></tr>`).join("")}</tbody></table>
    </div>
    <div class="card" id="rel-horario-semestre"><div class="bar"><h3>Quadro de horários por semestre</h3><div style="display:flex; gap:.5rem; min-width:320px"><select id="report-periodo">${periodos.map(p => `<option value="${p}">${p}</option>`).join("")}</select><button id="export-horario-semestre">CSV</button><button id="print-horario-semestre">Imprimir</button></div></div>${renderHorarioPorSemestre(selectedPeriodo)}</div>`;
  panel.querySelector("#report-docente").value = selectedDocente;
  panel.querySelector("#report-periodo").value = selectedPeriodo;
  panel.querySelector("#report-docente").onchange = (e) => { state.reportDocenteId = e.target.value; render(); };
  panel.querySelector("#report-periodo").onchange = (e) => { state.reportPeriodo = e.target.value; render(); };
  panel.querySelector("#export-docente").onclick = () => exportResumoDocente(resumoDocente);
  panel.querySelector("#print-docente").onclick = () => printSection("rel-docente", "Quadro resumo por docente");
  panel.querySelector("#export-todos").onclick = () => exportResumoTodos(resumo);
  panel.querySelector("#print-todos").onclick = () => printSection("rel-todos", "Quadro resumo de todos os docentes");
  panel.querySelector("#export-sala").onclick = () => exportSalaAula(salaDetalhada);
  panel.querySelector("#print-sala").onclick = () => printSection("rel-sala", "Quadro só sala de aula");
  panel.querySelector("#export-horario-semestre").onclick = () => exportHorarioSemestre(selectedPeriodo);
  panel.querySelector("#print-horario-semestre").onclick = () => printSection("rel-horario-semestre", `Quadro de horários - ${selectedPeriodo}`);
}

function buildSalaAulaDetalhada() {
  return state.docentes.map(docente => {
    const linhas = [];
    let sala = 0;
    state.oferta.forEach(oferta => {
      const carga = calcDisciplinaParaDocente(oferta, docente.id);
      if (!carga.sala) return;
      sala += carga.sala;
      linhas.push(`${oferta.periodo} - ${oferta.nome} (${carga.sala})`);
    });
    return { docente: docente.nome, disciplinas: linhas.join("; "), sala };
  });
}

function renderHorarioPorSemestre(periodo) {
  const horarios = state.horarios.filter(h => {
    const oferta = state.oferta.find(o => o.id === h.ofertaId);
    return oferta && oferta.periodo === periodo;
  }).sort((a,b)=> `${a.dia}-${a.turno}-${a.inicio}`.localeCompare(`${b.dia}-${b.turno}-${b.inicio}`));
  if (!horarios.length) return '<div class="small">Sem horários cadastrados para este semestre.</div>';
  return `<table><thead><tr><th>Dia</th><th>Turno</th><th>Início</th><th>Fim</th><th>Disciplina</th><th>Docentes</th><th>Turma</th></tr></thead><tbody>${horarios.map(h => {
    const oferta = state.oferta.find(o => o.id === h.ofertaId);
    const docentes = (getOfertaDocentes(oferta) || []).map(id => state.docentes.find(d => d.id === id)?.nome).filter(Boolean).join(", ");
    return `<tr><td>${h.dia}</td><td>${h.turno}</td><td>${h.inicio}</td><td>${h.fim}</td><td>${oferta ? oferta.nome : ""}</td><td>${docentes}</td><td>${getOfertaTurma(oferta) || ""}</td></tr>`;
  }).join("")}</tbody></table>`;
}

function printSection(sectionId, title) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  const html = `<html><head><meta charset="utf-8" /><title>${title}</title><style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
    .header { margin-bottom: 18px; }
    .header-top { display:flex; align-items:center; gap:16px; }
    .print-logo { width:90px; height:auto; }
    .header .inst { font-size: 12px; font-weight: 700; }
    .header .unit { font-size: 12px; margin-top: 2px; }
    .header .title { font-size: 18px; font-weight: 700; margin-top: 10px; }
    .header .subtitle { font-size: 12px; margin-top: 4px; color: #374151; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: top; }
    th { background: #f8fafc; text-align: left; }
    .bar button, .bar select { display: none !important; }
    .badge { padding: 2px 6px; border-radius: 999px; border: 1px solid #cbd5e1; }
  </style></head><body>
    <div class="header"><div class="header-top"><img src="./uern_logo.png" alt="Logo UERN" class="print-logo" /><div><div class="inst">UNIVERSIDADE DO ESTADO DO RIO GRANDE DO NORTE</div><div class="unit">Campus Caicó — Curso de Enfermagem</div><div class="title">${title}</div><div class="subtitle">Distribuição de carga horária docente</div></div></div></div>
    ${section.innerHTML}</body></html>`;
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.open(); win.document.write(html); win.document.close(); win.focus(); win.print();
}

function toCsv(rows) {
  return rows.map(row => row.map(cell => {
    const value = String(cell ?? "");
    const escaped = value.replace(/"/g, '""');
    return /[",;\n]/.test(escaped) ? `"${escaped}"` : escaped;
  }).join(";")).join("\n");
}
function downloadCsv(filename, rows) {
  const csv = "\uFEFF" + toCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
function exportResumoDocente(docenteResumo) {
  if (!docenteResumo) return;
  downloadCsv("quadro_resumo_docente.csv", [["Docente","Sala","Regência","Pesquisa","Extensão","Ensino","Orient. TCC","Orient. PIBIC","Coord. PIBIC","Comissões","Função","Total"], [docenteResumo.docente, docenteResumo.sala, docenteResumo.regencia, docenteResumo.pesquisa, docenteResumo.extensao, docenteResumo.ensino, docenteResumo.orientTcc, docenteResumo.orientPibic, docenteResumo.coordProjetoPibic, docenteResumo.comissoes, docenteResumo.funcao, docenteResumo.total]]);
}
function exportResumoTodos(resumo) {
  downloadCsv("quadro_resumo_todos_docentes.csv", [["Docente","Sala","Regência","Pesquisa","Extensão","Ensino","Orientações","Comissões","Função","Total","Status"], ...resumo.map(r => [r.docente, r.sala, r.regencia, r.pesquisa, r.extensao, r.ensino, r.orientTotal, r.comissoes, r.funcao, r.total, r.status])]);
}
function exportSalaAula(salaDetalhada) {
  downloadCsv("quadro_sala_aula.csv", [["Docente","Disciplinas","CH sala de aula"], ...salaDetalhada.map(r => [r.docente, r.disciplinas, r.sala])]);
}
function exportHorarioSemestre(periodo) {
  const horarios = state.horarios.filter(h => {
    const oferta = state.oferta.find(o => o.id === h.ofertaId);
    return oferta && oferta.periodo === periodo;
  }).sort((a,b)=> `${a.dia}-${a.turno}-${a.inicio}`.localeCompare(`${b.dia}-${b.turno}-${b.inicio}`));
  const rows = [["Dia","Turno","Início","Fim","Disciplina","Docentes","Turma"]];
  horarios.forEach(h => {
    const oferta = state.oferta.find(o => o.id === h.ofertaId);
    const docentes = (getOfertaDocentes(oferta) || []).map(id => state.docentes.find(d => d.id === id)?.nome).filter(Boolean).join(", ");
    rows.push([h.dia, h.turno, h.inicio, h.fim, oferta ? oferta.nome : "", docentes, getOfertaTurma(oferta) || ""]);
  });
  downloadCsv(`quadro_horarios_${periodo}.csv`, rows);
}
function renderGradeSlot(item) {
  const oferta = state.oferta.find((x) => x.id === item.ofertaId);
  const docentes = (getOfertaDocentes(oferta) || []).map(id => state.docentes.find(d => d.id === id)?.nome).filter(Boolean).join(", ");
  const disciplina = oferta ? `${oferta.periodo} - ${oferta.nome}` : "Sem disciplina";
  return `<div class="slot-card"><div class="slot-title">${item.inicio}–${item.fim}</div><div class="slot-sub">${disciplina}</div><div class="slot-sub">${docentes || "Sem docentes"}</div><div class="slot-sub">Turma: ${getOfertaTurma(oferta) || "-"}</div></div>`;
}
