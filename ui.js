import { downloadCsv, uid } from "./helpers.js";
import { calcDisciplinaParaDocente, calcResumoDocente, detectHorarioConflicts } from "./rules.js";
import { addOfertaFromCatalogo, addPeriodoFromCatalogo, saveState, state, syncAtividades } from "./state.js";

const tabs = [
  { key: "docentes", label: "Docentes" },
  { key: "oferta", label: "Oferta 26.1" },
  { key: "atividades", label: "Atividades" },
  { key: "resumo", label: "Resumo" },
  { key: "horarios", label: "Horários" },
  { key: "grade", label: "Grade semanal" },
  { key: "relatorios", label: "Relatórios" },
];
const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const turnos = ["Manhã", "Tarde", "Noite"];

export function renderApp(render) {
  renderTabs();
  renderDocentes(render);
  renderOferta(render);
  renderAtividades(render);
  renderResumo(render);
  renderHorarios(render);
  renderGrade(render);
  renderRelatorios(render);
}

function rerender(render) {
  syncAtividades();
  saveState();
  render();
}

function activateTab(key) {
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === key));
  document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.id === `panel-${key}`));
}

function renderTabs() {
  const nav = document.getElementById("tabs");
  nav.innerHTML = tabs.map((tab, i) => `<button class="tab ${i === 0 ? "active" : ""}" data-tab="${tab.key}">${tab.label}</button>`).join("");
  nav.querySelectorAll(".tab").forEach((btn) => btn.onclick = () => activateTab(btn.dataset.tab));
}

function renderChoiceWrap(selectedIds) {
  return `<div class="choice-wrap">${state.docentes.map((docente) => `
    <label class="choice">
      <input type="checkbox" data-docente="${docente.id}" ${selectedIds.includes(docente.id) ? "checked" : ""} />
      <span>${docente.nome || "(sem nome)"}</span>
    </label>`).join("")}</div>`;
}

function renderDocentes(render) {
  const panel = document.getElementById("panel-docentes");
  panel.innerHTML = `<div class="bar"><h2>Docentes</h2><button id="add-docente">Adicionar docente</button></div>
    <div class="card"><table><thead><tr><th>Nome</th><th>Regime</th><th>Mínimo sala</th><th>Função</th><th>CH função</th><th></th></tr></thead><tbody>
      ${state.docentes.map((docente, i) => `
        <tr>
          <td><input data-i="${i}" data-f="nome" value="${docente.nome || ""}" /></td>
          <td>
            <select data-i="${i}" data-f="regime">
              <option value="20h" ${docente.regime === "20h" ? "selected" : ""}>20h</option>
              <option value="40h" ${docente.regime === "40h" ? "selected" : ""}>40h</option>
              <option value="DE" ${docente.regime === "DE" ? "selected" : ""}>DE</option>
            </select>
          </td>
          <td><input type="number" data-i="${i}" data-f="minimoSala" value="${docente.minimoSala}" /></td>
          <td><input data-i="${i}" data-f="funcao" value="${docente.funcao || ""}" /></td>
          <td><input type="number" data-i="${i}" data-f="chFuncao" value="${docente.chFuncao || 0}" /></td>
          <td><button data-del="${i}">Excluir</button></td>
        </tr>`).join("")}
    </tbody></table></div>`;

  panel.querySelector("#add-docente").onclick = () => {
    state.docentes.push({ id: uid(), nome: "", regime: "40h", minimoSala: 12, funcao: "", chFuncao: 0 });
    syncAtividades();
    rerender(render);
  };

  panel.querySelectorAll("[data-f]").forEach((el) => {
    const evt = el.tagName === "SELECT" || el.type === "number" ? "change" : "input";
    el.addEventListener(evt, () => {
      const docente = state.docentes[Number(el.dataset.i)];
      docente[el.dataset.f] = el.type === "number" ? Number(el.value) : el.value;
      rerender(render);
    });
  });

  panel.querySelectorAll("[data-del]").forEach((btn) => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.del);
      const docenteId = state.docentes[idx].id;
      state.docentes.splice(idx, 1);
      state.oferta.forEach((oferta) => {
        oferta.docentes = (oferta.docentes || []).filter((id) => id !== docenteId);
      });
      syncAtividades();
      rerender(render);
    };
  });
}

