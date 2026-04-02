import { roundInt, weeklyHours, timeToMinutes } from "./helpers.js";

export const defaults = {
  nde: { none: 0, membro: 2, coordenacao: 4 },
  binaryHours: {
    projetoPesquisa: 4,
    projetoEnsino: 4,
    coordProjetoPibic: 8,
    fiel: 2,
    fieb: 2,
    comiteEtica: 2,
  },
};

export function isUCE(oferta) {
  return (
    (oferta.codigo || "").startsWith("UCE") ||
    (oferta.nome || "").toUpperCase().includes("UCE")
  );
}

export function isEspecialIndividual(oferta) {
  return oferta.tipo === "especial" && oferta.especial === "individual";
}

export function calcDisciplinaParaDocente(oferta, docenteId) {
  if (!(oferta.docentes || []).includes(docenteId)) {
    return { sala: 0, regencia: 0 };
  }

  if (isUCE(oferta)) {
    return { sala: 1, regencia: 0 };
  }

  const totalDocentes = (oferta.docentes || []).length || 1;
  const multiplicador = isEspecialIndividual(oferta) ? 0.5 : 1;
  const teoriaSemanal = (weeklyHours(oferta.teorica, 15) / totalDocentes) * multiplicador;
  const praticaSemanal = weeklyHours(oferta.pratica, 15) * multiplicador;

  return {
    sala: roundInt(teoriaSemanal + praticaSemanal),
    regencia: roundInt(teoriaSemanal + (praticaSemanal * 0.5)),
  };
}

export function calcResumoDocente(docente, state) {
  const acts = state.atividades[docente.id] || {};
  let sala = 0, regencia = 0, pesquisa = 0, extensao = 0, ensino = 0, comissoes = 0;
  const funcao = Number(docente.chFuncao || 0);

  state.oferta.forEach((oferta) => {
    const carga = calcDisciplinaParaDocente(oferta, docente.id);
    sala += carga.sala;
    regencia += carga.regencia;
  });

  if (acts.projetoPesquisa) pesquisa += defaults.binaryHours.projetoPesquisa;
  if (acts.projetoEnsino) ensino += defaults.binaryHours.projetoEnsino;
  if (acts.coordProjetoPibic) pesquisa += defaults.binaryHours.coordProjetoPibic;
  if (acts.fiel) comissoes += defaults.binaryHours.fiel;
  if (acts.fieb) comissoes += defaults.binaryHours.fieb;
  if (acts.comiteEtica) comissoes += defaults.binaryHours.comiteEtica;
  comissoes += defaults.nde[acts.nde || "none"] || 0;
  ensino += Number(acts.monitoria || 0);
  extensao += Number(acts.extensaoCoordenacaoQtd || 0) * 8;
  extensao += Number(acts.extensaoMembroQtd || 0) * 4;
  pesquisa += acts.grupoPesquisaMembro ? 1 : 0;
  pesquisa += acts.grupoPesquisaLider ? 2 : 0;
  const orientTcc = Math.min(Number(acts.orientacoesTcc || 0), 4) * 2;
  const orientPibic = Math.min(Number(acts.orientacoesPibic || 0) * 2, 8);
  (acts.outrasComissoes || []).forEach((item) => { comissoes += Number(item.ch || 0); });

  sala = roundInt(sala);
  regencia = roundInt(regencia);
  pesquisa = roundInt(pesquisa);
  extensao = roundInt(extensao);
  ensino = roundInt(ensino);
  comissoes = roundInt(comissoes);

  const total = roundInt(sala + regencia + pesquisa + extensao + ensino + orientTcc + orientPibic + comissoes + funcao);
  const status = sala >= Number(docente.minimoSala || 0) ? "Atende mínimo" : "Abaixo do mínimo";

  return {
    docente: docente.nome,
    sala,
    regencia,
    pesquisa,
    extensao,
    ensino,
    orientTcc,
    orientPibic,
    coordProjetoPibic: acts.coordProjetoPibic ? 8 : 0,
    orientTotal: roundInt(orientTcc + orientPibic + (acts.coordProjetoPibic ? 8 : 0)),
    comissoes,
    funcao,
    total,
    minimoSala: docente.minimoSala,
    status,
  };
}

export function detectHorarioConflicts(state) {
  return state.horarios.map((item, index) => {
    const start = timeToMinutes(item.inicio);
    const end = timeToMinutes(item.fim);
    const ofertaAtual = state.oferta.find((o) => o.id === item.ofertaId);
    const docentesAtual = ofertaAtual?.docentes || [];
    const turmaAtual = ofertaAtual?.periodo || "";
    let docenteConflict = false;
    let turmaConflict = false;

    state.horarios.forEach((other, otherIndex) => {
      if (index === otherIndex) return;
      if (item.dia !== other.dia || item.turno !== other.turno) return;
      const otherStart = timeToMinutes(other.inicio);
      const otherEnd = timeToMinutes(other.fim);
      const overlap = start < otherEnd && end > otherStart;
      if (!overlap) return;
      const ofertaOther = state.oferta.find((o) => o.id === other.ofertaId);
      const docentesOther = ofertaOther?.docentes || [];
      const turmaOther = ofertaOther?.periodo || "";
      if (docentesAtual.some((id) => docentesOther.includes(id))) docenteConflict = true;
      if (turmaAtual && turmaAtual === turmaOther) turmaConflict = true;
    });

    return { id: item.id, docenteConflict, turmaConflict, anyConflict: docenteConflict || turmaConflict };
  });
}
