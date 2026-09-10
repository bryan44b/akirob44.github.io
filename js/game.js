if(typeof THREE==="undefined"){document.body.innerHTML="<div style='color:white;padding:40px;font-family:Arial'>No se pudo cargar Three.js. Comprueba tu conexión a internet.</div>";throw new Error("THREE no disponible")}

const scene=new THREE.Scene();scene.background=new THREE.Color(0x79c8ff);scene.fog=new THREE.Fog(0x9fd7ff,155,285);
const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.05,340);camera.rotation.order="YXZ";

// ---------- OBJETO EN LA MANO ----------
const handGroup=new THREE.Group();
camera.add(handGroup);
scene.add(camera);

const handSkinMat=new THREE.MeshLambertMaterial({color:0xc98a5a});
const handSleeveMat=new THREE.MeshLambertMaterial({color:0x3b78c4});

const arm=new THREE.Group();
const sleeve=new THREE.Mesh(new THREE.BoxGeometry(.18,.42,.18),handSleeveMat);
sleeve.position.set(0,-.12,0);
const hand=new THREE.Mesh(new THREE.BoxGeometry(.18,.20,.18),handSkinMat);
hand.position.set(0,-.42,0);
arm.add(sleeve,hand);
arm.position.set(.55,-.40,-.84);
arm.rotation.set(-.2,0,-.08);
handGroup.add(arm);

let heldObject=null;
let handBobTime=0;
let handSwing=0;

function disposeHeldObject(){
 if(!heldObject)return;
 handGroup.remove(heldObject);
 heldObject=null;
}

function makeHeldBlock(type){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(.28,.28,.28),dropMaterialFor(type));
 mesh.position.set(.43,-.31,-.72);
 mesh.rotation.set(.18,-.45,.08);
 return mesh;
}

function toolModel(kind){
 const g=new THREE.Group();
 const woodMat=new THREE.MeshLambertMaterial({color:0x79512d});
 const metalMat=new THREE.MeshLambertMaterial({color:0x9ea4aa});
 const handle=new THREE.Mesh(new THREE.BoxGeometry(.07,.58,.07),woodMat);
 handle.position.y=-.08;
 g.add(handle);

 if(kind==="pickaxe"){
   const head=new THREE.Mesh(new THREE.BoxGeometry(.48,.09,.09),metalMat);
   head.position.y=.22;
   g.add(head);
   const tip1=new THREE.Mesh(new THREE.BoxGeometry(.12,.08,.08),metalMat);
   tip1.position.set(-.27,.18,0);tip1.rotation.z=.45;g.add(tip1);
   const tip2=tip1.clone();tip2.position.x=.27;tip2.rotation.z=-.45;g.add(tip2);
 }else if(kind==="shovel"){
   const head=new THREE.Mesh(new THREE.BoxGeometry(.22,.26,.08),metalMat);
   head.position.y=.25;g.add(head);
 }else if(kind==="axe"){
   const head=new THREE.Mesh(new THREE.BoxGeometry(.28,.22,.10),metalMat);
   head.position.set(.12,.24,0);g.add(head);
 }else if(kind==="sword"){
   const bladeMat=new THREE.MeshLambertMaterial({color:0xcbd5df});
   const edgeMat=new THREE.MeshLambertMaterial({color:0xf4f8fb});
   const grooveMat=new THREE.MeshLambertMaterial({color:0x7c8791});
   const guardMat=new THREE.MeshLambertMaterial({color:0x5d6770});
   const gripMat=new THREE.MeshLambertMaterial({color:0x55331f});
   const wrapMat=new THREE.MeshLambertMaterial({color:0x8d6a44});

   // Hoja principal
   const blade=new THREE.Mesh(new THREE.BoxGeometry(.115,.60,.06),bladeMat);
   blade.position.y=.20;
   g.add(blade);

   // Filos más claros
   const edgeL=new THREE.Mesh(new THREE.BoxGeometry(.018,.56,.068),edgeMat);
   edgeL.position.set(-.058,.20,0);
   g.add(edgeL);
   const edgeR=edgeL.clone();
   edgeR.position.x=.058;
   g.add(edgeR);

   // Canal central
   const groove=new THREE.Mesh(new THREE.BoxGeometry(.025,.48,.066),grooveMat);
   groove.position.set(0,.19,.001);
   g.add(groove);

   // Punta
   const tip=new THREE.Mesh(new THREE.ConeGeometry(.082,.19,4),bladeMat);
   tip.position.y=.595;
   tip.rotation.y=Math.PI/4;
   g.add(tip);

   // Guarda
   const guard=new THREE.Mesh(new THREE.BoxGeometry(.36,.075,.11),guardMat);
   guard.position.y=-.125;
   g.add(guard);

   const guardL=new THREE.Mesh(new THREE.BoxGeometry(.11,.06,.09),guardMat);
   guardL.position.set(-.20,-.10,0);
   guardL.rotation.z=-.35;
   g.add(guardL);
   const guardR=guardL.clone();
   guardR.position.x=.20;
   guardR.rotation.z=.35;
   g.add(guardR);

   // Empuñadura
   const grip=new THREE.Mesh(new THREE.BoxGeometry(.075,.29,.075),gripMat);
   grip.position.y=-.31;
   g.add(grip);

   for(let i=0;i<4;i++){
     const wrap=new THREE.Mesh(new THREE.BoxGeometry(.09,.025,.09),wrapMat);
     wrap.position.y=-.22-i*.065;
     wrap.rotation.y=i%2?.18:-.18;
     g.add(wrap);
   }

   // Pomo
   const pommel=new THREE.Mesh(new THREE.OctahedronGeometry(.09,0),guardMat);
   pommel.position.y=-.50;
   g.add(pommel);
 }else if(kind==="bow"){
   const top=new THREE.Mesh(new THREE.BoxGeometry(.055,.40,.055),woodMat);
   top.position.y=.19;top.rotation.z=.28;g.add(top);
   const bottom=top.clone();bottom.position.y=-.19;bottom.rotation.z=-.28;g.add(bottom);
   const sg=new THREE.BufferGeometry().setFromPoints([
     new THREE.Vector3(.12,.38,0),new THREE.Vector3(-.05,0,0),new THREE.Vector3(.12,-.38,0)
   ]);
   g.add(new THREE.Line(sg,new THREE.LineBasicMaterial({color:0xe7dfcf})));
 }

 g.position.set(.46,-.29,-.70);
 g.rotation.set(.12,0,-.42);
 return g;
}

function refreshHeldItem(){
 disposeHeldObject();

 if(["grass","dirt","stone","wood","leaves"].includes(selected)){
   heldObject=makeHeldBlock(selected);
 }else if(["sword","bow","pickaxe","shovel","axe"].includes(selected)){
   heldObject=toolModel(selected);
 }

 if(heldObject)handGroup.add(heldObject);
}

function triggerHandSwing(){
 handSwing=1;
}

function updateHand(dt){
 handBobTime+=dt;
 const moving=keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD;
 const bob=moving&&player.onGround?Math.sin(handBobTime*10)*.018:0;
 const sway=moving&&player.onGround?Math.cos(handBobTime*5)*.012:0;
 handGroup.position.set(sway,bob,0);

 if(handSwing>0)handSwing=Math.max(0,handSwing-dt*4.5);
 const phase=1-handSwing;
 const swing=handSwing>0?Math.sin(phase*Math.PI):0;

 arm.rotation.x=-.20-swing*.35;
 arm.rotation.z=-.08-swing*.18;

 if(heldObject){
   heldObject.rotation.x=.12-swing*.55;
   heldObject.rotation.z=-.42-swing*.18;
 }
}

const isTouchDevice=window.matchMedia("(pointer:coarse)").matches||("ontouchstart" in window);
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:"high-performance"});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio||1,isTouchDevice ? .72 : 1.25));renderer.outputEncoding=THREE.sRGBEncoding;document.getElementById("game").appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xe7f4ff,0x62704b,1.42));
const sun=new THREE.DirectionalLight(0xfff2cf,1.02);sun.position.set(38,55,22);scene.add(sun);

const skyGeo=new THREE.SphereGeometry(300,24,16);
const skyMat=new THREE.ShaderMaterial({
 side:THREE.BackSide,
 depthWrite:false,
 uniforms:{top:{value:new THREE.Color(0x4da9ed)},bottom:{value:new THREE.Color(0xc7ebff)}},
 vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
 fragmentShader:`uniform vec3 top;uniform vec3 bottom;varying vec3 vPos;void main(){float h=clamp(normalize(vPos).y*.65+.35,0.0,1.0);gl_FragColor=vec4(mix(bottom,top,h),1.0);}`
});
const skyDome=new THREE.Mesh(skyGeo,skyMat);scene.add(skyDome);

const cloudGroup=new THREE.Group();scene.add(cloudGroup);
const cloudMat=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.72,depthWrite:false});
for(let i=0;i<16;i++){
 const g=new THREE.Group();
 const pieces=2+((i*7)%4);
 for(let j=0;j<pieces;j++){
   const m=new THREE.Mesh(new THREE.BoxGeometry(5+((i+j)%4)*2,.6,2.5+((i*j+3)%3)),cloudMat);
   m.position.set(j*3-(pieces*1.5),0,(j%2)*1.2);
   g.add(m);
 }
 const a=i/16*Math.PI*2,r=42+(i%5)*10;
 g.position.set(Math.cos(a)*r,24+(i%3)*2,Math.sin(a)*r);
 cloudGroup.add(g);
}

const ui={start:document.getElementById("start"),play:document.getElementById("playBtn"),coords:document.getElementById("coords"),health:document.getElementById("health"),combat:document.getElementById("combat"),inventory:document.getElementById("inventory"),backpack:document.getElementById("backpack"),breakBar:document.getElementById("breakBar"),breakFill:document.getElementById("breakFill")};
const hotbar=document.getElementById("hotbar");
const slots=[...document.querySelectorAll(".slot")];
const HOTBAR_ORDER_KEY="blockcraft_hotbar_order_v1";
let draggedHotbarSlot=null;

