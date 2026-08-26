# Prompt para Codex — Clan Manager + Clash API + histórico de monitoramento

Você vai trabalhar no repositório `Naian1/clan-manager`, branch `main`, produção `https://clan-manager-five.vercel.app`.

Existe também o laboratório `Naian1/clash-api-explorer`, produção `https://clash-api-explorer.vercel.app`. Leia `lib/routes.js` e `api/explore.js` desse repositório antes de mexer na modelagem: ele cataloga 35 rotas da API e foi usado para testar respostas reais do clã `#2GRURLPLL`.

## Objetivo do produto

Transformar o Clan Manager em um painel administrativo histórico para líderes/co-líderes do clã. Ele deve mostrar estado atual e, principalmente, construir histórico próprio de jogadores, entradas/saídas, guerras, ataques, CWL, Capital Raid, doações, snapshots e score interno.

Identidade de jogador = `player tag` imutável da Supercell. Nunca usar nome como identidade. Business IDs no Supabase devem continuar `bigint`; UUID apenas onde Supabase Auth exigir.

Não resetar nem recriar o banco. Inspecionar schema atual e aplicar apenas migrations incrementais.

## O que já foi confirmado na API real

A bateria real foi executada contra o clã `#2GRURLPLL`. O laboratório possui 35 rotas catalogadas; a sonda inicial conseguiu executar 34 rotas sem player API token, com 29 respostas OK e 5 rotas sem contexto/erro esperado naquele momento. `verifytoken` exige token pessoal do jogador e deve ser tratado separadamente.

Amostras abaixo são de 26/08/2026 e NÃO devem ser hardcoded, pois mudam em tempo real.

### Clã

`GET /clans/{clanTag}` respondeu com:
- nome `As LENDAS`
- tag `#2GRURLPLL`
- clanLevel 22
- 39 membros na amostra
- warLeague `Master League II`
- capitalLeague `Champion League III`
- warWins 200
- badgeUrls oficiais
- memberList
- labels
- pontos e requisitos do clã

`GET /clans/{clanTag}/members` respondeu com 39 membros.

### Guerra atual

`GET /clans/{clanTag}/currentwar` respondeu com guerra real 20x20 e revelou que a API entrega dados suficientes para reproduzir o mapa lógico da guerra:
- `state`
- `teamSize`
- `attacksPerMember`
- `battleModifier`
- `preparationStartTime`
- `startTime`
- `endTime`
- clã/oponente com tag, nome, badge, estrelas, destruição e quantidade de ataques
- `members[]`
- `mapPosition`
- `townhallLevel`
- `opponentAttacks`
- `bestOpponentAttack`
- `attacks[]`
- em cada ataque: `attackerTag`, `defenderTag`, `stars`, `destructionPercentage`, `order`, `duration`

Na amostra atual: As LENDAS 27 estrelas / 47% contra Night Rangers 44 estrelas / 76,30%, 20x20, 10/40 ataques do nosso lado. Isso é apenas exemplo temporal.

A API NÃO traz o layout físico da vila (posição de muros/defesas). Ela traz o mapa lógico, posição da vila, TH, ataques e destruição.

### War log

`GET /clans/{clanTag}/warlog?limit=20` respondeu com 20 guerras anteriores contendo:
- result win/lose/tie
- endTime
- teamSize
- attacksPerMember
- battleModifier
- clan/opponent tag, name, badge
- stars
- destructionPercentage
- quantidade de ataques do nosso clã
- expEarned

Conclusão: usar warlog para backfill/resumo de guerras antigas. NÃO assumir que ele contém ataques individuais antigos. Para histórico individual exato é obrigatório capturar `currentwar` enquanto a guerra ainda está disponível.

### CWL

`GET /clans/{clanTag}/currentwar/leaguegroup` retornou 404 na bateria porque não havia CWL ativa. Isso é esperado, não erro de implementação.

Quando houver CWL, essa rota deve fornecer rounds/warTags. Cada warTag deve ser consultada em:
`GET /clanwarleagues/wars/{warTag}`

