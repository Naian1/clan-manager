export type ClashIconUrls = {
  small?: string;
  medium?: string;
  large?: string;
  tiny?: string;
};

export type ClashLeague = {
  id?: number;
  name?: string;
  iconUrls?: ClashIconUrls;
};

export type ClashLabel = {
  id?: number;
  name?: string;
  iconUrls?: ClashIconUrls;
};

export type ClashPlayerItem = {
  name: string;
  level?: number;
  maxLevel?: number;
  village?: string;
  superTroopIsActive?: boolean;
  equipment?: Array<{ name?: string; level?: number; maxLevel?: number }>;
};

export type ClashClanMember = {
  tag: string;
  name: string;
  role?: string;
  townHallLevel?: number;
  trophies?: number;
  bestTrophies?: number;
  warStars?: number;
  donations?: number;
  donationsReceived?: number;
  clanRank?: number;
  previousClanRank?: number;
  expLevel?: number;
  league?: ClashLeague;
  leagueTier?: ClashLeague;
};

export type ClashClan = {
  tag: string;
  name: string;
  description?: string;
  badgeUrls?: ClashIconUrls;
  clanLevel?: number;
  members?: number;
  warLeague?: ClashLeague;
  capitalLeague?: ClashLeague;
  warWins?: number;
  warLosses?: number;
  warTies?: number;
  winStreak?: number;
  clanPoints?: number;
  clanBuilderBasePoints?: number;
  clanCapitalPoints?: number;
  requiredTrophies?: number;
  requiredBuilderBaseTrophies?: number;
  requiredTownhallLevel?: number;
  type?: string;
  isFamilyFriendly?: boolean;
  labels?: ClashLabel[];
  location?: { id?: number; name?: string; isCountry?: boolean; countryCode?: string };
  clanCapital?: { capitalHallLevel?: number; districts?: Array<{ id?: number; name?: string; districtHallLevel?: number }> };
  memberList?: ClashClanMember[];
};

export type ClashLeagueBattleLogEntry = {
  opponentPlayerTag?: string;
  opponentName?: string;
  stars?: number;
  destructionPercentage?: number;
  trophies?: number;
  creationTime?: string;
};

export type ClashPlayerLeagueGroup = {
  members?: Array<{
    playerTag?: string;
    playerName?: string;
    clanTag?: string;
    clanName?: string;
    leagueTrophies?: number;
    attackWinCount?: number;
    attackLoseCount?: number;
    defenseWinCount?: number;
    defenseLoseCount?: number;
  }>;
  attackLogs?: ClashLeagueBattleLogEntry[];
  defenseLogs?: ClashLeagueBattleLogEntry[];
};

export type ClashPlayer = {
  tag: string;
  name: string;
  townHallLevel?: number;
  townHallWeaponLevel?: number;
  expLevel?: number;
  trophies?: number;
  bestTrophies?: number;
  warStars?: number;
  attackWins?: number;
  defenseWins?: number;
  builderHallLevel?: number;
  builderBaseTrophies?: number;
  bestBuilderBaseTrophies?: number;
  donations?: number;
  donationsReceived?: number;
  role?: string;
  warPreference?: string;
  league?: ClashLeague;
  leagueTier?: ClashLeague;
  labels?: ClashLabel[];
  troops?: ClashPlayerItem[];
  heroes?: ClashPlayerItem[];
  spells?: ClashPlayerItem[];
  heroEquipment?: ClashPlayerItem[];
  achievements?: Array<{ name?: string; stars?: number; value?: number; target?: number; info?: string; completionInfo?: string }>;
  currentLeagueGroupTag?: string;
  currentLeagueSeasonId?: string | number;
  previousLeagueGroupTag?: string;
  previousLeagueSeasonId?: string | number;
};

export type ClashWarAttack = {
  attackerTag: string;
  defenderTag: string;
  stars: number;
  destructionPercentage: number;
  order?: number;
  duration?: number;
};

export type ClashWarMember = {
  tag: string;
  name: string;
  townhallLevel?: number;
  townHallLevel?: number;
  mapPosition: number;
  opponentAttacks?: number;
  bestOpponentAttack?: ClashWarAttack;
  attacks?: ClashWarAttack[];
};

export type ClashWarClan = {
  tag: string;
  name: string;
  badgeUrls?: ClashIconUrls;
  clanLevel?: number;
  attacks?: number;
  stars?: number;
  destructionPercentage?: number;
  members?: ClashWarMember[];
};

export type ClashCurrentWar = {
  state: 'notInWar' | 'preparation' | 'inWar' | 'warEnded' | string;
  teamSize?: number;
  attacksPerMember?: number;
  battleModifier?: string;
  preparationStartTime?: string;
  startTime?: string;
  endTime?: string;
  clan?: ClashWarClan;
  opponent?: ClashWarClan;
};

export type ClashWarLogEntry = {
  result?: string;
  endTime?: string;
  teamSize?: number;
  attacksPerMember?: number;
  battleModifier?: string;
  clan?: ClashWarClan;
  opponent?: ClashWarClan;
};

export type ClashWarLog = {
  items?: ClashWarLogEntry[];
  paging?: unknown;
};

export type ClashCwlLeagueGroup = {
  tag?: string;
  state: string;
  season: string;
  clans?: Array<{
    tag: string;
    clanLevel?: number;
    name: string;
    badgeUrls?: ClashIconUrls;
    members?: Array<{ tag: string; townHallLevel?: number; name: string }>;
  }>;
  rounds?: Array<{ warTags?: string[] }>;
};

export type ClashApiList<T = Record<string, unknown>> = {
  items?: T[];
  paging?: unknown;
};

export type ClashCapitalRaidMember = {
  tag: string;
  name: string;
  attacks?: number;
  attackLimit?: number;
  bonusAttackLimit?: number;
  capitalResourcesLooted?: number;
};

export type ClashCapitalRaidSeason = {
  state?: string;
  startTime: string;
  endTime?: string;
  capitalTotalLoot?: number;
  raidsCompleted?: number;
  totalAttacks?: number;
  enemyDistrictsDestroyed?: number;
  offensiveReward?: number;
  defensiveReward?: number;
  members?: ClashCapitalRaidMember[];
  attackLog?: unknown[];
  defenseLog?: unknown[];
};

export type ClashCapitalRaidSeasons = ClashApiList<ClashCapitalRaidSeason>;
export type ClashPlayerBattleLog = ClashApiList<Record<string, unknown>>;
export type ClashPlayerLeagueHistory = ClashApiList<Record<string, unknown>>;