function allHotbarSlots(){
 return [...hotbar.querySelectorAll(".slot")];
}
function visibleHotbarSlots(){
 return allHotbarSlots().filter(s=>s.style.display!=="none");
}
function hotbarKeyForIndex(i){
 return i===9?"0":String(i+1);
}
function refreshHotbarNumbers(){
 const visible=visibleHotbarSlots();
 for(const slot of allHotbarSlots()){
   const b=slot.querySelector("b");
   if(b)b.textContent="";
 }
 visible.forEach((slot,i)=>{
   const b=slot.querySelector("b");
   if(b)b.textContent=hotbarKeyForIndex(i);
 });
}
function saveHotbarOrder(){
 try{
   localStorage.setItem(HOTBAR_ORDER_KEY,JSON.stringify(allHotbarSlots().map(s=>s.dataset.item)));
 }catch(e){}
}
function loadHotbarOrder(){
 try{
   const saved=JSON.parse(localStorage.getItem(HOTBAR_ORDER_KEY)||"null");
   if(!Array.isArray(saved))return;
   const byItem=new Map(allHotbarSlots().map(s=>[s.dataset.item,s]));
   for(const item of saved){
     const slot=byItem.get(item);
     if(slot)hotbar.appendChild(slot);
   }
   for(const slot of byItem.values()){
     if(!saved.includes(slot.dataset.item))hotbar.appendChild(slot);
   }
 }catch(e){}
}
function hotbarCanReorder(){
 return running&&!locked&&!inventoryOpen&&!backpackOpen;
}
function setHotbarReorderHint(){
 hotbar.classList.toggle("reorderMode",hotbarCanReorder());
}

const permanentHotbarItems=new Set(["sword","bow","pickaxe","shovel","axe"]);

function itemAvailableForHotbar(item){
 return permanentHotbarItems.has(item)||(inv[item]||0)>0;
}
function firstAvailableHotbarItem(){
 const slot=visibleHotbarSlots().find(s=>itemAvailableForHotbar(s.dataset.item))||allHotbarSlots().find(s=>itemAvailableForHotbar(s.dataset.item));
 return slot?slot.dataset.item:"sword";
}
function updateHotbarVisibility(){
 for(const slot of slots){
   const item=slot.dataset.item;
   slot.style.display=itemAvailableForHotbar(item)?"":"none";
 }
 if(!itemAvailableForHotbar(selected)){
   selected=firstAvailableHotbarItem();
   cancelMining();
   refreshHeldItem();
 }
 allHotbarSlots().forEach(s=>s.classList.toggle("active",s.dataset.item===selected&&s.style.display!=="none"));
 refreshHotbarNumbers();
}

const BLOCKS=["grass","dirt","stone","wood","leaves","bedrock"];
const inv={grass:18,dirt:18,stone:12,wood:8,planks:0,sticks:0,crafting_table:0,leaves:8,arrows:20};
const BACKPACK_SLOTS=12;
const BACKPACK_STACK=64;
const backpack=new Array(BACKPACK_SLOTS).fill(null);
let backpackOpen=false;
const backpackItems=["grass","dirt","stone","wood","planks","sticks","crafting_table","leaves","arrows"];


function pixelTexture(base,variation=22,pattern="noise"){
 const c=document.createElement("canvas");c.width=c.height=16;
 const ctx=c.getContext("2d");
 const rgb=[parseInt(base.slice(1,3),16),parseInt(base.slice(3,5),16),parseInt(base.slice(5,7),16)];
 for(let y=0;y<16;y++)for(let x=0;x<16;x++){
   let n=((x*17+y*31+x*y*7)%19)-9;
   let v=n*(variation/9);
   if(pattern==="stone"&&((x*3+y*5)%13===0))v-=28;
   if(pattern==="wood")v+=((x%5===0)?-23:((x%5===1)?9:0));
   if(pattern==="leaves"&&((x+y*3)%11===0))v-=25;
   const r=Math.max(0,Math.min(255,rgb[0]+v));
   const g=Math.max(0,Math.min(255,rgb[1]+v));
   const b=Math.max(0,Math.min(255,rgb[2]+v));
   ctx.fillStyle=`rgb(${r|0},${g|0},${b|0})`;ctx.fillRect(x,y,1,1);
 }
 const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;
}
function grassSideTexture(){
 const c=document.createElement("canvas");c.width=c.height=16;const ctx=c.getContext("2d");
 const dirt=pixelTexture("#80552f",18).image;
 ctx.drawImage(dirt,0,0);
 for(let y=0;y<5;y++)for(let x=0;x<16;x++){
   const n=((x*13+y*9)%15)-7;
   ctx.fillStyle=`rgb(${83+n},${164+n*2},${61+n})`;ctx.fillRect(x,y,1,1);
 }
 const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;return t;
}
const tex={
 grassTop:pixelTexture("#58b542",20),
 grassSide:grassSideTexture(),
 dirt:pixelTexture("#80552f",20),
 stone:pixelTexture("#777b82",18,"stone"),
 wood:pixelTexture("#81522a",17,"wood"),
 leaves:pixelTexture("#3f9341",22,"leaves"),
 bedrock:pixelTexture("#303237",24,"stone")
};
const mat={
 grass:[
   new THREE.MeshLambertMaterial({map:tex.grassSide}),
   new THREE.MeshLambertMaterial({map:tex.grassSide}),
   new THREE.MeshLambertMaterial({map:tex.grassTop}),
   new THREE.MeshLambertMaterial({map:tex.dirt}),
   new THREE.MeshLambertMaterial({map:tex.grassSide}),
   new THREE.MeshLambertMaterial({map:tex.grassSide})
 ],
 dirt:new THREE.MeshLambertMaterial({map:tex.dirt}),
 stone:new THREE.MeshLambertMaterial({map:tex.stone}),
 wood:new THREE.MeshLambertMaterial({map:tex.wood}),
 leaves:new THREE.MeshLambertMaterial({map:tex.leaves}),
 bedrock:new THREE.MeshLambertMaterial({map:tex.bedrock})
};
const cubeGeo=new THREE.BoxGeometry(1,1,1),dummy=new THREE.Object3D(),world=new THREE.Group();scene.add(world);
const CHUNK=16;
let DIST=4;
let SIM_DIST=3;
let MAX_FPS=60;
let LOW_RESOURCE=false;
let MAX_PARTICLES=160;
let MAX_DROPS=48;
let MAX_MOBS=7;
const blocks=new Map(),chunks=new Map(),meshData=new Map(),edits=new Map();
const k3=(x,y,z)=>`${x},${y},${z}`,kc=(x,z)=>`${x},${z}`,fd=(n,d)=>Math.floor(n/d);
function heightAt(x,z){return Math.floor(3+Math.sin(x*.105)*2.4+Math.cos(z*.11)*2.1+Math.sin((x+z)*.047)*1.6+Math.cos((x-z)*.033)*1.2)}
function hash(x,z){let n=(x*374761393+z*668265263)|0;n=(n^(n>>>13))*1274126177;n^=n>>>16;return(n>>>0)/4294967295}
function tree(x,z){return Math.abs(x)>4&&Math.abs(z)>4&&heightAt(x,z)>0&&hash(x,z)>.989}
function generated(x,y,z){
 let h=heightAt(x,z),t=null;if(y>=-4&&y<=h)t=y===-4?"bedrock":y===h?"grass":y>=h-2?"dirt":"stone";
 for(let tx=x-2;tx<=x+2;tx++)for(let tz=z-2;tz<=z+2;tz++)if(tree(tx,tz)){let th=heightAt(tx,tz),dx=x-tx,dz=z-tz,dy=y-th;if(dx===0&&dz===0&&dy>=1&&dy<=4)t="wood";if(dy>=3&&dy<=5&&Math.abs(dx)<=2&&Math.abs(dz)<=2&&Math.abs(dx)+Math.abs(dz)<4&&!(dx===0&&dz===0&&dy<=4))t="leaves";if(dx===0&&dz===0&&dy===6)t="leaves"}
 return t
}

function worldType(x,y,z){let k=k3(x,y,z);return edits.has(k)?edits.get(k):generated(x,y,z)}

// Comprueba si hay bloques sólidos entre dos puntos.
// Se usa para impedir ataques, flechas y explosiones a través de paredes.
function clearLine(ax,ay,az,bx,by,bz){
 const dx=bx-ax,dy=by-ay,dz=bz-az;
 const dist=Math.hypot(dx,dy,dz);
 const steps=Math.max(2,Math.ceil(dist/.22));
 for(let i=1;i<steps;i++){
   const t=i/steps;
   const x=ax+dx*t,y=ay+dy*t,z=az+dz*t;
   if(worldType(Math.round(x),Math.round(y),Math.round(z)))return false;
 }
 return true;
}
function mobHasLineToPlayer(m){
 return clearLine(
   m.mesh.position.x,m.mesh.position.y+1.0,m.mesh.position.z,
   player.pos.x,player.pos.y+player.eye*.72,player.pos.z
 );
}
function mobCanStandAt(m,x,z){
 const gy=heightAt(x,z)+.5;
 const radius=m.type==="spider"?.45:.31;
 const bodyH=m.type==="spider"?.75:1.75;
 const minX=Math.floor(x-radius+.5),maxX=Math.floor(x+radius+.5);
 const minZ=Math.floor(z-radius+.5),maxZ=Math.floor(z+radius+.5);
 const minY=Math.floor(gy+.05+.5),maxY=Math.floor(gy+bodyH-.05+.5);
 for(let bx=minX;bx<=maxX;bx++)for(let by=minY;by<=maxY;by++)for(let bz=minZ;bz<=maxZ;bz++){
   if(blocks.has(k3(bx,by,bz)))return false;
 }
 return true;
}
function moveMobXZ(m,dx,dz){
 const nx=m.mesh.position.x+dx,nz=m.mesh.position.z+dz;
 if(mobCanStandAt(m,nx,m.mesh.position.z))m.mesh.position.x=nx;
 if(mobCanStandAt(m,m.mesh.position.x,nz))m.mesh.position.z=nz;
}
function createChunk(cx,cz){
 let key=kc(cx,cz);if(chunks.has(key))return;let c={cx,cz,group:new THREE.Group(),keys:new Set()};chunks.set(key,c);world.add(c.group);
 for(let x=cx*CHUNK;x<(cx+1)*CHUNK;x++)for(let z=cz*CHUNK;z<(cz+1)*CHUNK;z++){let h=heightAt(x,z);for(let y=-4;y<=h+7;y++){let t=worldType(x,y,z);if(t){let q=k3(x,y,z);blocks.set(q,t);c.keys.add(q)}}}
 queueChunkRebuild(cx,cz)
}
function unloadChunk(cx,cz){let c=chunks.get(kc(cx,cz));if(!c)return;for(let q of c.keys)blocks.delete(q);for(let m of c.group.children)meshData.delete(m.uuid);world.remove(c.group);chunks.delete(kc(cx,cz))}
function exposed(x,y,z){return[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].some(d=>!blocks.has(k3(x+d[0],y+d[1],z+d[2])))}
function rebuildChunk(cx,cz){
 let c=chunks.get(kc(cx,cz));if(!c)return;for(let m of c.group.children)meshData.delete(m.uuid);c.group.clear();
 let lists={grass:[],dirt:[],stone:[],wood:[],leaves:[],bedrock:[]};
 for(let q of c.keys){let t=blocks.get(q);if(!t)continue;let[x,y,z]=q.split(",").map(Number);if(exposed(x,y,z))lists[t].push({x,y,z,type:t})}
 for(let t of BLOCKS){let a=lists[t];if(!a.length)continue;let mesh=new THREE.InstancedMesh(cubeGeo,mat[t],a.length);for(let i=0;i<a.length;i++){dummy.position.set(a[i].x,a[i].y,a[i].z);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix)}mesh.instanceMatrix.needsUpdate=true;meshData.set(mesh.uuid,a);c.group.add(mesh)}
}