Essas guerras/ataques devem ser persistidos enquanto disponíveis.

### Jogador

`GET /players/{playerTag}` funcionou. A amostra usada foi `Jony Bage #QV89VUP0Y`, mas não hardcode o jogador.

A resposta trouxe:
- tag, name
- townHallLevel
- expLevel
- trophies / bestTrophies
- warStars
- attackWins / defenseWins
- Builder Base
- role / warPreference
- donations / donationsReceived
- clanCapitalContributions
- clan
- leagueTier com iconUrls
- builderBaseLeague
- current/previous league group/season IDs
- achievements
- labels
- troops
- heroes
- heroEquipment
- spells

Na amostra houve 54 achievements, 82 troops, 8 heroes, 37 heroEquipment e 18 spells.

Cada unidade traz nome, level/maxLevel e demais metadados disponíveis. Isso permite mostrar perfil visual completo.

IMPORTANTE: `players.war_stars` / `warStars` da API é o TOTAL DE WAR STARS DA CONTA, acumulado em qualquer clã. NÃO rotular isso como “estrelas pelo clã”.

As estrelas exatas conquistadas pelo nosso clã devem ser calculadas a partir dos ataques arquivados por nós:
- guerra normal: soma de `war_attacks.stars`
- CWL: soma de `cwl_attacks.stars`
- sempre vinculadas ao nosso clan_id/período monitorado

O período anterior ao início do monitoramento individual é DESCONHECIDO. Não inventar total histórico. Se existir baseline, rotular claramente:
- “War Stars totais da conta (Supercell)”
- “Estrelas monitoradas pelo As LENDAS”
- “Monitoramento desde <data>”

Pode guardar `war_stars_total_at_monitoring_start` apenas como checkpoint de auditoria, mas não usar diferença de total da conta como “estrelas pelo clã”, pois o jogador pode ganhar estrelas fora do clã.

### Battle Log

`GET /players/{playerTag}/battlelog` respondeu com 50 itens.

Antes de criar schema definitivo para battlelog, inspecionar detalhadamente a forma atual de cada item no explorer. Inicialmente, usar API on-demand na tela de perfil e não criar uma tabela pesada sem uma necessidade clara. Se decidirmos manter histórico que a API descarta, normalizar somente após definir chave de unicidade confiável; `raw jsonb` pode ser usado temporariamente no laboratório.

### League History

`GET /players/{playerTag}/leaguehistory` respondeu com 8 itens.

Pode ser usado on-demand. Persistir somente se for necessário integrar histórico/ranking interno; nesse caso usar group/season IDs como chaves naturais quando disponíveis.

### Capital Raid

`GET /clans/{clanTag}/capitalraidseasons?limit=10` respondeu com 10 temporadas e é muito detalhado.

A temporada mais recente da amostra possuía:
- state
- startTime/endTime
- capitalTotalLoot
- raidsCompleted
- totalAttacks
- enemyDistrictsDestroyed
- offensiveReward/defensiveReward
- members[] com tag/name, attacks, attackLimit, bonusAttackLimit, capitalResourcesLooted
- attackLog
- defenseLog
- clãs atacados/atacantes
- districts[]
- district id/name/hall level
- destructionPercent
- stars
- attackCount
- totalLooted
- attacks[] por distrito com attacker tag/name, destruição e estrelas

Portanto o schema atual de Capital é suficiente para resumo, mas precisa ser expandido se quisermos histórico detalhado de distritos e ataques.

### Ligas, ranks, localidades e assets oficiais

Também funcionaram na sonda:
- `/leaguetiers` — 37 itens na amostra
- `/leaguetiers/{id}` — id/name/iconUrls
- `/leagues` — 23 itens
- `/leagues/{id}` — id/name/iconUrls
- `/warleagues` — 23 itens
- `/warleagues/{id}`
- `/capitalleagues` — 23 itens
- `/capitalleagues/{id}`
- `/builderbaseleagues` — 42 itens
- `/builderbaseleagues/{id}`
- `/locations` — lista
- `/locations/{id}`
- rankings de clans/players/builder/capital por location — retornaram itens
- `/goldpass/seasons/current` — startTime/endTime
- `/labels/players` — 19 itens na amostra
- `/labels/clans` — 17 itens na amostra

