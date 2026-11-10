/** Patch #54: original pixel-art study of the supplied Bingsu photograph.
 *
 * Unlike the previous front-on white puppy icon, this shows a FULL-BODY,
 * left-facing adult Dogo Argentino: real dropped ears, broad square muzzle,
 * long athletic frame, deep chest, narrow tucked abdomen, tall straight legs
 * and a natural lowered tail. Entirely collar-free. All pixels are drawn
 * locally from polygons/ellipses, not a photo stored in the game or a
 * browser-fetched image. World-companion sprite and behavior are untouched.
 */
export const BINGSU_PORTRAIT54={w:124,h:65} as const;
export const BINGSU_PORTRAIT_PALETTE54={
  coat:"#f2f0e9",
  highlight:"#fffdf6",
  shadow:"#c7d0cb",
  dark:"#262c2c",
  nose:"#191f22",
  background:"#576567",
  ear:"#e2dbd4",
} as const;

/** Exact pixel extents; native canvas renderer intentionally has no
 * anti-aliasing, curves or subpixel scaling. */
export function drawBingsuPortrait54(ctx:any,x:number,y:number):void{
  const color=BINGSU_PORTRAIT_PALETTE54;
  const p=(px:number,py:number,w:number,h:number,ink:string)=>{
    if(w<=0||h<=0)return;
    ctx.fillStyle=ink;
    ctx.fillRect(x+px,y+py,w,h);
  };
  // Rasterized hand-plotted polygons create coherent connected silhouettes
  // while staying entirely in the original integer-pixel art language.
  const poly=(points:[number,number][],ink:string)=>{
    if(points.length<3)return;
    const top=Math.max(0,Math.floor(Math.min(...points.map(pt=>pt[1]))));
    const bottom=Math.min(65,Math.ceil(Math.max(...points.map(pt=>pt[1]))));
    for(let py=top;py<bottom;py++){
      const crossings:number[]=[];
      for(let i=0;i<points.length;i++){
        const [ax,ay]=points[i], [bx,by]=points[(i+1)%points.length];
        if((ay<=py+.5 && by>py+.5)||(by<=py+.5 && ay>py+.5))
          crossings.push(ax+(py+.5-ay)*(bx-ax)/(by-ay));
      }
      crossings.sort((a,b)=>a-b);
      for(let i=0;i+1<crossings.length;i+=2){
        const left=Math.max(0,Math.ceil(crossings[i]));
        const right=Math.min(124,Math.ceil(crossings[i+1]));
        p(left,py,right-left,1,ink);
      }
    }
  };
  const oval=(cx:number,cy:number,rx:number,ry:number,ink:string)=>{
    for(let py=Math.max(0,Math.floor(cy-ry));py<Math.min(65,Math.ceil(cy+ry));py++){
      const dy=(py+.5-cy)/ry;
      if(Math.abs(dy)>=1)continue;
      const width=rx*Math.sqrt(1-dy*dy);
      const left=Math.max(0,Math.ceil(cx-width));
      const right=Math.min(124,Math.ceil(cx+width));
      p(left,py,right-left,1,ink);
    }
  };
  // Quiet warm grey studio-like background respects supplied photo's mood.
  p(0,0,124,65,"#314249");
  p(1,1,122,44,color.background);
  p(1,32,122,13,"#65716e");
  p(1,45,122,19,"#888d85");
  p(1,49,122,15,"#929389");
  p(1,58,122,6,"#777d75");
  // Soft ground contact, before paws are drawn.
  oval(72,59,53,3,"#6c726d");
  oval(72,59,46,2,"#747c77");

  // Tail, furthest behind the body: natural low, gently curving, not curled.
  poly([[101,24],[109,27],[113,33],[119,39],[122,41],
        [118,43],[112,40],[108,35],[101,30]],"#aebbb5");
  poly([[102,24],[109,28],[114,36],[119,40],[120,41],
        [116,40],[110,34],[105,29]],color.coat);

  // The furthest legs, separately silhouetted and offset from the near legs.
  poly([[48,36],[57,37],[57,52],[56,58],[52,59],
        [50,57],[51,49]],"#97a7a4");
  poly([[50,36],[56,38],[55,55],[56,58],[53,58],
        [52,49]],"#d0d7d1");
  poly([[87,33],[95,33],[96,43],[94,53],[97,57],[92,59],
        [89,56],[90,48]],"#a0ada9");
  poly([[89,34],[94,36],[94,45],[92,53],[95,57],
        [92,58],[90,54]],"#d2d8d2");

  // Lower trunk and tall adult Dogo's athletic tucked belly.
  // It is deliberately NOT a full rectangular white blob.
  poly([[37,22],[46,19],[64,17],[83,18],[96,21],
        [104,27],[103,35],[97,40],[91,41],[87,35],
        [81,34],[77,39],[61,39],[55,41],[48,44],
        [43,42],[36,35]],"#9aada9");
  poly([[38,22],[46,20],[65,18],[82,19],[95,22],
        [102,27],[101,34],[95,38],[90,38],[87,33],
        [78,33],[74,37],[59,37],[53,41],[47,41],
        [40,36]],"#d7dfd9");
  poly([[40,22],[47,20],[65,19],[81,20],[94,23],
        [99,28],[98,33],[92,36],[87,31],
        [77,31],[72,35],[57,35],[51,39],
        [45,38],[41,33]],color.coat);
  // White back highlight follows the reference's relaxed spine.
  poly([[47,19],[65,18],[83,19],[94,22],[97,25],
        [86,23],[67,21],[50,22]],color.highlight);
  poly([[58,34],[75,34],[80,32],[86,33],[78,36],
        [59,38],[55,40]],"#e4ded7");

  // Hindquarter: clean muscled thigh flowing to a long lower hock.
  poly([[89,27],[99,30],[103,38],[103,45],[107,55],
        [104,60],[98,60],[97,56],[98,48],
        [95,42],[89,38]],"#aebeb9");
  poly([[91,27],[100,31],[102,38],[101,45],[105,56],
        [103,59],[99,59],[99,54],[100,47],
        [96,40],[90,36]],"#e0e5de");
  poly([[92,27],[99,30],[100,37],[99,45],[103,56],
        [100,57],[100,52],[98,44],[93,39]],color.coat);
  // Long rear paw rests firmly on the ground, not floating.
  poly([[100,57],[105,57],[110,59],[109,61],[98,61],[97,59]],
    "#9ba9a5");
  poly([[100,58],[106,58],[108,60],[99,60]],color.coat);
  p(106,60,2,1,"#8b9390");

  // Front leg is a structural continuation of the deep chest.
  poly([[36,30],[48,34],[52,42],[50,52],[52,59],
        [48,62],[41,62],[39,58],[41,47],[39,38]],
      "#a9b9b4");
  poly([[39,30],[47,34],[50,41],[48,52],[50,59],
        [46,61],[43,60],[43,56],[44,44],[40,38]],
      "#e2e9e1");
  poly([[40,30],[46,34],[48,40],[46,52],[48,59],
        [45,59],[44,55],[45,44],[41,39]],
      color.coat);
  poly([[43,58],[49,58],[53,60],[52,62],[40,62],[39,60]],
      "#a7b4ae");
  poly([[43,59],[49,59],[50,61],[41,61]],color.highlight);
  p(49,61,2,1,"#8a9892");

  // Strong shoulder and white uninterrupted neck (NO collar).
  poly([[31,22],[39,22],[47,29],[51,36],[51,42],
        [45,45],[39,42],[33,35],[29,29]],
      "#a8b9b4");
  poly([[30,22],[38,21],[45,28],[49,35],[48,41],
        [43,43],[38,38],[32,32]],
      "#e2e9e2");
  poly([[30,22],[38,22],[44,28],[47,34],[46,40],
        [41,39],[36,33],[30,28]],
      color.coat);
  poly([[33,25],[39,27],[43,34],[45,37],[41,36],[36,30]],
      color.highlight);
  // Tight coat and subtle elbow/chest shading, not fluffy fur.
  poly([[38,38],[41,43],[46,45],[49,43],[51,39],
        [48,40],[44,42]],"#c8d2cc");

  // Head faces LEFT in a natural three-quarter profile as in the photo:
  // broad but not caricatured, with long upper muzzle and heavy lips.
  poly([[19,10],[31,9],[39,13],[41,20],[39,27],
        [33,32],[24,34],[15,31],[11,28],
        [10,23],[12,18]],"#9eada9");
  poly([[18,11],[30,10],[38,14],[40,20],[38,27],
        [32,31],[23,32],[15,29],[12,26],
        [12,21],[14,16]],"#e0e6df");
  poly([[19,11],[30,11],[36,15],[37,21],[35,27],
        [30,30],[21,30],[15,27],[14,23],[16,17]],
      color.coat);
  poly([[20,12],[29,12],[34,15],[29,15],[20,17],
        [16,22],[16,19]],color.highlight);
  // Natural folded ear hanging alongside the back of her cheek.
  poly([[29,10],[36,11],[40,14],[39,20],[37,26],
        [33,27],[31,23],[30,17]],"#a6b1af");
  poly([[30,11],[36,12],[39,15],[37,24],
        [34,25],[32,21]],color.ear);
  poly([[30,12],[35,12],[37,16],[34,15]],"#f7eee7");
  p(35,23,2,2,"#c7b8b3");
  // Dogo's calm eye: a short almond under a gentle brow.
  poly([[21,19],[27,18],[27,20],[23,21]],"#c6c6bd");
  p(22,19,3,2,"#464849");
  p(23,19,1,1,"#14191b");
  p(22,20,1,1,"#d6d7ca");
  // Forward cheeks and visible soft whisker pads.
  poly([[14,22],[25,22],[29,25],[27,31],
        [20,32],[12,29],[10,26]],"#c6d1cc");
  poly([[14,23],[24,23],[27,26],[25,30],
        [19,30],[13,28],[11,26]],color.coat);
  p(17,26,2,1,"#bcb4a9");p(20,28,1,1,"#aba8a1");
  // Naturally broad, soft black nose, not a snarling mouth.
  poly([[10,22],[14,23],[16,25],[14,29],
        [10,29],[8,26],[9,23]],"#525a59");
  poly([[10,23],[14,23],[15,25],[13,28],
        [9,27],[8,25]],color.nose);
  p(10,23,2,1,"#687171");
  p(11,26,2,1,"#121719");
  // Closed, relaxed mouth and cheek crease as in supplied image.
  poly([[11,29],[15,30],[21,31],[24,30],
        [22,32],[15,32],[12,31]],"#929d97");
  p(12,30,4,1,"#464b4a");p(17,31,5,1,"#b8c2ba");
  p(22,33,3,1,"#d8ddd6");

  // Subtle toe separation and natural skin patches, not equipment or collar.
  p(45,61,1,1,"#818c89");p(104,60,1,1,"#838e89");
  // Keep the whole drawing inside the normal 124x65 UI art box.
  p(0,0,124,1,"#a9967f");
  p(0,64,124,1,"#4d5652");
  p(0,0,1,65,"#ab967b");
  p(123,0,1,65,"#7e8278");
}
