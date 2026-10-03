/* SAIL · mysail.ai — Sprache, Navigation, Kontaktformular und Animationen */
(()=>{
  const d=document,root=d.documentElement;
  root.classList.add('js');
  const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HOVER=matchMedia('(hover:hover)').matches;
  const $=(s,c=d)=>c.querySelector(s),$$=(s,c=d)=>[...c.querySelectorAll(s)];
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));

  /* ── Zähler ── */
  const fmt=(v,dec)=>v.toLocaleString(root.lang==='de'?'de-DE':'en-US',{minimumFractionDigits:dec,maximumFractionDigits:dec});
  const paint=(el,v)=>{el.textContent=(el.dataset.pre||'')+fmt(v,+(el.dataset.dec||0))+(el.dataset.suf||'')};
  function count(el){
    const to=+el.dataset.to;el._done=true;
    if(RM){paint(el,to);return}
    const t0=performance.now(),dur=1500,id=(el._run=(el._run||0)+1);
    (function tick(t){
      if(el._run!==id)return;
      const p=clamp((t-t0)/dur);paint(el,to*(1-Math.pow(1-p,3)));
      if(p<1)requestAnimationFrame(tick);
    })(t0);
  }
  const refreshCounters=()=>$$('[data-to]').forEach(el=>{if(el._done){el._run=(el._run||0)+1;paint(el,+el.dataset.to)}});

  /* ── Sprache: ?lang → gespeicherte Wahl → Browsersprache ── */
  const KEY='sail.lang';
  function detect(){
    try{const q=new URLSearchParams(location.search).get('lang');if(q==='de'||q==='en')return q}catch(e){}
    try{const s=localStorage.getItem(KEY);if(s==='de'||s==='en')return s}catch(e){}
    return (navigator.language||'en').toLowerCase().indexOf('de')===0?'de':'en';
  }
  function apply(l){
    root.lang=l;
    try{localStorage.setItem(KEY,l)}catch(e){}
    $$('.lang button').forEach(b=>b.classList.toggle('on',b.dataset.lang===l));
    const t=$('title');if(t&&t.dataset[l])d.title=t.dataset[l];
    const m=$('meta[name=description]');if(m&&m.dataset[l])m.content=m.dataset[l];
    refreshCounters();
  }
  apply(detect());
  if(!RM)$$('[data-to]').forEach(el=>paint(el,0));

  /* ── Navigation ── */
  const top=$('.top'),burger=$('.burger');
  const closeMenu=()=>{if(top)top.classList.remove('open');if(burger)burger.setAttribute('aria-expanded','false')};
  if(top){
    const s=d.createElement('div');
    s.style.cssText='position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
    d.body.prepend(s);
    new IntersectionObserver(([e])=>top.classList.toggle('stuck',!e.isIntersecting)).observe(s);
  }
  d.addEventListener('click',e=>{
    const b=e.target.closest('.lang button');if(b){apply(b.dataset.lang);return}
    if(e.target.closest('.burger')&&top){burger.setAttribute('aria-expanded',top.classList.toggle('open'));return}
    if(e.target.closest('.mnav a'))closeMenu();
  });
  d.addEventListener('keydown',e=>{if(e.key==='Escape'&&top&&top.classList.contains('open')){closeMenu();burger.focus()}});
  const path=location.pathname.split('/').pop()||'index.html';
  $$('.nav a,.mnav a').forEach(a=>{
    const h=a.getAttribute('href')||'';
    if(h===path||(path==='index.html'&&h==='./')||h.replace('./','')===path)a.classList.add('on');
  });

  /* ── Kontaktformular → mailto ── */
  const form=$('#cform');
  if(form)form.addEventListener('submit',e=>{
    e.preventDefault();
    const v=id=>{const el=d.getElementById(id);return el?el.value:''};
    const de=root.lang==='de';
    const subj=(de?'SAIL Anfrage – ':'SAIL inquiry – ')+v('c-name')+(v('c-company')?' ('+v('c-company')+')':'');
    const body=v('c-msg')+'\n\n'+v('c-name')+' · '+v('c-company')+' · '+v('c-email')+(v('c-topic')?'\n'+(de?'Thema: ':'Topic: ')+v('c-topic'):'');
    const ok=d.getElementById('ok');if(ok)ok.style.display='block';
    location.href='mailto:hello@mysail.ai?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);
  });

  /* ── Reveals: einmalig beim Sichtbarwerden; Unterseiten werden automatisch markiert ── */
  $$('.sec .kicker,.sec .h2,.sec .h3,.sec .intro,.card,.step,.shot,.figure,.callout,.faq details,.ptable,.form').forEach(el=>{
    if(el.classList.contains('rv')||el.closest('.cine,.flow,.rv,.rv-clip,.phead,.hero'))return;
    el.classList.add('rv');
    const i=[...el.parentNode.children].filter(c=>c.matches('.card,.step,details')).indexOf(el);
    if(i>0)el.style.setProperty('--i',Math.min(i,6));
  });
  const io=new IntersectionObserver(es=>{
    for(const e of es)if(e.isIntersecting){
      const el=e.target;el.classList.add('in');
      $$('[data-to]:not([data-flow])',el).forEach(count);
      setTimeout(()=>el.style.setProperty('--i','0'),2200);   /* danach reagieren Hover-Effekte ohne Verzögerung */
      io.unobserve(el);
    }
  },{threshold:.14,rootMargin:'0px 0px -6% 0px'});
  $$('.rv,.rv-clip,[data-in]').forEach(el=>{
    if(RM){el.classList.add('in');$$('[data-to]',el).forEach(count)}else io.observe(el);
  });

  /* ── Workflow (Startseite): angeheftet auf großen Bildschirmen, sonst gestapelt ── */
  const flow=$('#workflow.flow'),items=flow?$$('.flow-item',flow):[];
  let pinned=false,cur=-1;
  function activate(it){
    if(it.classList.contains('is-on'))return;
    it.classList.add('is-on');$$('[data-flow]',it).forEach(count);
  }
  function setStep(i){
    if(i===cur)return;cur=i;
    items.forEach((it,k)=>{if(k===i)activate(it);else it.classList.remove('is-on')});
  }
  if(flow){
    const pinMQ=matchMedia('(min-width:960px) and (min-height:640px)');
    const stackIO=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!pinned)activate(e.target)}),{threshold:.3});
    const layoutFlow=()=>{
      pinned=pinMQ.matches&&!RM;flow.classList.toggle('pinned',pinned);cur=-1;
      if(RM){items.forEach(it=>it.classList.add('is-on'));return}
      items.forEach(it=>{it.classList.remove('is-on');if(pinned)stackIO.unobserve(it);else stackIO.observe(it)});
    };
    layoutFlow();pinMQ.addEventListener('change',layoutFlow);
  }

  /* ── Scroll-Fortschritt: jede Szene bekommt --p (0…1), weich nachlaufend ── */
  const hero=$('#hero');
  const scenes=$$('[data-scroll],footer').map(el=>({el,mode:el.dataset.scroll||'',p:0,t:0,on:false,last:-1}));
  if(RM){
    scenes.forEach(s=>s.el.style.setProperty('--p',s.mode==='top'?1:s.el.tagName==='FOOTER'?0:.5));
  }else if(scenes.length){
    const sio=new IntersectionObserver(es=>es.forEach(e=>{const s=scenes.find(s=>s.el===e.target);if(s)s.on=e.isIntersecting}),{rootMargin:'15% 0px'});
    scenes.forEach(s=>sio.observe(s.el));
    let mx=0,my=0,tx=0,ty=0,raf=0;
    if(hero&&HOVER)hero.addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-.5)*2;ty=(e.clientY/innerHeight-.5)*2});
    const frame=()=>{
      const vh=innerHeight;
      for(const s of scenes){
        if(!s.on)continue;
        const r=s.el.getBoundingClientRect();
        s.t=s.mode==='pin'?clamp(-r.top/Math.max(1,r.height-vh))
           :s.mode==='top'?clamp(scrollY/(vh*.62))
           :clamp((vh-r.top)/(vh+r.height));
        s.p+=(s.t-s.p)*.14;if(Math.abs(s.t-s.p)<.0005)s.p=s.t;
        if(s.p!==s.last){s.last=s.p;s.el.style.setProperty('--p',s.p.toFixed(4))}
        if(s.el===flow&&pinned)setStep(s.p<.2?0:s.p<.45?1:s.p<.7?2:3);
      }
      if(hero&&(Math.abs(tx-mx)>.001||Math.abs(ty-my)>.001)){
        mx+=(tx-mx)*.06;my+=(ty-my)*.06;
        hero.style.setProperty('--mx',mx.toFixed(3));hero.style.setProperty('--my',my.toFixed(3));
      }
      raf=requestAnimationFrame(frame);
    };
    raf=requestAnimationFrame(frame);
    d.addEventListener('visibilitychange',()=>{cancelAnimationFrame(raf);if(!d.hidden)raf=requestAnimationFrame(frame)});
  }

  /* ── Rauch-Textur: einmalig auf kleiner Canvas erzeugt, per CSS groß gezogen und langsam verschoben ── */
  function makeSmoke(){
    const w=512,h=256,c=d.createElement('canvas');c.width=w;c.height=h;
    const x=c.getContext('2d');if(!x)return;
    const im=x.createImageData(w,h),D=im.data;
    let s=20261003;const rnd=()=>(s=s*16807%2147483647)/2147483647;
    const oct=[[5,3],[10,6],[20,12],[40,24],[80,48]].map(([gx,gy])=>{const g=new Float32Array(gx*gy);for(let i=0;i<g.length;i++)g[i]=rnd();return{gx,gy,g}});
    const sm=t=>t*t*(3-2*t);
    for(let j=0;j<h;j++){
      const fade=Math.pow(Math.sin(Math.PI*j/h),1.6);   /* oben und unten weich auslaufen – keine Maske nötig */
      for(let i=0;i<w;i++){
        let v=0,amp=1,tot=0;
        for(const{gx,gy,g}of oct){
          const fx=i/w*gx,fy=j/h*gy,x0=fx|0,y0=fy|0,tx=sm(fx-x0),ty=sm(fy-y0),x1=(x0+1)%gx,y1=(y0+1)%gy;
          const a=g[y0*gx+x0],b=g[y0*gx+x1],e=g[y1*gx+x0],f=g[y1*gx+x1],top=a+(b-a)*tx;
          v+=amp*(top+((e+(f-e)*tx)-top)*ty);tot+=amp;amp*=.6;
        }
        const al=clamp((v/tot-.34)*2.3)*fade,k=(j*w+i)*4;
        D[k]=168;D[k+1]=204;D[k+2]=255;D[k+3]=al*al*175;
      }
    }
    x.putImageData(im,0,0);
    c.toBlob(b=>{if(!b)return;root.style.setProperty('--smoke',`url(${URL.createObjectURL(b)})`);requestAnimationFrame(()=>root.classList.add('smoke-on'))});
  }
  if($('.smoke'))('requestIdleCallback' in window?requestIdleCallback:setTimeout)(makeSmoke,{timeout:1200});

  /* ── Dauerschleifen außerhalb des Sichtfelds pausieren ── */
  const pio=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('paused',!e.isIntersecting)),{rootMargin:'10% 0px'});
  $$('.cine,.sec,.phead,.hero,footer').forEach(s=>pio.observe(s));

  /* ── Micro-Interactions ── */
  if(!RM&&HOVER){
    $$('.magnetic').forEach(el=>{
      el.addEventListener('pointermove',e=>{
        const r=el.getBoundingClientRect();
        el.style.translate=`${(e.clientX-r.left-r.width/2)*.22}px ${(e.clientY-r.top-r.height/2)*.3}px`;
      });
      el.addEventListener('pointerleave',()=>{el.style.translate=''});
    });
    $$('.gt,.card').forEach(el=>el.addEventListener('pointermove',e=>{
      const r=el.getBoundingClientRect();
      el.style.setProperty('--gx',(e.clientX-r.left)+'px');el.style.setProperty('--gy',(e.clientY-r.top)+'px');
    }));
  }

  /* ── Diagramme: nur der Auftritt wird animiert, der Endzustand ist das Original ── */
  if(!RM){
    const ease='cubic-bezier(.16,1,.3,1)';
    const fio=new IntersectionObserver(es=>es.forEach(en=>{
      if(!en.isIntersecting)return;fio.unobserve(en.target);
      $$('svg',en.target).forEach(svg=>{
        if(getComputedStyle(svg).display==='none')return;
        $$('path[fill="none"]',svg).forEach((p,i)=>{
          const da=p.getAttribute('stroke-dasharray');
          if(da){   /* gestrichelte Rückkopplung: Striche fließen */
            const per=da.split(/[\s,]+/).reduce((a,n)=>a+(+n||0),0)||12;
            p.style.setProperty('--dl',(-per*2)+'px');p.classList.add('flowdash');return;
          }
          const L=p.getTotalLength();p.style.strokeDasharray=L;
          p.animate([{strokeDashoffset:L},{strokeDashoffset:0}],{duration:1000,delay:150+Math.min(i,14)*80,easing:ease,fill:'backwards'})
            .onfinish=()=>{p.style.strokeDasharray=''};
        });
        $$('rect[fill^="url(#gacc"]',svg).forEach((r,i)=>{
          if(+r.getAttribute('height')>10)return;   /* nur die Gewichts-Regler */
          const w=+r.getAttribute('width'),o={duration:1300,delay:600+i*120,easing:ease,fill:'backwards'};
          r.style.transformBox='fill-box';r.style.transformOrigin='0 50%';
          r.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],o);
          const k=r.nextElementSibling;
          if(k&&k.tagName.toLowerCase()==='circle')k.animate([{transform:`translateX(${-w}px)`},{transform:'translateX(0)'}],o);
        });
      });
    }),{threshold:.2});
    $$('.figure').forEach(f=>fio.observe(f));
  }
})();
