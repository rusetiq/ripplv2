const fs=require('fs'), path=require('path');
const out=__dirname, assets=path.join(out,'..','assets');
function dep(name){try{return require(name)}catch{return require('/Users/rusetiq/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'+name)}}
const {chromium}=dep('playwright');
const src=(p,mime='image/png')=>`data:${mime};base64,${fs.readFileSync(p).toString('base64')}`;
const mark=src(path.join(assets,'brand','rippl-mark.png'));
const qr=src(path.join(out,'qr.png'));
const heading=src(path.join(out,'what-does-rippl-do.png'));
const credit=src(path.join(out,'made-by-aarush-diwakar.png'));
const font=src(path.join(assets,'manrope.ttf'),'font/ttf');
const theme=fs.readFileSync(path.join(out,'..','theme.css'),'utf8');
const css=fs.readFileSync(path.join(out,'poster.css'),'utf8');
const glyphs={'0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],'6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],'.':['00000','00000','00000','00000','00000','00100','00100'],',':['00000','00000','00000','00000','00100','00100','01000']};
const dotNum=value=>`<svg class="impact-number" data-dot-number="${value}" role="img" aria-label="${value}" viewBox="0 0 ${value.length*36-6} 42">${[...value].flatMap((ch,i)=>(glyphs[ch]||[]).flatMap((row,y)=>[...row].map((v,x)=>v==='1'?`<circle cx="${i*36+x*6+3}" cy="${y*6+3}" r="1.65" fill="white"/>`:''))).join('')}</svg>`;
const T=(value,cls='')=>`<div data-text class="${cls}">${value}</div>`;
const impact=(kind,title,value,unit)=>`<div data-shape data-gradient="${kind}" class="impact-card ${kind}">${T(title,'impact-label')}${dotNum(value)}${T(unit,'impact-unit')}<div data-dots class="impact-dots"></div></div>`;
const step=(kind,no,title,body)=>`<div data-shape data-gradient="${kind}" class="process-card expressive-card ${kind}"><div data-shape class="process-number">${T(no,'step-index')}</div>${T(title,'process-title')}${T(body,'process-body')}</div>`;
const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>rippl · display poster</title><style>@font-face{font-family:Manrope;src:url('${font}') format('truetype');font-weight:400 700;font-display:block}${theme}\n${css}</style></head><body><main class="poster app-gallery" data-card-style="luminous" style="--brand-mark:url('${mark}')">
<header class="poster-brand"><i data-brand class="brand-mark"></i>${T('rippl','brand-name')}</header>
<div data-shape class="top-tag">${T('everyday actions, visible impact','top-tag-text')}</div>
${T('a personal space for everyday progress','eyebrow')}
<div class="hero">${T('small actions.','hero-line first')}${T('lasting ripples.','hero-line second')}</div>
${T('log sustainable choices, verify them with photos,<br>and see what your habits add up to.','hero-copy')}
<div data-shape class="impact-panel"></div>
${T('your impact','panel-title')}
<div data-shape class="demo-pill">${T('illustrative demo profile','demo-pill-text')}</div>
<div class="stats"><div class="stat" data-rule>${T('1,280','stat-value')}${T('points earned','stat-label')}</div><div class="stat" data-rule>${T('12 days','stat-value')}${T('current streak','stat-label')}</div><div class="stat" data-rule>${T('32','stat-value')}${T('actions logged','stat-label')}</div></div>
${impact('carbon','carbon avoided','128.4','kg co₂')}
${impact('water','water saved','2,450','litres of water')}
${T('demo figures · estimated savings from approved actions','panel-note')}
<img data-image="dot-heading" class="dot-heading" src="${heading}" alt="what does rippl do">
${T('a simple loop that turns a choice into a record.','process-subtitle')}
<div class="process-grid">${step('catalog-art','01','log an action','choose a sustainable habit.')}${step('sapphire-card','02','add evidence','attach a photo for review.')}${step('forest-card','03','see your impact','follow estimated savings over time.')}</div>
<div data-shape data-gradient="cta" class="cta"></div>
${T('start your ripple.','cta-title')}
<div data-shape class="cta-button">${T('open rippl ↗','cta-button-text')}</div>
${T('rippl.aarush-uae.workers.dev/app','cta-url')}
<div data-shape class="qr-back"></div><img data-image="qr" class="qr" src="${qr}" alt="scan to open rippl">
<img data-image="maker-credit" class="maker-credit" src="${credit}" alt="made by aarush diwakar, grade 12A, 2026-2027">
<i data-brand class="footer-mark"></i>
</main></body></html>`;
fs.writeFileSync(path.join(out,'rippl-display-poster.html'),html);
(async()=>{const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:2245,height:3179},deviceScaleFactor:2});await page.goto('file://'+path.join(out,'rippl-display-poster.html'));await page.evaluate(()=>document.fonts.ready);await page.locator('.poster').screenshot({path:path.join(out,'rippl-display-poster.png')});await page.pdf({path:path.join(out,'rippl-display-poster.pdf'),printBackground:true,preferCSSPageSize:true});await require('./export-editable.cjs')(page);await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