const chunkBuildQueue=[];
const chunkBuildQueued=new Set();
const chunkRebuildQueue=[];
const chunkRebuildQueued=new Set();
let ccx=99999,ccz=99999;

function queueChunkBuild(cx,cz,priority=0){
 const key=kc(cx,cz);
 if(chunks.has(key)||chunkBuildQueued.has(key))return;
 chunkBuildQueued.add(key);
 chunkBuildQueue.push({cx,cz,priority});
}

function queueChunkRebuild(cx,cz){
 const key=kc(cx,cz);
 if(!chunks.has(key)||chunkRebuildQueued.has(key))return;
 chunkRebuildQueued.add(key);
 chunkRebuildQueue.push({cx,cz});
}

function rebuildNear(cx,cz){
 queueChunkRebuild(cx,cz);
 queueChunkRebuild(cx+1,cz);
 queueChunkRebuild(cx-1,cz);
 queueChunkRebuild(cx,cz+1);
 queueChunkRebuild(cx,cz-1);
}

function processChunkQueues(){
 // Generar como máximo 1 chunk nuevo por frame.
 if(chunkBuildQueue.length){
   chunkBuildQueue.sort((a,b)=>a.priority-b.priority);
   const job=chunkBuildQueue.shift();
   chunkBuildQueued.delete(kc(job.cx,job.cz));
   if(!chunks.has(kc(job.cx,job.cz)))createChunk(job.cx,job.cz);
 }

 // Reconstruir como máximo 1 chunk sucio por frame.
 if(chunkRebuildQueue.length){
   const job=chunkRebuildQueue.shift();
   chunkRebuildQueued.delete(kc(job.cx,job.cz));
   if(chunks.has(kc(job.cx,job.cz)))rebuildChunk(job.cx,job.cz);
 }
}

function updateChunks(force=false){
 const x=fd(player.pos.x,CHUNK),z=fd(player.pos.z,CHUNK);
 if(!force&&x===ccx&&z===ccz)return;

 ccx=x;ccz=z;
 const wanted=new Set();

 for(let dx=-DIST;dx<=DIST;dx++){
   for(let dz=-DIST;dz<=DIST;dz++){
     const a=x+dx,b=z+dz,key=kc(a,b);
     wanted.add(key);
     if(!chunks.has(key)){
       queueChunkBuild(a,b,dx*dx+dz*dz);
     }
   }
 }

 // Quitar trabajos que ya quedaron fuera de distancia.
 for(let i=chunkBuildQueue.length-1;i>=0;i--){
   const q=chunkBuildQueue[i];
   if(!wanted.has(kc(q.cx,q.cz))){
     chunkBuildQueued.delete(kc(q.cx,q.cz));
     chunkBuildQueue.splice(i,1);
   }
 }

 // Descargar chunks lejanos.
 for(const [key,c] of [...chunks]){
   if(!wanted.has(key))unloadChunk(c.cx,c.cz);
 }
}

function changeBlock(x,y,z,t){
 const q=k3(x,y,z);
 edits.set(q,t);
 const cx=fd(x,CHUNK),cz=fd(z,CHUNK),c=chunks.get(kc(cx,cz));
 if(c){
   if(t){blocks.set(q,t);c.keys.add(q)}
   else{blocks.delete(q);c.keys.delete(q)}
   rebuildNear(cx,cz);
 }
}

const player={pos:new THREE.Vector3(0,8,0),vel:new THREE.Vector3(),knock:new THREE.Vector3(),radius:.31,height:1.78,eye:1.62,speed:5.25,jump:7.1,onGround:false};
let yaw=0,pitch=0,running=false,locked=false,selected="grass",hp=20,keys={},inventoryOpen=false;let swordTier=1;
function syncMobileControlsVisibility(){
 const mc=document.getElementById("mobileControls");
 if(mc)mc.style.pointerEvents=running?"":"none";
}

const mobileInput={x:0,z:0,moveId:null,lookId:null,lookX:0,lookY:0,mining:false};

function collides(px,py,pz){let r=player.radius;for(let x=Math.floor(px-r+.5);x<=Math.floor(px+r+.5);x++)for(let y=Math.floor(py+.001+.5);y<=Math.floor(py+player.height-.001+.5);y++)for(let z=Math.floor(pz-r+.5);z<=Math.floor(pz+r+.5);z++)if(blocks.has(k3(x,y,z)))return true;return false}
function moveAxis(a,v){if(!v)return;player.pos[a]+=v;if(collides(player.pos.x,player.pos.y,player.pos.z)){player.pos[a]-=v;if(a==="y"){if(v<0)player.onGround=true;player.vel.y=0}else player.vel[a]=0}}
function resetPlayer(){player.pos.set(0,8,0);player.vel.set(0,0,0);player.knock.set(0,0,0);updateChunks(true)}
function updatePlayer(dt){
 let fx=-Math.sin(yaw),fz=-Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw),mx=0,mz=0;
 if(keys.KeyW){mx+=fx;mz+=fz}
 if(keys.KeyS){mx-=fx;mz-=fz}
 if(keys.KeyD){mx+=rx;mz+=rz}
 if(keys.KeyA){mx-=rx;mz-=rz}

 if(isTouchDevice){
   mx+=rx*mobileInput.x + fx*(-mobileInput.z);
   mz+=rz*mobileInput.x + fz*(-mobileInput.z);
 }

 let l=Math.hypot(mx,mz);
 if(l){mx/=l;mz/=l}

 // Movimiento normal + empuje recibido.
 player.vel.x=mx*player.speed;
 player.vel.z=mz*player.speed;
 player.vel.y=Math.max(player.vel.y-18*dt,-22);

 // El knockback se va frenando poco a poco, como una inercia.
 const knockDrag=Math.exp(-6.2*dt);
 player.knock.x*=knockDrag;
 player.knock.z*=knockDrag;
 player.knock.y*=Math.exp(-3.5*dt);

 player.onGround=false;

 let dx=(player.vel.x+player.knock.x)*dt;
 let dy=(player.vel.y+player.knock.y)*dt;
 let dz=(player.vel.z+player.knock.z)*dt;

 let s=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz))/.18));
 for(let i=0;i<s;i++){
   moveAxis("x",dx/s);
   moveAxis("z",dz/s);
   moveAxis("y",dy/s);
 }

 if(player.pos.y<-20)resetPlayer();
 updateChunks();

 camera.position.set(player.pos.x,player.pos.y+player.eye,player.pos.z);
 camera.rotation.y=yaw;
 camera.rotation.x=pitch;
 ui.coords.textContent=`X: ${player.pos.x.toFixed(1)} · Y: ${player.pos.y.toFixed(1)} · Z: ${player.pos.z.toFixed(1)}`
}
function refreshUI(){for(let n in inv){document.querySelectorAll(`[data-count="${n}"]`).forEach(e=>e.textContent=inv[n]);document.querySelectorAll(`[data-inv="${n}"]`).forEach(e=>e.textContent=inv[n])}ui.health.textContent="❤ ".repeat(Math.ceil(hp/2)).trim();ui.combat.textContent=`${
 selected==="sword"?(swordTier===2?"Espada de piedra":"Espada"):
 selected==="bow"?"Arco":
 selected==="pickaxe"?"Pico":
 selected==="shovel"?"Pala":
 selected==="axe"?"Hacha":"Bloques"
 } · Flechas: ${inv.arrows}`
 updateHotbarVisibility();
}
function selectItem(n){
 if(!itemAvailableForHotbar(n))return;
 selected=n;
 allHotbarSlots().forEach(s=>s.classList.toggle("active",s.dataset.item===n));
 cancelMining();
 refreshUI();
 refreshHeldItem();
}
function setupHotbarReorder(){
 for(const slot of slots){
   slot.draggable=true;

   slot.onclick=e=>{
     e.stopPropagation();
     selectItem(slot.dataset.item);
   };

   slot.addEventListener("dragstart",e=>{
     if(!hotbarCanReorder()||slot.style.display==="none"){
       e.preventDefault();
       return;
     }
     draggedHotbarSlot=slot;
     slot.classList.add("dragging");
     e.dataTransfer.effectAllowed="move";
     e.dataTransfer.setData("text/plain",slot.dataset.item);
   });

   slot.addEventListener("dragover",e=>{
     if(!draggedHotbarSlot||draggedHotbarSlot===slot||slot.style.display==="none")return;
     e.preventDefault();
     slot.classList.add("dragOver");
     e.dataTransfer.dropEffect="move";
   });

   slot.addEventListener("dragleave",()=>slot.classList.remove("dragOver"));

   slot.addEventListener("drop",e=>{
     if(!draggedHotbarSlot||draggedHotbarSlot===slot||slot.style.display==="none")return;
     e.preventDefault();
     slot.classList.remove("dragOver");

     const rect=slot.getBoundingClientRect();
     const after=e.clientX>rect.left+rect.width/2;
     hotbar.insertBefore(draggedHotbarSlot,after?slot.nextSibling:slot);

     saveHotbarOrder();
     refreshHotbarNumbers();
   });

   slot.addEventListener("dragend",()=>{
     for(const s of slots)s.classList.remove("dragging","dragOver");
     draggedHotbarSlot=null;
     saveHotbarOrder();
     refreshHotbarNumbers();
   });
 }
}

