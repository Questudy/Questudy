import test from 'node:test';
import assert from 'node:assert/strict';
import { createMockMapService } from '../src/services/map-service.ts';

const service = () => createMockMapService({delay:0});
test('starts at the center; only the plaza and four entrance gates are discovered',async()=>{
  const map=await service().getMap();
  assert.equal(map.session.currentNodeId,'start');
  assert.deepEqual(map.progress,{completed:0,total:40});
  assert.equal(map.session.discovered.length,5);
  assert.equal(map.session.reachable.length,5);
  const start=map.nodes.find(n=>n.id==='start');
  assert.ok(start);
  assert.equal(start.x,map.world.width/2);assert.equal(start.y,map.world.height/2);
});
test('camera-only browsing cannot bypass locked nodes; invalid actions do not reveal anything',async()=>{
  const api=service();
  await assert.rejects(api.moveTo('database-1'),/앞 노드/);
  await assert.rejects(api.completeBattle('database-1'),/앞 노드/);
  assert.equal((await api.getMap()).session.discovered.length,5);
});
test('difficulty opens only adjacent nodes and is immutable within its section',async()=>{
  const api=service();
  let map=await api.chooseDifficulty('database-0','normal');
  assert.ok(map.session.discovered.includes('database-1'));
  assert.ok(!map.session.discovered.includes('database-2'));
  assert.equal(map.progress.completed,0);
  await assert.rejects(api.chooseDifficulty('database-0','hard'),/바꿀 수/);
  // @ts-expect-error Runtime validation must also reject invalid untyped input.
  await assert.rejects(api.chooseDifficulty('sql-0','invalid'),/올바른/);
  map=await api.getMap();
  assert.equal(map.session.difficulties['database:1'],'normal');
  assert.equal(map.session.difficulties['sql:1'],undefined);
});
test('combat unlocks both branches; either branch reaches the merge; no duplicate completion',async()=>{
  const api=service();
  await api.chooseDifficulty('database-0','easy');
  let map=await api.completeBattle('database-1');
  assert.ok(map.session.discovered.includes('database-2'));
  assert.ok(map.session.discovered.includes('database-3'));
  assert.ok(!map.session.discovered.includes('database-4'));
  map=await api.completeBattle('database-2');
  assert.ok(map.session.reachable.includes('database-4'));
  assert.ok(map.session.reachable.includes('database-3'));
  assert.equal(map.progress.completed,2);
  await assert.rejects(api.completeBattle('database-2'),/進行|진행/);
  await api.moveTo('start');
  map=await api.getMap();
  assert.ok(map.session.discovered.includes('database-4'));
  assert.equal(map.progress.completed,2);
});
test('all 40 battles can complete, with independent difficulty per area and section',async()=>{
  const api=service();let map=await api.getMap();
  for(const area of map.areas) {
    for(const id of area.nodeIds) {
      const node=map.nodes.find(n=>n.id===id);
      assert.ok(node);
      map=node.kind==='gate'?await api.chooseDifficulty(id,'normal'):await api.completeBattle(id);
    }
  }
  assert.deepEqual(map.progress,{completed:40,total:40});
  assert.equal(map.session.discovered.length,map.nodes.length);
  assert.equal(Object.keys(map.session.difficulties).length,12);
  assert.equal(map.player.hp,80);
  assert.deepEqual(map.inventory,{recovery:2,pass:3});
});
test('snapshots are isolated and an ended preview rejects further game actions',async()=>{
  const api=service();let map=await api.getMap();
  map.session.completed.push('database-1');map.nodes[0].x=0;
  map=await api.getMap();
  assert.equal(map.nodes[0].x,1200);assert.equal(map.session.completed.length,1);
  await api.endPreview();
  await assert.rejects(api.moveTo('database-0'),/종료/);
  await assert.rejects(api.chooseDifficulty('database-0','easy'),/종료/);
});
