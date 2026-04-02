import { uid } from "./helpers.js";

export const STORAGE_KEY = "dch_uern_sprint12";

export const state = {
  docentes: [],
  catalogo: [],
  oferta: [],
  atividades: {},
  horarios: [],
  gradeFilters: {
    view: "turma",
    turma: "",
    docente: "",
  },
  reportDocenteId: "",
  reportPeriodo: "P2",
};

export function makeComponente(
  periodo,
  codigo,
  nome,
  teorica,
  pratica,
  total,
  tipo = "obrigatoria",
  especial = "nao"
) {
  return {
    periodo,
    codigo,
    nome,
    teorica,
    pratica,
    total,
    semanas: 15,
    tipo,
    especial,
  };
}

export function fromCatalogo(comp) {
  return {
    id: uid(),
    ...comp,
    docentes: [],
  };
}

export function buildCatalogo() {
  return [
    makeComponente("P1", "CAC0037", "Vivência em Comunidade", 30, 30, 60),
    makeComponente("P1", "CAC0036", "Introdução ao estudo científico", 45, 0, 45),
    makeComponente("P1", "CAC0035", "Organização celular e metabolismo", 90, 30, 120),
    makeComponente("P1", "CAC0034", "Antropologia: cultura e saúde", 45, 0, 45),
    makeComponente("P1", "CAC0033", "Fundamentos da Sociologia", 60, 0, 60),
    makeComponente("P1", "CFI0098", "Introdução à Filosofia", 60, 0, 60),
    makeComponente("P2", "CAC0038", "Práticas Interprofissionais em Saúde", 30, 15, 45),
    makeComponente("P2", "CAC0039", "História da enfermagem", 60, 0, 60),
    makeComponente("P2", "CAC0040", "Epidemiologia", 60, 15, 75),
    makeComponente("P2", "CAC0041", "Saúde e gênero", 30, 0, 30),
    makeComponente("P2", "CAC0042", "Módulo morfofuncional I", 105, 45, 150),
    makeComponente("P2", "UCE0022", "UCE", 15, 45, 60),
    makeComponente("P3", "CAC0044", "Investigação em Enfermagem", 45, 0, 45),
    makeComponente("P3", "CAC0045", "Ética e bioética na enfermagem", 60, 0, 60),
    makeComponente("P3", "CAC0043", "Módulo morfofuncional II", 90, 60, 150),
    makeComponente("P3", "CAC0046", "Saúde coletiva I", 75, 15, 90),
    makeComponente("P3", "CAC0047", "Saúde e meio ambiente", 45, 0, 45),
    makeComponente("P3", "UCE0023", "UCE", 15, 45, 60),
    makeComponente("P4", "CAC0048", "Semiologia da enfermagem", 45, 45, 90),
    makeComponente("P4", "CAC0049", "Agentes biopatogênicos", 90, 30, 120),
    makeComponente("P4", "CAC0050", "Metodologia da assistência de enfermagem", 45, 15, 60),
    makeComponente("P4", "CAC0051", "Saúde coletiva II", 45, 15, 60),
    makeComponente("P4", "UCE0024", "UCE", 15, 45, 60),
    makeComponente("P5", "CAC0052", "Bioestatística básica", 45, 0, 45),
    makeComponente("P5", "CAC0053", "Semiotécnica da enfermagem", 60, 60, 120),
    makeComponente("P5", "CAC0054", "Farmacologia básica e aplicada", 120, 0, 120),
    makeComponente("P5", "CAC0055", "Patologia geral", 45, 0, 45),
    makeComponente("P5", "UCE0025", "UCE", 15, 45, 60),
    makeComponente("P6", "CAC0056", "Saúde mental", 60, 15, 75),
    makeComponente("P6", "CAC0057", "Processo gerenciar", 45, 15, 60),
    makeComponente("P6", "CAC0058", "Saúde sexual e reprodutiva", 120, 60, 180),
    makeComponente("P6", "UCE0026", "UCE", 15, 45, 60),
    makeComponente("P6", "UCE0006", "UCE", 15, 15, 30),
    makeComponente("P7", "CAC0060", "Atenção à saúde da criança e do adolescente", 150, 30, 180),
    makeComponente("P7", "CAC0061", "Processo pesquisar", 60, 0, 60),
    makeComponente("P7", "CAC0059", "Urgência e emergência", 45, 30, 75),
    makeComponente("P7", "UCE0027", "UCE", 15, 45, 60),
    makeComponente("P8", "CAC0062", "Saúde do trabalhador", 45, 15, 60),
    makeComponente("P8", "CAC0063", "Cuidados clínicos e intensivos", 150, 45, 195),
    makeComponente("P8", "CAC0064", "Saúde da pessoa idosa", 60, 15, 75),
    makeComponente("P8", "UCE0028", "UCE", 15, 45, 60),
    makeComponente("P9", "CAC0065", "Estágio curricular supervisionado I", 60, 405, 465),
    makeComponente("P9", "CAC0066", "Monografia", 15, 30, 45),
    makeComponente("P10", "CAC0067", "Estágio curricular supervisionado II", 60, 420, 480),
    makeComponente("OPT", "CEN0051", "Atualização em imunologia e imunização", 45, 0, 45, "optativa"),
    makeComponente("OPT", "CAC0072", "Bioestatística avançada", 45, 0, 45, "optativa"),
    makeComponente("OPT", "CAC0070", "Bioética e Interprofissionalidade", 60, 0, 60, "optativa"),
    makeComponente("OPT", "CEN0070", "Cuidados paliativos", 45, 0, 45, "optativa"),
    makeComponente("OPT", "CEN0041", "Educação popular em saúde", 60, 0, 60, "optativa"),
    makeComponente("OPT", "CEN0072", "Empreendedorismo em Enfermagem", 30, 15, 45, "optativa"),
    makeComponente("OPT", "CEN0054", "Epidemias e endemias regionais", 45, 0, 45, "optativa"),
    makeComponente("OPT", "CAC0073", "Língua brasileira de sinais no contexto da saúde", 60, 0, 60, "optativa"),
    makeComponente("OPT", "CAC0071", "Metodologias de Ensino em Saúde", 30, 15, 45, "optativa"),
    makeComponente("OPT", "CEN0071", "Práticas integrativas e complementares em saúde – PICS", 45, 0, 45, "optativa"),
    makeComponente("OPT", "CAC0069", "Psicologia da criança e do adolescente", 60, 0, 60, "optativa"),
    makeComponente("OPT", "CEN0074", "Raciocínio clínico em enfermagem", 45, 0, 45, "optativa"),
    makeComponente("OPT", "CEN0073", "Tecnologias em saúde e Enfermagem", 30, 15, 45, "optativa"),
    makeComponente("OPT", "CAC0068", "Transtornos Globais do Desenvolvimento (TGD)", 45, 0, 45, "optativa"),
    makeComponente("ESP", "ESP-GERAL", "Disciplina especial", 45, 0, 45, "especial", "individual"),
    makeComponente("UCE", "UCE-GERAL", "UCE", 15, 45, 60, "obrigatoria", "nao"),
  ];
}