loadHotbarOrder();
setupHotbarReorder();

const ray=new THREE.Raycaster();ray.far=7;
function targetBlock(){ray.setFromCamera(new THREE.Vector2(0,0),camera);for(let h of ray.intersectObjects(world.children,true)){if(h.instanceId==null)continue;let a=meshData.get(h.object.uuid);if(a&&a[h.instanceId])return{hit:h,b:a[h.instanceId]}}return null}
function touchesPlayer(x,y,z){return player.pos.x-player.radius<x+.5&&player.pos.x+player.radius>x-.5&&player.pos.y<y+.5&&player.pos.y+player.height>y-.5&&player.pos.z-player.radius<z+.5&&player.pos.z+player.radius>z-.5}

const breakMesh=new THREE.Mesh(new THREE.BoxGeometry(1.035,1.035,1.035),new THREE.MeshBasicMaterial({color:0x111111,wireframe:true,transparent:true,opacity:.35}));breakMesh.visible=false;scene.add(breakMesh);
const hard={grass:.38,dirt:.34,stone:.85,wood:.65,leaves:.22};let mining=false,mineKey="",mineProgress=0;
function cancelMining(){mining=false;mineKey="";mineProgress=0;breakMesh.visible=false;ui.breakBar.style.display="none";ui.breakFill.style.width="0%"}
function beginMining(){
 if((!locked&&!isTouchDevice)||selected==="sword"||selected==="bow")return;
 let t=targetBlock();
 if(!t||t.b.type==="bedrock")return;

 // La piedra solo puede picarse con el pico.
 if(t.b.type==="stone"&&selected!=="pickaxe")return;

 mining=true;
 mineKey=k3(t.b.x,t.b.y,t.b.z);
 mineProgress=0;
 breakMesh.position.set(t.b.x,t.b.y,t.b.z);
 breakMesh.visible=true;
 ui.breakBar.style.display="block";
 triggerHandSwing();
}
function updateMining(dt){
 if(!mining)return;
 let t=targetBlock();
 if(!t||k3(t.b.x,t.b.y,t.b.z)!==mineKey){cancelMining();return}

 if(t.b.type==="stone"&&selected!=="pickaxe"){cancelMining();return}

 let base=hard[t.b.type]||.5;
 let speedBonus=1;

 if(t.b.type==="stone"&&selected==="pickaxe")speedBonus=2.2;
 if((t.b.type==="dirt"||t.b.type==="grass")&&selected==="shovel")speedBonus=2.4;
 if(t.b.type==="wood"&&selected==="axe")speedBonus=2.3;
 if(t.b.type==="leaves"&&selected==="axe")speedBonus=1.6;

 mineProgress+=dt/base*speedBonus;
 ui.breakFill.style.width=`${Math.min(100,mineProgress*100)}%`;
 breakMesh.material.opacity=.2+Math.min(.65,mineProgress*.55);

 if(Math.floor(performance.now()/180)%2===0)triggerHandSwing();

 if(mineProgress>=1){
   let type=t.b.type,bx=t.b.x,by=t.b.y,bz=t.b.z;
   changeBlock(bx,by,bz,null);
   spawnBlockDrop(type,bx,by,bz);
   cancelMining();
 }
}
function place(){if(["sword","bow","pickaxe","shovel","axe"].includes(selected)||(!locked&&!isTouchDevice)||inv[selected]<=0)return;let t=targetBlock();if(!t)return;let n=t.hit.face.normal,x=t.b.x+Math.round(n.x),y=t.b.y+Math.round(n.y),z=t.b.z+Math.round(n.z);if(!worldType(x,y,z)&&!touchesPlayer(x,y,z)){changeBlock(x,y,z,selected);inv[selected]--;refreshUI()}}




// ---------- MOCHILA ----------
const bagNames={
 grass:"Pasto",dirt:"Tierra",stone:"Piedra",wood:"Tronco",
 planks:"Tablones",sticks:"Palos",crafting_table:"Mesa",
 leaves:"Hojas",arrows:"Flechas"
};

const bagIcons={
 grass:"🟩",dirt:"🟫",stone:"⬜",wood:"🪵",
 planks:"🟧",sticks:"╎",crafting_table:"▦",
 leaves:"🌿",arrows:"➶"
};

function backpackUsed(){
 return backpack.filter(Boolean).length;
}

function addToBackpack(item,count){
 if(!backpackItems.includes(item)||count<=0)return 0;
 let remaining=count;

 // Completar stacks existentes.
 for(let i=0;i<backpack.length&&remaining>0;i++){
   const slot=backpack[i];
   if(slot&&slot.item===item&&slot.count<BACKPACK_STACK){
     const add=Math.min(BACKPACK_STACK-slot.count,remaining);
     slot.count+=add;
     remaining-=add;
   }
 }

 // Crear stacks nuevos.
 while(remaining>0){
   const i=backpack.findIndex(v=>!v);
   if(i<0)break;
   const add=Math.min(BACKPACK_STACK,remaining);
   backpack[i]={item,count:add};
   remaining-=add;
 }

 drawBackpack();
 return count-remaining;
}

function storeInventoryItem(item){
 const available=inv[item]||0;
 if(available<=0)return;
 const moved=addToBackpack(item,Math.min(available,BACKPACK_STACK));
 if(moved>0){
   inv[item]-=moved;
   refreshUI();
   refreshHeldItem();
   drawBackpack();
 }
}

function takeBackpackSlot(i){
 const slot=backpack[i];
 if(!slot)return;
 if(inv[slot.item]==null)inv[slot.item]=0;
 inv[slot.item]+=slot.count;
 backpack[i]=null;
 refreshUI();
 drawBackpack();
}

function drawBackpack(){
 const sources=document.getElementById("backpackSources");
 const grid=document.getElementById("backpackGrid");
 const usage=document.getElementById("backpackUsage");
 if(!sources||!grid||!usage)return;

 usage.textContent=`${backpackUsed()} / ${BACKPACK_SLOTS} espacios`;

 sources.innerHTML="";
 for(const item of backpackItems){
   const btn=document.createElement("button");
   btn.className="backpackSource";
   btn.disabled=(inv[item]||0)<=0;
   btn.innerHTML=`<span>${bagIcons[item]||"■"}</span><span>${bagNames[item]||item}</span><b>${inv[item]||0}</b>`;
   btn.addEventListener("click",e=>{
     e.stopPropagation();
     storeInventoryItem(item);
   });
   sources.appendChild(btn);
 }

 grid.innerHTML="";
 for(let i=0;i<BACKPACK_SLOTS;i++){
   const slot=backpack[i];
   const btn=document.createElement("button");
   btn.className="backpackSlot"+(slot?"":" empty");

   if(slot){
     btn.innerHTML=`<span class="bagIcon">${bagIcons[slot.item]||"■"}</span><strong>${bagNames[slot.item]||slot.item}</strong><em>${slot.count}</em>`;
     btn.addEventListener("click",e=>{
       e.stopPropagation();
       takeBackpackSlot(i);
     });
   }

   grid.appendChild(btn);
 }
}

function toggleBackpack(){
 backpackOpen=!backpackOpen;

 // No abrir inventario y mochila a la vez.
 if(backpackOpen&&inventoryOpen){
   inventoryOpen=false;
   returnAllCrafting();
   ui.inventory.classList.add("hidden");
 }

 ui.backpack.classList.toggle("hidden",!backpackOpen);setHotbarReorderHint();
 drawBackpack();

 // Para poder hacer clic dentro de la mochila, liberamos el mouse.
 if(backpackOpen&&document.pointerLockElement===renderer.domElement){
   document.exitPointerLock?.();
 }
}

function clearBackpack(){
 for(let i=0;i<backpack.length;i++)backpack[i]=null;
 drawBackpack();
}

// ---------- CRAFTEO TIPO MINECRAFT ----------
const craftGrid=new Array(9).fill(null);
const craftSlots=[...document.querySelectorAll(".craftSlot")];
const craftResult=document.getElementById("craftResult");

const itemNames={
 grass:"Pasto",dirt:"Tierra",stone:"Piedra",wood:"Tronco",leaves:"Hojas",
 planks:"Tablones",sticks:"Palos",crafting_table:"Mesa de crafteo",
 wooden_sword:"Espada de madera",stone_sword:"Espada de piedra"
};

function normalizePattern(){
 let rows=[];
 for(let y=0;y<3;y++)rows.push(craftGrid.slice(y*3,y*3+3));

 let top=0,bottom=2,left=0,right=2;
 while(top<=bottom&&rows[top].every(v=>!v))top++;
 while(bottom>=top&&rows[bottom].every(v=>!v))bottom--;
 while(left<=right&&rows.slice(top,bottom+1).every(r=>!r[left]))left++;
 while(right>=left&&rows.slice(top,bottom+1).every(r=>!r[right]))right--;

 if(top>bottom||left>right)return [];
 return rows.slice(top,bottom+1).map(r=>r.slice(left,right+1));
}

function patternEquals(a,b){
 if(a.length!==b.length)return false;
 for(let y=0;y<a.length;y++){
   if(a[y].length!==b[y].length)return false;
   for(let x=0;x<a[y].length;x++)if(a[y][x]!==b[y][x])return false;
 }
 return true;
}

function currentRecipe(){
 const p=normalizePattern();

 if(patternEquals(p,[["wood"]]))return{item:"planks",count:4};
 if(patternEquals(p,[["planks"],["planks"]]))return{item:"sticks",count:4};
 if(patternEquals(p,[["planks","planks"],["planks","planks"]]))return{item:"crafting_table",count:1};
 if(patternEquals(p,[["planks"],["planks"],["sticks"]]))return{item:"wooden_sword",count:1};
 if(patternEquals(p,[["stone"],["stone"],["sticks"]]))return{item:"stone_sword",count:1};

 return null;
}

