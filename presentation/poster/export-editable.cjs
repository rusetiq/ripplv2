const fs=require('fs'), path=require('path');
const out=__dirname;
function dep(name){try{return require(name)}catch{return require('/Users/rusetiq/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/'+name)}}
const PptxGenJS=dep('pptxgenjs'),sharp=dep('sharp'),JSZip=dep('jszip');
const W=594/25.4,H=841/25.4;
const gradients={
 carbon:['EDC4A8','ECC38F','C7CC64','48D449','00BB23','009D26','559A62'],
 water:['D2E6ED','B9DCE9','89CBE3','53ACD5','2687C7','1E6DB4','729AC5'],
 'catalog-art':['27142B','492344','824557','D37459'],
 'sapphire-card':['080E25','101A45','20419B','58BBD5'],
 'forest-card':['080F0B','122A1B','1A5631','61B875'],
 cta:['1A3336','2B5554','4F7772']
};
const digitGlyphs={'0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],'8':['01110','10001','10001','01110','10001','10001','01110'],'.':['00000','00000','00000','00000','00000','00100','00100'],',':['00000','00000','00000','00000','00100','00100','01000']};
function color(value){const parts=value.match(/[\d.]+/g)||['0','0','0'];return {hex:parts.slice(0,3).map(n=>Math.round(+n).toString(16).padStart(2,'0')).join('').toUpperCase(),alpha:parts[3]===undefined?1:+parts[3]}}
async function brandMark(){const {data,info}=await sharp(path.join(out,'..','assets','brand','rippl-mark.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});const bytes=Buffer.from(data);for(let i=0;i<bytes.length;i+=4){const luminance=.2126*bytes[i]+.7152*bytes[i+1]+.0722*bytes[i+2];bytes[i]=54;bytes[i+1]=92;bytes[i+2]=146;bytes[i+3]=Math.round(luminance*bytes[i+3]/255)}return 'data:image/png;base64,'+(await sharp(bytes,{raw:info}).png().toBuffer()).toString('base64')}
module.exports=async function exportEditable(page){
 const extracted=await page.locator('.poster').evaluate(poster=>{const base=poster.getBoundingClientRect();const nodes=[...poster.querySelectorAll('[data-shape],[data-rule],[data-text],[data-image],[data-brand],[data-dot-number],[data-dots]')].map(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);const type=e.hasAttribute('data-shape')?'shape':e.hasAttribute('data-rule')?'rule':e.hasAttribute('data-text')?'text':e.hasAttribute('data-image')?'image':e.hasAttribute('data-brand')?'brand':e.hasAttribute('data-dot-number')?'dot-number':'dots';const n={type,cls:typeof e.className==='string'?e.className:'',gradient:e.getAttribute('data-gradient'),value:e.getAttribute('data-dot-number'),src:e.getAttribute('src'),x:r.left-base.left,y:r.top-base.top,w:r.width,h:r.height,radius:parseFloat(cs.borderRadius)||0,bg:cs.backgroundColor,color:cs.color,font:parseFloat(cs.fontSize)||20,weight:parseInt(cs.fontWeight)||400,align:cs.textAlign};if(type==='text'){const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),lines=[];let node;while(node=walker.nextNode()){for(let i=0;i<node.length;i++){const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);const b=range.getBoundingClientRect();if(!b.height)continue;let line=lines.find(l=>Math.abs(l.top-b.top)<2);if(!line){line={top:b.top,left:b.left,right:b.right,height:b.height,text:''};lines.push(line)}line.text+=node.textContent[i];line.left=Math.min(line.left,b.left);line.right=Math.max(line.right,b.right)}}n.lines=lines.map(l=>({text:l.text.trim(),x:l.left-base.left,y:l.top-base.top,w:l.right-l.left,h:l.height})).filter(l=>l.text)}return n});return {width:base.width,height:base.height,nodes}});
 const pptx=new PptxGenJS();pptx.defineLayout({name:'A1 portrait',width:W,height:H});pptx.layout='A1 portrait';pptx.author='rippl';pptx.title='rippl · display poster';pptx.subject='editable A1 portrait poster';pptx.theme={headFontFace:'Manrope',bodyFontFace:'Manrope',lang:'en-US'};
 const slide=pptx.addSlide();slide.background={color:'E9ECEA'};
 const sx=W/extracted.width,sy=H/extracted.height;
 const nativeGradients={};let gradientIndex=0;
 const mark=await brandMark();
 for(const n of extracted.nodes){
  if(n.type==='shape'){
   let fill;if(n.gradient&&gradients[n.gradient]){const token=(0xF10000+(++gradientIndex)).toString(16).toUpperCase();nativeGradients[token]=gradients[n.gradient];fill={color:token}}else{const c=color(n.bg);fill={color:c.hex,transparency:Math.round((1-c.alpha)*100)}}
   const rounded=n.radius>0;slide.addShape(rounded?pptx.ShapeType.roundRect:pptx.ShapeType.rect,{x:n.x*sx,y:n.y*sy,w:n.w*sx,h:n.h*sy,rectRadius:rounded?Math.min(n.radius*sx,n.h*sy/2):undefined,fill,line:{color:'FFFFFF',transparency:n.cls.includes('impact-card')||n.cls.includes('process-card')?75:100,width:.7},objectName:n.cls||'editable shape'});
  } else if(n.type==='rule'){
   slide.addShape(pptx.ShapeType.line,{x:n.x*sx,y:n.y*sy,w:n.w*sx,h:0,line:{color:'DFE5DF',width:1},objectName:'metric divider'});
  } else if(n.type==='text'){
   const c=color(n.color);for(const l of n.lines){slide.addText(l.text,{x:l.x*sx,y:(l.y-1)*sy,w:l.w*sx+.1,h:Math.max(l.h*sy,.17),fontFace:'Manrope',fontSize:n.font*.75,color:c.hex,transparency:Math.round((1-c.alpha)*100),bold:n.weight>=600,margin:0,breakLine:false,valign:'mid',vertAnchor:'mid',charSpacing:n.cls.includes('hero-line')?-1.3:0,objectName:n.cls||'editable text',...(l.text==='open rippl ↗'?{hyperlink:{url:'https://rippl.aarush-uae.workers.dev/app'}}:{})})}
  } else if(n.type==='dot-number'){
   const scale=n.h/42,diameter=3.3*scale;
   [...n.value].forEach((character,i)=>{const rows=digitGlyphs[character]||[];rows.forEach((row,y)=>[...row].forEach((bit,x)=>{if(bit!=='1')return;const cx=n.x+(i*36+x*6+3)*scale,cy=n.y+(y*6+3)*scale;slide.addShape(pptx.ShapeType.ellipse,{x:(cx-diameter/2)*sx,y:(cy-diameter/2)*sy,w:diameter*sx,h:diameter*sy,fill:{color:'FFFFFF'},line:{transparency:100},objectName:`editable dotted numeral ${character}`})}))});
  } else if(n.type==='dots'){
   for(let row=0;row<5;row++)for(let col=0;col<37;col++){const spread=Math.abs(col-18)/18,vertical=Math.abs(row-2)/2,transparency=Math.round(47+spread*40+vertical*13);const d=3.1;slide.addShape(pptx.ShapeType.ellipse,{x:(n.x+col*17)*sx,y:(n.y+row*17)*sy,w:d*sx,h:d*sy,fill:{color:n.cls.includes('water')?'D5EFFF':'EEFFBE',transparency},line:{transparency:100},objectName:'editable decoration dot'})}
  } else if(n.type==='brand'){
   slide.addImage({data:mark,x:n.x*sx,y:n.y*sy,w:n.w*sx,h:n.h*sy,objectName:'rippl brand mark'});
  } else if(n.type==='image'){
   slide.addImage({data:n.src,x:n.x*sx,y:n.y*sy,w:n.w*sx,h:n.h*sy,objectName:n.cls||'poster image'});
  }
 }
 slide.addNotes('A1 portrait display poster. The impact figures are illustrative demo values, not live user data. The dotted headings and maker credit are separate transparent PNG images; matching SVG files are included. The QR code opens https://rippl.aarush-uae.workers.dev/app. All other copy, impact dots, cards and gradients are native editable PowerPoint objects.');
 const bytes=await pptx.write({outputType:'nodebuffer'}),zip=await JSZip.loadAsync(bytes);
 const xmlPath='ppt/slides/slide1.xml';let xml=await zip.file(xmlPath).async('string');
 for(const [token,stops]of Object.entries(nativeGradients)){const items=stops.map((hex,index)=>`<a:gs pos="${Math.round(index/(stops.length-1)*100000)}"><a:srgbClr val="${hex}"/></a:gs>`).join('');const grad=`<a:gradFill rotWithShape="1"><a:gsLst>${items}</a:gsLst><a:lin ang="5400000" scaled="1"/><a:tileRect/></a:gradFill>`;xml=xml.replace(/<a:solidFill>[\s\S]*?<\/a:solidFill>/g,fill=>fill.includes(`val="${token}"`)?grad:fill)}zip.file(xmlPath,xml);
 fs.writeFileSync(path.join(out,'rippl-display-poster-editable.pptx'),await zip.generateAsync({type:'nodebuffer'}));
};
