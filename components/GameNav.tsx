import Link from 'next/link';

const items = [
  ['home','Visão geral','/'],
  ['players','Jogadores','/players'],
  ['wars','Guerras','/wars'],
  ['cwl','CWL','/cwl'],
  ['capital','Capital','/capital'],
  ['admin','Admin','/admin'],
] as const;

export default function GameNav({ active }: { active: string }) {
  return (
    <>
      <nav className="shared-game-nav" aria-label="Navegação principal">
        {items.map(([icon,label,href]) => (
          <Link key={icon} href={href} className={`shared-nav-item ${active === icon ? 'active' : ''}`}>
            <span className={`clash-icon ico-${icon}`} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
      <style>{`
        .shared-game-nav{position:sticky;top:0;z-index:80;width:min(960px,calc(100% - 18px));margin:10px auto 24px;padding:7px 9px;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;background:rgba(25,33,39,.96);border:2px solid #10171c;border-radius:16px;box-shadow:0 7px 0 #11191e,0 13px 24px #0008;backdrop-filter:blur(6px)}
        .shared-nav-item{height:64px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;text-decoration:none;color:#fff;font-weight:900;font-size:11px;text-shadow:0 2px 0 #24130b;background:url('/assets/clash/nav-wood-final.png') center/100% 100% no-repeat;filter:drop-shadow(0 3px 2px #0008);transition:.15s transform,.15s filter}
        .shared-nav-item.active{background-image:url('/assets/clash/nav-active-final.png');transform:translateY(-2px);filter:drop-shadow(0 5px 4px #0009) brightness(1.1)}
        .clash-icon{display:block;width:34px;height:34px;background-image:url('/assets/clash/icons-clash-final.png');background-size:300% 400%;background-repeat:no-repeat;filter:drop-shadow(0 3px 2px #0007);flex:none}
        .ico-home{background-position:0% 0%}.ico-players{background-position:50% 0%}.ico-wars{background-position:100% 0%}.ico-cwl{background-position:0% 33.333%}.ico-capital{background-position:50% 33.333%}.ico-admin{background-position:100% 33.333%}.ico-donations{background-position:0% 66.666%}.ico-received{background-position:50% 66.666%}.ico-streak{background-position:100% 66.666%}.ico-stars{background-position:0% 100%}.ico-raid{background-position:50% 100%}.ico-alerts{background-position:100% 100%}
        @media(max-width:760px){.shared-game-nav{width:calc(100% - 12px);margin:6px auto 18px;padding:5px;gap:2px;border-radius:12px}.shared-nav-item{height:51px;font-size:7.5px}.shared-nav-item .clash-icon{width:28px;height:28px}}
      `}</style>
    </>
  );
}