`/leagues/{leagueId}/seasons` retornou 400 para o leagueId escolhido automaticamente na primeira sonda; não tratar isso como falha geral. Validar quais ligas aceitam seasons antes de usar.

`/leaguegroup/{leagueGroupTag}/{leagueSeasonId}` não foi executada na primeira sonda por falta dos parâmetros derivados naquele fluxo. O explorer já tenta descobrir esses IDs via perfil/league history; aprofundar e validar antes de modelar.

## Catálogo das 35 rotas do explorer

### Clã
1. `GET /clans/{clanTag}`
2. `GET /clans/{clanTag}/members`
3. `GET /clans/{clanTag}/warlog`
4. `GET /clans/{clanTag}/currentwar`
5. `GET /clans/{clanTag}/currentwar/leaguegroup`
6. `GET /clans/{clanTag}/capitalraidseasons`
7. `GET /clans` (search)

### CWL
8. `GET /clanwarleagues/wars/{warTag}`

### Jogador
9. `GET /players/{playerTag}`
10. `GET /players/{playerTag}/battlelog`
11. `GET /players/{playerTag}/leaguehistory`
12. `POST /players/{playerTag}/verifytoken`

### Ligas
13. `GET /leaguetiers`
14. `GET /leaguetiers/{leagueTierId}`
15. `GET /leagues`
16. `GET /leagues/{leagueId}`
17. `GET /leagues/{leagueId}/seasons`
18. `GET /leagues/{leagueId}/seasons/{seasonId}`
19. `GET /leaguegroup/{leagueGroupTag}/{leagueSeasonId}`
20. `GET /warleagues`
21. `GET /warleagues/{leagueId}`
22. `GET /capitalleagues`
23. `GET /capitalleagues/{leagueId}`
24. `GET /builderbaseleagues`
25. `GET /builderbaseleagues/{leagueId}`

### Rankings/localidades
26. `GET /locations`
27. `GET /locations/{locationId}`
28. `GET /locations/{locationId}/rankings/clans`
29. `GET /locations/{locationId}/rankings/players`
30. `GET /locations/{locationId}/rankings/players-builder-base`
31. `GET /locations/{locationId}/rankings/clans-builder-base`
32. `GET /locations/{locationId}/rankings/capitals`

### Outros
33. `GET /goldpass/seasons/current`
34. `GET /labels/players`
35. `GET /labels/clans`

## Estratégia API-only x persistência

Use esta regra: não armazenar tudo só porque a API retorna. Persistir quando o dado precisa sobreviver ao desaparecimento/alteração da API ou quando precisamos fazer histórico/agregações eficientes.

### Persistir obrigatoriamente

1. Clã/membros atuais principais:
- `clans`
- `players`
- `player_memberships`
- `player_snapshots`

2. Guerra:
- `warlog` para backfill de resumos em `wars`
- `currentwar` para upsert da guerra atual
- roster/mapa da guerra
- TODOS os ataques dos dois lados enquanto disponíveis
- ao terminar, manter registro para sempre

3. CWL:
- season/group
- warTags
- cada guerra/round
- cada ataque individual

4. Capital Raid:
- temporada
- membros e loot
- se a UI mostrar detalhes históricos: oponentes, distritos e ataques

5. Entradas/saídas e score interno.

### API ao vivo + persistência paralela

- `currentwar`: UI pode consultar direto para mostrar estado atual, mas o sync precisa persistir os fatos históricos.
- `players/{tag}`: perfil atual detalhado pode ser consultado on-demand; `players`/snapshots guardam somente dados necessários para histórico/ranking.
- Capital current/recent: pode exibir resposta fresca, mas persistir histórico que queremos manter.

### API-only / cache opcional

