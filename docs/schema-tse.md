# Schema TSE — Dados Eleitorais do DF

Definições de tabelas Drizzle ORM para os dados eleitorais do TSE integrados ao CRIVO.
Complementa o `schema-pdad.md` com indicadores de comportamento eleitoral por RA.

---

## Tabelas

### `tse_resultados_candidato_ra`

Votos nominais por candidato agregados por Região Administrativa do DF.
Derivada do arquivo `votacao_candidato_munzona_<ANO>.zip` do TSE.

```typescript
// drizzle/schema.ts
export const tseResultadosCandidatoRa = mysqlTable(
  "tse_resultados_candidato_ra",
  {
    id:                      int("id").autoincrement().primaryKey(),
    ano:                     int("ano").notNull(),
    nrTurno:                 tinyint("nr_turno").notNull(),
    raCodigo:                varchar("ra_codigo", { length: 6 }).notNull(),
    raNome:                  varchar("ra_nome", { length: 100 }).notNull(),
    cdCargo:                 varchar("cd_cargo", { length: 10 }),
    dsCargo:                 varchar("ds_cargo", { length: 100 }),
    nrCandidato:             varchar("nr_candidato", { length: 20 }),
    nmCandidato:             varchar("nm_candidato", { length: 200 }),
    nmUrnaCandidato:         varchar("nm_urna_candidato", { length: 200 }),
    sgPartido:               varchar("sg_partido", { length: 20 }),
    nmPartido:               varchar("nm_partido", { length: 100 }),
    qtVotosNominais:         int("qt_votos_nominais").default(0),
    dsSituacaoCandidatura:   varchar("ds_situacao_candidatura", { length: 100 }),
    createdAt:               timestamp("created_at").defaultNow(),
  },
  (t) => ({
    ukRaCandTurno: unique("uk_ra_cand_turno").on(
      t.ano, t.nrTurno, t.raCodigo, t.nrCandidato, t.cdCargo
    ),
    idxRaCodigo:   index("idx_ra_codigo").on(t.raCodigo),
    idxAnoTurno:   index("idx_ano_turno").on(t.ano, t.nrTurno),
    idxPartido:    index("idx_partido").on(t.sgPartido),
  })
);
```

### `tse_resultados_secao`

Votos por seção eleitoral (granularidade máxima). Derivada de `votacao_secao_<ANO>_DF.zip`.
Disponível a partir de 2022.

```typescript
export const tseResultadosSecao = mysqlTable(
  "tse_resultados_secao",
  {
    id:          int("id").autoincrement().primaryKey(),
    ano:         int("ano").notNull(),
    nrTurno:     tinyint("nr_turno").notNull(),
    nrZona:      int("nr_zona").notNull(),
    nrSecao:     varchar("nr_secao", { length: 10 }),
    raCodigo:    varchar("ra_codigo", { length: 6 }).notNull(),
    raNome:      varchar("ra_nome", { length: 100 }).notNull(),
    cdCargo:     varchar("cd_cargo", { length: 10 }),
    dsCargo:     varchar("ds_cargo", { length: 100 }),
    nrVotavel:   varchar("nr_votavel", { length: 20 }),
    nmVotavel:   varchar("nm_votavel", { length: 200 }),
    qtVotos:     int("qt_votos").default(0),
    createdAt:   timestamp("created_at").defaultNow(),
  },
  (t) => ({
    ukZonaSecaoVotavel: unique("uk_zona_secao_votavel").on(
      t.ano, t.nrTurno, t.nrZona, t.nrSecao, t.nrVotavel, t.cdCargo
    ),
    idxRaCodigo: index("idx_ra_codigo").on(t.raCodigo),
    idxZona:     index("idx_zona").on(t.nrZona),
  })
);
```

### `tse_zonas_ra_df`

Tabela de referência estática: mapeamento zona eleitoral → RA do DF.
Fonte: TRE-DF + repositório mapaslivres/zonas-eleitorais.

```typescript
export const tseZonasRaDf = mysqlTable(
  "tse_zonas_ra_df",
  {
    nrZona:      int("nr_zona").primaryKey(),
    raCodigo:    varchar("ra_codigo", { length: 6 }).notNull(),
    raNome:      varchar("ra_nome", { length: 100 }).notNull(),
    descricao:   text("descricao"),
    multiRa:     boolean("multi_ra").default(false),
    rasSecundarias: varchar("ras_secundarias", { length: 200 }),
  }
);
```

---

## Mapeamento Zona Eleitoral → RA do DF

| Zona | RA Principal | Nome da RA | Abrangência Territorial |
|------|-------------|------------|------------------------|
| 1 | RA01 | Brasília | Asa Sul, Plano Piloto |
| 2 | RA27 | Jardim Botânico | Paranoá, Jardim Botânico, São Sebastião (parcial) |
| 3 | RA03 | Taguatinga | Taguatinga Norte |
| 4 | RA02 | Gama | Gama Setor Central |
| 5 | RA05 | Sobradinho | Sobradinho, Sobradinho II (parcial) |
| 6 | RA06 | Planaltina | Planaltina |
| 7 | RA04 | Brazlândia | Brazlândia |
| 8 | RA09 | Ceilândia | Ceilândia Setor QNM, QNN, P Norte (parcial) |
| 9 | RA10 | Guará | Guará I e II |
| 10 | RA11 | Cruzeiro | Núcleo Bandeirante, Cruzeiro |
| 11 | RA11 | Cruzeiro | Cruzeiro Novo, Park Way (parcial) |
| 12 | RA09 | Ceilândia | Ceilândia Norte (2ª zona) |
| 13 | RA20 | Samambaia | Samambaia Norte e Sul |
| 14 | RA01 | Brasília | Asa Norte, Plano Piloto Norte |
| 15 | RA25 | Águas Claras | Águas Claras, Taguatinga Sul |
| 16 | RA09 | Ceilândia | Ceilândia Norte (3ª zona), Sol Nascente |
| 17 | RA02 | Gama | Gama (2ª zona) |
| 18 | RA16 | Lago Sul | Lago Sul, Jardim Botânico (parcial) |
| 19 | RA03 | Taguatinga | Taguatinga Norte (2ª zona) |
| 20 | RA09 | Ceilândia | Ceilândia Sul |
| 21 | RA23 | Recanto das Emas | Recanto das Emas |