function drawCrafting(){
 craftSlots.forEach((el,i)=>{
   const item=craftGrid[i];
   el.innerHTML=item?`<span class="craftName">${itemNames[item]||item}</span><span class="craftCount">1</span>`:"";
 });

 const r=currentRecipe();
 if(r){
   craftResult.disabled=false;
   craftResult.innerHTML=`<span>${itemNames[r.item]}</span><br><b>×${r.count}</b>`;
 }else{
   craftResult.disabled=true;
   craftResult.innerHTML="<span>Sin receta</span>";
 }
}

let selectedCraftItem=null;

function selectCraftMaterial(item){
 selectedCraftItem=item;
 document.querySelectorAll(".craftSource").forEach(row=>{
   row.classList.toggle("craftSelected",row.dataset.craftItem===item);
 });
}

function putCraftItemAt(item,i){
 if(!item||craftGrid[i]||(inv[item]||0)<=0)return;
 inv[item]--;
 craftGrid[i]=item;
 refreshUI();
 drawCrafting();
}

function returnCraftSlot(i){
 const item=craftGrid[i];
 if(!item)return;
 if(inv[item]==null)inv[item]=0;
 inv[item]++;
 craftGrid[i]=null;
 refreshUI();
 drawCrafting();
}

document.querySelectorAll(".craftSource").forEach(row=>{
 row.addEventListener("click",e=>{
   e.stopPropagation();
   selectCraftMaterial(row.dataset.craftItem);
 });
});

craftSlots.forEach((slot,i)=>{
 slot.addEventListener("contextmenu",e=>{
   e.preventDefault();
   e.stopPropagation();
   returnCraftSlot(i);
 });
 slot.addEventListener("click",e=>{
   e.stopPropagation();
   if(craftGrid[i])returnCraftSlot(i);
   else putCraftItemAt(selectedCraftItem,i);
 });
});

craftResult.addEventListener("click",e=>{
 e.stopPropagation();
 const r=currentRecipe();
 if(!r)return;

 // Consumir todos los ingredientes que hay en la cuadrícula.
 for(let i=0;i<craftGrid.length;i++)craftGrid[i]=null;

 if(r.item==="wooden_sword"||r.item==="stone_sword"){
   // La espada ya existe en la barra; craftearla mejora su daño.
   swordTier=r.item==="stone_sword"?2:Math.max(swordTier,1);
 }else{
   if(inv[r.item]==null)inv[r.item]=0;
   inv[r.item]+=r.count;
 }

 refreshUI();
 drawCrafting();
});

function returnAllCrafting(){
 for(let i=0;i<craftGrid.length;i++){
   const item=craftGrid[i];
   if(item){
     if(inv[item]==null)inv[item]=0;
     inv[item]++;
     craftGrid[i]=null;
   }
 }
 refreshUI();
 drawCrafting();
}
drawCrafting();

// BLOQUES MINIATURA QUE CAEN AL ROMPER
const drops=[];
const dropGroup=new THREE.Group();
scene.add(dropGroup);

function dropMaterialFor(type){
 if(type==="grass"){
   return mat.grass;
 }
 return mat[type]||mat.dirt;
}

const dropGeo=new THREE.BoxGeometry(.28,.28,.28);
function spawnBlockDrop(type,x,y,z){
 if(type==="bedrock"||drops.length>=MAX_DROPS)return;

 const mesh=new THREE.Mesh(
   dropGeo,
   dropMaterialFor(type)
 );
 mesh.position.set(x,y+.18,z);
 mesh.rotation.set(Math.random()*2,Math.random()*2,Math.random()*2);
 dropGroup.add(mesh);

 const a=Math.random()*Math.PI*2;
 const speed=.65+Math.random()*.7;

 drops.push({
   mesh,
   type,
   vel:new THREE.Vector3(Math.cos(a)*speed,2.3+Math.random()*.8,Math.sin(a)*speed),
   life:8,
   pickupDelay:.35,
   spinX:(Math.random()-.5)*5,
   spinY:(Math.random()-.5)*5
 });
}

function updateDrops(dt){
 for(let i=drops.length-1;i>=0;i--){
   const d=drops[i];
   d.life-=dt;
   d.pickupDelay-=dt;

   d.vel.y-=10.5*dt;

   const nx=d.mesh.position.x+d.vel.x*dt;
   const ny=d.mesh.position.y+d.vel.y*dt;
   const nz=d.mesh.position.z+d.vel.z*dt;

   // Colisión sencilla con el suelo/bloques.
   if(worldType(Math.round(nx),Math.round(ny-.18),Math.round(nz))){
     d.vel.y=Math.abs(d.vel.y)*.24;
     d.vel.x*=.78;
     d.vel.z*=.78;
   }else{
     d.mesh.position.set(nx,ny,nz);
   }

   d.mesh.rotation.x+=d.spinX*dt;
   d.mesh.rotation.y+=d.spinY*dt;

   // Ligero efecto de flotación cuando se queda casi quieto.
   if(Math.abs(d.vel.y)<.25){
     d.mesh.position.y+=Math.sin(performance.now()*.004+i)*.0015;
   }

   // Recoger al acercarse.
   if(d.pickupDelay<=0){
     const dx=d.mesh.position.x-player.pos.x;
     const dy=d.mesh.position.y-(player.pos.y+.8);
     const dz=d.mesh.position.z-player.pos.z;

     if(Math.hypot(dx,dy,dz)<1.25){
       if(inv[d.type]!=null)inv[d.type]++;
       refreshUI();
       dropGroup.remove(d.mesh);
       drops.splice(i,1);
       continue;
     }
   }

   if(d.life<=0||d.mesh.position.y<-20){
     dropGroup.remove(d.mesh);
     drops.splice(i,1);
   }
 }
}

// COMBATE
const mobs=[],shots=[],mobGroup=new THREE.Group();scene.add(mobGroup);let swordCd=0,bowCd=0;
const faceWhite=new THREE.MeshLambertMaterial({color:0xf1f1f1});
const faceRed=new THREE.MeshLambertMaterial({color:0xe44343});
const mm={z:new THREE.MeshLambertMaterial({color:0x4f9b52}),blue:new THREE.MeshLambertMaterial({color:0x3c6fa8}),s:new THREE.MeshLambertMaterial({color:0xd8d8d8}),sp:new THREE.MeshLambertMaterial({color:0x342c2c}),c:new THREE.MeshLambertMaterial({color:0x58a94f}),dark:new THREE.MeshLambertMaterial({color:0x171717}),arrow:new THREE.MeshLambertMaterial({color:0x8b5a2b})};
function B(w,h,d,m,x=0,y=0,z=0){let q=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);q.position.set(x,y,z);return q}
function mobModel(type){
 let g=new THREE.Group();

 // Helper para colocar detalles en la cara frontal (hacia -Z).
 function facePart(w,h,d,material,x,y,z){
   const p=B(w,h,d,material,x,y,z);
   g.add(p);
   return p;
 }

 if(type==="zombie"){
   g.add(B(.55,.7,.3,mm.blue,0,.75,0));
   g.add(B(.5,.5,.5,mm.z,0,1.35,0));
   g.add(B(.18,.7,.18,mm.z,-.18,.15,0),B(.18,.7,.18,mm.z,.18,.15,0));
   g.add(B(.16,.65,.16,mm.z,-.38,.78,0),B(.16,.65,.16,mm.z,.38,.78,0));

   // Ojos y boca.
   facePart(.11,.08,.035,mm.dark,-.13,1.43,.268); facePart(.035,.025,.04,faceWhite,-.13,1.445,.29);
   facePart(.11,.08,.035,mm.dark,.13,1.43,.268); facePart(.035,.025,.04,faceWhite,.13,1.445,.29);
   facePart(.22,.055,.035,mm.dark,0,1.25,.268);

 }else if(type==="skeleton"){
   g.add(B(.42,.7,.24,mm.s,0,.75,0));
   g.add(B(.46,.46,.46,mm.s,0,1.35,0));
   g.add(B(.12,.65,.12,mm.s,-.17,.15,0),B(.12,.65,.12,mm.s,.17,.15,0));
   g.add(B(.11,.62,.11,mm.s,-.34,.78,0),B(.11,.62,.11,mm.s,.34,.78,0));

   facePart(.11,.10,.035,mm.dark,-.12,1.42,.248);
   facePart(.11,.10,.035,mm.dark,.12,1.42,.248);
   facePart(.08,.08,.035,mm.dark,0,1.31,.248);
   facePart(.22,.045,.035,mm.dark,0,1.20,.248);

 }else if(type==="spider"){
   g.add(B(.75,.35,.8,mm.sp,0,.3,0));
   g.add(B(.48,.38,.48,mm.dark,0,.32,-.52));

   for(let s of[-1,1])for(let z of[-.3,0,.3])g.add(B(.65,.08,.08,mm.sp,s*.58,.22,z));

   const red=new THREE.MeshLambertMaterial({color:0xd33838});
   const eyeY=.37, eyeZ=-.765;
   for(const x of[-.16,-.055,.055,.16]){
     facePart(.065,.065,.03,red,x,eyeY,eyeZ);
   }

 }else{
   g.add(B(.52,.85,.42,mm.c,0,.78,0));
   g.add(B(.55,.55,.55,mm.c,0,1.5,0));
   g.add(B(.18,.45,.18,mm.c,-.16,.22,-.12),B(.18,.45,.18,mm.c,.16,.22,.12));

   // Cara clásica simplificada del creeper.
   facePart(.12,.12,.035,mm.dark,-.12,1.58,.292);
   facePart(.12,.12,.035,mm.dark,.12,1.58,.292);
   facePart(.10,.12,.035,mm.dark,0,1.42,.292);
   facePart(.24,.12,.035,mm.dark,0,1.30,.292);
 }

 return g;
}

