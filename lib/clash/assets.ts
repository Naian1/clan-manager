const CLASHKING_RAW = 'https://raw.githubusercontent.com/ClashKingInc/ClashKingAssets/main/assets';

function slugLeague(name?: string | null) {
  if (!name) return null;
  const match = name.trim().match(/^(.+?)\s+(I|II|III)$/i);
  if (!match) return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const roman = match[2].toUpperCase();
  const division = roman === 'I' ? '1' : roman === 'II' ? '2' : '3';
  return `${match[1].trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}_${division}`;
}

export function cwlLeagueIcon(name?: string | null) {
  const slug = slugLeague(name);
  return slug ? `${CLASHKING_RAW}/leagues/cwl/${slug}.png` : null;
}

export function capitalLeagueIcon(name?: string | null) {
  const slug = slugLeague(name);
  return slug ? `${CLASHKING_RAW}/leagues/capital-leagues/${slug}.png` : null;
}