Normalmente NÃO criar tabelas de negócio para:
- clan search
- league tiers
- leagues
- war leagues
- capital leagues
- builder leagues
- locations
- rankings globais
- gold pass
- labels

Esses endpoints podem ser consultados on-demand e ter cache de referência se necessário.

`iconUrls` e `badgeUrls` oficiais podem ser usados diretamente na UI. Não duplicar binários no banco.

### Nunca persistir segredo

`POST /players/{tag}/verifytoken`: nunca guardar player API token. Usar somente para verificação instantânea e descartar.

## Assets visuais

- Escudo do clã: usar `badgeUrls.large/medium` da Supercell.
- Liga/rank/labels: usar `iconUrls` oficiais quando a API fornecer.
- TH, heróis, tropas, spells e equipamentos: a API fornece principalmente nomes/níveis, não um conjunto completo de imagens. Para UI bonita, usar mapa de assets PNG locais por nome/TH.
- O usuário não quer SVG ativo no site. Para novos assets visuais, PNG raster.

Não salvar no banco o caminho de cada asset local. Criar helpers de frontend, por exemplo `getTownHallAsset(level)`, `getUnitAsset(category, name)`.

## Schema Supabase já existente

Já existem e têm RLS:
- `clans`
- `players`
- `player_memberships`
- `player_snapshots`
- `wars`
- `war_members`
- `war_attacks`
- `cwl_seasons`
- `cwl_attacks`
- `capital_raid_seasons`
- `capital_raid_members`
- `player_scores`
- `clan_rules`
- `sync_runs`
- tabelas admin/auth do projeto

Não apagar/recriar.

### Ajustes sugeridos para guerra

O schema atual `wars` já possui `war_key`, state, team_size, attacks_per_member, tempos, estrelas/destruição dos dois lados, opponent data, result e `raw jsonb`.

Revisar migrations para suportar mapa histórico completo:
- adicionar em `wars`, se necessário: `battle_modifier`, `clan_attacks`, `opponent_attacks`, `is_cwl`/origem ou equivalente
- `war_members` hoje exige `player_id` e foi pensado no nosso lado; para reconstruir mapa dos dois lados, preferir evoluir para roster genérico:
  - `side` (`clan`/`opponent`)
  - `player_id bigint null`
  - `player_tag text not null`
  - `player_name text`
  - `map_position`
  - `town_hall_level`
  - `opponent_attacks`
  - best opponent stars/destruction/attacker tag
  - unique `(war_id, side, player_tag)`
- não criar jogador externo na tabela `players` só para representar adversário
- `war_attacks` deve guardar ataques dos DOIS lados; `attacker_player_id` pode ser null para adversários
- adicionar constraint idempotente. `attack_order` parece globalmente único dentro da guerra na resposta observada; validar e usar `(war_id, attack_order)` quando presente. Se não puder garantir, usar composição com attacker/defender/order.

`war_key` para guerra regular precisa ser determinístico mesmo sem warTag, por exemplo baseado em clanTag + preparationStartTime/startTime + opponentTag.

### Estrelas monitoradas pelo clã

Não criar/usar `players.war_stars` como estrela do clã.

Criar query/view/service para:
- regular_war_stars = SUM(war_attacks.stars onde atacante é nosso player e guerra pertence ao clan_id)
- cwl_stars = SUM(cwl_attacks.stars)
- monitored_clan_stars = regular + CWL
- wars_monitored
- attacks_available
- attacks_used
- missed_attacks
- triples
- two_stars / one_star / zero_star
- average_stars
- average_destruction
- triple_rate

Guardar agregados em `player_scores`/view/materialização somente se necessário para performance. A fonte de verdade deve ser o histórico de ataques.

Adicionar um timestamp claro como `clans.war_monitoring_started_at timestamptz` OU tabela/checkpoint equivalente, para UI mostrar “Monitoramento desde ...”. Não inventar período anterior.

### CWL

O schema atual é básico. Avaliar migration incremental:
- `cwl_seasons`: group_tag, season id/string, state, league
- criar `cwl_wars` para cada warTag/round, com opponent, tempos, stars/destruction/result/raw
- `cwl_attacks`: adicionar `war_tag`/`cwl_war_id`, attack_order, duration, captured_at se faltarem
- unique por guerra/ataque

