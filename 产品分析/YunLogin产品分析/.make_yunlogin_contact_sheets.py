from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont
import hashlib, math

root = Path('/Users/zhangbin/Desktop/YunLogin')
out = Path('/Users/zhangbin/Desktop/灵匠/云登pc端/.yunlogin_contact_sheets')
out.mkdir(exist_ok=True)
exts={'.png','.jpg','.jpeg','.webp'}
seen={}
files=[]
for p in sorted(root.rglob('*')):
    if p.suffix.lower() not in exts: continue
    h=hashlib.md5(p.read_bytes()).hexdigest()
    if h in seen: continue
    seen[h]=p
    files.append(p)

font=ImageFont.truetype('/System/Library/Fonts/Hiragino Sans GB.ttc',18)
for module in sorted({p.relative_to(root).parts[0] for p in files}):
    group=[p for p in files if p.relative_to(root).parts[0]==module]
    per=20 if module!='商城' else 24
    for page in range(math.ceil(len(group)/per)):
        chunk=group[page*per:(page+1)*per]
        tw,th,labelh=360,220,32
        cols=4
        rows=math.ceil(len(chunk)/cols)
        sheet=Image.new('RGB',(cols*tw,rows*(th+labelh)),(245,245,245))
        d=ImageDraw.Draw(sheet)
        for i,p in enumerate(chunk):
            im=Image.open(p).convert('RGB')
            im.thumbnail((tw-8,th-8))
            x=(i%cols)*tw+(tw-im.width)//2
            y=(i//cols)*(th+labelh)+(th-im.height)//2
            sheet.paste(im,(x,y))
            label=p.stem.replace('iShot_2026-08-12_','')[:34]
            d.text(((i%cols)*tw+5,(i//cols)*(th+labelh)+th+4),label,font=font,fill=(0,0,0))
        sheet.save(out/f'{module}_{page+1:02d}.jpg',quality=88)
print(f'{len(files)} unique images; sheets in {out}')