function renderOferta(render) {
  const panel = document.getElementById("panel-oferta");
  const periodos = [...new Set(state.catalogo.map((c) => c.periodo))];
  panel.innerHTML = `<div class="bar"><h2>Oferta 26.1</h2></div>
    <div class="help">Sem CH de orientação e sem semanas na visualização. UCE conta 1h de sala. Disciplinas especiais individuais contam 50%. Em UCE ou especial, você pode renomear a disciplina livremente.</div>
    <div class="card" style="margin-bottom:.8rem"><div class="grid">
      <div><label>Adicionar disciplina do catálogo</label><select id="sel-disciplina"><option value="">Selecione</option>
        ${state.catalogo.map((comp) => `<option value="${comp.codigo}">${comp.periodo} — ${comp.codigo} — ${comp.nome}</option>`).join("")}
      </select></div>
      <div class="inline-actions"><button id="btn-add-disciplina">Adicionar disciplina</button></div>
      <div><label>Adicionar período inteiro</label><select id="sel-periodo"><option value="">Selecione</option>
        ${periodos.map((p) => `<option value="${p}">${p}</option>`).join("")}
      </select></div>
      <div class="inline-actions"><button id="btn-add-periodo">Adicionar período</button></div>
    </div></div>
    <div class="bar"><button id="btn-add-manual">Adicionar disciplina manual</button></div>
    <div class="card"><table><thead><tr><th>Período</th><th>Tipo</th><th>Especial</th><th>Código</th><th>Disciplina</th><th>CH Teórica</th><th>CH Prática</th><th>Docentes</th><th></th></tr></thead><tbody>
      ${state.oferta.map((oferta, i) => `
        <tr>
          <td><input data-i="${i}" data-f="periodo" value="${oferta.periodo || ""}" /></td>
          <td><select data-i="${i}" data-f="tipo">
            <option value="obrigatoria" ${oferta.tipo === "obrigatoria" ? "selected" : ""}>Obrigatória</option>
            <option value="optativa" ${oferta.tipo === "optativa" ? "selected" : ""}>Optativa</option>
            <option value="especial" ${oferta.tipo === "especial" ? "selected" : ""}>Especial</option>
          </select></td>
          <td><select data-i="${i}" data-f="especial">
            <option value="nao" ${oferta.especial === "nao" ? "selected" : ""}>Não</option>
            <option value="individual" ${oferta.especial === "individual" ? "selected" : ""}>Individual (50%)</option>
            <option value="turma" ${oferta.especial === "turma" ? "selected" : ""}>Turma especial (100%)</option>
          </select></td>
          <td><input data-i="${i}" data-f="codigo" value="${oferta.codigo || ""}" /></td>
          <td><input data-i="${i}" data-f="nome" value="${oferta.nome || ""}" /></td>
          <td><input type="number" data-i="${i}" data-f="teorica" value="${oferta.teorica || 0}" /></td>
          <td><input type="number" data-i="${i}" data-f="pratica" value="${oferta.pratica || 0}" /></td>
          <td>${renderChoiceWrap(oferta.docentes || [])}</td>
          <td><button data-del="${i}">Excluir</button></td>
        </tr>`).join("")}
    </tbody></table></div>`;

  panel.querySelector("#btn-add-disciplina").onclick = () => {
    const codigo = panel.querySelector("#sel-disciplina").value;
    if (!codigo) return;
    addOfertaFromCatalogo(codigo);
    rerender(render);
  };
  panel.querySelector("#btn-add-periodo").onclick = () => {
    const periodo = panel.querySelector("#sel-periodo").value;
    if (!periodo) return;
    addPeriodoFromCatalogo(periodo);
    rerender(render);
  };
  panel.querySelector("#btn-add-manual").onclick = () => {
    state.oferta.push({
      id: uid(), periodo: "", tipo: "obrigatoria", especial: "nao", codigo: "", nome: "",
      teorica: 0, pratica: 0, total: 0, semanas: 15, docentes: [],
    });
    rerender(render);
  };

  panel.querySelectorAll("[data-f]").forEach((el) => {
    const evt = el.tagName === "SELECT" || el.type === "number" ? "change" : "input";
    el.addEventListener(evt, () => {
      const oferta = state.oferta[Number(el.dataset.i)];
      oferta[el.dataset.f] = el.type === "number" ? Number(el.value) : el.value;
      rerender(render);
    });
  });

  panel.querySelectorAll("[data-del]").forEach((btn) => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.del);
      const ofertaId = state.oferta[idx].id;
      state.oferta.splice(idx, 1);
      state.horarios = state.horarios.filter((h) => h.ofertaId !== ofertaId);
      rerender(render);
    };
  });

  panel.querySelectorAll(".choice input").forEach((cb) => {
    cb.onchange = () => {
      const tr = cb.closest("tr");
      const idx = [...tr.parentNode.children].indexOf(tr);
      const oferta = state.oferta[idx];
      const docenteId = cb.dataset.docente;
      oferta.docentes = oferta.docentes || [];
      if (cb.checked && !oferta.docentes.includes(docenteId)) oferta.docentes.push(docenteId);
      if (!cb.checked) oferta.docentes = oferta.docentes.filter((id) => id !== docenteId);
      rerender(render);
    };
  });
}