function spawn(type,x,z){let m=mobModel(type),st={zombie:[16,1.25,2,1.25],skeleton:[12,.8,2,9],spider:[12,1.8,2,1.15],creeper:[14,1.05,8,2.1]}[type];m.position.set(x,heightAt(x,z)+.5,z);mobGroup.add(m);mobs.push({type,mesh:m,hp:st[0],speed:st[1],damage:st[2],range:st[3],atk:0,shoot:1+Math.random()*2,fuse:0,dead:false,knock:new THREE.Vector3()})}
function spawnStart(){[["zombie",8,-8],["zombie",-10,-6],["skeleton",12,8],["skeleton",-13,9],["spider",7,13],["spider",-8,14],["creeper",15,-3],["creeper",-15,-2]].forEach(a=>spawn(...a))}
function hurtPlayer(n,sourceX=null,sourceZ=null,power=0){
 hp=Math.max(0,hp-n);

 if(sourceX!==null&&sourceZ!==null&&power>0){
   let dx=player.pos.x-sourceX,dz=player.pos.z-sourceZ,l=Math.hypot(dx,dz)||1;
   player.knock.x+=dx/l*power;
   player.knock.z+=dz/l*power;
   player.knock.y+=Math.min(4.8,power*.45);
 }

 refreshUI();
 if(hp<=0){
   hp=20;
   resetPlayer();
   refreshUI();
 }
}
function hurtMob(m,n,k=.3,sourceX=player.pos.x,sourceZ=player.pos.z){
 if(!m||m.dead)return;
 m.hp-=n;

 if(!m.knock)m.knock=new THREE.Vector3();

 if(k){
   let dx=m.mesh.position.x-sourceX,dz=m.mesh.position.z-sourceZ,l=Math.hypot(dx,dz)||1;
   m.knock.x+=dx/l*k*7.0;
   m.knock.z+=dz/l*k*7.0;
   m.knock.y+=Math.min(3.5,k*2.4);
 }

 if(m.hp<=0){
   m.dead=true;
   mobGroup.remove(m.mesh);
 }
}
function findMob(obj){for(let m of mobs){if(m.dead)continue;let o=obj;while(o&&o!==m.mesh)o=o.parent;if(o===m.mesh)return m}return null}
function swordAttack(){if(swordCd>0||!locked)return;swordCd=.38;ray.setFromCamera(new THREE.Vector2(0,0),camera);ray.far=3.2;let hits=ray.intersectObjects(mobs.filter(m=>!m.dead).map(m=>m.mesh),true);ray.far=7;if(hits.length)hurtMob(findMob(hits[0].object),swordTier===2?8:6,.9,player.pos.x,player.pos.z)}
const arrowGeo=new THREE.BoxGeometry(.06,.06,.55);
function arrow(origin,dir,speed,hostile){let m=new THREE.Mesh(arrowGeo,mm.arrow);m.position.copy(origin);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,-1),dir.clone().normalize());scene.add(m);shots.push({mesh:m,vel:dir.clone().multiplyScalar(speed),life:4,hostile})}
function bow(){if(bowCd>0||inv.arrows<=0||!locked)return;bowCd=.45;inv.arrows--;refreshUI();let d=new THREE.Vector3();camera.getWorldDirection(d);arrow(camera.position.clone().add(d.clone().multiplyScalar(.55)),d,15,false)}
function skeletonArrow(m){let o=m.mesh.position.clone();o.y+=1.25;arrow(o,camera.position.clone().sub(o).normalize(),9,true)}

const particles=[];
const particleGeo=new THREE.BoxGeometry(.13,.13,.13);
const particleMat=new THREE.MeshBasicMaterial({color:0xffa13a});
const particleMesh=new THREE.InstancedMesh(particleGeo,particleMat,160);
particleMesh.count=0;
particleMesh.frustumCulled=false;
scene.add(particleMesh);
const particleDummy=new THREE.Object3D();

function spawnExplosionParticles(x,y,z){
 const amount=LOW_RESOURCE?18:34;
 for(let i=0;i<amount&&particles.length<MAX_PARTICLES;i++){
   let dx=Math.random()-.5,dy=Math.random()*.85+.2,dz=Math.random()-.5;
   const len=Math.hypot(dx,dy,dz)||1;
   const speed=3+Math.random()*6;
   particles.push({
     x:x+(Math.random()-.5)*.8,
     y:y+.8+(Math.random()-.5)*.8,
     z:z+(Math.random()-.5)*.8,
     vx:dx/len*speed,
     vy:dy/len*speed,
     vz:dz/len*speed,
     life:.55+Math.random()*.55,
     rot:Math.random()*6
   });
 }
}

function updateParticles(dt){
 for(let i=particles.length-1;i>=0;i--){
   const p=particles[i];
   p.life-=dt;
   if(p.life<=0){
     particles.splice(i,1);
     continue;
   }
   p.vy-=9*dt;
   p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;
   p.rot+=dt*8;
 }

 particleMesh.count=Math.min(particles.length,MAX_PARTICLES);
 for(let i=0;i<particleMesh.count;i++){
   const p=particles[i];
   const s=Math.max(.05,Math.min(1,p.life));
   particleDummy.position.set(p.x,p.y,p.z);
   particleDummy.rotation.set(p.rot,p.rot*.7,0);
   particleDummy.scale.setScalar(s);
   particleDummy.updateMatrix();
   particleMesh.setMatrixAt(i,particleDummy.matrix);
 }
 particleMesh.instanceMatrix.needsUpdate=true;
}

function explode(m){
 if(m.dead)return;
 m.dead=true;
 mobGroup.remove(m.mesh);

 const ex=m.mesh.position.x,ey=m.mesh.position.y+.7,ez=m.mesh.position.z;
 const radius=3.2;

 spawnExplosionParticles(ex,ey,ez);

 // Romper bloques alrededor de la explosión.
 const minX=Math.floor(ex-radius),maxX=Math.ceil(ex+radius);
 const minY=Math.floor(ey-radius),maxY=Math.ceil(ey+radius);
 const minZ=Math.floor(ez-radius),maxZ=Math.ceil(ez+radius);

 for(let x=minX;x<=maxX;x++){
   for(let y=minY;y<=maxY;y++){
     for(let z=minZ;z<=maxZ;z++){
       const dx=x-ex,dy=y-ey,dz=z-ez;
       const d=Math.hypot(dx,dy,dz);

       if(d<=radius){
         const t=worldType(x,y,z);
         if(t&&t!=="bedrock"){
           // Más probable romper los bloques cercanos al centro.
           const chance=Math.max(.18,1-d/radius);
           if(Math.random()<chance){
             changeBlock(x,y,z,null);
             if(Math.random()<.28)spawnBlockDrop(t,x,y,z);
           }
         }
       }
     }
   }
 }

 // Empuje y daño al jugador.
 const pd=Math.hypot(player.pos.x-ex,player.pos.z-ez);
 if(pd<5.2&&clearLine(ex,ey,ez,player.pos.x,player.pos.y+player.eye*.65,player.pos.z)){
   const power=Math.max(0,11-pd*1.8);
   hurtPlayer(Math.max(1,Math.round(11-pd*2)),ex,ez,power);
 }

 // Empuje y daño a otros mobs.
 for(const other of mobs){
   if(other===m||other.dead)continue;
   const dx=other.mesh.position.x-ex,dz=other.mesh.position.z-ez;
   const d=Math.hypot(dx,dz);

   if(d<5.2&&clearLine(ex,ey,ez,other.mesh.position.x,other.mesh.position.y+.8,other.mesh.position.z)){
     const power=Math.max(.2,1.15-d*.16);
     const damage=Math.max(1,Math.round(10-d*1.7));
     hurtMob(other,damage,power,ex,ez);
   }
 }
}
function updateMobs(dt){
 for(let m of mobs){
   const simRange=SIM_DIST*CHUNK;
   const smx=m.mesh.position.x-player.pos.x;
   const smz=m.mesh.position.z-player.pos.z;
   if(smx*smx+smz*smz>simRange*simRange)continue;

   if(m.dead)continue;
   if(!m.knock)m.knock=new THREE.Vector3();

   const mobDrag=Math.exp(-5.5*dt);
   m.knock.x*=mobDrag;
   m.knock.z*=mobDrag;
   m.knock.y-=11*dt;

   moveMobXZ(m,m.knock.x*dt,m.knock.z*dt);

   let gy=heightAt(m.mesh.position.x,m.mesh.position.z)+.5;
   m.mesh.position.y=Math.max(gy,m.mesh.position.y+m.knock.y*dt);
   if(m.mesh.position.y<=gy){m.mesh.position.y=gy;if(m.knock.y<0)m.knock.y=0}

   let dx=player.pos.x-m.mesh.position.x,dz=player.pos.z-m.mesh.position.z;
   let d=Math.hypot(dx,dz)||.001,nx=dx/d,nz=dz/d;
   let seesPlayer=mobHasLineToPlayer(m);

   m.atk-=dt;
   m.shoot-=dt;

   if(m.type==="skeleton"){
     if(seesPlayer){
       if(d>5.5&&d<15)moveMobXZ(m,nx*m.speed*dt,nz*m.speed*dt);
       else if(d<4)moveMobXZ(m,-nx*m.speed*.8*dt,-nz*m.speed*.8*dt);

       if(d<11&&m.shoot<=0){
         skeletonArrow(m);
         m.shoot=2.1+Math.random()*.8;
       }
     }
   }else if(m.type==="creeper"){
     if(seesPlayer&&d<14)moveMobXZ(m,nx*m.speed*dt,nz*m.speed*dt);

     if(seesPlayer&&d<m.range){
       m.fuse+=dt;
       let s=1+Math.sin(m.fuse*18)*.04;
       m.mesh.scale.set(s,s,s);
       if(m.fuse>=1.35){explode(m);continue}
     }else{
       m.fuse=Math.max(0,m.fuse-dt*1.8);
       m.mesh.scale.set(1,1,1);
     }
   }else{
     if(seesPlayer&&d<15)moveMobXZ(m,nx*m.speed*dt,nz*m.speed*dt);

     // No puede golpear si hay una pared/bloque entre el mob y el jugador.
     if(seesPlayer&&d<m.range&&m.atk<=0){
       hurtPlayer(m.damage,m.mesh.position.x,m.mesh.position.z,m.type==="spider"?4.2:3.4);
       m.atk=1;
     }
   }

   gy=heightAt(m.mesh.position.x,m.mesh.position.z)+.5;
   if(m.mesh.position.y<gy)m.mesh.position.y=gy;
   m.mesh.lookAt(player.pos.x,m.mesh.position.y,player.pos.z);
 }

 for(let i=mobs.length-1;i>=0;i--)if(mobs[i].dead)mobs.splice(i,1);

 if(mobs.length<MAX_MOBS){
   let types=["zombie","skeleton","spider","creeper"];
   let a=Math.random()*Math.PI*2,d=15+Math.random()*18;
   spawn(types[Math.floor(Math.random()*4)],player.pos.x+Math.cos(a)*d,player.pos.z+Math.sin(a)*d);
 }
}

