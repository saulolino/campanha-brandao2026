# Integração PDAD/IPEDF — Camada Territorial CRIVO

A integração dos dados da Pesquisa Distrital por Amostra de Domicílios (PDAD) do IPEDF cria uma **camada territorial unificada** para o ecossistema CRIVO. Esta base de dados socioeconômicos e demográficos por Região Administrativa (RA) foi projetada para ser consumida de forma padronizada pelos produtos **Atlas.voto**, **Monitor360**, **Fala Eleitor** e **Campanha360**.

## 1. Arquitetura da Solução

A solução foi desenvolvida seguindo os padrões arquiteturais do projeto CRIVO (Node.js, TypeScript, Drizzle ORM, MySQL/TiDB) e complementada com um pipeline ETL em Python para processamento de dados complexos.

### 1.1. Componentes Principais

1. **Pipeline ETL (Python)**: Extrai, normaliza e carrega os dados da PDAD.
2. **Gerador de Resumos Estratégicos (Python + LLM)**: Cria análises qualitativas por RA.
3. **Schema de Banco de Dados (Drizzle ORM)**: Estrutura otimizada para consultas analíticas.
4. **Serviço Backend (tRPC + REST)**: Endpoints para consumo pelos produtos do ecossistema.

## 2. Pipeline ETL (`etl/pdad/etl_pdad.py`)

O pipeline ETL é responsável por alimentar a base de dados com informações atualizadas e padronizadas.

### 2.1. Fontes de Dados Suportadas

O ETL foi projetado para lidar com múltiplas fontes de dados da PDAD:

- **Seed (Embutido)**: Dados consolidados da PDAD 2021 pré-processados, garantindo funcionamento imediato sem dependências externas.
- **PDF (Relatórios Oficiais)**: Extração automatizada via `pdfplumber` dos relatórios executivos publicados pelo IPEDF.
- **Painel PDAD-A**: Preparado para integração futura com o painel interativo.

### 2.2. Normalização Territorial

Um dos principais desafios resolvidos pelo ETL é a padronização da nomenclatura das Regiões Administrativas. O sistema utiliza um dicionário canônico que mapeia variações de nomes (ex: "Sudoeste", "Sudoeste/Octogonal", "RA 22") para um formato unificado (`RA22`, "Sudoeste/Octogonal").

### 2.3. Execução do ETL

```bash
# Executar em modo dry-run (apenas validação)
python3 etl/pdad/etl_pdad.py --source seed --dry-run

# Executar carga real no banco de dados
python3 etl/pdad/etl_pdad.py --source seed
```

## 3. Gerador de Resumos Estratégicos (`etl/pdad/generate_summaries.py`)

Para transformar dados brutos em inteligência acionável, foi criado um gerador de resumos estratégicos que analisa os indicadores de cada RA e produz insights voltados para comunicação e formulação de políticas públicas.

### 3.1. Dimensões Analisadas

O gerador produz cinco dimensões de análise para cada território:

1. **Perfil Socioeconômico**: Síntese demográfica e de renda.
2. **Vulnerabilidades**: Identificação de déficits críticos (ex: desemprego, saneamento).
3. **Oportunidades**: Áreas prioritárias para intervenção de políticas públicas.
4. **Pautas Eleitorais**: Temas com maior ressonância para campanhas políticas.
5. **Alertas de Comunicação**: Recomendações de tom e formato para comunicação territorial.

### 3.2. Modos de Operação

- **Modo LLM (Padrão)**: Utiliza a API da OpenAI (GPT-4) para gerar análises qualitativas ricas e contextualizadas.
- **Modo Determinístico (Fallback)**: Caso a API não esteja disponível, utiliza um sistema de regras baseadas em limiares estatísticos para gerar os resumos automaticamente.

```bash
# Gerar resumos usando LLM
python3 etl/pdad/generate_summaries.py

# Gerar resumos usando apenas regras determinísticas
python3 etl/pdad/generate_summaries.py --no-llm
```

## 4. Estrutura de Banco de Dados

O schema foi implementado usando Drizzle ORM (`drizzle/pdad_schema.ts`) e consiste em duas tabelas principais.

