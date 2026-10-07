import test from 'node:test';
import assert from 'node:assert/strict';
import { alignSafariVideo } from './safari-video-handoff.js';

function fixture(sourceTime=5, destinationTime=4.8) {
  let callback, revealed=0;
  const source={currentTime:sourceTime};
  const destination={currentTime:destinationTime,duration:10,readyState:4,seeking:false,playbackRate:1,loop:false,
    requestVideoFrameCallback(cb){callback=cb;return 1;},cancelVideoFrameCallback(){callback=undefined;}};
  const stop=alignSafariVideo(source,destination,()=>revealed++);
  return {source,destination,stop,frame:()=>callback?.(),revealed:()=>revealed};
}
test('a late destination catches up under its cover before handoff without another seek',()=>{
  const f=fixture();f.frame();
  assert.equal(f.revealed(),0);assert.equal(f.destination.currentTime,4.8);
  assert.equal(f.destination.playbackRate,1.5);
  f.destination.currentTime=4.98;f.frame();
  assert.equal(f.revealed(),1);assert.equal(f.destination.playbackRate,1);assert.equal(f.destination.loop,false);
});
test('handoff handles a loop boundary as a short drift',()=>{
  const f=fixture(.01,9.99);f.frame();assert.equal(f.revealed(),1);
});
test('cancelled alignment restores playback and cannot reveal late frames',()=>{
  const f=fixture();f.frame();f.stop();f.frame();
  assert.equal(f.destination.playbackRate,1);assert.equal(f.destination.loop,false);assert.equal(f.revealed(),0);
});
