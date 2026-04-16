/* ── PRODUCT SEARCH MODAL ── */
(function(){
  const toggleBtn = document.getElementById('productSearchToggle');
  const modal = document.getElementById('productSearchModal');
  const closeBtn = document.getElementById('productSearchClose');
  const typeSelect = document.getElementById('productSearchType');
  const titleEl = document.getElementById('productSearchTitle');
  const input = document.getElementById('productSearchInput');
  const colName = document.getElementById('searchColName');
  const colMeta = document.getElementById('searchColMeta');
  const table = modal.querySelector('.search-table');
  const tbody = document.getElementById('productSearchBody');
  const empty = document.getElementById('productSearchEmpty');
  if (!toggleBtn||!modal||!closeBtn||!typeSelect||!titleEl||!input||!colName||!colMeta||!table||!tbody||!empty) return;

  const norm = (s='') => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  let products=[], blogs=[];

  function collectProducts(){
    products=[...document.querySelectorAll('.products-grid .product-card')].map((card,i)=>({
      idx:i+1,
      name:card.querySelector('.product-name')?.textContent?.trim()||'',
      meta:card.querySelector('.product-price')?.textContent?.trim()||'',
      link:'#products'
    }));
  }
  function collectBlogs(){
    blogs=[...document.querySelectorAll('.blog-grid .blog-card')].map((card,i)=>{
      const linkEl=card.querySelector('.blog-title a');
      return {idx:i+1,name:linkEl?.textContent?.trim()||'',meta:'',link:linkEl?.getAttribute('href')||'/blog'};
    });
  }
  function isBlogMode(){ return typeSelect.value==='blog'; }
  function updateSearchUI(){
    const b=isBlogMode();
    titleEl.textContent=b?'Tìm kiếm Blog':'Tìm kiếm Sản phẩm';
    input.placeholder=b?'Nhập tiêu đề blog...':'Nhập tên sản phẩm...';
    colName.textContent=b?'Tiêu đề Blog':'Tên sản phẩm';
    colMeta.textContent='Giá';
    table.classList.toggle('blog-mode',b);
    empty.textContent=b?'Không tìm thấy bài blog phù hợp.':'Không tìm thấy sản phẩm phù hợp.';
  }
  function renderRows(keyword=''){
    const kw=norm(keyword);
    const blogMode=isBlogMode();
    const source=blogMode?blogs:products;
    const filtered=source.filter(item=>norm(item.name).includes(kw));
    tbody.innerHTML='';
    filtered.forEach((p,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${i+1}</td><td><div class="search-name-scroll">${p.name}</div></td><td class="${blogMode?'meta':'price'}">${p.meta}</td><td><a class="search-go" href="${p.link}">Xem</a></td>`;
      tbody.appendChild(tr);
    });
    empty.style.display=filtered.length?'none':'block';
  }
  function openModal(){
    collectProducts(); collectBlogs();
    updateSearchUI(); renderRows(input.value);
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    setTimeout(()=>input.focus(),20);
  }
  function closeModal(){
    modal.classList.remove('open'); modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }
  toggleBtn.addEventListener('click',openModal);
  closeBtn.addEventListener('click',closeModal);
  modal.addEventListener('click',e=>{
    if(!(e.target instanceof Element)) return;
    if(e.target.hasAttribute('data-close-search')) closeModal();
    if(e.target.closest('.search-go')) closeModal();
  });
  input.addEventListener('input',()=>renderRows(input.value));
  typeSelect.addEventListener('change',()=>{ updateSearchUI(); renderRows(input.value); input.focus(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&modal.classList.contains('open')) closeModal(); });
})();

/* ── MOBILE NAV ── */
const mobileNav=document.getElementById('mobileNav');
function closeMobileNav(){
  mobileNav.classList.remove('open');
  document.querySelectorAll('.mobile-acc-item.open').forEach(i=>{
    i.classList.remove('open');
    i.querySelector('.mobile-accordion-trigger')?.setAttribute('aria-expanded','false');
  });
}
document.getElementById('mobileMenu').addEventListener('click',()=>mobileNav.classList.add('open'));
document.getElementById('mobileNavClose').addEventListener('click',closeMobileNav);
document.getElementById('mobileNavBackdrop').addEventListener('click',closeMobileNav);
document.querySelectorAll('.mobile-accordion-trigger').forEach(t=>{
  t.addEventListener('click',()=>{
    const item=t.closest('.mobile-acc-item');
    const isOpen=item.classList.contains('open');
    document.querySelectorAll('.mobile-acc-item.open').forEach(o=>{
      o.classList.remove('open');
      o.querySelector('.mobile-accordion-trigger')?.setAttribute('aria-expanded','false');
    });
    item.classList.toggle('open',!isOpen);
    t.setAttribute('aria-expanded',String(!isOpen));
  });
});

/* ── HEADER SCROLL ── */
function updateScrollUI(){
  const y=window.scrollY;
  document.getElementById('header').classList.toggle('scrolled',y>50);
  document.getElementById('scrollTop').classList.toggle('visible',y>500);
  document.querySelector('.floating-contact')?.classList.toggle('visible',y>120);
}
window.addEventListener('scroll',updateScrollUI);
updateScrollUI();

/* ── FADE UP ── */
const fadeEls=document.querySelectorAll('.fade-up');
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);} });
},{threshold:.05,rootMargin:'0px 0px 40px 0px'});
fadeEls.forEach(el=>{
  if(el.getBoundingClientRect().top<window.innerHeight) el.classList.add('visible');
  else io.observe(el);
});

/* ── GENERIC FADE DRAG SLIDER ── */
function makeFadeDragSlider(frameId,slideSelector){
  const frame=document.getElementById(frameId); if(!frame) return;
  const slides=[...frame.querySelectorAll(slideSelector)]; if(!slides.length) return;
  let dotsWrap=frame.querySelector('.slider-dots');
  if(!dotsWrap){dotsWrap=document.createElement('div');dotsWrap.className='slider-dots';frame.appendChild(dotsWrap);}
  let idx=slides.findIndex(s=>s.classList.contains('active'));
  if(idx<0) idx=0;
  let dots=[],timer=null,isDragging=false,pointerId=null,startX=0,deltaX=0;
  function buildDots(){
    dotsWrap.innerHTML='';
    dots=slides.map((_,i)=>{
      const dot=document.createElement('button');
      dot.type='button';
      dot.className='slider-dot'+(i===idx?' active':'');
      dot.addEventListener('click',()=>{go(i);stopAuto();startAuto();});
      dotsWrap.appendChild(dot); return dot;
    });
  }
  function go(n){
    idx=(n+slides.length)%slides.length;
    slides.forEach((s,i)=>s.classList.toggle('active',i===idx));
    dots.forEach((d,i)=>d.classList.toggle('active',i===idx));
  }
  function stopAuto(){if(timer){clearInterval(timer);timer=null;}}
  function startAuto(){stopAuto();if(slides.length>1)timer=setInterval(()=>go(idx+1),4600);}
  function onDown(e){
    if(e.pointerType==='mouse'&&e.button!==0)return;
    if(e.target.closest('.slider-dot'))return;
    pointerId=e.pointerId;isDragging=true;startX=e.clientX;deltaX=0;
    frame.classList.add('dragging');stopAuto();frame.setPointerCapture?.(pointerId);
  }
  function onMove(e){if(!isDragging||e.pointerId!==pointerId)return;deltaX=e.clientX-startX;}
  function onUp(e){
    if(!isDragging||e.pointerId!==pointerId)return;
    isDragging=false;frame.classList.remove('dragging');
    frame.releasePointerCapture?.(pointerId);pointerId=null;
    if(deltaX>42)go(idx-1);else if(deltaX<-42)go(idx+1);
    startAuto();
  }
  frame.addEventListener('pointerdown',onDown);
  frame.addEventListener('pointermove',onMove);
  frame.addEventListener('pointerup',onUp);
  frame.addEventListener('pointercancel',onUp);
  frame.addEventListener('dragstart',e=>e.preventDefault());
  document.addEventListener('visibilitychange',()=>document.hidden?stopAuto():startAuto());
  buildDots();go(idx);startAuto();
}
makeFadeDragSlider('midSlider','.mid-slide');
makeFadeDragSlider('resultsFrame','.results-slide');

/* ── STRIP SLIDER ── */
(function(){
  const root=document.getElementById('midStripSlider');if(!root)return;
  const wrap=root.querySelector('.mid-strip-wrap');
  const viewport=root.querySelector('.mid-strip-viewport');
  const track=document.getElementById('midStripTrack');
  const cards=[...root.querySelectorAll('.mid-strip-card')];
  if(!wrap||!viewport||!track||!cards.length)return;
  let dotsWrap=root.querySelector('.strip-dots');
  if(!dotsWrap){dotsWrap=document.createElement('div');dotsWrap.className='strip-dots';wrap.appendChild(dotsWrap);}
  let idx=0,timer=null;
  let isDragging=false,pointerId=null,startX=0,startOffset=0,currentOffset=0;
  let dots=[];
  const vis=()=>window.innerWidth<=680?1:window.innerWidth<=1024?2:3;
  const pages=()=>Math.max(1,cards.length-vis()+1);
  const gap=()=>parseFloat(window.getComputedStyle(track).columnGap||window.getComputedStyle(track).gap||'0')||18;
  const step=()=>cards[0].getBoundingClientRect().width+gap();
  const minOff=()=>-Math.max(0,pages()-1)*step();
  const clamp=v=>Math.max(minOff(),Math.min(0,v));
  function buildDots(){
    const count=pages();if(dots.length===count)return;
    dotsWrap.innerHTML='';dots=[];
    for(let i=0;i<count;i++){
      const dot=document.createElement('button');dot.type='button';
      dot.className='strip-dot'+(i===idx?' active':'');
      dot.addEventListener('click',()=>{idx=i;applyOffset(-idx*step(),true);syncDots();stopAuto();startAuto();});
      dotsWrap.appendChild(dot);dots.push(dot);
    }
  }
  function syncDots(){dots.forEach((d,i)=>d.classList.toggle('active',i===idx));}
  function applyOffset(v,animate=true){
    track.style.transition=animate?'transform .42s cubic-bezier(.4,0,.2,1)':'none';
    currentOffset=clamp(v);track.style.transform=`translateX(${currentOffset}px)`;
  }
  function snapToNearest(){
    const s=step();if(!s)return;
    idx=Math.max(0,Math.min(Math.round(Math.abs(currentOffset)/s),pages()-1));
    applyOffset(-idx*s,true);buildDots();syncDots();
  }
  function stopAuto(){if(timer){clearInterval(timer);timer=null;}}
  function startAuto(){
    stopAuto();
    if(pages()>1)timer=setInterval(()=>{idx=(idx+1)%pages();applyOffset(-idx*step(),true);syncDots();},4300);
  }
  function onDown(e){
    if(e.pointerType==='mouse'&&e.button!==0)return;
    isDragging=true;pointerId=e.pointerId;startX=e.clientX;startOffset=currentOffset;
    viewport.classList.add('dragging');stopAuto();viewport.setPointerCapture?.(pointerId);
  }
  function onMove(e){if(!isDragging||e.pointerId!==pointerId)return;applyOffset(startOffset+(e.clientX-startX),false);}
  function onUp(e){
    if(!isDragging||e.pointerId!==pointerId)return;
    isDragging=false;viewport.classList.remove('dragging');
    viewport.releasePointerCapture?.(pointerId);pointerId=null;
    snapToNearest();startAuto();
  }
  viewport.addEventListener('pointerdown',onDown);
  viewport.addEventListener('pointermove',onMove);
  viewport.addEventListener('pointerup',onUp);
  viewport.addEventListener('pointercancel',onUp);
  viewport.addEventListener('dragstart',e=>e.preventDefault());
  window.addEventListener('resize',()=>{idx=Math.min(idx,pages()-1);applyOffset(-idx*step(),true);buildDots();syncDots();});
  document.addEventListener('visibilitychange',()=>document.hidden?stopAuto():startAuto());
  buildDots();syncDots();applyOffset(0,true);startAuto();
})();

/* ── PRODUCT TABS ── */
(()=>{  
  const tabBtns=[...document.querySelectorAll('.products-tabs .tab-btn')];
  const cards=[...document.querySelectorAll('.products-grid .product-card')];
  if(!tabBtns.length||!cards.length) return;

  function applyFilter(btn){
    tabBtns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const cat=btn.dataset.cat||'all';
    cards.forEach(card=>{
      card.style.display=(cat==='all'||card.dataset.cat===cat)?'':'none';
    });
  }

  tabBtns.forEach(btn=>btn.addEventListener('click',()=>applyFilter(btn)));
  applyFilter(tabBtns.find(b=>b.classList.contains('active'))||tabBtns[0]);
})();

/* ── PRODUCT CUSTOM SELECT ── */
(()=>{
  const wraps=[...document.querySelectorAll('.product-select-wrap')];
  if(!wraps.length) return;

  function setOpen(wrap, open){
    wrap.classList.toggle('open', open);
    wrap.style.zIndex=open?'40':'';
    const card=wrap.closest('.product-card');
    if(card) card.classList.toggle('open-dropdown', open);
    const toggle=wrap.querySelector('.custom-select-toggle');
    if(toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeAll(except=null){
    wraps.forEach(w=>{ if(w!==except) setOpen(w,false); });
  }

  wraps.forEach((wrap, index)=>{
    const select=wrap.querySelector('.product-select');
    if(!select || wrap.dataset.customized==='1') return;
    wrap.dataset.customized='1';
    wrap.classList.add('enhanced');

    if(!select.id) select.id=`productSelect${index+1}`;

    const toggle=document.createElement('button');
    toggle.type='button';
    toggle.className='custom-select-toggle';
    toggle.setAttribute('aria-haspopup','listbox');
    toggle.setAttribute('aria-expanded','false');
    toggle.innerHTML=
      '<span class="custom-select-value"></span>'+
      '<span class="custom-select-icon" aria-hidden="true">'+
      '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>'+
      '</span>';

    const menu=document.createElement('div');
    menu.className='custom-select-menu';
    menu.setAttribute('role','listbox');
    menu.setAttribute('aria-labelledby',select.id);

    const optionButtons=[...select.options].map((opt,optIndex)=>{
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='custom-select-option';
      btn.textContent=opt.textContent.trim();
      btn.setAttribute('role','option');
      btn.dataset.index=String(optIndex);
      btn.addEventListener('click',()=>{
        if(select.selectedIndex!==optIndex){
          select.selectedIndex=optIndex;
          select.dispatchEvent(new Event('change',{bubbles:true}));
        }
        syncFromNative();
        setOpen(wrap,false);
      });
      return btn;
    });
    optionButtons.forEach(btn=>menu.appendChild(btn));

    function syncFromNative(){
      const current=select.options[select.selectedIndex]||select.options[0];
      const currentIdx=current?select.selectedIndex:0;
      const valueEl=toggle.querySelector('.custom-select-value');
      if(valueEl) valueEl.textContent=current?current.textContent.trim():'';
      optionButtons.forEach((btn,i)=>{
        const selected=i===currentIdx;
        btn.classList.toggle('selected',selected);
        btn.setAttribute('aria-selected',selected?'true':'false');
      });
    }

    toggle.addEventListener('click',(e)=>{
      e.stopPropagation();
      const isOpen=wrap.classList.contains('open');
      closeAll(wrap);
      setOpen(wrap,!isOpen);
    });

    toggle.addEventListener('keydown',(e)=>{
      if(e.key==='ArrowDown'||e.key==='Enter'||e.key===' '){
        e.preventDefault();
        closeAll(wrap);
        setOpen(wrap,true);
      }
      if(e.key==='Escape'){
        setOpen(wrap,false);
      }
    });

    select.addEventListener('change',syncFromNative);
    wrap.appendChild(toggle);
    wrap.appendChild(menu);
    syncFromNative();
  });

  document.addEventListener('click',(e)=>{
    if(!e.target.closest('.product-select-wrap')) closeAll();
  });
  document.addEventListener('keydown',(e)=>{
    if(e.key==='Escape') closeAll();
  });
  window.addEventListener('scroll',()=>closeAll(),{passive:true});
  window.addEventListener('resize',()=>closeAll(),{passive:true});
})();

/* ── HERO MEDIA ── */
/* Tự đồng bộ class hero theo media đang có trong HTML:
   - Chỉ có <video> => hero-video
   - Chỉ có <img>   => hero-image
   Mục tiêu: khi bật/tắt media bằng comment, không cần nhớ đổi class thủ công.
*/
(function(){
  const hero=document.getElementById('home');
  if(!hero) return;

  const video=hero.querySelector('.hero-bg-video');
  const image=hero.querySelector('.hero-bg-image');
  const hasVideo=!!video;
  const hasImage=!!image;

  if(hasVideo && !hasImage){
    hero.classList.remove('hero-image');
    hero.classList.add('hero-video');
    const p=video.play?.();
    if(p && typeof p.catch==='function') p.catch(()=>{});
    return;
  }

  if(hasImage && !hasVideo){
    hero.classList.remove('hero-video');
    hero.classList.add('hero-image');
  }
})();

/* ── PARTICLES ── */
(function(){
  const c=document.getElementById('heroParticles');if(!c)return;
  const ctx=c.getContext('2d');
  function resize(){c.width=c.offsetWidth;c.height=c.offsetHeight;}
  resize();window.addEventListener('resize',resize);
  const pts=[];
  for(let i=0;i<36;i++)pts.push({
    x:Math.random()*c.width,y:Math.random()*c.height,
    r:Math.random()*1.8+.8,
    dx:(Math.random()-.5)*.38,dy:(Math.random()-.5)*.38,
    o:Math.random()*.25+.06
  });
  (function draw(){
    ctx.clearRect(0,0,c.width,c.height);

    pts.forEach(p=>{
      p.x+=p.dx;p.y+=p.dy;
      if(p.x<0||p.x>c.width)p.dx*=-1;
      if(p.y<0||p.y>c.height)p.dy*=-1;

      const dist=Math.hypot(p.x,p.y);
      const maxDist=Math.max(c.width,c.height)*0.8;
      const topLeftBoost=Math.max(0,1-dist/maxDist);
      const alpha=Math.min(0.9,p.o+topLeftBoost*0.5);

      ctx.shadowColor=`rgba(245,200,96,${Math.min(0.95,alpha)})`;
      ctx.shadowBlur=10+topLeftBoost*18;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(233,163,32,${alpha})`;
      ctx.fill();
    });
    ctx.shadowBlur=0;
    requestAnimationFrame(draw);
  })();
})();
