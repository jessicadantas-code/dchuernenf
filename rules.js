import { round2, weeklyHours, timeToMinutes } from "./helpers.js";

export const defaults = {
  nde: { none: 0, membro: 2, coordenacao: 4 },
  binaryHours: {
    projetoPesquisa: 4,
    grupoPesquisa: 2,
    projetoEnsino: 4,
    projetoExtensao: 4,
    coordProjetoPibic: 8,
    fiel: 2,
    fieb: 2,
    comiteEtica: 2,
  },
};

export function getOfertaMultiplier(oferta) {
  if (oferta.tipo === "especial" && oferta.especial === "individual") return 0.5;
  return 1;
}

export function calcDisciplinaParaDocente(oferta, docenteId) {
  if (!(oferta.docentes || []).includes(docenteId)) return { sala: 0, regencia: 0 };

  const totalDocentes = (oferta.docentes || []).length || 1;
  const mult = getOfertaMultiplier(oferta);

  const teoriaSemanal = (weeklyHours(oferta.teorica, oferta.semanas) / totalDocentes) * mult;
  const orientacaoSemanal = (weeklyHours(oferta.orientacao, oferta.semanas) / totalDocentes) * mult;
  const praticaSemanal = (oferta.praticaDocentes || []).includes(docenteId)
    ? weeklyHours(oferta.pratica, oferta.semanas) * mult
    : 0;

  const sala = teoriaSemanal + orientacaoSemanal + praticaSemanal;
  const regencia = teoriaSemanal + (praticaSemanal * 0.5);

  return { sala: round2(sala), regencia: round2(regencia) };
}

export function calcOrientacoesEPesquisaDocente(docente, state) {
  const acts = state.atividades[docente.id] || {};
  const qtdTcc = Number(acts.orientacoesTcc || 0);
  const qtdPibic = Number(acts.orientacoesPibic || 0);
  const coordProjetoPibic = Boolean(acts.coordProjetoPibic);

  const orientTcc = Math.min(qtdTcc, 4) * 2;
  const orientPibic = Math.min(qtdPibic * 2, 8);
  const coordPibic = coordProjetoPibic ? defaults.binaryHours.coordProjetoPibic : 0;

  return {
    orientTcc: round2(orientTcc),
    orientPibic: round2(orientPibic),
    coordProjetoPibic: round2(coordPibic),
    totalOrientacoesEPesquisa: round2(orientTcc + orientPibic + coordPibic),
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
  if (acts.grupoPesquisa) pesquisa += defaults.binaryHours.grupoPesquisa;
  if (acts.projetoEnsino) ensino += defaults.binaryHours.projetoEnsino;
  if (acts.projetoExtensao) extensao += defaults.binaryHours.projetoExtensao;
  if (acts.fiel) comissoes += defaults.binaryHours.fiel;
  if (acts.fieb) comissoes += defaults.binaryHours.fieb;
  if (acts.comiteEtica) comissoes += defaults.binaryHours.comiteEtica;
  comissoes += defaults.nde[acts.nde || "none"] || 0;
  (acts.outras || []).forEach((item) => { comissoes += Number(item.ch || 0); });

  const orientPesquisa = calcOrientacoesEPesquisaDocente(docente, state);

  sala = round2(sala); regencia = round2(regencia); pesquisa = round2(pesquisa); extensao = round2(extensao); ensino = round2(ensino); comissoes = round2(comissoes);
  const total = round2(sala + regencia + pesquisa + extensao + ensino + orientPesquisa.totalOrientacoesEPesquisa + comissoes + funcao);
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

export function detectHorarioConflicts(horarios) {
  return horarios.map((item, index) => {
    const currentStart = timeToMinutes(item.inicio);
    const currentEnd = timeToMinutes(item.fim);
    let docenteConflict = false;
    let turmaConflict = false;

    horarios.forEach((other, otherIndex) => {
      if (index === otherIndex) return;
      if (item.dia !== other.dia || item.turno !== other.turno) return;
      const otherStart = timeToMinutes(other.inicio);
      const otherEnd = timeToMinutes(other.fim);
      if (!overlap(currentStart, currentEnd, otherStart, otherEnd)) return;
      if (item.docente && other.docente && item.docente === other.docente) docenteConflict = true;
      if (item.turma && other.turma && item.turma === other.turma) turmaConflict = true;
    });

    return { id: item.id, docenteConflict, turmaConflict, anyConflict: docenteConflict || turmaConflict };
  });
}