### Capital

O resumo atual (`capital_raid_seasons`, `capital_raid_members`) deve permanecer.

Para detalhamento histórico, adicionar somente se a UI for implementar agora:
- `capital_raid_opponents`
- `capital_raid_districts`
- `capital_raid_attacks`

Campos principais:
- attack/defense side
- opponent clan tag/name/level/badge
- district id/name/hall level
- destruction/stars/attack count/loot
- attacker tag/name
- captured_at

Usar uniques naturais por season/opponent/district e evitar duplicidade nos polls.

### Heróis/tropas/spells/equipment

Para estado atual visual, NÃO precisamos salvar tudo; consultar `/players/{tag}` on-demand.

Se implementar evolução de níveis, NÃO criar snapshot completo de ~145 itens a cada poll. Preferir histórico por mudança:
- tabela de estado atual por player/category/name
- tabela de eventos de mudança de level quando `old_level != new_level`

Isso reduz muito o volume no free tier.

## Sync

Já existe `lib/services/sync-clan.ts` e `/api/sync`. Ele já sincroniza clã, membros, memberships, snapshots e `sync_runs`. NÃO reconstruir do zero.

Evoluir de forma idempotente em serviços separados, por exemplo:
- `syncClan`
- `syncMembers`
- `syncWarLogBackfill`
- `syncCurrentWar`
- `syncCwl`
- `syncCapital`
- `calculateScores`

Fluxo full sync:
1. clan
2. members
3. membership leave/rejoin
4. snapshots
5. warlog backfill
6. currentwar + roster + attacks
7. CWL se disponível
8. Capital
9. scores/agregados
10. `sync_runs`

## Frequência de monitoramento

O Vercel está em Hobby. NÃO mudar `vercel.json` para cron subdiário: Hobby atualmente limita cron a uma execução por dia e isso pode bloquear deploy.

O cron diário existente pode continuar para full sync.

Para guerra detalhada, 1x/dia é insuficiente. Criar endpoint protegido e barato, ex. `/api/sync/war`, e considerar GitHub Actions scheduled no repositório público chamando esse endpoint a cada ~10 minutos, com secret em GitHub Actions Secrets e endpoint protegido por `SYNC_SECRET`/equivalente. O endpoint deve ser idempotente e retornar rápido. Se não houver guerra, apenas registrar/retornar sem fazer trabalho pesado.

Nunca colocar token da Supercell ou sync secret no client ou no repositório.

## Frontend — o que já foi alterado antes deste handoff

Já foi implementado e está em produção:

1. Cabeçalho:
- antigo logo fictício `CM` foi substituído pelo badge real do clã vindo de `clans.badge_url`
- `ClashShell` busca branding no Supabase
- fallback `CM` só se badge não existir

2. Guerra atual na home:
- `lib/clash/client.ts` agora possui `getCurrentWar`
- tipos de current war foram adicionados em `lib/clash/types.ts`
- home `/` consulta `currentwar` server-side com `cache: no-store`
- mostra badges dos dois clãs, estrelas, destruição, ataques usados, tamanho/status e horário de término

3. Página `/wars`:
- não é mais placeholder
- mostra guerra atual ao vivo
- mostra mapa lógico das 20 vilas do nosso clã
- para cada vila: mapPosition, player, tag, TH, ataques usados, alvos, estrelas feitas, melhor destruição, ataques recebidos e melhor ataque recebido
- dados vêm da API atual; ainda NÃO são histórico persistido

4. CSS novo:
- `app/clan-badge.css`
- `app/war-live.css`

Último commit deste handoff: `6292522b422b780fe0c0d0a10629f97edf8c94e3`.
Vercel production do commit está READY e o alias é `https://clan-manager-five.vercel.app`.

## Frontend — próximos passos

### Home
- continuar mostrando guerra atual via API live
- quando histórico estiver persistido, preencher “Estrelas no mês” com estrelas monitoradas em regular war + CWL do período
- nunca usar `players.war_stars` nessa métrica

