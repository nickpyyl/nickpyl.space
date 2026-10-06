import test from 'node:test';
import assert from 'node:assert/strict';
import { nextPreview, promotePreview, connectPreviewPlayback } from './preview-playlist.js';

test('promoting a preview preserves every image/video and the remaining order',()=>{
 const media=[{src:'a'},{src:'still'},{src:'b'},{src:'c'}];
 const ordered=promotePreview(media,'b');
 assert.deepEqual(ordered.map(x=>x.src),['b','a','still','c']);
 assert.equal(ordered[0],media[2]);
 assert.deepEqual(media.map(x=>x.src),['a','still','b','c']);
 assert.equal(promotePreview(media,'missing'),media);
 assert.equal(nextPreview([media[0],media[2],media[3]],'c'),media[0]);
});
function setup(t,{currentImage=false,nextImage=false,...options}={}) {
 t.mock.timers.enable({apis:['setTimeout']});
 const document=Object.assign(new EventTarget(),{hidden:false});
 const motion=Object.assign(new EventTarget(),{matches:false});
 const old={document:globalThis.document,window:globalThis.window,IntersectionObserver:globalThis.IntersectionObserver};
 globalThis.document=document;globalThis.window={matchMedia:()=>motion};globalThis.IntersectionObserver=undefined;
 function video() {
  return Object.assign(new EventTarget(),{
   ended:false,readyState:4,paused:true,plays:0,pauses:0,frame:null,
   play(){this.paused=false;this.plays++;return Promise.resolve();},
   pause(){this.paused=true;this.pauses++;},
   requestVideoFrameCallback(f){this.frame=f;return 1;},
   cancelVideoFrameCallback(){this.frame=null;},
  });
 }
 const image=()=>Object.assign(new EventTarget(),{tagName:'IMG',complete:true,naturalWidth:2080});
 const current=currentImage?image():video(),next=nextImage?image():video();let advances=0;
 const cleanup=connectPreviewPlayback(current,next,{canCycle:true,onAdvance:()=>{advances++;return true;},...options});
 t.after(()=>{cleanup();for(const[k,v]of Object.entries(old)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}});
 const end=()=>{current.ended=true;current.dispatchEvent(new Event('ended'));};
 return {current,next,end,cleanup,document,motion,advances:()=>advances};
}
test('switches only after this video ends and the next decoded frame is presented',t=>{
 const f=setup(t);assert.equal(f.advances(),0);assert.equal(f.next.plays,0);
 f.end();assert.equal(f.next.plays,1);assert.equal(f.advances(),0);
 f.next.frame();assert.equal(f.advances(),1);
});
test('slow next video leaves the final frame visible until it can decode',t=>{
 const f=setup(t);f.next.readyState=0;f.end();assert.equal(f.next.plays,0);
 f.next.readyState=4;f.next.dispatchEvent(new Event('canplay'));
 assert.equal(f.advances(),0);f.next.frame();assert.equal(f.advances(),1);
});
test('navigation lock prevents an end event from changing the shared clip',t=>{
 const f=setup(t,{canCycle:false});f.end();assert.equal(f.next.plays,0);assert.equal(f.advances(),0);
});
test('unmount cancels pending frame delivery so navigation cannot receive a stale switch',t=>{
 const f=setup(t);f.end();const lateFrame=f.next.frame;f.cleanup();lateFrame();
 assert.equal(f.advances(),0);assert.equal(f.next.paused,true);
});
test('hiding the tab cancels a prepared swap and resumes after visibility returns',t=>{
 const f=setup(t);f.end();f.document.hidden=true;f.document.dispatchEvent(new Event('visibilitychange'));
 assert.equal(f.next.paused,true);assert.equal(f.advances(),0);
 f.document.hidden=false;f.document.dispatchEvent(new Event('visibilitychange'));
 f.next.frame();assert.equal(f.advances(),1);
});
test('reduced motion pauses cycling',t=>{
 const f=setup(t);f.motion.matches=true;f.motion.dispatchEvent(new Event('change'));f.end();
 assert.equal(f.current.paused,true);assert.equal(f.next.plays,0);assert.equal(f.advances(),0);
});

test('membership stays visible for three seconds before preparing the next video',t=>{
 const f=setup(t,{currentImage:true,durationMs:3000});
 t.mock.timers.tick(2999);assert.equal(f.next.plays,0);
 t.mock.timers.tick(1);assert.equal(f.next.plays,1);assert.equal(f.advances(),0);
 f.next.frame();assert.equal(f.advances(),1);
});
test('navigation lock pauses the membership timer',t=>{
 const f=setup(t,{currentImage:true,durationMs:3000,canCycle:false});
 t.mock.timers.tick(5000);assert.equal(f.advances(),0);assert.equal(f.next.plays,0);
});
test('a video can advance to a loaded membership still',t=>{
 const f=setup(t,{nextImage:true});f.end();assert.equal(f.advances(),1);
});
test('a pending image waits for loading before the cut',t=>{
 const f=setup(t,{nextImage:true});f.next.complete=false;f.next.naturalWidth=0;
 f.end();assert.equal(f.advances(),0);
 f.next.complete=true;f.next.naturalWidth=2080;f.next.dispatchEvent(new Event('load'));
 assert.equal(f.advances(),1);
});

test('navigation lock changes do not pause or restart the preview controller', t => {
 let allowed=true;
 const f=setup(t,{canCycle:()=>allowed});
 allowed=false;f.cleanup.sync();
 allowed=true;f.cleanup.sync();
 assert.equal(f.current.pauses,0);
 assert.equal(f.current.paused,false);
 f.end();f.next.frame();
 assert.equal(f.advances(),1);
});
