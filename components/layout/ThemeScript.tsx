import { THEME_STORAGE_KEY } from "@/lib/theme";

export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');var d=t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.classList.toggle('dark',d);r.style.colorScheme=d?'dark':'light';var c=d?'#0E1219':'#FFFFFF';var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',c);}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
