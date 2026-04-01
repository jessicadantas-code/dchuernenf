import { uid } from "./helpers.js";

export const state = {
  docentes: [],
  oferta: [],
  atividades: {},
  horarios: [],
  gradeFilters: { view: "turma", turma: "", docente: "" },
};

export function syncAtividades() {
  const ids = new Set(state.docentes.map((docente) => docente.id));
  Object.keys(state.atividades).forEach((id) => { if (!ids.has(id)) delete state.atividades[id]; });
  state.docentes.forEach((docente) => {
    if (!state.atividades[docente.id]) {
      state.atividades[docente.id] = {
        projetoPesquisa: false,
        grupoPesquisa: false,
        projetoEnsino: false,
        projetoExtensao: false,
        coordProjetoPibic: false,
        nde: "none",
        fiel: false,
        fieb: false,
        comiteEtica: false,
        orientacoesTcc: 0,
        orientacoesPibic: 0,
        outras: [{ nome: "", ch: 0 }, { nome: "", ch: 0 }, { nome: "", ch: 0 }],
      };
    }
  });
}

function makeOferta(periodo, codigo, nome, teorica, pratica, orientacao, total, semanas = 15, tipo = "obrigatoria", especial = "nao") {
  return { id: uid(), periodo, codigo, nome, teorica, pratica, orientacao, total, semanas, tipo, especial, docentes: [], praticaDocentes: [] };
}

