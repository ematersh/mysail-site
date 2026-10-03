(function(){
  var KEY='sail.lang';
  function detect(){
    try{ var q=new URLSearchParams(location.search).get('lang'); if(q==='de'||q==='en') return q; }catch(e){}
    try{ var s=localStorage.getItem(KEY); if(s==='de'||s==='en') return s; }catch(e){}
    var n=(navigator.language||'en').toLowerCase();
    return n.indexOf('de')===0?'de':'en';
  }
  function apply(l){
    document.documentElement.lang=l;
    try{ localStorage.setItem(KEY,l); }catch(e){}
    document.querySelectorAll('.lang button').forEach(function(b){ b.classList.toggle('on', b.dataset.lang===l); });
    var t=document.querySelector('title'); if(t&&t.dataset[l]) document.title=t.dataset[l];
    var m=document.querySelector('meta[name=description]'); if(m&&m.dataset[l]) m.content=m.dataset[l];
  }
  apply(detect());
  document.addEventListener('click',function(e){
    var b=e.target.closest('.lang button'); if(b){ apply(b.dataset.lang); return; }
    var g=e.target.closest('.burger'); if(g){ document.querySelector('.top').classList.toggle('open'); return; }
    if(e.target.closest('.mnav a')) document.querySelector('.top').classList.remove('open');
  });
  // mark active nav
  var path=(location.pathname.split('/').pop()||'index.html');
  document.querySelectorAll('.nav a,.mnav a').forEach(function(a){ var h=a.getAttribute('href'); if(h===path||(path==='index.html'&&h==='./')||(h.replace('./','')===path)) a.classList.add('on'); });
  // contact form -> mailto
  var f=document.getElementById('cform');
  if(f){ f.addEventListener('submit',function(e){
    e.preventDefault();
    var v=function(id){ var el=document.getElementById(id); return el?el.value:''; };
    var de=document.documentElement.lang==='de';
    var subj=(de?'SAIL Anfrage – ':'SAIL inquiry – ')+v('c-name')+(v('c-company')?' ('+v('c-company')+')':'');
    var body=v('c-msg')+'\n\n'+v('c-name')+' · '+v('c-company')+' · '+v('c-email')+(v('c-topic')?'\n'+(de?'Thema: ':'Topic: ')+v('c-topic'):'');
    var ok=document.getElementById('ok'); if(ok) ok.style.display='block';
    location.href='mailto:hello@mysail.ai?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(body);
  }); }
})();
