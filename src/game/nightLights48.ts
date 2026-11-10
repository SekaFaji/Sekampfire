import { CX } from "./config";
import { FENCE_TORCH_LIGHT_RADIUS, fenceTorchLights } from "./fenceTorches47";
import { weatherIntensity } from "./weather";

/** Real visible light sources only. A finished building is NOT a lamp and
 * sheltered fence segments do not create invisible floating light circles.
 * Keep this single list authoritative for night-mask cutouts. */
export type NightLight48 = {kind:"fire"|"hand"|"fence";x:number;y:number;radius:number};
export function nightLightSources48(g:any):NightLight48[] {
  const sources:NightLight48[]=[];
  const fuel=Number.isFinite(g.fuel)?Math.max(0,Math.min(100,g.fuel)):0;
  if(g.fireLit && fuel>0){
    let radius=28+(fuel/100)*66;
    radius*=1-weatherIntensity(g,"fog")*0.35;
    radius*=1-weatherIntensity(g,"blizzard")*0.25;
    sources.push({kind:"fire",x:CX,y:146,radius});
  }
  if(Number(g.player?.torchT)>0 && Number.isFinite(g.player?.x)
     && Number.isFinite(g.player?.y)){
    sources.push({kind:"hand",x:g.player.x,y:g.player.y-12,radius:38});
  }
  for(const torch of fenceTorchLights(g))
    sources.push({kind:"fence",x:torch.x,y:torch.y,radius:FENCE_TORCH_LIGHT_RADIUS});
  return sources;
}