export function seedData() {
  state.docentes = [
    ["Jéssica Tinôco","40h",4,"Chefe do departamento",4],["Jéssica Naiara","40h",8,"Coord. Profsaude",8],
    ["Maura Vanessa","40h",4,"Chefe cursos Lato",4],["Rosangela Diniz","40h",8,"Proex",8],["Linda Kátia","40h",8,"",0],
    ["Clécio Andre","40h",8,"",0],["Ildone Fortes","40h",8,"",0],["Izabel Calixta","40h",8,"",0],["Liria Alvino","40h",12,"",0],
    ["Vinicius","40h",20,"",0],["Raquel Mirtes","40h",8,"",0],["CRISTYANNE SAMARA","40h",8,"",0],["Roberta Kalily","40h",8,"",0],
    ["Roberta Luna","40h",8,"",0],["Dulcian Azevedo","40h",8,"Vice Profsaude",8],["Erika Fernandes","40h",12,"",0],["Regilene Alves","40h",8,"Vice chefe",8],
  ].map(([nome, regime, minimoSala, funcao, chFuncao]) => ({ id: uid(), nome, regime, minimoSala, funcao, chFuncao }));

  state.oferta = [
    makeOferta("P1","CAC0037","Vivência em Comunidade",30,30,0,60),
    makeOferta("P1","CAC0036","Introdução ao estudo científico",45,0,0,45),
    makeOferta("P1","CAC0035","Organização celular e metabolismo",90,30,0,120),
    makeOferta("P1","CAC0034","Antropologia: cultura e saúde",45,0,0,45),
    makeOferta("P1","CAC0033","Fundamentos da Sociologia",60,0,0,60),
    makeOferta("P1","CFI0098","Introdução à Filosofia",60,0,0,60),

    makeOferta("P2","CAC0038","Práticas Interprofissionais em Saúde",30,15,0,45),
    makeOferta("P2","CAC0039","História da enfermagem",60,0,0,60),
    makeOferta("P2","CAC0040","Epidemiologia",60,15,0,75),
    makeOferta("P2","CAC0041","Saúde e gênero",30,0,0,30),
    makeOferta("P2","CAC0042","Módulo morfofuncional I",105,45,0,150),
    makeOferta("P2","UCE0022","UCE",15,0,45,60),

    makeOferta("P3","CAC0044","Investigação em Enfermagem",45,0,0,45),
    makeOferta("P3","CAC0045","Ética e bioética na enfermagem",60,0,0,60),
    makeOferta("P3","CAC0043","Módulo morfofuncional II",90,60,0,150),
    makeOferta("P3","CAC0046","Saúde coletiva I",75,15,0,90),
    makeOferta("P3","CAC0047","Saúde e meio ambiente",45,0,0,45),
    makeOferta("P3","UCE0023","UCE",15,0,45,60),

    makeOferta("P4","CAC0048","Semiologia da enfermagem",45,45,0,90),
    makeOferta("P4","CAC0049","Agentes biopatogênicos",90,30,0,120),
    makeOferta("P4","CAC0050","Metodologia da assistência de enfermagem",45,15,0,60),
    makeOferta("P4","CAC0051","Saúde coletiva II",45,15,0,60),
    makeOferta("P4","UCE0024","UCE",15,0,45,60),

    makeOferta("P5","CAC0052","Bioestatística básica",45,0,0,45),
    makeOferta("P5","CAC0053","Semiotécnica da enfermagem",60,60,0,120),
    makeOferta("P5","CAC0054","Farmacologia básica e aplicada",120,0,0,120),
    makeOferta("P5","CAC0055","Patologia geral",45,0,0,45),
    makeOferta("P5","UCE0025","UCE",15,0,45,60),

    makeOferta("P6","CAC0056","Saúde mental",60,15,0,75),
    makeOferta("P6","CAC0057","Processo gerenciar",45,15,0,60),
    makeOferta("P6","CAC0058","Saúde sexual e reprodutiva",120,60,0,180),
    makeOferta("P6","UCE0026","UCE",15,0,45,60),
    makeOferta("P6","UCE0006","UCE",15,0,15,30),

    makeOferta("P7","CAC0060","Atenção à saúde da criança e do adolescente",150,30,0,180),
    makeOferta("P7","CAC0061","Processo pesquisar",60,0,0,60),
    makeOferta("P7","CAC0059","Urgência e emergência",45,30,0,75),
    makeOferta("P7","UCE0027","UCE",15,0,45,60),

    makeOferta("P8","CAC0062","Saúde do trabalhador",45,15,0,60),
    makeOferta("P8","CAC0063","Cuidados clínicos e intensivos",150,45,0,195),
    makeOferta("P8","CAC0064","Saúde da pessoa idosa",60,15,0,75),
    makeOferta("P8","UCE0028","UCE",15,0,45,60),

    makeOferta("P9","CAC0065","Estágio curricular supervisionado I",60,0,405,465),
    makeOferta("P9","CAC0066","Monografia",15,0,30,45),
    makeOferta("P10","CAC0067","Estágio curricular supervisionado II",60,0,420,480),

    makeOferta("OPT","CEN0051","Atualização em imunologia e imunização",45,0,0,45,15,"optativa"),
    makeOferta("OPT","CAC0072","Bioestatística avançada",45,0,0,45,15,"optativa"),
    makeOferta("OPT","CAC0070","Bioética e Interprofissionalidade",60,0,0,60,15,"optativa"),
    makeOferta("OPT","CEN0070","Cuidados paliativos",45,0,0,45,15,"optativa"),
    makeOferta("OPT","CEN0041","Educação popular em saúde",60,0,0,60,15,"optativa"),
    makeOferta("OPT","CEN0072","Empreendedorismo em Enfermagem",30,15,0,45,15,"optativa"),
    makeOferta("OPT","CEN0054","Epidemias e endemias regionais",45,0,0,45,15,"optativa"),
    makeOferta("OPT","CAC0073","Língua brasileira de sinais no contexto da saúde",60,0,0,60,15,"optativa"),
    makeOferta("OPT","CAC0071","Metodologias de Ensino em Saúde",30,15,0,45,15,"optativa"),
    makeOferta("OPT","CEN0071","Práticas integrativas e complementares em saúde – PICS",45,0,0,45,15,"optativa"),
    makeOferta("OPT","CAC0069","Psicologia da criança e do adolescente",60,0,0,60,15,"optativa"),
    makeOferta("OPT","CEN0074","Raciocínio clínico em enfermagem",45,0,0,45,15,"optativa"),
    makeOferta("OPT","CEN0073","Tecnologias em saúde e Enfermagem",30,15,0,45,15,"optativa"),
    makeOferta("OPT","CAC0068","Transtornos Globais do Desenvolvimento (TGD)",45,0,0,45,15,"optativa"),

    makeOferta("ESP","ESP0001","Disciplina especial exemplo (individual)",45,0,0,45,15,"especial","individual"),
    makeOferta("ESP","ESP0002","Disciplina especial exemplo (turma especial)",45,0,0,45,15,"especial","turma"),
  ];

  state.horarios = [
    { id: uid(), docente: "", ofertaId: state.oferta.find(x => x.codigo === "CAC0042")?.id || "", turma: "P2", dia: "Segunda", turno: "Manhã", inicio: "08:00", fim: "10:00" },
    { id: uid(), docente: "", ofertaId: state.oferta.find(x => x.codigo === "CAC0048")?.id || "", turma: "P4", dia: "Segunda", turno: "Manhã", inicio: "09:00", fim: "11:00" }
  ];

  state.gradeFilters = { view: "turma", turma: "P2", docente: "" };
  syncAtividades();
}

export function serializeState() {
  return JSON.parse(JSON.stringify(state));
}

export function loadState(snapshot) {
  state.docentes = snapshot.docentes || [];
  state.oferta = snapshot.oferta || [];
  state.atividades = snapshot.atividades || {};
  state.horarios = snapshot.horarios || [];
  state.gradeFilters = snapshot.gradeFilters || { view: "turma", turma: "", docente: "" };
  syncAtividades();
}
