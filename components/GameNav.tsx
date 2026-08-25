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
        .shared-game-nav{
          position:sticky;top:6px;z-index:80;
          width:min(980px,calc(100% - 14px));
          margin:8px auto 22px;padding:0;
          display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;
          background:transparent;border:0;border-radius:0;box-shadow:none;backdrop-filter:none;
        }
        .shared-nav-item{
          min-width:0;height:62px;
          display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;
          text-decoration:none;color:#fff;font-weight:900;font-size:10px;
          text-shadow:0 2px 0 #24130b;
          background:url('/assets/clash/wood-tab.png') center/100% 100% no-repeat;
          filter:drop-shadow(0 4px 3px #0008);
          transition:transform .15s ease,filter .15s ease,box-shadow .15s ease;
        }
        .shared-nav-item.active{
          background-image:url('/assets/clash/wood-tab.png');
          transform:translateY(-2px);
          filter:saturate(1.45) brightness(1.18) drop-shadow(0 5px 4px #0009);
          box-shadow:inset 0 0 0 3px #ffd331,inset 0 0 18px #ffe987aa,0 0 10px #ffdb3b66;
          border-radius:15px;
        }
        .shared-nav-item:active{transform:translateY(1px)}
        .clash-icon{
          display:block;width:31px;height:31px;
          background-image:url('/assets/clash/icons-clash-final.png');
          background-size:300% 400%;background-repeat:no-repeat;
          filter:drop-shadow(0 3px 2px #0007);flex:none;
        }
        .ico-home{background-position:0% 0%}.ico-players{background-position:50% 0%}.ico-wars{background-position:100% 0%}.ico-cwl{background-position:0% 33.333%}.ico-capital{background-position:50% 33.333%}.ico-admin{background-position:100% 33.333%}.ico-donations{background-position:0% 66.666%}.ico-received{background-position:50% 66.666%}.ico-streak{background-position:100% 66.666%}.ico-stars{background-position:0% 100%}.ico-raid{background-position:50% 100%}.ico-alerts{background-position:100% 100%}
        @media(max-width:760px){
          .shared-game-nav{width:calc(100% - 10px);margin:5px auto 16px;gap:2px;top:4px}
          .shared-nav-item{height:47px;font-size:7px}
          .shared-nav-item.active{border-radius:11px;box-shadow:inset 0 0 0 2px #ffd331,inset 0 0 12px #ffe98799,0 0 7px #ffdb3b55}
          .shared-nav-item .clash-icon{width:23px;height:23px}
        }
      `}</style>
    </>
  );
}
