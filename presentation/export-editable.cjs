const fs=require('fs'),path=require('path');
const {chromium}=require('playwright'),PptxGenJS=require('pptxgenjs'),sharp=require('sharp'),JSZip=require('jszip');
const out=__dirname;
const palettes={
 impact:['E8C4A6','BECB73','46AD65','187B4C','0C553A'],water:['CBE5ED','8AC7DF','489FCB','286DA6','1D467B'],
 'carbon-art':['1F352D','344C38','657F4B','A4B877'], 'water-art':['16364D','235672','407F9E','83CBD1'],
 'trees-art':['3A273E','633953','925B7E','C18DAA'], 'catalog-art':['27142B','492344','824557','D37459'],
 'sapphire-card':['080E25','101A45','20419B','58BBD5'],'forest-card':['080F0B','122A1B','1A5631','61B875'],
 'transport-art':['1B3048','335E84','6D9DBC'], 'food-art':['263D36','43543A','738852','B9CD77'],
 'energy-art':['422D35','795641','C58B45','FFE6A7'], 'water-log-art':['203A54','367E92','72C4B8'],
 'waste-art':['263A3A','465D48','84936A'], 'aurora-card':['09090F','161329','39265E','7B58BE'],
 'standing-art':['171B35','343052','51438A','8773D8'],'rewards-invite-art':['43263E','754460','B47488'],
 'milestone-art':['173632','285348','437D69','93BF95']};
