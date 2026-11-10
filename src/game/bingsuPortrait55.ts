/** Patch #56: reframe the APPROVED Bingsu close-up, without changing her look.
 * The image now includes more of her white neck, chest and shoulders from
 * the existing illustration. Cropping, not redesigning, preserves likeness.
 * Pixel data is rendered synchronously on the native canvas without an
 * external asset or save change. Her in-world sprite is unchanged.
 */
export const BINGSU_PORTRAIT55={w:94,h:68} as const;
export const BINGSU_PALETTE55=["#201c1d","#383939","#3d4746","#494b4a","#434f4f","#444f4f","#454f4e","#44504f","#445050","#445051","#445150","#455050","#455150","#47504f","#455151","#455152","#465151","#455252","#465252","#505655","#756966","#8d837e","#a18e87","#a1958e","#aa9b92","#b49e94","#b9aa9f","#c2aea2","#c6b4a7","#cab9ac","#cfbcae","#d3c0b1","#d4c5b7","#dac6b7","#dcc9ba","#e0d0c1","#e7d6c5","#eadac9","#ede0d0","#f1e3d2","#f4e8d8","#f8efdf","#fcf6e8","#fefbf0"] as const;
const CHARS55="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqr";
const PIXELS55=[
  "OOOOOOOOOOOOOOOOOOOOEFLLIIIIILLFFLGMCCCCESNQQSSSSQQQQQQQQSSECCCGECCNLFIIIIEIEEEEEEEEIEEIIIIIEE",
  "OOOOOOOOOOOOOOOOOOOOFFFFKIIIILLFEFSCTTTTTCSTTTTTTTTSSSSTTNCTTTTTTTTGQTRFIIIIEEEEEEEEEEEIIIIILI",
  "OOOOOOOOOOOOOOOOOOOOHGGFGGGGGGGGNEBVqrrqoVCCBBCCCCCCCCBBBCXrrqppqpraBBCSSQMLEEEEEIIIIIIIIIIOOI",
  "OOOOOOOOOOOOOOOOOOOOMGGGGGNNGGGSCDdrodjoknggggggcgggggggalrqqrrmnporgdTBCKQLIIEEIIIIIIIIIOIOOK",
  "OOOOOOOOOOOOOOOOOOOOQNGGGNNNNNNGUgqcVVamprrrrrpoqrrrrrrqqrmeZbopjlnoprgVVNCROILIIIIIIIOOOOOOOK",
  "OOOOOOOOOOOOOOOOOOOOQNGGNNNGSTGCmrXDAXqrqqppnlmqqqqqoomnrnbVTUbrmimmlmrrrUBCETSQQIIIIOOOOOOOQR",
  "OOOOOOOOOOOOOOOOOOOOMGGGNNQTCBaopYBTmrrqqqpmlqqqqqqpppooobUDBBDlphjngdljppmmTBCTSROOIOIIOOORQK",
  "MQSQLLQQSSSSSQQQLPMMMGGGGSGBUaoocTUjrqqqqpmmqrqqqqqoopommhZUBAAVolflgailprrrgYVBCSROJIOOOOOSOK",
  "NQQMMOSSSSSSQQQMOOMMMGNNQBTVppmgTVrrqqqppmnqqqqqqppooonmmomaTBAUopfjjecmmpqpqroVUBFSOIOOOOOOOK",
  "NNQMMPSSSSQSQQQMOOMMMGNQGTgroirYVrrqqqppnnqrqqqqpooooommmmkbWUBDmofhifcjmoppmjmrnTNFSOOOOOOOLK",
  "NNMMMMQSSSQQQQNMOOOOOLSBUrojejcUrqqqqponkpqqrrqpooooommmmmlkcVUBgpfgghchoonoicadlrTCSOOOOOOOLK",
  "NNMMQQQSSQNNNQNMOOOOOSCVqonjdYWlrqqqqpolmqqrrrqpponlllmmmmmkiZUAgqggfgbgmnnjbYZchoTCSLOOOIOOLI",
  "NNMMQQQMMQQLLLLMOOQOMSBXrjkgcWprrqpoooolprqrrpooppommlmmmmnkhaVBgqffffafkmniZWWbgoTBSLOSOIOOLI",
  "GNOPQNNNNNOPOQQQQQNNLSBXrjfcbmqooqpllonmpqqqpliinopqqomklmlihcWDgpffffafknmiZWWbkeCCSROSOIOOLI",
  "GLOOMNNNNNOOOQQQQQLNGSBXqifalrpjjopklolmppqpoiZZjopppppljmkfedYDgpffffbejkicYWZelUBTLOOOOIOOLI",
  "GGLLNNNLNQOOOOOMMLNNGSBXrjgaqopgelkimnlmppomgbWYjllklnolhkkhdbXDgpdfefbbhigYWWbmdBROOOIIIIIILE",
  "GGNGNNNNNNOOOOOMMMGGGMEDcocaqVBUekhhmmlopommfYVDBCTWifikjkicbbXDjmceeeaafcaXXWclUCQIMOIIIIOIIE",
  "GGGGGLNNNNOOOOOMMMLLGHSBVqaadACAViimnlnqppnlcWDABAAAUWcfgfeabaXDgldeccaYdaXWXYjXBSNIIIIIIIIOIE",
  "GGGGLOOOOJMMMQQQOOOOMNSCUqcaYADAUfmqolqqppmjZWBABABAABVYaaaabYVDikdfbabXZYWWWboTCSIIIIIIIIIILI",
  "GGGGLKOIOOMHMQQOOOOOONNSBghVoUAAVpoolprqpkhbWDAAAABDWfidaabeeZXTjkdfcaZXXXWWblUCSIIIOIIIIIOIFE",
  "GGFHLLLLIOLGLLQOOOQQLNQSCUaUqkWXpromorqpohaedUVVWWWimnjccdfhfaYDgldecaWWWWWagUBSQIIIIIIIIIIIFE",
  "GGIILQQOOOLLMOOOOONNQNQQSCYVqnrrqppqrrrqmnggmfkmooppnmgccfihicYDindfdbXXXXafUBTQLKIIIOOIIIIILE",
  "GGIILQQOOOMMMSOOOOQQQQQQSSCVrqqoopqqqonnmmnljmnononlmieehllkjcZDapeedaVWXdYBCSLLFIIIIIOOIIIILE",
  "GGIIOOOOOOSSSSSOSOQSSQSTCGUqrpnnoppppnmmmmmmilmmmmlkhfeillllibZTVojfdaWXdXDBSHOOJOOIIOOOOIIIFE",
  "GGIIOOOOSSSSSSSOOSSSSSTCTlqqoonnonnnmmmmmmmmlmkkjefeddilllllidaVTgpidbaeUUjDSLIIKOOOOOOOOOOILE",
  "GGOOOOOSSSSSSOSOOSSQSGGVYaWVWWXVdhilmmmmmmmmmmlkieeeefklllllidaWTVpkgddVTclCLQLHFOOOOIOOOOOOLE",
  "GGOOOOSSSSSSSSOOSONQQCaoXUUUTTCBBVejmmmmmmmmmmlmjeeeejlllllkidaWUDapngWDXemDCLNGGOOOOOOOSOOKIE",
  "GGIOOOSSOOOSSOOOOOQSCXaUUUVUTDBBBAVbfknmmmkijkmllkfgkklllllkidaWVUDTTDTVXbljDENGLOIOOOOOOOOIIE",
  "GGOOOOOOOOOSOOOOOOQSCVDBBBBAAABBBAUbfknmmjiihilllmjjlllklllkjdZWVUUTUUVYZbkoDCGGLOOOOOOOOOOIII",
  "GGIIOOOOOOOSOOOOOOMQCVBAAABAAAAAAAUcgiiijhhhhfjmmllmjfjlkkkjdbZWWVTUVWWZabfpVCSGGOOOOOOOOOOOLK",
  "GGOOOOOOOOOOOOOOOOMSCVAAAABAAAAAABVbfhhgghhhghiijlkkichkkkjiaZZXXVTUWXWZaberVBTGLIIOOOOOOOOOLI",
  "EHOOOOOOOOOSOOOIOOQQCcUBBAAAAAAABVZbceghhhhgghgffiiedbfiiiebaZWWXVTVYWWZabeqXBQNLIIIIOOOOIOOLI",
  "HMOOOOOOOOSSSOOOOOKETqUUBAAABDBAUZabbbfihhghggggffeeaaccccaZaXWWXVUXXXWaaaciqdBQGKIIOOOOOOIOLK",
  "GLOOOOOOOSSOSSOOOOJETqZAAAAAAABUZZZaefddcbhgggggfffcZXZddbaZWWWXVUVXabWYabcipgBSLIIOOIOOOOOILI",
  "GLOOOOOOOSOOSSOOOOLENolUBBAAABUWZZZZbbbbdehgggggfgdZZXZbZZYYWWWXUUXXbcXWZbdgngCSFIIOIOOOOOOILI",
  "GNOOOOOOOOOOOOOOIOLCNpiZVBABDTZWWZZchffghddhhhggfhdYZWXYWWXWWXXVUVXXbeYWYaceogCTLIIIOOOOOOOOLI",
  "GMOOOOOOOOOOOOOOIILCTqhZWUBBTVZWZZYZZYZYZcfghhhgfgdZaVVXWWXXXWVUVXXbddZXYadeogBKQNGHIOOOOOIOLK",
  "LMOOOSOOOOOOOOOOOILEDaobZVBADVZZZZZZaeeegicchhhhhidZYVXXXXWUUUUVWXYeddbXXZdcjlcNENGHIIIOOOOOOK",
  "NMOSSOOOOOOOOOOOOOLRCNpeUBAAAAUVZWYYZbbbdedhhhhhfcbaWVXWVVVUUUUVXYaeddcXXaddhnrTCNGFIIOOOOOOOK",
  "NMOSSOSOOOOIOOOOSIOIECnbBABDBAABVZZYWYYZbhihhhiiaWXaVVXVUUUUUVWYXZedddeYXadcflqTCNGEIIOOOOOROK",
  "NMOOOOSOOOOIOOOSSOOOEGgZABUUUUUTDUVWZddfiffffgcYUBUYTUUUUUUUVVXYYbeeedeYWaddfkqTCNGFIIIOOOOOLI",
  "NLOOOOOOOOOOOOSSSOOOKSCZDAVbWWWWUDATWWafeeddbVBAAACVDTTUUUVWVWYXchgifdcXWaddfjqTCNGHIIOOOOOMLE",
  "GGOOOOOOOOOOOSSSSOOOMLEDTADWeZZYWVUDDUUVUUUUDAAAAATUUUUUVVVVWXYadfhjfdcXWbedeipNCNGIIIIOOOOKFE",
  "GGOOOOOOOOOOOQSSSOOOLLQICECTbcYXXVVVTBBBBABUDAAABTTUUUUUVVVWYYYfghijgdbXWbeddenaCQNHIIIIOOOHFE",
  "GLOOOOOOOOOOOQSSSOOOOOOQQOSECCCCCCCCBdiZTTTUUUUUUUUUUUUVVVVYYZbgiiiifdXWWbdddeiqXCQGNNLOOOOOII",
  "GGIIIIOOOOOOORQQSOOOOOOOIOQRREJJMOIEBmqiaVUUTTUUUUUUVVVVVWYYYafiiiiifcXXWbbddehqcBSGGGIOOIOIIE",
  "GGIIHHIOIOOOOOQOOOOOOOOOOOKIKOOLQLFKBjpkjYVUUUUUUUUUVWWXWXZYZciiiiiifbXXXbbcddgodNNLLHOOOIIOLE",
  "GFIIHHIIOOOOOOOOOOOOOOOOOOIIIOOOOIQSBjrnlgcXUUUVVUUUWXXYYYYYcihiiiijbXXXWacddddgnmCEIIOOIOOOLE",
  "GGEEEHIIOOOOOOOOOOOOOOOIIIIOIOOOOOSCaoqpmgcbVUVVVVUUUXYYYZaYdiiiiiiiaWXXWbddddcelpCCSIOOOOOILE",
  "GGEEIIIIOIOOOOOOIOOILIIIIIIIOOOOSTBVrkoqnjiiaXUVVVVVUUWZYceahhiiiiifYWXXWbedddcbepYCSNKIIOIIIE",
  "GGIIIIIIOOOOOOOOOIIIIIIIIIIIOOSSSCUrqkprnkkkcaVVVVVVVUUXYbhfghhiiiicYWXXYdedddbbdlrVCSOIIIIIII",
  "GGIIIIIIOOOOOOOOOILLLIIIIIOOSOSSTCgrpjkopnnmhiaVWXWWVVUVYchghhiiiihXXXXWbedeedZbfhrVCSIFFIIIIE",
  "GFIIIIOOOOOOOOOOIILLLOOOOOOOOOSTCdrqqmhironlghdWVWWWWWVVWbhghhiiiigXWWXXbeddecYbfirVBSFFFIEEEE",
  "GFEIIIOOIOOOOOOOOOLQLOIOOOOOSSSBUrrppmhfkponjjigXWWWWWXWVXbhhhiijdXWWXXceeeeeaaddeklUCSFLIFIEE",
  "GFIIIOIOOOOOOOIOIOILOOOOOOSQSSSDXrqpoljfgoookjiiaWWWXXXWWXahghiiibWXWXYdeddebZcdccfpZBSGFEEEEE",
  "GFIIIIOOOIOOOOOOIIIKOOOOSSSSSBUrqqpppmmjbjnommkhjYVWXYXXWWYhhhiieZWXWXaddddeZZdcddbjjBSGGEEEEE",
  "GGIIOOOOOOOOOOIOOOOOOOOOQSTCCdmoqqpomlljbchommlijgaWYYYYYWXchhhiaXWWWXcddedaabfdddcflaCLGEEEEE",
  "GGIIOOOOSOOIIOIOOOOOOOOQSSCCdrqlrppnkllkcbdkmmkiijeWYYYYYYXaiiiiYWXWWYededbabdfdddbflnDCLGGEEE",
  "GGIIOSOOOOOOIIOOOOOOOOSLECdorpknrppnomlkhbZYdlljjjifXXYYYYYZhhfZXWXWZceecbabgjfedeZafoUCSFGHEE",
  "GGOOOOSSOOOOIOOOOOSSSQENCcrrqpkorppppljjicaXZjlkjjihYXXYYYYZfggYXWWWacdebbcdikgedeZZcoVCNGGFEE",
  "GGOOOOOSSOOOOOOOOOOOSTCaqrponljqqpppppnjjieYXXbkjjiiiaXYYYZccddXWWWZbbccbikkkkkfdeYYafoVCSGFFE",
  "GGIOOOOOOOOOOMOOOLSSCCjrrqonnjjqqpppppomiiiaWXXbljjijbXYYYZdcdcWWWXcbbbbgkkkkklgddYYbepVCSGFLE",
  "GGIIOOOOOOOOIMMMQQIBVgrrppookhoqpppppppolijfbYWXbjjiifZXYZbddcaWWWYbcbeijkkkkklfceYYaaoVBSHGFE",
  "GGIJIIOOOOOOMMMMLSCXrrqqnnnnjiqqppppppoonjiifZWWYhiihiaXXacddaYWWYccccglkkkkkklfccYZbZkXCNGGFE",
  "GGMLIIOOOOMILMMMSBarponooomjfjqqpnmopooonnjhigcXXXbjhihaWZdddZWXYacbhkkkkkkklkkgcXXXaaclZBLGLK",
  "NNNNLIIIIOHHMNQSGTjrppnnnnmjdjqqpnmnooonnnjiiieYYXafhhidXZccbYWWYbddikkkklllkkkdaXXWZbbjZBSMQR",
  "NNNNLIIIIIGHLNNSCmroonnnnmiecopomnnmmmnnnmmjiiffcXWXhiijaXZcWWXZbccklkkllllllkjZWXXXXaXebBSMLE",
  "GLGFLFLHHHHHGLLLDoqonnnomjeaboqpmnmmmnnnnnnjiiheeaWWgjiicYYZXWXdcbcllllllllljifYWXXWWWWhdBSGGT",
] as readonly string[];
/** Draw the approved image at native size by default, or fit it into a
 * smaller frame with nearest-neighbor sampling. Both axes share practically
 * the same scale factor at the Shop's 86x62 size, keeping Bingsu's head
 * natural rather than stretching or cropping it. No canvas transforms,
 * smoothing, generated art or new asset loading. */