### 4.1. `pdad_indicators`

Armazena os indicadores granulares por RA, ano e categoria.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT | Chave primária |
| `ano` | SMALLINT | Ano de referência (ex: 2021) |
| `fonte` | VARCHAR | Origem do dado (ex: PDAD-2021) |
| `ra_codigo` | VARCHAR | Código canônico (ex: RA09) |
| `ra_nome` | VARCHAR | Nome normalizado (ex: Ceilândia) |
| `indicador` | VARCHAR | Slug do indicador (ex: taxa_desemprego) |
| `categoria` | VARCHAR | Agrupamento temático (ex: trabalho) |
| `valor` | DECIMAL | Valor numérico |
| `unidade` | VARCHAR | Unidade de medida (ex: %) |

### 4.2. `pdad_ra_summaries`

Armazena os resumos estratégicos gerados para consumo rápido.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ra_codigo` | VARCHAR | Código canônico da RA |
| `perfil_socioeconomico` | TEXT | Síntese descritiva |
| `vulnerabilidades` | TEXT | Déficits identificados |
| `oportunidades` | TEXT | Focos para políticas públicas |
| `pautas_eleitorais` | TEXT | Temas de ressonância |
| `alertas_comunicacao` | TEXT | Recomendações de tom |
| `indice_vulnerabilidade` | DECIMAL | Score composto (0-100) |
| `classificacao` | ENUM | Classificação de renda |

## 5. API e Endpoints

A camada territorial expõe seus dados através de duas interfaces: tRPC (para uso interno no frontend React) e REST (para integrações externas ou ferramentas de terceiros).

### 5.1. Endpoints Disponíveis

#### Listar todas as RAs
Retorna a lista de todas as Regiões Administrativas com seus indicadores-chave agrupados por categoria.
- **tRPC**: `territories.list`
- **REST**: `GET /api/territories/pdad`

#### Detalhes de uma RA específica
Retorna todos os indicadores detalhados de uma RA.
- **tRPC**: `territories.byRa({ ra: "RA09" })`
- **REST**: `GET /api/territories/pdad/RA09`

#### Resumo Estratégico
Retorna a análise qualitativa, vulnerabilidades e pautas eleitorais da RA.
- **tRPC**: `territories.summary({ ra: "RA09" })`
- **REST**: `GET /api/territories/pdad/RA09/summary`

#### Comparação entre RAs
Permite comparar indicadores lado a lado entre múltiplas regiões.
- **tRPC**: `territories.compare({ ras: ["RA01", "RA09"] })`
- **REST**: `GET /api/territories/pdad/compare?ras=RA01,RA09`

#### Ranking por Indicador
Gera um ranking das RAs baseado em um indicador específico.
- **tRPC**: `territories.ranking({ indicador: "taxa_desemprego" })`
- **REST**: `GET /api/territories/pdad/ranking/taxa_desemprego`

## 6. Casos de Uso por Produto

A arquitetura foi desenhada para atender às necessidades específicas de cada produto do ecossistema CRIVO:

### Atlas.voto
- Utiliza os endpoints de `compare` e `ranking` para gerar mapas de calor (choropleth maps) e visualizações comparativas de desigualdade territorial.
- Cruza dados de votação histórica com o `indice_vulnerabilidade` para identificar correlações socioeconômicas.

### Monitor360
- Consome os `alertas_comunicacao` para calibrar o tom das respostas automatizadas e moderação de redes sociais baseada na geolocalização do usuário.
- Monitora a aderência das `pautas_eleitorais` identificadas com os temas mais discutidos nas redes daquela região.

### Fala Eleitor
- Utiliza o `perfil_socioeconomico` para enriquecer o cadastro de eleitores quando a RA é identificada.
- Direciona pesquisas e enquetes específicas baseadas nas `vulnerabilidades` da região do respondente.

### Campanha360
- O módulo de planejamento semanal consome as `oportunidades` e `pautas_eleitorais` para sugerir temas de discursos e eventos de rua em cada RA.
- Auxilia na alocação de recursos de campanha priorizando áreas com maior alinhamento estratégico.