function renderAtividades(render) {
  const panel = document.getElementById("panel-atividades");
  panel.innerHTML = `<div class="bar"><h2>Atividades por docente</h2></div>
    <div class="help">Monitoria incluída. Extensão: coordenação 8h por ação, membro 4h por ação. Grupo de pesquisa: membro 1h, líder 2h.</div>
    <div class="grid">
      ${state.docentes.map((docente) => {
        const acts = state.atividades[docente.id];
        return `<div class="doc-card">
          <h3>${docente.nome || "(sem nome)"}</h3>
          <div class="grid">
            <label><input type="checkbox" data-doc="${docente.id}" data-f="projetoPesquisa" ${acts.projetoPesquisa ? "checked" : ""}> Projeto de pesquisa</label>
            <label><input type="checkbox" data-doc="${docente.id}" data-f="projetoEnsino" ${acts.projetoEnsino ? "checked" : ""}> Projeto de ensino</label>
            <label><input type="checkbox" data-doc="${docente.id}" data-f="coordProjetoPibic" ${acts.coordProjetoPibic ? "checked" : ""}> Coordenação PIBIC</label>
            <div><label>Monitoria</label><input type="number" data-doc="${docente.id}" data-f="monitoria" value="${acts.monitoria || 0}"></div>
            <div><label>Extensão coordenação</label><input type="number" data-doc="${docente.id}" data-f="extensaoCoordenacaoQtd" value="${acts.extensaoCoordenacaoQtd || 0}"></div>
            <div><label>Extensão membro</label><input type="number" data-doc="${docente.id}" data-f="extensaoMembroQtd" value="${acts.extensaoMembroQtd || 0}"></div>
            <label><input type="checkbox" data-doc="${docente.id}" data-f="grupoPesquisaMembro" ${acts.grupoPesquisaMembro ? "checked" : ""}> Grupo pesquisa membro</label>
            <label><input type="checkbox" data-doc="${docente.id}" data-f="grupoPesquisaLider" ${acts.grupoPesquisaLider ? "checked" : ""}> Grupo pesquisa líder</label>
            <div><label>NDE</label><select data-doc="${docente.id}" data-f="nde">
              <option value="none" ${acts.nde === "none" ? "selected" : ""}>Não</option>
              <option value="membro" ${acts.nde === "membro" ? "selected" : ""}>Membro</option>
              <option value="coordenacao" ${acts.nde === "coordenacao" ? "selected" : ""}>Coordenação</option>
            </select></div>
            <label><input type="checkbox" data-doc="${docente.id}" data-f="fiel" ${acts.fiel ? "checked" : ""}> FIEL</label>
            <label><input type="checkbox" data-doc="${docente.id}" data-f="fieb" ${acts.fieb ? "checked" : ""}> FIEB</label>
            <label><input type="checkbox" data-doc="${docente.id}" data-f="comiteEtica" ${acts.comiteEtica ? "checked" : ""}> Comitê de Ética</label>
            <div><label>Orientações TCC</label><input type="number" data-doc="${docente.id}" data-f="orientacoesTcc" value="${acts.orientacoesTcc || 0}"></div>
            <div><label>Orientações PIBIC</label><input type="number" data-doc="${docente.id}" data-f="orientacoesPibic" value="${acts.orientacoesPibic || 0}"></div>
          </div>
        </div>`;
      }).join("")}
    </div>`;

  panel.querySelectorAll("[data-f]").forEach((el) => {
    const evt = el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, () => {
      const atividade = state.atividades[el.dataset.doc];
      atividade[el.dataset.f] = el.type === "checkbox" ? el.checked : (el.tagName === "SELECT" ? el.value : Number(el.value));
      rerender(render);
    });
  });
}

