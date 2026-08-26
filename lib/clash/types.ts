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
  memberList?: ClashClanMember[];
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
  achievements?: Array<{ name?: string; stars?: number; value?: number; target?: number; info?: string }>;
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