function updateShots(dt){
 for(let i=shots.length-1;i>=0;i--){
   let a=shots[i];
   a.life-=dt;
   const old=a.mesh.position.clone();
   const next=old.clone().addScaledVector(a.vel,dt);

   // Si la trayectoria cruza un bloque, la flecha se detiene antes de hacer daño.
   if(!clearLine(old.x,old.y,old.z,next.x,next.y,next.z)){
     scene.remove(a.mesh);shots.splice(i,1);continue;
   }

   a.mesh.position.copy(next);
   let hit=false;

   if(a.hostile){
     if(Math.hypot(a.mesh.position.x-player.pos.x,a.mesh.position.y-(player.pos.y+1),a.mesh.position.z-player.pos.z)<.65){
       hurtPlayer(2,a.mesh.position.x-a.vel.x*.08,a.mesh.position.z-a.vel.z*.08,2.7);
       hit=true;
     }
   }else{
     for(let m of mobs){
       if(!m.dead&&Math.hypot(a.mesh.position.x-m.mesh.position.x,a.mesh.position.y-(m.mesh.position.y+.8),a.mesh.position.z-m.mesh.position.z)<.65){
         hurtMob(m,5,.55,a.mesh.position.x-a.vel.x*.06,a.mesh.position.z-a.vel.z*.06);
         hit=true;break;
       }
     }
   }

   let x=Math.round(a.mesh.position.x),y=Math.round(a.mesh.position.y),z=Math.round(a.mesh.position.z);
   if(hit||worldType(x,y,z)||a.life<=0){scene.remove(a.mesh);shots.splice(i,1)}
 }
}


// ---------- AJUSTES DE RENDIMIENTO ----------
let debugPerfVisible=false;
let perfFrames=0,perfSeconds=0,measuredFPS=60;
let lowFPSSeconds=0,warningDismissed=false;
let lastPresented=0;

const debugPerf=document.createElement("div");
debugPerf.id="debugPerf";
debugPerf.className="hidden";
document.body.appendChild(debugPerf);

const performancePanel=document.getElementById("performancePanel");
const qualitySelect=document.getElementById("qualitySelect");
const fpsSelect=document.getElementById("fpsSelect");
const lowResourceCheck=document.getElementById("lowResourceCheck");
const perfSummary=document.getElementById("perfSummary");
const performanceWarning=document.getElementById("performanceWarning");

function applyPerformancePreset(name){
 LOW_RESOURCE=false;
 lowResourceCheck.checked=false;

 if(name==="low"){
   if(isTouchDevice){
     DIST=2;SIM_DIST=1;MAX_PARTICLES=40;MAX_DROPS=18;MAX_MOBS=4;
     renderer.setPixelRatio(Math.min(devicePixelRatio||1,.72));
   }else{
     DIST=4;SIM_DIST=3;MAX_PARTICLES=120;MAX_DROPS=40;MAX_MOBS=7;
     renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.15));
   }
 }else if(name==="medium"){
   DIST=5;SIM_DIST=3;MAX_PARTICLES=150;MAX_DROPS=48;MAX_MOBS=9;
   renderer.setPixelRatio(Math.min(devicePixelRatio||1,isTouchDevice ? .72 : 1.25));
 }else{
   DIST=6;SIM_DIST=4;MAX_PARTICLES=160;MAX_DROPS=56;MAX_MOBS=10;
   renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.35));
 }

 ccx=99999;ccz=99999;
 updateChunks(true);
 updatePerformanceSummary();
}

function applyLowResource(enabled){
 LOW_RESOURCE=enabled;
 lowResourceCheck.checked=enabled;

 if(enabled){
   if(isTouchDevice){
     DIST=2;SIM_DIST=1;MAX_PARTICLES=28;MAX_DROPS=12;MAX_MOBS=3;
     MAX_FPS=30;
     renderer.setPixelRatio(Math.min(devicePixelRatio||1,.65));
     cloudGroup.visible=false;
   }else{
     DIST=3;SIM_DIST=2;MAX_PARTICLES=70;MAX_DROPS=28;MAX_MOBS=5;
     renderer.setPixelRatio(Math.min(devicePixelRatio||1,.9));
   }
 }else{
   applyPerformancePreset(qualitySelect.value);
   return;
 }

 ccx=99999;ccz=99999;
 updateChunks(true);
 updatePerformanceSummary();
}

function updatePerformanceSummary(){
 perfSummary.textContent=
   `Render: ${DIST} chunks · Simulación: ${SIM_DIST} · FPS: ${MAX_FPS} · `+
   `Pixel ratio: ${LOW_RESOURCE?".9 máx.":"adaptado"} · Sombras: OFF`;
}

qualitySelect.onchange=()=>applyPerformancePreset(qualitySelect.value);
fpsSelect.onchange=()=>{MAX_FPS=Number(fpsSelect.value)||60;updatePerformanceSummary()};
lowResourceCheck.onchange=()=>applyLowResource(lowResourceCheck.checked);

document.getElementById("performanceBtn").onclick=()=>{
 performancePanel.classList.remove("hidden");
};
document.getElementById("closePerformance").onclick=()=>{
 performancePanel.classList.add("hidden");
};
document.getElementById("warningYes").onclick=()=>{
 performanceWarning.classList.add("hidden");
 applyLowResource(true);
 warningDismissed=true;
};
document.getElementById("warningNo").onclick=()=>{
 performanceWarning.classList.add("hidden");
 warningDismissed=true;
};

function updatePerfStats(dt){
 perfFrames++;
 perfSeconds+=dt;
 if(perfSeconds>=1){
   measuredFPS=Math.round(perfFrames/perfSeconds);
   if(measuredFPS<28)lowFPSSeconds+=perfSeconds;
   else lowFPSSeconds=Math.max(0,lowFPSSeconds-perfSeconds*.5);
   perfFrames=0;perfSeconds=0;

   if(lowFPSSeconds>=5&&!warningDismissed&&!LOW_RESOURCE){
     performanceWarning.classList.remove("hidden");
   }
 }

 if(debugPerfVisible){
   const info=renderer.info;
   debugPerf.textContent=
     `FPS: ${measuredFPS}\n`+
     `Chunks: ${chunks.size}\n`+
     `Cola generar: ${chunkBuildQueue.length}\n`+
     `Cola rebuild: ${chunkRebuildQueue.length}\n`+
     `Mobs: ${mobs.length}\n`+
     `Items: ${drops.length}\n`+
     `Partículas: ${particles.length}\n`+
     `Draw calls: ${info.render.calls}\n`+
     `Triángulos: ${info.render.triangles}\n`+
     `Render dist: ${DIST}\n`+
     `Sim dist: ${SIM_DIST}`;
 }
}

document.addEventListener("visibilitychange",()=>{
 if(document.hidden){
   keys={};
   cancelMining();
 }
});

applyPerformancePreset("low");
if(isTouchDevice){
 DIST=2;
 SIM_DIST=1;
 MAX_FPS=30;
 MAX_MOBS=4;
 MAX_PARTICLES=40;
 MAX_DROPS=18;
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,.72));
 cloudGroup.visible=false;
 qualitySelect.value="low";
 fpsSelect.value="30";
 updatePerformanceSummary();
 ccx=99999;ccz=99999;
 updateChunks(true);
}


// ---------- CONTROLES TÁCTILES ----------
const moveZone=document.getElementById("moveZone");
const joystickBase=document.getElementById("joystickBase");
const joystickKnob=document.getElementById("joystickKnob");
const lookZone=document.getElementById("lookZone");
const btnJump=document.getElementById("btnJump");
const btnAttack=document.getElementById("btnAttack");
const btnPlace=document.getElementById("btnPlace");
const btnInventory=document.getElementById("btnInventory");
const btnBackpack=document.getElementById("btnBackpack");

function mobileMenuOpen(){return inventoryOpen||backpackOpen}

function updateJoystick(t){
 const r=joystickBase.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
 let dx=t.clientX-cx,dy=t.clientY-cy;
 const max=r.width*.34,len=Math.hypot(dx,dy)||1;
 if(len>max){dx=dx/len*max;dy=dy/len*max}
 joystickKnob.style.transform=`translate(${dx}px,${dy}px)`;
 mobileInput.x=dx/max;mobileInput.z=dy/max;
}
function resetJoystick(){
 mobileInput.x=0;mobileInput.z=0;mobileInput.moveId=null;
 if(joystickKnob)joystickKnob.style.transform="translate(0,0)";
}

moveZone?.addEventListener("touchstart",e=>{
 if(!running||mobileMenuOpen())return;
 const t=e.changedTouches[0];mobileInput.moveId=t.identifier;updateJoystick(t);e.preventDefault();
},{passive:false});
moveZone?.addEventListener("touchmove",e=>{
 for(const t of e.changedTouches)if(t.identifier===mobileInput.moveId){updateJoystick(t);e.preventDefault();break}
},{passive:false});
moveZone?.addEventListener("touchend",e=>{
 for(const t of e.changedTouches)if(t.identifier===mobileInput.moveId){resetJoystick();break}
},{passive:false});
moveZone?.addEventListener("touchcancel",resetJoystick,{passive:false});

