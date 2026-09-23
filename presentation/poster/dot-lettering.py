"""Make transparent dotted lettering based on rippl's 5x7 DotNumber grid."""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent
INK = '#242b28'
G = {
 'a':['00000','00000','01110','00001','01111','10001','01111'],
 'b':['10000','10000','10110','11001','10001','10001','11110'],
 'c':['00000','00000','01110','10001','10000','10001','01110'],
 'd':['00001','00001','01101','10011','10001','10001','01111'],
 'e':['00000','00000','01110','10001','11111','10000','01110'],
 'g':['00000','01111','10001','10001','01111','00001','01110'],
 'h':['10000','10000','10110','11001','10001','10001','10001'],
 'i':['00100','00000','01100','00100','00100','00100','01110'],
 'k':['10000','10001','10010','11100','10010','10001','10001'],
 'l':['01100','00100','00100','00100','00100','00100','01110'],
 'm':['00000','00000','11010','10101','10101','10101','10101'],
 'o':['00000','00000','01110','10001','10001','10001','01110'],
 'p':['00000','11110','10001','11110','10000','10000','10000'],
 'r':['00000','00000','10110','11001','10000','10000','10000'],
 's':['00000','00000','01111','10000','01110','00001','11110'],
 't':['00100','00100','11111','00100','00100','00101','00010'],
 'u':['00000','00000','10001','10001','10001','10011','01101'],
 'w':['00000','00000','10001','10001','10101','10101','01010'],
 'y':['00000','00000','10001','10001','01111','00001','01110'],
 'A':['01110','10001','10001','11111','10001','10001','10001'],
 '0':['01110','10001','10011','10101','11001','10001','01110'],
 '1':['00100','01100','00100','00100','00100','00100','01110'],
 '2':['01110','10001','00001','00010','00100','01000','11111'],
 '6':['01110','10000','10000','11110','10001','10001','01110'],
 '7':['11111','00001','00010','00100','01000','01000','01000'],
 '-':['00000','00000','00000','11111','00000','00000','00000'],
 ',':['00000','00000','00000','00000','00100','00100','01000'],
 ' ':['00000']*7,
}

def create(name, lines, step, gap):
    advance = step*7
    width = max(len(line) for line in lines)*advance
    height = len(lines)*step*7+(len(lines)-1)*gap
    scale = 3
    img = Image.new('RGBA',(width*scale,height*scale),(0,0,0,0))
    pen = ImageDraw.Draw(img)
    circles = []
    radius = step*.285
    for li,line in enumerate(lines):
        for ci,ch in enumerate(line):
            glyph=G[ch]
            for y,row in enumerate(glyph):
                for x,bit in enumerate(row):
                    if bit=='1':
                        cx=ci*advance+(x+1)*step
                        cy=li*(7*step+gap)+(y+.5)*step
                        circles.append((cx,cy))
                        pen.ellipse(((cx-radius)*scale,(cy-radius)*scale,(cx+radius)*scale,(cy+radius)*scale),fill=INK)
    img=img.resize((width,height),Image.Resampling.LANCZOS)
    img.save(OUT/f'{name}.png')
    svg=''.join(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{radius:.2f}"/>' for cx,cy in circles)
    (OUT/f'{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" fill="{INK}">{svg}</svg>')
    print(name,width,height,len(circles))

create('what-does-rippl-do',['what does rippl do'],15,0)
create('made-by-aarush-diwakar',['made by aarush diwakar,','grade 12A, 2026-2027'],9,18)