### `/wars`
- manter seção live atual
- abaixo, adicionar histórico do Supabase
- cards/lista por guerra com result, opponent, stars, destruction, date
- clique abre detalhe da guerra arquivada e reconstrói o mapa usando DB/raw
- mostrar faltas somente após guerra terminar: attacks_per_member - attacks_used

### `/players`
- lista atual vem do Supabase
- mostrar TH, liga/icon, doações, war stars TOTAL da conta com label correto e score monitorado
- adicionar estatísticas monitoradas separadas: estrelas pelo clã, guerras monitoradas, ataques, faltas, triples, destruição

### `/players/[tag]`
Combinar:
- API live on-demand: perfil atual, heroes, troops, spells, equipment, league icons
- DB histórico: memberships, snapshots, wars, CWL, Capital, donations, score

UI deve mostrar de forma explícita:
- `War Stars totais da conta (Supercell)`
- `Estrelas monitoradas pelo As LENDAS`
- `Monitoramento desde ...`

### `/cwl`
- estado atual quando CWL existir
- rounds/warTags
- histórico persistido de seasons/rounds/attacks
- ranking de players por attacks/stars/destruction

### `/capital`
- temporada recente
- ranking por player: attacks, bonus, capitalResourcesLooted
- histórico de weekends
- se criar tabelas detalhadas: drilldown por opponent/district/attack

### `/admin`
- status de cada pipeline: clan, members, war, CWL, capital
- última sync / erros / registros alterados
- botão manual sincronizar agora
- regras de score
- autenticação/allowlist existente deve ser respeitada

## Segurança

- Supercell token somente server-side: `CLASH_API_TOKEN` ou `SUPERCELL_API_TOKEN`
- nunca `NEXT_PUBLIC_*`
- nunca retornar token ao browser
- endpoints de sync protegidos
- player verify token nunca persistido
- Supabase service role somente servidor

## Regras de qualidade

- usar migrations para DDL
- manter RLS
- nada de resetar banco
- nada de duplicar players por nome
- upsert idempotente em todas as sincronizações
- preservar `raw jsonb` onde a API tem payload complexo e ainda estamos evoluindo a modelagem
- `timestamptz` para eventos reais
- separar `created_at/updated_at` do banco de `captured_at` da observação e dos tempos reais do Clash
- não inventar dados que API não entrega
- não chamar estimativa de dado exato
- UI responsiva mobile primeiro
- manter visual Clash atual
- novos assets visuais em PNG, não SVG

## Ordem de execução recomendada

1. Ler estado atual de `main` e este handoff.
2. Ler `Naian1/clash-api-explorer/lib/routes.js` e `api/explore.js`.
3. Inspecionar schema real do Supabase antes de qualquer migration.
4. Implementar migrations mínimas para histórico detalhado de war/CWL; Capital detalhado pode vir depois se quiser reduzir escopo.
5. Implementar `syncWarLogBackfill` + `syncCurrentWar` idempotentes.
6. Criar endpoint `/api/sync/war` protegido.
7. Configurar monitor externo compatível com free tier; NÃO criar cron Vercel subdiário em Hobby.
8. Fazer backfill dos resumos do warlog.
9. Capturar a guerra atual imediatamente para não perder os ataques que ainda estão disponíveis.
10. Atualizar `/wars` para juntar API live + DB histórico.
11. Criar estatísticas monitoradas por jogador, inclusive estrelas pelo clã calculadas a partir dos ataques.
12. Depois implementar CWL e Capital.
13. Atualizar profiles e score.
14. Rodar build/TypeScript.
15. Commitar em `main` somente com build passando.
16. Confirmar Vercel `READY` e `meta.githubCommitSha` igual ao commit final antes de declarar concluído.

Não devolva apenas um plano. Faça as alterações no código/banco necessárias, valide e entregue resumo final com migrations, commit SHA, deploy READY e o que já está sendo persistido versus o que permanece API-only.