export function syncAtividades() {
  const ids = new Set(state.docentes.map((docente) => docente.id));
  Object.keys(state.atividades).forEach((id) => {
    if (!ids.has(id)) delete state.atividades[id];
  });

  state.docentes.forEach((docente) => {
    if (!state.atividades[docente.id]) {
      state.atividades[docente.id] = {
        projetoPesquisa: false,
        projetoEnsino: false,
        coordProjetoPibic: false,
        nde: "none",
        fiel: false,
        fieb: false,
        comiteEtica: false,
        orientacoesTcc: 0,
        orientacoesPibic: 0,
        monitoria: 0,
        extensaoCoordenacaoQtd: 0,
        extensaoMembroQtd: 0,
        grupoPesquisaMembro: false,
        grupoPesquisaLider: false,
        outrasComissoes: [],
      };
    }
  });
}

export function addOfertaFromCatalogo(codigo) {
  const comp = state.catalogo.find((item) => item.codigo === codigo);
  if (!comp) return;
  state.oferta.push(fromCatalogo(comp));
}

export function addPeriodoFromCatalogo(periodo) {
  state.catalogo.filter((item) => item.periodo === periodo).forEach((comp) => {
    state.oferta.push(fromCatalogo(comp));
  });
}

export function seedData() {
  state.docentes = [
    ["Jéssica Tinôco", "40h", 4, "Chefe do departamento", 4],
    ["Jéssica Naiara", "40h", 8, "Coord. Profsaude", 8],
    ["Maura Vanessa", "40h", 4, "Chefe cursos Lato", 4],
    ["Rosangela Diniz", "40h", 8, "Proex", 8],
    ["Linda Kátia", "40h", 8, "", 0],
    ["Clécio Andre", "40h", 8, "", 0],
    ["Ildone Fortes", "40h", 8, "", 0],
    ["Izabel Calixta", "40h", 8, "", 0],
    ["Liria Alvino", "40h", 12, "", 0],
    ["Vinicius", "40h", 20, "", 0],
    ["Raquel Mirtes", "40h", 8, "", 0],
    ["CRISTYANNE SAMARA", "40h", 8, "", 0],
    ["Roberta Kalily", "40h", 8, "", 0],
    ["Roberta Luna", "40h", 8, "", 0],
    ["Dulcian Azevedo", "40h", 8, "Vice Profsaude", 8],
    ["Erika Fernandes", "40h", 12, "", 0],
    ["Regilene Alves", "40h", 8, "Vice chefe", 8],
  ].map(([nome, regime, minimoSala, funcao, chFuncao]) => ({
    id: uid(),
    nome,
    regime,
    minimoSala,
    funcao,
    chFuncao,
  }));

  state.catalogo = buildCatalogo();
  state.oferta = [
    fromCatalogo(state.catalogo.find((x) => x.codigo === "CAC0042")),
    fromCatalogo(state.catalogo.find((x) => x.codigo === "CAC0048")),
    fromCatalogo(state.catalogo.find((x) => x.codigo === "CAC0058")),
    fromCatalogo(state.catalogo.find((x) => x.codigo === "CAC0063")),
    fromCatalogo(state.catalogo.find((x) => x.codigo === "CAC0066")),
  ].filter(Boolean);

  state.horarios = [
    {
      id: uid(),
      ofertaId: state.oferta.find((x) => x.codigo === "CAC0042")?.id || "",
      dia: "Segunda",
      turno: "Manhã",
      inicio: "08:00",
      fim: "10:00",
    },
    {
      id: uid(),
      ofertaId: state.oferta.find((x) => x.codigo === "CAC0048")?.id || "",
      dia: "Segunda",
      turno: "Manhã",
      inicio: "10:00",
      fim: "12:00",
    },
  ];

  state.gradeFilters = { view: "turma", turma: "P2", docente: "" };
  state.reportPeriodo = "P2";
  state.reportDocenteId = "";
  syncAtividades();
}

export function serializeState() {
  return JSON.parse(JSON.stringify(state));
}

export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeState()));
}

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  const snapshot = JSON.parse(raw);
  state.docentes = snapshot.docentes || [];
  state.catalogo = snapshot.catalogo || buildCatalogo();
  state.oferta = snapshot.oferta || [];
  state.atividades = snapshot.atividades || {};
  state.horarios = snapshot.horarios || [];
  state.gradeFilters = snapshot.gradeFilters || { view: "turma", turma: "", docente: "" };
  state.reportDocenteId = snapshot.reportDocenteId || "";
  state.reportPeriodo = snapshot.reportPeriodo || "P2";
  syncAtividades();
  return true;
}