function renderResumo(render) {
  const panel = document.getElementById("panel-resumo");
  if (!state.reportDocenteId && state.docentes[0]?.id) {
    state.reportDocenteId = state.docentes[0].id;
  }
  const docente = state.docentes.find((d) => d.id === state.reportDocenteId);
  const resumo = docente ? calcResumoDocente(docente, state) : null;
  panel.innerHTML = `<div class="bar"><h2>Resumo individual por docente</h2><div style="min-width:280px">
      <select id="sel-doc-resumo">${state.docentes.map((doc) => `<option value="${doc.id}" ${state.reportDocenteId === doc.id ? "selected" : ""}>${doc.nome || "(sem nome)"}</option>`).join("")}</select>
    </div></div>
    ${resumo ? `
      <div class="resumo-cards">
        <div class="resumo-card"><h3>Ensino</h3><p>Sala de aula: <strong>${resumo.sala}</strong></p><p>Regência: <strong>${resumo.regencia}</strong></p><p>Ensino complementar: <strong>${resumo.ensino}</strong></p></div>
        <div class="resumo-card"><h3>Pesquisa</h3><p>Pesquisa: <strong>${resumo.pesquisa}</strong></p><p>Orient. TCC: <strong>${resumo.orientTcc}</strong></p><p>Orient. PIBIC: <strong>${resumo.orientPibic}</strong></p><p>Coord. PIBIC: <strong>${resumo.coordProjetoPibic}</strong></p></div>
        <div class="resumo-card"><h3>Extensão</h3><p><strong>${resumo.extensao}</strong></p></div>
        <div class="resumo-card"><h3>Comissões</h3><p><strong>${resumo.comissoes}</strong></p></div>
        <div class="resumo-card destaque"><h3>Total</h3><p><strong>${resumo.total}</strong></p></div>
      </div>` : `<div class="small">Selecione um docente.</div>`}`;
  panel.querySelector("#sel-doc-resumo").onchange = (e) => {
    state.reportDocenteId = e.target.value;
    rerender(render);
  };
}

