import test from 'node:test';
import assert from 'node:assert/strict';
import { createDestinationPointer } from './destination-pointer.js';

test('Safari pointer bursts use one paint and cached measurements, including section crossing and cancellation',t=>{
  let pending, reads=0;const changes=[];
  for(const [key,value] of Object.entries({innerWidth:1000,innerHeight:800,
    requestAnimationFrame:cb=>{pending=cb;return 1;},cancelAnimationFrame:()=>{pending=undefined;},
    getComputedStyle:()=>({fontSize:'12px'})})) {
    const old=Object.getOwnPropertyDescriptor(globalThis,key);
    Object.defineProperty(globalThis,key,{value,configurable:true});
    t.after(()=>old?Object.defineProperty(globalThis,key,old):delete globalThis[key]);
  }
  const nav={dataset:{},getBoundingClientRect(){reads++;return {left:100,width:400};},
    querySelectorAll:()=>[{offsetWidth:120,offsetHeight:20}]};
  const tooltip={dataset:{},style:{setProperty(key,value){this[key]=value;}}};
  const pointer=createDestinationPointer(nav,tooltip,d=>changes.push(d));
  pointer.move({clientX:180,clientY:400});pointer.move({clientX:200,clientY:410});
  assert.equal(reads,0);pending();assert.equal(reads,1);
  assert.equal(tooltip.style['--label-x'],'200px');
  pointer.move({clientX:390,clientY:420});pending();
  assert.equal(reads,1);assert.deepEqual(changes,['work','explorations']);
  pointer.move({clientX:400,clientY:420});pointer.hide();
  assert.equal(pending,undefined);assert.equal(tooltip.dataset.pointerActive,undefined);
  pointer.move({clientX:990,clientY:420});pending();assert.equal(reads,2);
  assert.equal(tooltip.style['--label-x'],'932px');pointer.dispose();
});
