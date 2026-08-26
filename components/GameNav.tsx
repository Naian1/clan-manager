import Link from 'next/link';

const items = [
  ['home', 'Visão geral', '/', 'home'],
  ['players', 'Jogadores', '/players', 'players'],
  ['wars', 'Guerras', '/wars', 'wars'],
  ['cwl', 'CWL', '/cwl', 'cwl'],
  ['capital', 'Capital', '/capital', 'capital'],
] as const;

export default function GameNav({ active }: { active: string }) {
  return <nav className="game-nav" aria-label="Navegação principal">
    {items.map(([key, label, href, icon]) => <Link key={key} href={href} className={`game-nav-item ${active === key ? 'active' : ''}`}>
      <span className={`game-icon icon-${icon}`} aria-hidden="true"/><span>{label}</span>
    </Link>)}
  </nav>;
}