function renderHorarios(render) {
  const panel = document.getElementById("panel-horarios");
  const conflicts = new Map(detectHorarioConflicts(state).map((item) => [item.id, item]));
  const ofertaveis = state.oferta.filter((oferta) => !(oferta.tipo === "especial" && oferta.especial === "individual"));
  panel.innerHTML = `<div class="bar"><h2>Horários</h2><button id="btn-add-horario">Adicionar bloco</button></div>
    <div class="help">Escolha a disciplina. A turma e os docentes são puxados automaticamente da oferta.</div>
    <div class="card"><table><thead><tr><th>Disciplina</th><th>Turma</th><th>Docentes</th><th>Dia</th><th>Turno</th><th>Início</th><th>Fim</th><th>Status</th><th></th></tr></thead><tbody>
      ${state.horarios.map((horario, i) => {
        const oferta = state.oferta.find((o) => o.id === horario.ofertaId);
        const docentes = (oferta?.docentes || []).map((id) => state.docentes.find((d) => d.id === id)?.nome).filter(Boolean).join(", ");
        const conflict = conflicts.get(horario.id);
        let badge = `<span class="badge ok">OK</span>`;
        if (conflict?.docenteConflict && conflict?.turmaConflict) badge = `<span class="badge bad">Docente + Turma</span>`;
        else if (conflict?.docenteConflict) badge = `<span class="badge bad">Docente</span>`;
        else if (conflict?.turmaConflict) badge = `<span class="badge warn">Turma</span>`;
        return `<tr>
          <td><select data-i="${i}" data-f="ofertaId"><option value="">Selecione</option>${ofertaveis.map((of) => `<option value="${of.id}" ${horario.ofertaId === of.id ? "selected" : ""}>${of.periodo} - ${of.nome}</option>`).join("")}</select></td>
          <td>${oferta?.periodo || ""}</td>
          <td>${docentes}</td>
          <td><select data-i="${i}" data-f="dia">${dias.map((dia) => `<option value="${dia}" ${horario.dia === dia ? "selected" : ""}>${dia}</option>`).join("")}</select></td>
          <td><select data-i="${i}" data-f="turno">${turnos.map((turno) => `<option value="${turno}" ${horario.turno === turno ? "selected" : ""}>${turno}</option>`).join("")}</select></td>
          <td><input type="time" data-i="${i}" data-f="inicio" value="${horario.inicio}" /></td>
          <td><input type="time" data-i="${i}" data-f="fim" value="${horario.fim}" /></td>
          <td>${badge}</td>
          <td><button data-del="${i}">Excluir</button></td>
        </tr>`;
      }).join("")}
    </tbody></table></div>`;

  panel.querySelector("#btn-add-horario").onclick = () => {
    state.horarios.push({
      id: uid(),
      ofertaId: "",
      dia: "Segunda",
      turno: "Manhã",
      inicio: "08:00",
      fim: "10:00",
    });
    rerender(render);
  };

  panel.querySelectorAll("[data-f]").forEach((el) => {
    el.onchange = () => {
      const horario = state.horarios[Number(el.dataset.i)];
      horario[el.dataset.f] = el.value;
      rerender(render);
    };
  });

  panel.querySelectorAll("[data-del]").forEach((btn) => {
    btn.onclick = () => {
      state.horarios.splice(Number(btn.dataset.del), 1);
      rerender(render);
    };
  });
}

function renderGrade(render) {
  const panel = document.getElementById("panel-grade");
  const filtered = state.horarios.filter((horario) => {
    const oferta = state.oferta.find((o) => o.id === horario.ofertaId);
    if (!oferta) return false;
    if (state.gradeFilters.view === "turma") {
      return !state.gradeFilters.turma || oferta.periodo === state.gradeFilters.turma;
    }
    return !state.gradeFilters.docente || (oferta.docentes || []).includes(state.gradeFilters.docente);
  });

  panel.innerHTML = `<div class="bar"><h2>Grade semanal</h2>
    <div class="filters">
      <div><label>Visualizar por</label><select id="grade-view">
        <option value="turma" ${state.gradeFilters.view === "turma" ? "selected" : ""}>Turma</option>
        <option value="docente" ${state.gradeFilters.view === "docente" ? "selected" : ""}>Docente</option>
      </select></div>
      <div id="filter-turma-wrap"><label>Turma</label><select id="grade-turma">
        <option value="">Todas</option>
        ${[...new Set(state.oferta.map((o) => o.periodo).filter(Boolean))].map((turma) => `<option value="${turma}" ${state.gradeFilters.turma === turma ? "selected" : ""}>${turma}</option>`).join("")}
      </select></div>
      <div id="filter-docente-wrap"><label>Docente</label><select id="grade-docente">
        <option value="">Todos</option>
        ${state.docentes.map((doc) => `<option value="${doc.id}" ${state.gradeFilters.docente === doc.id ? "selected" : ""}>${doc.nome || "(sem nome)"}</option>`).join("")}
      </select></div>
    </div></div>
    <div class="card"><table class="grade-table"><thead><tr><th>Turno</th>${dias.map((d) => `<th>${d}</th>`).join("")}</tr></thead><tbody>
      ${turnos.map((turno) => `
        <tr>
          <th>${turno}</th>
          ${dias.map((dia) => {
            const blocos = filtered.filter((h) => h.turno === turno && h.dia === dia);
            return `<td class="grade-cell">${blocos.map((horario) => {
              const oferta = state.oferta.find((o) => o.id === horario.ofertaId);
              const docentes = (oferta?.docentes || []).map((id) => state.docentes.find((d) => d.id === id)?.nome).filter(Boolean).join(", ");
              return `<div class="slot-card"><div class="slot-title">${horario.inicio}–${horario.fim}</div><div class="slot-sub">${oferta ? `${oferta.periodo} - ${oferta.nome}` : ""}</div><div class="slot-sub">${docentes}</div></div>`;
            }).join("")}</td>`;
          }).join("")}
        </tr>`).join("")}
    </tbody></table></div>`;

  panel.querySelector("#grade-view").onchange = (e) => {
    state.gradeFilters.view = e.target.value;
    rerender(render);
  };
  panel.querySelector("#grade-turma").onchange = (e) => {
    state.gradeFilters.turma = e.target.value;
    rerender(render);
  };
  panel.querySelector("#grade-docente").onchange = (e) => {
    state.gradeFilters.docente = e.target.value;
    rerender(render);
  };

  panel.querySelector("#filter-turma-wrap").style.display = state.gradeFilters.view === "turma" ? "block" : "none";
  panel.querySelector("#filter-docente-wrap").style.display = state.gradeFilters.view === "docente" ? "block" : "none";
}

