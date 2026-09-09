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
