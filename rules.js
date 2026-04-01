import { timeToMinutes, weeklyHours } from "./helpers.js";

const roundCarga = (value) => Math.round(Number(value || 0));

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

export function getOfertaMultiplier(oferta) {
  if (oferta?.tipo === "especial" && oferta?.especial === "individual") return 0.5;
  return 1;
}

export function getOfertaTurma(oferta) {
  return oferta?.periodo || "";
}

export function getOfertaDocentes(oferta) {
  return oferta?.docentes || [];
}

export function calcDisciplinaParaDocente(oferta, docenteId) {
  if (!(oferta?.docentes || []).includes(docenteId)) return { sala: 0, regencia: 0 };

  const totalDocentes = (oferta.docentes || []).length || 1;
  const mult = getOfertaMultiplier(oferta);
  const teoriaSemanal = (weeklyHours(oferta.teorica, oferta.semanas) / totalDocentes) * mult;
  const orientacaoSemanal = (weeklyHours(oferta.orientacao, oferta.semanas) / totalDocentes) * mult;
  const praticaSemanal = weeklyHours(oferta.pratica, oferta.semanas) * mult;

  return {
    sala: roundCarga(teoriaSemanal + orientacaoSemanal + praticaSemanal),
    regencia: roundCarga(teoriaSemanal + (praticaSemanal * 0.5)),
  };
}

export function calcOrientacoesEPesquisaDocente(docente, state) {
  const acts = state.atividades[docente.id] || {};
  const orientTcc = Math.min(Number(acts.orientacoesTcc || 0), 4) * 2;
  const orientPibic = Math.min(Number(acts.orientacoesPibic || 0) * 2, 8);
  const coordProjetoPibic = acts.coordProjetoPibic ? defaults.binaryHours.coordProjetoPibic : 0;

  return {
    orientTcc: roundCarga(orientTcc),
    orientPibic: roundCarga(orientPibic),
    coordProjetoPibic: roundCarga(coordProjetoPibic),
    totalOrientacoesEPesquisa: roundCarga(orientTcc + orientPibic + coordProjetoPibic),
  };
}

export function calcResumoDocente(docente, state) {
  const acts = state.atividades[docente.id] || {};
  let sala = 0, regencia = 0, pesquisa = 0, extensao = 0, ensino = 0, comissoes = 0;
  const funcao = roundCarga(docente.chFuncao || 0);

  state.oferta.forEach((oferta) => {
    const carga = calcDisciplinaParaDocente(oferta, docente.id);
    sala += carga.sala;
    regencia += carga.regencia;
  });

  if (acts.projetoPesquisa) pesquisa += defaults.binaryHours.projetoPesquisa;
  if (acts.projetoEnsino) ensino += defaults.binaryHours.projetoEnsino;
  extensao += Number(acts.extCoordCount || 0) * 8;
  extensao += Number(acts.extMembroCount || 0) * 4;
  pesquisa += Number(acts.grupoPesquisaCount || 0) * 1;
  pesquisa += Number(acts.grupoPesquisaLiderCount || 0) * 2;
  if (acts.fiel) comissoes += defaults.binaryHours.fiel;
  if (acts.fieb) comissoes += defaults.binaryHours.fieb;
  if (acts.comiteEtica) comissoes += defaults.binaryHours.comiteEtica;
  comissoes += defaults.nde[acts.nde || "none"] || 0;
  (acts.outras || []).forEach((item) => { comissoes += Number(item.ch || 0); });

  const orientPesquisa = calcOrientacoesEPesquisaDocente(docente, state);

  sala = roundCarga(sala);
  regencia = roundCarga(regencia);
  pesquisa = roundCarga(pesquisa);
  extensao = roundCarga(extensao);
  ensino = roundCarga(ensino);
  comissoes = roundCarga(comissoes);

  const total = roundCarga(sala + regencia + pesquisa + extensao + ensino + orientPesquisa.totalOrientacoesEPesquisa + comissoes + funcao);
  const status = sala >= Number(docente.minimoSala || 0) ? "Atende mínimo" : "Abaixo do mínimo";

  return {
    docente: docente.nome,
    sala, regencia, pesquisa, extensao, ensino,
    orientTcc: orientPesquisa.orientTcc,
    orientPibic: orientPesquisa.orientPibic,
    coordProjetoPibic: orientPesquisa.coordProjetoPibic,
    orientTotal: orientPesquisa.totalOrientacoesEPesquisa,
    comissoes, funcao, total, minimoSala: docente.minimoSala, status,
  };
}

function overlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}
function intersect(arr1, arr2) {
  return arr1.some((id) => arr2.includes(id));
}

export function detectHorarioConflicts(horarios, oferta) {
  return horarios.map((item, index) => {
    const currentStart = timeToMinutes(item.inicio);
    const currentEnd = timeToMinutes(item.fim);
    const ofertaAtual = oferta.find((o) => o.id === item.ofertaId);
    const docentesAtual = getOfertaDocentes(ofertaAtual);
    const turmaAtual = getOfertaTurma(ofertaAtual);
    let docenteConflict = false;
    let turmaConflict = false;

    horarios.forEach((other, otherIndex) => {
      if (index === otherIndex) return;
      if (item.dia !== other.dia || item.turno !== other.turno) return;
      const otherStart = timeToMinutes(other.inicio);
      const otherEnd = timeToMinutes(other.fim);
      if (!overlap(currentStart, currentEnd, otherStart, otherEnd)) return;
      const ofertaOther = oferta.find((o) => o.id === other.ofertaId);
      const docentesOther = getOfertaDocentes(ofertaOther);
      const turmaOther = getOfertaTurma(ofertaOther);
      if (docentesAtual.length && docentesOther.length && intersect(docentesAtual, docentesOther)) docenteConflict = true;
      if (turmaAtual && turmaOther && turmaAtual === turmaOther) turmaConflict = true;
    });

    return { id: item.id, docenteConflict, turmaConflict, anyConflict: docenteConflict || turmaConflict };
  });
}