const rgb=s=>{let m=s.match(/[\d.]+/g)||[0,0,0];return {color:m.slice(0,3).map(x=>Math.round(+x).toString(16).padStart(2,'0')).join('').toUpperCase(),alpha:m[3]===undefined?1:+m[3]}};
const digitGlyphs={'0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],'6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],'.':['00000','00000','00000','00000','00000','00100','00100'],',':['00000','00000','00000','00000','00100','00100','01000']};
(async()=>{
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
await page.goto('file://'+path.join(out,'rippl-presentation.html'));await page.evaluate(()=>document.fonts.ready);await page.addStyleTag({content:'nav.controls{display:none}'});
await page.pdf({path:path.join(out,'rippl-presentation.pdf'),preferCSSPageSize:true,printBackground:true});
const deck=new PptxGenJS();deck.defineLayout({name:'RIPPL',width:16,height:9});deck.layout='RIPPL';deck.author='rippl';deck.title='rippl · small actions. lasting ripples.';deck.subject='editable product overview';deck.company='rippl';deck.lang='en';deck.theme={headFontFace:'Manrope',bodyFontFace:'Manrope',lang:'en-US'};
const gradientMap={},shots=[],report=[];let gradientId=0;
// Brand mark uses the same luminance mask as the web application.
const raw=await sharp(path.join(out,'assets/brand/rippl-mark.png')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
async function brand(color){const bytes=Buffer.from(raw.data);for(let j=0;j<bytes.length;j+=4){const a=Math.round((.2126*bytes[j]+.7152*bytes[j+1]+.0722*bytes[j+2])*bytes[j+3]/255);bytes[j]=color[0];bytes[j+1]=color[1];bytes[j+2]=color[2];bytes[j+3]=a}return 'data:image/png;base64,'+(await sharp(bytes,{raw:raw.info}).png().toBuffer()).toString('base64')}
const blueMark=await brand([54,92,146]),whiteMark=await brand([232,243,231]);
const slideCount=await page.locator('.slide').count();for(let idx=0;idx<slideCount;idx++){
const el=page.locator('.slide').nth(idx),shot=path.join(out,'assets',`slide-${String(idx+1).padStart(2,'0')}.png`);await el.screenshot({path:shot});shots.push(shot);
const nodes=await el.evaluate(slide=>{const base=slide.getBoundingClientRect();return [...slide.querySelectorAll('.card,.impact,.pill,.dashboard,.closing-art,.video-frame,[data-text],.impact-number,video,.eco,.mark,.large-mark,.dots')].map(e=>{const r=e.getBoundingClientRect(),cs=getComputedStyle(e);const obj={cls:e.className,x:(r.x-base.x)/100,y:(r.y-base.y)/100,w:r.width/100,h:r.height/100,color:cs.color,bg:cs.backgroundColor,radius:parseFloat(cs.borderRadius),font:parseFloat(cs.fontSize),align:cs.textAlign,opacity:parseFloat(cs.opacity),value:e.getAttribute('data-value'),type:e.matches('video')?'video':e.matches('.impact-number')?'dot-number':e.hasAttribute('data-text')?'text':e.matches('img')?'image':e.matches('.mark,.large-mark')?'brand':e.matches('.dots')?'dots':'shape',src:e.matches('video')?e.getAttribute('src'):e.src,poster:e.matches('video')?e.getAttribute('poster'):null};if(obj.type==='text'){const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT),lines=[];let node;while(node=walker.nextNode()){for(let i=0;i<node.length;i++){const range=document.createRange();range.setStart(node,i);range.setEnd(node,i+1);const b=range.getBoundingClientRect();if(!b.height)continue;let line=lines.find(l=>Math.abs(l.top-b.top)<2);if(!line){line={top:b.top,left:b.left,right:b.right,height:b.height,text:''};lines.push(line)}line.text+=node.textContent[i];line.left=Math.min(line.left,b.left);line.right=Math.max(line.right,b.right)}}obj.lines=lines.map(l=>({text:l.text.trim(),x:(l.left-base.x)/100,y:(l.top-base.y)/100,w:(l.right-l.left)/100,h:l.height/100})).filter(l=>l.text)}return obj})});
const slide=deck.addSlide();slide.background={color:'E9ECEA'};let textCount=0,shapeCount=0;
for(const n of nodes){
 if(n.type==='shape'){
 let fill;const key=n.cls.split(' ').find(c=>palettes[c]);let colors=n.cls.split(' ').includes('impact')?(n.cls.split(' ').includes('water')?palettes.water:palettes.impact):palettes[key];
 if(colors){const sentinel=(0xF00000+(++gradientId)).toString(16).toUpperCase();gradientMap[sentinel]=colors;fill={color:sentinel}}else{let c=rgb(n.bg);fill={color:c.color,transparency:Math.round((1-c.alpha)*100)}}
 slide.addShape(deck.ShapeType.roundRect,{x:n.x,y:n.y,w:n.w,h:n.h,rectRadius:Math.min(n.radius/100,n.h/2),radius:Math.min(n.radius/100,n.h/2),fill,line:{color:'FFFFFF',transparency:n.cls.includes('expressive-card')?82:100,width:.65},objectName:n.cls});shapeCount++;
 }else if(n.type==='dot-number'){
 const scale=n.h*100/42,step=6*scale/100,dotSize=3.3*scale/100,startX=n.x,startY=n.y;
 [...n.value].forEach((character,index)=>{const rows=digitGlyphs[character]||[];rows.forEach((row,y)=>[...row].forEach((bit,x)=>{if(bit!=='1')return;const cx=startX+(index*36+x*6+3)*scale/100,cy=startY+(y*6+3)*scale/100;slide.addShape(deck.ShapeType.ellipse,{x:cx-dotSize/2,y:cy-dotSize/2,w:dotSize,h:dotSize,fill:{color:'FFFFFF'},line:{color:'FFFFFF',transparency:100},objectName:`editable dotted numeral ${character}`})}))});
 }else if(n.type==='video'){
 const poster=fs.readFileSync(path.join(out,n.poster)).toString('base64');slide.addMedia({type:'video',path:path.join(out,n.src),x:n.x,y:n.y,w:n.w,h:n.h,cover:`data:image/jpeg;base64,${poster}`,objectName:'rippl product walkthrough · embedded video'});
 }else if(n.type==='text'){
 const color=rgb(n.color);for(const l of n.lines){slide.addText(l.text,{x:l.x,y:l.y-.009,w:l.w+.09,h:Math.max(l.h,.18),fontFace:'Manrope',fontSize:n.font*.72,color:color.color,transparency:Math.round((1-color.alpha)*100),margin:0,breakLine:false,vertAnchor:'mid',valign:'mid',paraSpaceAfterPt:0,charSpacing:n.cls.includes('hero')?-1.4:0,objectName:n.cls||'editable copy',...(l.text==='open rippl ↗'?{hyperlink:{url:'https://rippl.aarush-uae.workers.dev/app'}}:{})});textCount++}
 }else if(n.type==='brand')slide.addImage({data:n.cls.includes('large')?whiteMark:blueMark,x:n.x,y:n.y,w:n.w,h:n.h,objectName:'rippl logo'});
 else if(n.type==='image'){
 const buf=Buffer.from(n.src.split(',')[1],'base64');const white=await sharp(buf).negate({alpha:false}).png().toBuffer();slide.addImage({data:'data:image/png;base64,'+white.toString('base64'),x:n.x,y:n.y,w:n.w,h:n.h,transparency:22,objectName:'sustainability icon'});
 }else if(n.type==='dots'){
 const cols=Math.floor(n.w/.11),rows=4;for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const fade=Math.abs(x-cols/2)/(cols/2);slide.addShape(deck.ShapeType.ellipse,{x:n.x+x*.11,y:n.y+y*.11,w:.025,h:.025,fill:{color:'E9F8E8',transparency:Math.round(68+fade*25)},line:{transparency:100},objectName:'editable footer dot'})}
 }
}
slide.addNotes('All text, metrics, cards, gradient fills and dotted numerals are native editable PowerPoint objects. The 41-second product walkthrough is embedded with its original audio. Logos and sustainability icons are separate images. Values are illustrative demo data, not actual user metrics: 128.4 kg CO2 avoided, 2,450 litres saved, 1,280 points, 32 actions, 12-day streak. Source: presentation/DESIGN.md and RIPPL_PROJECT_BRIEF.md. Manrope font is included in presentation/assets/manrope.ttf.');report.push({slide:idx+1,textBoxes:textCount,cards:shapeCount});
}
const bytes=await deck.write({outputType:'nodebuffer'});const zip=await JSZip.loadAsync(bytes);
for(const name of Object.keys(zip.files).filter(n=>/^ppt\/slides\/slide\d+\.xml$/.test(n))){let xml=await zip.file(name).async('string');for(const [sentinel,colors]of Object.entries(gradientMap)){const stops=colors.map((c,i)=>`<a:gs pos="${Math.round(i/(colors.length-1)*100000)}"><a:srgbClr val="${c}"/></a:gs>`).join('');const gradient=`<a:gradFill rotWithShape="1"><a:gsLst>${stops}</a:gsLst><a:lin ang="5400000" scaled="1"/><a:tileRect/></a:gradFill>`;xml=xml.replace(/<a:solidFill>[\s\S]*?<\/a:solidFill>/g,fillXml=>fillXml.includes('val="'+sentinel+'"')?gradient:fillXml)}zip.file(name,xml)}
const pptxPath=path.join(out,'rippl-presentation.pptx');fs.writeFileSync(pptxPath,await zip.generateAsync({type:'nodebuffer'}));fs.copyFileSync(pptxPath,path.join(out,'rippl-editable.pptx'));
const thumbs=await Promise.all(shots.map(p=>sharp(p).resize(480,270).toBuffer()));await sharp({create:{width:984,height:Math.ceil(shots.length/2)*285,channels:3,background:'#CDD3CF'}}).composite(thumbs.map((input,i)=>({input,left:i%2*492,top:Math.floor(i/2)*285}))).png().toFile(path.join(out,'preview.png'));
fs.writeFileSync(path.join(out,'editable-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
