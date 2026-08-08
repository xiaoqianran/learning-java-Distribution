import type { DemoKind } from "@/data/lessons";

export type DemoSource = {
  lang: string;
  title: string;
  code: string;
};

export const DEMO_SOURCES: Record<DemoKind, DemoSource> = {
  "thread-pool": {
    lang: "java",
    title: "有界线程池",
    code: `ExecutorService pool = new ThreadPoolExecutor(
  4, 8, 60, TimeUnit.SECONDS,
  new ArrayBlockingQueue<>(16),
  new ThreadPoolExecutor.CallerRunsPolicy()
);
pool.submit(() -> handle(req));`,
  },
  "lock-race": {
    lang: "java",
    title: "原子计数",
    code: `AtomicInteger n = new AtomicInteger();
// 多线程
n.incrementAndGet();`,
  },
  serialize: {
    lang: "java",
    title: "JSON 序列化",
    code: `record Event(String id, long ts) {}
String json = mapper.writeValueAsString(new Event("o1", 1));
Event e = mapper.readValue(json, Event.class);`,
  },
  "rpc-call": {
    lang: "java",
    title: "RPC 超时",
    code: `client.withTimeout(Duration.ofMillis(300))
      .create(order); // 可能超时但服务端已成功`,
  },
  "message-queue": {
    lang: "java",
    title: "发布订阅",
    code: `mq.publish("order.created", evt);
// consumer 幂等处理
onMessage(evt -> processOnce(evt.id()));`,
  },
  "cap-theorem": {
    lang: "java",
    title: "分区下的选择",
    code: `if (partitioned) {
  if (preferC) return refuseWrite(); // CP
  else return localWrite();          // AP
}`,
  },
  "raft-election": {
    lang: "java",
    title: "请求投票",
    code: `if (req.term >= currentTerm
    && logUpToDate(req)
    && canVote(req.candidateId)) {
  grantVote();
}`,
  },
  "clock-skew": {
    lang: "java",
    title: "单调时钟",
    code: `long t0 = System.nanoTime();
work();
long cost = System.nanoTime() - t0;`,
  },
  "cache-aside": {
    lang: "java",
    title: "Cache-Aside",
    code: `User u = cache.get(id);
if (u == null) {
  u = db.find(id);
  cache.put(id, u);
}
return u;`,
  },
  "rate-limit": {
    lang: "java",
    title: "令牌桶",
    code: `if (!bucket.tryAcquire()) {
  throw new TooManyRequests();
}
handle(req);`,
  },
  "circuit-breaker": {
    lang: "java",
    title: "熔断调用",
    code: `return circuitBreaker.executeSupplier(
  () -> remote.call()
);`,
  },
  "two-phase-commit": {
    lang: "java",
    title: "2PC",
    code: `for (p : parts) if (!p.prepare()) abort();
for (p : parts) p.commit();`,
  },
  "consistent-hash": {
    lang: "java",
    title: "一致性哈希",
    code: `String node = ring.ceiling(hash(key));
return node != null ? node : ring.first();`,
  },
  "load-balance": {
    lang: "java",
    title: "加权选择",
    code: `Instance i = weightedRandom(healthy);
return http.post(i.uri(), body);`,
  },
  "service-discovery": {
    lang: "java",
    title: "服务发现",
    code: `List<Instance> list =
  registry.getHealthy("order-svc");
return lb.choose(list);`,
  },
  idempotent: {
    lang: "java",
    title: "幂等键",
    code: `if (idem.exists(key)) return idem.get(key);
Order o = create(req);
idem.save(key, o);
return o;`,
  },
  saga: {
    lang: "java",
    title: "Saga 补偿",
    code: `try { reserve(); pay(); }
catch (e) { refund(); cancel(); throw e; }`,
  },
  sharding: {
    lang: "java",
    title: "分片路由",
    code: `int shard = floorMod(key.hashCode(), N);
return shards.get(shard).query(...);`,
  },
};

export function getDemoSource(kind: DemoKind): DemoSource {
  return DEMO_SOURCES[kind];
}
