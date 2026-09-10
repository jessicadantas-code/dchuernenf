# DCH UERN — versão consolidada para teste 2027.1

Esta é a versão recomendada para publicação no GitHub Pages e testes da distribuição de carga horária de 2027.1.

## Semestre inicial
O sistema abre por padrão em **2027.1**.

Estrutura básica automática:
- P1
- P3
- P5
- P7
- P9

Optativas, UCEs, disciplinas especiais/estudo individual e outros componentes excepcionais devem ser adicionados conforme a oferta real do semestre.

## Funcionalidades consolidadas
- semestres independentes no formato AAAA.1 e AAAA.2;
- 2026.1, 2026.2 e 2027.1 preservados;
- oferta básica automática por semestre;
- ficha individual do docente;
- portarias editáveis;
- atividades inteligentes com cálculo automático;
- horários com editar, duplicar e excluir;
- validação de conflitos;
- disciplinas especiais não entram no quadro de horários;
- prática em serviço com módulos/grupos;
- vínculo de um docente por módulo prático;
- CH prática integral por módulo atribuído;
- teoria dividida entre os docentes do componente;
- memória numérica da carga de ensino;
- relatório individual;
- relatório de todos os docentes;
- relatório somente sala de aula;
- relatório de horários por período;
- exportação CSV/PDF;
- backup JSON;
- armazenamento local com chave permanente.

## Regras principais preservadas
- 15 semanas;
- teoria semanal = CH teórica / 15 / número de docentes;
- prática em serviço = CH prática / 15 para cada módulo/docente responsável;
- regência = 100% da teoria + 50% da prática;
- arredondamento final para inteiro;
- UCE = 1h de sala de aula;
- disciplina especial individual = 50% da CH e fora do horário regular.

## Publicação no GitHub Pages
Envie para a raiz do repositório:
- index.html
- styles.css
- uern_logo.png
- README.md

## Importante
Nesta etapa, os dados continuam salvos localmente no navegador.
A integração compartilhada com n8n será feita após a validação funcional desta versão.


## Relatório Geral Institucional — v6
Foi acrescentado um relatório único consolidado, inspirado na planilha institucional fornecida:
- uma linha por docente;
- nome, matrícula, CPF e regime;
- nomes das disciplinas e memória resumida de teoria/prática;
- CH de ensino e regência;
- função e portaria;
- pesquisa;
- PIBIC;
- extensão;
- monitoria;
- TCC;
- mestrado;
- grupo de pesquisa;
- NDE;
- FIEL/FIEB;
- Comitê de Ética;
- outras comissões;
- portarias/atos administrativos do semestre;
- total da carga horária.

O relatório geral pode ser baixado em CSV (para abrir no Excel) e PDF.


## Ajuste de layout do relatório geral — v7
- colunas exclusivamente numéricas foram reduzidas;
- coluna final renomeada para **Total CH**;
- coluna Total CH foi fixada com largura pequena e destaque;
- linha **TOTAL GERAL** adicionada ao final do relatório em tela, CSV e PDF;
- PDF A3 reorganizado para manter Portarias e Total CH visíveis dentro da página.


## Relatório Geral v8 — layout redesenhado
O PDF geral permanece um único arquivo, mas agora é organizado em quadros para aumentar a legibilidade:

1. Resumo numérico da carga horária por docente
2. Disciplinas, teoria, prática, módulos e regência
3. Atividades, funções e portarias
4. Relação consolidada de portarias e atos administrativos, quando houver

As colunas numéricas foram compactadas e o Total CH passou a ficar em destaque.


## Correção v9 — semestre fixo em 15 semanas
Foi corrigida a inconsistência em que alguns componentes podiam aparecer calculados sobre 10, 8 ou 6 semanas.

A partir desta versão:
- existe uma única constante de sistema: `SEMANAS_SEMESTRE = 15`;
- toda conversão de CH total para CH semanal usa 15 semanas;
- teoria, prática, módulos práticos, regência e blocos semanais usam a mesma base;
- não é mais possível passar outra quantidade de semanas para a função de cálculo semanal;
- a tela informa explicitamente que a base de cálculo é 15 semanas.

Regra:
`CH semanal = CH total ÷ 15`


## v10 — armazenamento compartilhado via n8n

Esta versão está conectada aos webhooks de produção:

- Salvar: `https://jessicauern.app.n8n.cloud/webhook/dch-salvar`
- Carregar: `https://jessicauern.app.n8n.cloud/webhook/dch-carregar`

### Funcionamento
- O GitHub Pages continua hospedando a interface.
- O `localStorage` continua sendo backup local.
- O botão **Salvar online** envia o estado completo do sistema ao n8n.
- O botão **Carregar online** busca o semestre ativo no n8n.
- O sistema tenta buscar o semestre online ao abrir, mas só substitui os dados locais se o conteúdo recebido tiver o formato válido do DCH.
- O JSON de teste usado durante a configuração do n8n não sobrescreve os dados locais.
- Alterações normais têm sincronização online com pequeno atraso para reduzir chamadas excessivas ao n8n.
- Importação de JSON fica local até clicar em **Salvar online**.
- “Limpar tudo” não apaga automaticamente a versão armazenada no n8n.

### n8n
Os dois workflows precisam estar **Published/Active** e usar as Production URLs acima.

### Observação de acesso
Nesta primeira fase não há login. Quem tiver acesso ao site poderá visualizar os dados carregados. A interface também contém funções de edição; controle de edição/autenticação poderá ser acrescentado posteriormente.