function buildSalaAulaDetalhada() {
  return state.docentes.map((docente) => {
    let sala = 0;
    const linhas = [];
    state.oferta.forEach((oferta) => {
      if (!(oferta.docentes || []).includes(docente.id)) return;
      const resumo = calcDisciplinaParaDocente(oferta, docente.id);
      sala += resumo.sala;
      linhas.push(`${oferta.periodo} - ${oferta.nome} (${resumo.sala})`);
    });
    return { docente: docente.nome, disciplinas: linhas.join("; "), sala };
  });
}

function gerarPdfTabela(title, head, body, filename) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(13);
  doc.text("UNIVERSIDADE DO ESTADO DO RIO GRANDE DO NORTE", 14, 14);
  doc.setFontSize(11);
  doc.text("Campus Caicó — Curso de Enfermagem", 14, 21);
  doc.setFontSize(12);
  doc.text(title, 14, 30);

  doc.autoTable({
    startY: 36,
    head,
    body,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [36, 87, 197] },
  });

  doc.save(filename);
}

function renderRelatorios(render) {
  const panel = document.getElementById("panel-relatorios");
  const resumo = state.docentes.map((docente) => ({ id: docente.id, ...calcResumoDocente(docente, state) }));
  const salaDetalhada = buildSalaAulaDetalhada();
  const selectedDocente = state.reportDocenteId || state.docentes[0]?.id || "";
  const resumoDocente = resumo.find((r) => r.id === selectedDocente);
  const periodos = [...new Set(state.oferta.map((o) => o.periodo).filter(Boolean))];
  const periodo = state.reportPeriodo || "P2";
  const horarios = state.horarios.filter((horario) => {
    const oferta = state.oferta.find((o) => o.id === horario.ofertaId);
    return oferta && oferta.periodo === periodo;
  });

  panel.innerHTML = `<div class="bar"><h2>Relatórios</h2></div>
    <div class="card" style="margin-bottom:.8rem">
      <div class="bar"><h3>Quadro resumo por docente</h3><div class="inline-actions">
        <select id="rel-docente">${state.docentes.map((doc) => `<option value="${doc.id}" ${selectedDocente === doc.id ? "selected" : ""}>${doc.nome || "(sem nome)"}</option>`).join("")}</select>
        <button id="csv-docente">CSV</button><button id="pdf-docente">PDF</button></div></div>
      ${resumoDocente ? `<table><thead><tr><th>Docente</th><th>Sala</th><th>Regência</th><th>Pesquisa</th><th>Extensão</th><th>Ensino</th><th>Orient. TCC</th><th>Orient. PIBIC</th><th>Coord. PIBIC</th><th>Comissões</th><th>Função</th><th>Total</th></tr></thead><tbody><tr><td>${resumoDocente.docente}</td><td>${resumoDocente.sala}</td><td>${resumoDocente.regencia}</td><td>${resumoDocente.pesquisa}</td><td>${resumoDocente.extensao}</td><td>${resumoDocente.ensino}</td><td>${resumoDocente.orientTcc}</td><td>${resumoDocente.orientPibic}</td><td>${resumoDocente.coordProjetoPibic}</td><td>${resumoDocente.comissoes}</td><td>${resumoDocente.funcao}</td><td>${resumoDocente.total}</td></tr></tbody></table>` : ""}
    </div>
    <div class="card" style="margin-bottom:.8rem">
      <div class="bar"><h3>Quadro resumo de todos os docentes</h3><div class="inline-actions"><button id="csv-todos">CSV</button><button id="pdf-todos">PDF</button></div></div>
      <table><thead><tr><th>Docente</th><th>Sala</th><th>Regência</th><th>Pesquisa</th><th>Extensão</th><th>Ensino</th><th>Orient.</th><th>Comissões</th><th>Função</th><th>Total</th><th>Status</th></tr></thead><tbody>
        ${resumo.map((r) => `<tr><td>${r.docente}</td><td>${r.sala}</td><td>${r.regencia}</td><td>${r.pesquisa}</td><td>${r.extensao}</td><td>${r.ensino}</td><td>${r.orientTotal}</td><td>${r.comissoes}</td><td>${r.funcao}</td><td>${r.total}</td><td>${r.status}</td></tr>`).join("")}
      </tbody></table>
    </div>
    <div class="card" style="margin-bottom:.8rem">
      <div class="bar"><h3>Quadro só sala de aula</h3><div class="inline-actions"><button id="csv-sala">CSV</button><button id="pdf-sala">PDF</button></div></div>
      <table><thead><tr><th>Docente</th><th>Disciplinas</th><th>CH sala de aula</th></tr></thead><tbody>
        ${salaDetalhada.map((r) => `<tr><td>${r.docente}</td><td>${r.disciplinas}</td><td>${r.sala}</td></tr>`).join("")}
      </tbody></table>
    </div>
    <div class="card">
      <div class="bar"><h3>Quadro de horários por semestre</h3><div class="inline-actions">
        <select id="rel-periodo">${periodos.map((p) => `<option value="${p}" ${periodo === p ? "selected" : ""}>${p}</option>`).join("")}</select>
        <button id="csv-horarios">CSV</button><button id="pdf-horarios">PDF</button></div></div>
      <table><thead><tr><th>Dia</th><th>Turno</th><th>Início</th><th>Fim</th><th>Disciplina</th><th>Docentes</th><th>Turma</th></tr></thead><tbody>
        ${horarios.map((horario) => {
          const oferta = state.oferta.find((o) => o.id === horario.ofertaId);
          const docentes = (oferta?.docentes || []).map((id) => state.docentes.find((d) => d.id === id)?.nome).filter(Boolean).join(", ");
          return `<tr><td>${horario.dia}</td><td>${horario.turno}</td><td>${horario.inicio}</td><td>${horario.fim}</td><td>${oferta?.nome || ""}</td><td>${docentes}</td><td>${oferta?.periodo || ""}</td></tr>`;
        }).join("")}
      </tbody></table>
    </div>`;

  panel.querySelector("#rel-docente").onchange = (e) => {
    state.reportDocenteId = e.target.value;
    rerender(render);
  };
  panel.querySelector("#rel-periodo").onchange = (e) => {
    state.reportPeriodo = e.target.value;
    rerender(render);
  };

  panel.querySelector("#csv-docente").onclick = () => {
    if (!resumoDocente) return;
    downloadCsv("quadro_resumo_docente.csv", [[
      "Docente", "Sala", "Regência", "Pesquisa", "Extensão", "Ensino", "Orient. TCC",
      "Orient. PIBIC", "Coord. PIBIC", "Comissões", "Função", "Total"
    ], [
      resumoDocente.docente, resumoDocente.sala, resumoDocente.regencia, resumoDocente.pesquisa,
      resumoDocente.extensao, resumoDocente.ensino, resumoDocente.orientTcc, resumoDocente.orientPibic,
      resumoDocente.coordProjetoPibic, resumoDocente.comissoes, resumoDocente.funcao, resumoDocente.total
    ]]);
  };

  panel.querySelector("#csv-todos").onclick = () => {
    downloadCsv("quadro_resumo_todos_docentes.csv", [[
      "Docente", "Sala", "Regência", "Pesquisa", "Extensão", "Ensino", "Orient.", "Comissões", "Função", "Total", "Status"
    ], ...resumo.map((r) => [
      r.docente, r.sala, r.regencia, r.pesquisa, r.extensao, r.ensino,
      r.orientTotal, r.comissoes, r.funcao, r.total, r.status
    ])]);
  };

  panel.querySelector("#csv-sala").onclick = () => {
    downloadCsv("quadro_sala_aula.csv", [["Docente", "Disciplinas", "CH sala de aula"], ...salaDetalhada.map((r) => [r.docente, r.disciplinas, r.sala])]);
  };

  panel.querySelector("#csv-horarios").onclick = () => {
    downloadCsv(`quadro_horarios_${periodo}.csv`, [["Dia", "Turno", "Início", "Fim", "Disciplina", "Docentes", "Turma"], ...horarios.map((horario) => {
      const oferta = state.oferta.find((o) => o.id === horario.ofertaId);
      const docentes = (oferta?.docentes || []).map((id) => state.docentes.find((d) => d.id === id)?.nome).filter(Boolean).join(", ");
      return [horario.dia, horario.turno, horario.inicio, horario.fim, oferta?.nome || "", docentes, oferta?.periodo || ""];
    })]);
  };

  panel.querySelector("#pdf-docente").onclick = () => {
    if (!resumoDocente) return;
    gerarPdfTabela("Quadro resumo por docente", [[
      "Docente", "Sala", "Regência", "Pesquisa", "Extensão", "Ensino", "Orient. TCC",
      "Orient. PIBIC", "Coord. PIBIC", "Comissões", "Função", "Total"
    ]], [[
      resumoDocente.docente, resumoDocente.sala, resumoDocente.regencia, resumoDocente.pesquisa,
      resumoDocente.extensao, resumoDocente.ensino, resumoDocente.orientTcc, resumoDocente.orientPibic,
      resumoDocente.coordProjetoPibic, resumoDocente.comissoes, resumoDocente.funcao, resumoDocente.total
    ]], "quadro_resumo_docente.pdf");
  };

  panel.querySelector("#pdf-todos").onclick = () => {
    gerarPdfTabela("Quadro resumo de todos os docentes", [[
      "Docente", "Sala", "Regência", "Pesquisa", "Extensão", "Ensino", "Orient.", "Comissões", "Função", "Total", "Status"
    ]], resumo.map((r) => [
      r.docente, r.sala, r.regencia, r.pesquisa, r.extensao, r.ensino,
      r.orientTotal, r.comissoes, r.funcao, r.total, r.status
    ]), "quadro_resumo_todos_docentes.pdf");
  };

  panel.querySelector("#pdf-sala").onclick = () => {
    gerarPdfTabela("Quadro só sala de aula", [["Docente", "Disciplinas", "CH sala de aula"]], salaDetalhada.map((r) => [r.docente, r.disciplinas, r.sala]), "quadro_sala_aula.pdf");
  };

  panel.querySelector("#pdf-horarios").onclick = () => {
    gerarPdfTabela(`Quadro de horários - ${periodo}`, [["Dia", "Turno", "Início", "Fim", "Disciplina", "Docentes", "Turma"]], horarios.map((horario) => {
      const oferta = state.oferta.find((o) => o.id === horario.ofertaId);
      const docentes = (oferta?.docentes || []).map((id) => state.docentes.find((d) => d.id === id)?.nome).filter(Boolean).join(", ");
      return [horario.dia, horario.turno, horario.inicio, horario.fim, oferta?.nome || "", docentes, oferta?.periodo || ""];
    }), `quadro_horarios_${periodo}.pdf`);
  };
}