lookZone?.addEventListener("touchstart",e=>{
 if(!running||mobileMenuOpen())return;
 const t=e.changedTouches[0];mobileInput.lookId=t.identifier;mobileInput.lookX=t.clientX;mobileInput.lookY=t.clientY;e.preventDefault();
},{passive:false});
lookZone?.addEventListener("touchmove",e=>{
 for(const t of e.changedTouches)if(t.identifier===mobileInput.lookId){
   const dx=t.clientX-mobileInput.lookX,dy=t.clientY-mobileInput.lookY;
   mobileInput.lookX=t.clientX;mobileInput.lookY=t.clientY;
   yaw-=dx*.0052;pitch-=dy*.0052;
   pitch=Math.max(-Math.PI/2+.03,Math.min(Math.PI/2-.03,pitch));
   e.preventDefault();break;
 }
},{passive:false});
lookZone?.addEventListener("touchend",e=>{
 for(const t of e.changedTouches)if(t.identifier===mobileInput.lookId){mobileInput.lookId=null;break}
},{passive:false});
lookZone?.addEventListener("touchcancel",()=>mobileInput.lookId=null,{passive:false});

function mobileAttackStart(){
 if(!running||mobileMenuOpen())return;
 triggerHandSwing();
 if(selected==="sword")swordAttack();
 else if(selected==="bow")bow();
 else{mobileInput.mining=true;beginMining()}
}
function mobileAttackEnd(){mobileInput.mining=false;cancelMining()}

btnJump?.addEventListener("touchstart",e=>{
 if(running&&!mobileMenuOpen()&&player.onGround){player.vel.y=player.jump;player.onGround=false}
 e.preventDefault();
},{passive:false});
btnAttack?.addEventListener("touchstart",e=>{mobileAttackStart();e.preventDefault()},{passive:false});
btnAttack?.addEventListener("touchend",e=>{mobileAttackEnd();e.preventDefault()},{passive:false});
btnAttack?.addEventListener("touchcancel",mobileAttackEnd,{passive:false});
btnPlace?.addEventListener("touchstart",e=>{if(running&&!mobileMenuOpen())place();e.preventDefault()},{passive:false});
btnInventory?.addEventListener("touchstart",e=>{
 if(backpackOpen){backpackOpen=false;ui.backpack.classList.add("hidden")}
 inventoryOpen=!inventoryOpen;if(!inventoryOpen)returnAllCrafting();
 ui.inventory.classList.toggle("hidden",!inventoryOpen);resetJoystick();e.preventDefault();
},{passive:false});
btnBackpack?.addEventListener("touchstart",e=>{toggleBackpack();resetJoystick();e.preventDefault()},{passive:false});

// Hotbar móvil: toque = seleccionar, pulsación larga + arrastre = reordenar.
for(const slot of slots){
 let holdTimer=null;
 let touchDragging=false;
 let touchId=null;
 let startX=0,startY=0;

 slot.addEventListener("touchstart",e=>{
   const t=e.changedTouches[0];
   touchId=t.identifier;
   startX=t.clientX;
   startY=t.clientY;
   touchDragging=false;

   clearTimeout(holdTimer);
   holdTimer=setTimeout(()=>{
     touchDragging=true;
     slot.classList.add("dragging");
   },420);

   e.stopPropagation();
 },{passive:true});

 slot.addEventListener("touchmove",e=>{
   const t=[...e.changedTouches].find(v=>v.identifier===touchId);
   if(!t)return;

   const moved=Math.hypot(t.clientX-startX,t.clientY-startY);
   if(!touchDragging&&moved>12){
     clearTimeout(holdTimer);
   }

   if(touchDragging){
     slots.forEach(s=>s.classList.remove("dragOver"));
     const target=document.elementFromPoint(t.clientX,t.clientY)?.closest?.(".slot");
     if(target&&target!==slot&&target.style.display!=="none")target.classList.add("dragOver");
     e.preventDefault();
   }
 },{passive:false});

 slot.addEventListener("touchend",e=>{
   clearTimeout(holdTimer);
   const t=[...e.changedTouches].find(v=>v.identifier===touchId)||e.changedTouches[0];

   if(touchDragging){
     const target=document.elementFromPoint(t.clientX,t.clientY)?.closest?.(".slot");
     if(target&&target!==slot&&target.style.display!=="none"){
       const r=target.getBoundingClientRect();
       const after=t.clientX>r.left+r.width/2;
       hotbar.insertBefore(slot,after?target.nextSibling:target);
       saveHotbarOrder();
       refreshHotbarNumbers();
     }
   }else{
     selectItem(slot.dataset.item);
   }

   slots.forEach(s=>s.classList.remove("dragging","dragOver"));
   touchDragging=false;
   touchId=null;
   e.stopPropagation();
 },{passive:true});

 slot.addEventListener("touchcancel",()=>{
   clearTimeout(holdTimer);
   touchDragging=false;
   touchId=null;
   slots.forEach(s=>s.classList.remove("dragging","dragOver"));
 },{passive:true});
}

document.addEventListener("keydown",e=>{
 if(e.code==="F3"&&!e.repeat){
   e.preventDefault();
   debugPerfVisible=!debugPerfVisible;
   debugPerf.classList.toggle("hidden",!debugPerfVisible);
   return;
 }
 if(e.code==="F4"&&!e.repeat){
   e.preventDefault();
   applyLowResource(!LOW_RESOURCE);
   return;
 }

 keys[e.code]=true;

 if(["KeyW","KeyA","KeyS","KeyD","Space","Tab"].includes(e.code))e.preventDefault();

 // TAB alterna entre mouse libre y control de cámara.
 if(e.code==="Tab"&&!e.repeat){
   keys={};
   cancelMining();

   if(document.pointerLockElement===renderer.domElement){
     document.exitPointerLock?.();
   }else if(running&&!inventoryOpen&&!backpackOpen){
     renderer.domElement.requestPointerLock?.();
   }
   return;
 }

 if(e.code==="Space"&&running&&player.onGround){
   player.vel.y=player.jump;
   player.onGround=false;
 }

 const digitIndex={
   Digit1:0,Digit2:1,Digit3:2,Digit4:3,Digit5:4,
   Digit6:5,Digit7:6,Digit8:7,Digit9:8,Digit0:9
 };
 if(digitIndex[e.code]!=null){
   const slot=visibleHotbarSlots()[digitIndex[e.code]];
   if(slot)selectItem(slot.dataset.item);
 }

 if(e.code==="KeyE"&&!e.repeat){
   if(backpackOpen){
     backpackOpen=false;
     ui.backpack.classList.add("hidden");
   }

   inventoryOpen=!inventoryOpen;
   if(!inventoryOpen)returnAllCrafting();
   ui.inventory.classList.toggle("hidden",!inventoryOpen);setHotbarReorderHint();

   if(inventoryOpen&&document.pointerLockElement===renderer.domElement){
     document.exitPointerLock?.();
   }
 }

 if(e.code==="KeyB"&&!e.repeat){
   toggleBackpack();
 }

 if(e.code==="KeyR"){
   returnAllCrafting();
   swordTier=1;
   clearBackpack();
   edits.clear();

   for(let [q,c] of [...chunks])unloadChunk(c.cx,c.cz);
   ccx=99999;ccz=99999;

   Object.assign(inv,{
     grass:18,dirt:18,stone:12,wood:8,
     planks:0,sticks:0,crafting_table:0,
     leaves:8,arrows:20
   });

   hp=20;
   for(let m of mobs)mobGroup.remove(m.mesh);
   mobs.length=0;
   resetPlayer();
   spawnStart();
   refreshUI();
   drawBackpack();
 }
});
document.addEventListener("keyup",e=>keys[e.code]=false);window.addEventListener("blur",()=>{keys={};cancelMining()});
document.addEventListener("mousemove",e=>{if(!locked)return;yaw-=e.movementX*.0022;pitch-=e.movementY*.0022;pitch=Math.max(-Math.PI/2+.03,Math.min(Math.PI/2-.03,pitch))});
ui.play.onclick=()=>{running=true;ui.start.style.display="none";syncMobileControlsVisibility();if(!isTouchDevice)renderer.domElement.requestPointerLock?.()};renderer.domElement.onclick=()=>{if(!isTouchDevice&&running&&!locked&&!inventoryOpen&&!backpackOpen)renderer.domElement.requestPointerLock?.()};document.addEventListener("pointerlockchange",()=>{locked=document.pointerLockElement===renderer.domElement;if(!locked)cancelMining();setHotbarReorderHint()});
renderer.domElement.addEventListener("mousedown",e=>{
 if(isTouchDevice)return;
 if(e.button===0){
   triggerHandSwing();
   if(selected==="sword")swordAttack();
   else if(selected==="bow")bow();
   else beginMining();
 }
 if(e.button===2)place();
});document.addEventListener("mouseup",e=>{if(e.button===0)cancelMining()});renderer.domElement.oncontextmenu=e=>e.preventDefault();
window.onresize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio||1,isTouchDevice ? .72 : 1.25))};

resetPlayer();spawnStart();refreshUI();refreshHeldItem();drawBackpack();refreshHotbarNumbers();setHotbarReorderHint();
syncMobileControlsVisibility();
const clock=new THREE.Clock();
let mobileMobTimer=0;
let mobileDropTimer=0;

function loop(now=performance.now()){
 requestAnimationFrame(loop);

 const target=document.hidden?10:MAX_FPS;
 const minFrame=1000/target;
 if(now-lastPresented<minFrame)return;
 lastPresented=now;

 const dt=Math.min(clock.getDelta(),.035);
 updatePerfStats(dt);

 if(running&&!document.hidden){
   swordCd=Math.max(0,swordCd-dt);
   bowCd=Math.max(0,bowCd-dt);

   updatePlayer(dt);
   processChunkQueues();
   updateMining(dt);
   if(isTouchDevice){
     mobileMobTimer+=dt;
     mobileDropTimer+=dt;
     if(mobileMobTimer>=.10){
       updateMobs(mobileMobTimer);
       updateShots(mobileMobTimer);
       mobileMobTimer=0;
     }
     updateParticles(dt);
     if(mobileDropTimer>=.066){
       updateDrops(mobileDropTimer);
       mobileDropTimer=0;
     }
   }else{
     updateMobs(dt);
     updateShots(dt);
     updateParticles(dt);
     updateDrops(dt);
   }
   updateHand(dt);

   skyDome.position.copy(camera.position);
   cloudGroup.position.x=player.pos.x;
   cloudGroup.position.z=player.pos.z;
 }

 renderer.render(scene,camera);
}loop();