export function drawBingsuPortrait55(
  ctx:any,x:number,y:number,
  width:number=BINGSU_PORTRAIT55.w,
  height:number=BINGSU_PORTRAIT55.h
):void {
  const ox=Math.round(x),oy=Math.round(y);
  const targetW=Math.max(1,Math.round(width));
  const targetH=Math.max(1,Math.round(height));
  for(let j=0;j<targetH;j++){
    const sourceY=Math.min(BINGSU_PORTRAIT55.h-1,
      Math.floor((j+0.5)*BINGSU_PORTRAIT55.h/targetH));
    const row=PIXELS55[sourceY];
    for(let i=0;i<targetW;){
      const sourceX=Math.min(BINGSU_PORTRAIT55.w-1,
        Math.floor((i+0.5)*BINGSU_PORTRAIT55.w/targetW));
      const key=row[sourceX];
      let end=i+1;
      while(end<targetW){
        const nextX=Math.min(BINGSU_PORTRAIT55.w-1,
          Math.floor((end+0.5)*BINGSU_PORTRAIT55.w/targetW));
        if(row[nextX]!==key)break;
        end++;
      }
      ctx.fillStyle=BINGSU_PALETTE55[CHARS55.indexOf(key)];
      ctx.fillRect(ox+i,oy+j,end-i,1);
      i=end;
    }
  }
}