> **Atenção:** Zonas 2, 5, 10, 11, 15 e 18 abrangem múltiplas RAs. Para análise
> de precisão territorial, usar `tse_resultados_secao` (granularidade por seção).

---

## Arquivos CSV do TSE — Estrutura de Colunas

### `votacao_candidato_munzona_<ANO>.zip`

Arquivo com votos nominais por candidato, município e zona eleitoral (todas as UFs).
Separador: `;` | Encoding: `latin-1`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `ANO_ELEICAO` | int | Ano da eleição |
| `NR_TURNO` | int | Turno (1 ou 2) |
| `SG_UF` | str | UF (filtrar por `DF`) |
| `NR_ZONA` | int | Número da zona eleitoral |
| `CD_CARGO` | str | Código do cargo |
| `DS_CARGO` | str | Descrição do cargo |
| `NR_CANDIDATO` | str | Número do candidato |
| `NM_CANDIDATO` | str | Nome completo |
| `NM_URNA_CANDIDATO` | str | Nome de urna |
| `SG_PARTIDO` | str | Sigla do partido |
| `NM_PARTIDO` | str | Nome do partido |
| `QT_VOTOS_NOMINAIS` | int | Total de votos nominais |
| `DS_SITUACAO_CANDIDATURA` | str | Situação (DEFERIDO, INDEFERIDO...) |

### `votacao_secao_<ANO>_DF.zip`

Arquivo específico do DF com votos por seção eleitoral (disponível a partir de 2022).
Separador: `;` | Encoding: `latin-1`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `ANO_ELEICAO` | int | Ano da eleição |
| `NR_TURNO` | int | Turno (1 ou 2) |
| `NR_ZONA` | int | Número da zona eleitoral |
| `NR_SECAO` | str | Número da seção |
| `CD_CARGO` | str | Código do cargo |
| `NR_VOTAVEL` | str | Número do candidato/partido |
| `NM_VOTAVEL` | str | Nome do candidato/partido |
| `QT_VOTOS` | int | Total de votos |

---

## Queries Úteis

### Top candidatos por RA (Governador, 1º turno 2022)

```sql
SELECT
  ra_codigo,
  ra_nome,
  nm_urna_candidato,
  sg_partido,
  qt_votos_nominais,
  RANK() OVER (PARTITION BY ra_codigo ORDER BY qt_votos_nominais DESC) AS posicao
FROM tse_resultados_candidato_ra
WHERE ano = 2022
  AND nr_turno = 1
  AND cd_cargo = '3'  -- Governador
ORDER BY ra_codigo, posicao;
```

### Comparação eleitoral por RA entre 2018 e 2022

```sql
SELECT
  a.ra_codigo,
  a.ra_nome,
  a.nm_urna_candidato,
  a.qt_votos_nominais AS votos_2022,
  b.qt_votos_nominais AS votos_2018,
  (a.qt_votos_nominais - b.qt_votos_nominais) AS variacao
FROM tse_resultados_candidato_ra a
JOIN tse_resultados_candidato_ra b
  ON a.ra_codigo = b.ra_codigo
  AND a.nr_candidato = b.nr_candidato
  AND a.cd_cargo = b.cd_cargo
WHERE a.ano = 2022 AND b.ano = 2018
  AND a.nr_turno = 2 AND b.nr_turno = 2
ORDER BY variacao DESC;
```

### Penetração por partido por RA

```sql
SELECT
  ra_codigo,
  ra_nome,
  sg_partido,
  SUM(qt_votos_nominais) AS total_votos,
  SUM(qt_votos_nominais) * 100.0 /
    SUM(SUM(qt_votos_nominais)) OVER (PARTITION BY ra_codigo) AS pct_ra
FROM tse_resultados_candidato_ra
WHERE ano = 2022 AND nr_turno = 1 AND cd_cargo = '3'
GROUP BY ra_codigo, ra_nome, sg_partido
ORDER BY ra_codigo, total_votos DESC;
```

---

## Notas de Implementação

- **Encoding:** Todos os CSVs do TSE usam `latin-1` (ISO-8859-1). Sempre decodificar com `encoding='latin-1'` no Python.
- **Separador:** Ponto e vírgula (`;`), não vírgula.
- **Zonas sem mapeamento:** Zonas acima de 21 não constam no mapeamento atual. Verificar se o TRE-DF criou novas zonas após 2022.
- **Ceilândia multi-zona:** As zonas 8, 12, 16 e 20 cobrem diferentes setores de Ceilândia. Para análise de Ceilândia como um todo, somar todas as quatro zonas.
- **CDN bloqueado:** O CDN do TSE (`cdn.tse.jus.br`) bloqueia downloads de IPs de servidores cloud. Usar download manual via browser ou proxy residencial.
