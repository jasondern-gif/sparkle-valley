'use strict';
// ---------- Asset wrappers: sprite art when an asset is ready, otherwise the original procedural drawing ----------
// Pattern: if(Assets.has(id)) drawAssetSprite(...) else originalDrawFn(...)
// Loaded right after the base draw functions exist (after ch2draw2.js) and BEFORE the modules that extend them
// (ch3.js, village.js). Those modules wrap whatever is global, so their extras (village pony dress-up via
// horseAcc, the star-oat sparkle, ...) keep drawing on top of either the sprite or the procedural art.
// Only drawing changes here: positions, sort order, hit areas and game state are untouched.
(()=>{
  // World object: trees (tile 'T'). One sheet, one named frame per existing tree kind (see treeKind in draw.js).
  const TREE_VARIANTS=['round','blossom','apple','pine'];
  const procTree=drawTree;
  drawTree=function(x,y){
    const h=hash(x,y),v=TREE_VARIANTS[treeKind(h)];
    if(!Assets.hasAnim('tree',v))return procTree(x,y);
    const s=ts,cx=SX(x)+s/2,base=SY(y)+s*.9,k=Math.sin(nowS()*1.1+h*12)*.022;
    shadow(cx,base,s*.44,s*.14);
    ctx.save();ctx.translate(cx,base);ctx.transform(1,0,k,1,0,0);drawAssetSprite('tree',0,0,{anim:v});ctx.restore();
  };

  // Crop: carrot. Animation "stage1".."stage3" = stageOf() 1..3 (stage 0 is the seed dots drawn in render()).
  // Anchored at the plot's ground line; the ripe bounce from render() is kept because it is already in y.
  const CROP_ASSETS={carrot:'crop_carrot'};
  const procCrop=drawCrop;
  drawCrop=function(c,st,x,y,size,t){
    const id=CROP_ASSETS[c],anim='stage'+st;
    if(!id||!Assets.hasAnim(id,anim))return procCrop(c,st,x,y,size,t);
    drawAssetSprite(id,x,y+ts*.45,{anim,timeMs:t*1000});
  };

  // Building: Grandma's farmhouse (tiles 'H' x3-6,y2-5). Bottom-center of the footprint is world (5,6).
  const procHouse=drawHouse;
  drawHouse=function(){
    if(!Assets.has('farmhouse'))return procHouse();
    const s=ts,x=SX(3),y=SY(2),T=nowS();
    shadow(SX(5),y+3.98*s,4*s*.56,s*.3);
    drawAssetSprite('farmhouse',SX(5),SY(6));
    // chimney smoke: same live detail as drawHouse()
    for(let i=0;i<3;i++){const k=(T*.28+i/3)%1,px=x+3.06*s+Math.sin(k*5+i)*s*.12+k*s*.25,py=y+.3*s-k*s*.9;
      ctx.fillStyle=`rgba(255,255,255,${(.55*(1-k)).toFixed(3)})`;circ(px,py,s*(.08+k*.13));ctx.fill();}
  };

  // Character: Buttercup. Callers mark her look with assetId:'buttercup'; every other horse is untouched.
  // Keeps: facing (flip), walk/idle animation (walkT / time), the procedural bob and hops (y), scale,
  // the ground shadow, and the accessories drawn inside drawHorse() (bow, flower crown, gift accessory) at the
  // same head anchor. Village dress-up (head/neck/face items) is added afterwards by village.js's drawHorse wrapper,
  // which uses the same anchor + bob math, so it lines up with the sprite too.
  const procHorse=drawHorse;
  drawHorse=function(x,y,o){
    const id=o&&o.assetId;
    if(!id||o.horn||o.wings||!Assets.has(id))return procHorse(x,y,o);
    const s=ts*(o.scale||1),T=nowS(),wt=o.walkT||0,mv=!!o.moving,seed=strSeed(o.body||'#fff');
    const bob=mv?-Math.abs(Math.sin(wt))*s*.05:Math.sin(T*2.1+seed)*s*.006,Hx=.4*s,Hy=-.88*s+bob;
    const anim=mv&&Assets.hasAnim(id,'walk')?'walk':'idle';
    ctx.save();ctx.translate(x,y);if(o.flip)ctx.scale(-1,1);
    shadow(0,0,s*.42,s*.1);
    drawAssetSprite(id,0,bob,{anim,timeMs:anim==='walk'?wt/12*1000:T*1000,scale:o.scale||1});
    if(o.crown){drawEmoji('🌸',Hx-s*.14,Hy-s*.17,s*.17);drawEmoji('🌼',Hx-s*.05,Hy-s*.22,s*.15);}
    if(o.bow)drawEmoji('🎀',Hx-s*.22,Hy-s*.07,s*.24);
    if(o.acc)drawEmoji(o.acc,Hx-s*.06,Hy-s*.25,s*.26);
    ctx.restore();
  };
})();
