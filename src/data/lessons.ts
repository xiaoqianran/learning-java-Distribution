export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explain: string;
};

export type DemoKind =
  | "thread-pool"
  | "lock-race"
  | "serialize"
  | "rpc-call"
  | "message-queue"
  | "cap-theorem"
  | "raft-election"
  | "clock-skew"
  | "cache-aside"
  | "rate-limit"
  | "circuit-breaker"
  | "two-phase-commit"
  | "consistent-hash"
  | "load-balance"
  | "service-discovery"
  | "idempotent"
  | "saga"
  | "sharding";

export type LessonBlock =
  | { type: "text"; title?: string; body: string }
  | { type: "code"; title?: string; lang?: string; code: string }
  | { type: "tip"; body: string }
  | { type: "demo"; kind: DemoKind; title: string; hint?: string }
  | { type: "quiz"; questions: QuizQuestion[] };

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  level: "入门" | "进阶" | "实战";
  track: "并发基础" | "网络通信" | "分布式核心" | "中间件" | "微服务" | "可靠性" | "工程面试";
  format?: "course" | "reference";
  minutes: number;
  /** 官方/权威文档路径（完整 URL 或相对 docs.oracle.com 等） */
  official?: string;
  blocks: LessonBlock[];
};

export const LESSONS: Lesson[] = [
  {
    slug: "intro",
    title: "什么是 Java 分布式",
    summary: "从单体到分布式：问题、代价与学习地图。",
    level: "入门",
    track: "并发基础",
    minutes: 8,
    official: "https://docs.oracle.com/en/java/",
    blocks: [
      {
        type: "text",
        title: "为什么要分布式",
        body: "单机 CPU / 内存 / 磁盘总有上限。业务增长后，我们把系统拆成多进程、多机器协作——这就是分布式。\n\n分布式不是目的，是手段：换来的是扩展性与容错，代价是网络延迟、部分失败、数据一致性变难。\n\n本站路径：并发与 JVM 基础 → 网络与 RPC → CAP / 共识 → 中间件 → 微服务治理 → 可靠性模式 → 工程与面试。",
      },
      {
        type: "code",
        title: "对应源码 · 单体 vs 多进程心智模型",
        lang: "java",
        code: `// 单体：进程内方法调用（几乎零延迟、强一致）
OrderService.create(order);

// 分布式：跨进程 RPC / 消息（有延迟、会超时、会丢包）
orderClient.create(order);      // 同步 RPC
mq.publish("order.created", evt); // 异步事件`,
      },
      {
        type: "tip",
        body: "记住口诀：网络不可靠、延迟不为零、带宽有限、拓扑会变。后面所有模式都在应对这四条。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "i1",
            question: "分布式的核心代价是？",
            options: ["代码变少", "网络延迟与部分失败", "不再需要数据库", "JVM 自动水平扩展"],
            answer: 1,
            explain: "跨进程引入网络与部分失败。",
          },
          {
            id: "i2",
            question: "分布式首先要解决的是？",
            options: ["选最炫的框架", "业务边界与失败语义", "必须用 K8s", "禁用事务"],
            answer: 1,
            explain: "先想清楚边界与失败，再选技术。",
          },
        ],
      },
    ],
  },
  {
    slug: "thread-model",
    title: "线程模型与线程池",
    summary: "Java 并发基石：线程、池化与背压。",
    level: "入门",
    track: "并发基础",
    minutes: 12,
    official: "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html",
    blocks: [
      {
        type: "text",
        title: "为什么服务端几乎都用线程池",
        body: "每个请求 new Thread 成本高、不可控。ThreadPoolExecutor 把任务排队 + 复用工作线程。\n\n关键参数：corePoolSize、maximumPoolSize、workQueue、RejectedExecutionHandler。队列满且线程到顶时触发拒绝策略（Abort / CallerRuns / Discard）。",
      },
      {
        type: "code",
        title: "对应源码 · 有界线程池",
        lang: "java",
        code: `ExecutorService pool = new ThreadPoolExecutor(
  4, 16,
  60L, TimeUnit.SECONDS,
  new ArrayBlockingQueue<>(200),
  new ThreadFactoryBuilder().setNameFormat("biz-%d").build(),
  new ThreadPoolExecutor.CallerRunsPolicy() // 背压：调用方执行
);

pool.submit(() -> handle(request));`,
      },
      {
        type: "demo",
        kind: "thread-pool",
        title: "动手：线程池排队与拒绝",
        hint: "调 core / 队列容量，观察任务完成与拒绝。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "tp1",
            question: "队列满且线程达上限时？",
            options: ["无限创建线程", "触发拒绝策略", "自动扩 JVM 堆", "忽略任务无日志"],
            answer: 1,
            explain: "RejectedExecutionHandler。",
          },
          {
            id: "tp2",
            question: "CallerRunsPolicy 的作用？",
            options: ["丢弃任务", "让提交线程自己跑，形成背压", "重启服务", "升级为虚拟线程"],
            answer: 1,
            explain: "减慢生产端。",
          },
        ],
      },
    ],
  },
  {
    slug: "locks",
    title: "锁、可见性与竞态",
    summary: "synchronized、JMM 可见性、无锁思路。",
    level: "入门",
    track: "并发基础",
    minutes: 12,
    official: "https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html",
    blocks: [
      {
        type: "text",
        title: "竞态从哪来",
        body: "多线程读写共享可变状态时，若没有正确同步，会出现丢失更新、脏读。\n\nJMM：synchronized / volatile / 锁保证可见性与有序性。分布式里没有「一把全局锁」可免费拿——后面会学分布式锁与共识。",
      },
      {
        type: "code",
        title: "对应源码 · 计数器竞态",
        lang: "java",
        code: `// 不安全
int count = 0;
void inc() { count++; } // 非原子：读-改-写

// 安全
final AtomicInteger count = new AtomicInteger();
void inc() { count.incrementAndGet(); }

// 或
synchronized void incSync() { count++; }`,
      },
      {
        type: "demo",
        kind: "lock-race",
        title: "动手：有锁 vs 无锁计数",
        hint: "开多 worker 狂点，对比最终值。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "lk1",
            question: "count++ 在多线程下？",
            options: ["总是安全", "非原子，会丢更新", "只需 volatile", "只需 final"],
            answer: 1,
            explain: "读改写三步。",
          },
          {
            id: "lk2",
            question: "volatile 保证？",
            options: ["复合操作原子性", "可见性与禁止重排（不保证 i++ 原子）", "分布式一致性", "事务"],
            answer: 1,
            explain: "可见性 ≠ 原子性。",
          },
        ],
      },
    ],
  },
  {
    slug: "serialize",
    title: "序列化与协议",
    summary: "跨进程必须先变成字节：JSON / Protobuf / Java 序列化。",
    level: "入门",
    track: "网络通信",
    minutes: 10,
    blocks: [
      {
        type: "text",
        title: "选协议的维度",
        body: "体积、速度、可读性、schema 演进、多语言。Java 原生序列化历史包袱多，生产更常用 JSON（可读）或 Protobuf/Avro（紧凑、强 schema）。\n\n演进规则：字段只增不改语义；兼容读者与写者版本。",
      },
      {
        type: "code",
        title: "对应源码 · DTO 与 JSON",
        lang: "java",
        code: `public record OrderCreated(
  String orderId,
  long amountCents,
  Instant at
) {}

// 出站
String json = objectMapper.writeValueAsString(event);
// 入站
OrderCreated evt = objectMapper.readValue(json, OrderCreated.class);`,
      },
      {
        type: "demo",
        kind: "serialize",
        title: "动手：对象 ↔ 字节",
        hint: "改字段，看 JSON 体积与解析结果。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "sz1",
            question: "跨语言 RPC 更推荐？",
            options: ["Java 原生序列化", "Protobuf / JSON 等中立格式", "仅靠 toString", "共享内存映射"],
            answer: 1,
            explain: "中立格式便于多语言。",
          },
        ],
      },
    ],
  },
  {
    slug: "rpc",
    title: "RPC：远程像本地？",
    summary: "超时、重试、幂等：远程调用的真实语义。",
    level: "进阶",
    track: "网络通信",
    minutes: 14,
    blocks: [
      {
        type: "text",
        title: "假本地调用的陷阱",
        body: "RPC 框架让你像调本地方法一样调远程，但语义完全不同：可能超时后对端其实成功了；重试会导致重复执行。\n\n实践：为每个写操作设计幂等键；超时时间与下游 SLA 对齐；区分可重试错误与业务错误。",
      },
      {
        type: "code",
        title: "对应源码 · 带超时的客户端",
        lang: "java",
        code: `interface OrderApi {
  @POST("/orders")
  Order create(@Header("Idempotency-Key") String key, CreateOrder req);
}

OrderApi api = new RestClient.Builder()
  .baseUrl("http://order-svc")
  .requestFactory(timeoutClient(Duration.ofMillis(300)))
  .build()
  .create(OrderApi.class);

api.create(UUID.randomUUID().toString(), req);`,
      },
      {
        type: "demo",
        kind: "rpc-call",
        title: "动手：超时与重试",
        hint: "调节延迟与超时，看成功 / 超时 / 重复执行。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "rpc1",
            question: "RPC 超时后对端？",
            options: ["一定失败", "可能已成功", "一定回滚", "连接必断"],
            answer: 1,
            explain: "超时只说明没收到响应。",
          },
          {
            id: "rpc2",
            question: "写接口重试前提？",
            options: ["无限重试", "幂等或可去重", "加大超时即可", "只用 GET"],
            answer: 1,
            explain: "避免重复副作用。",
          },
        ],
      },
    ],
  },
  {
    slug: "mq-basics",
    title: "消息队列入门",
    summary: "异步解耦、削峰、至少一次投递。",
    level: "进阶",
    track: "中间件",
    minutes: 12,
    blocks: [
      {
        type: "text",
        title: "为什么引入 MQ",
        body: "同步链路过长会放大故障半径。把「下单成功」与「发短信 / 积分」拆成事件，消费者独立扩缩容。\n\n投递语义：at-most-once / at-least-once / exactly-once（通常是端到端幂等 + 去重）。",
      },
      {
        type: "code",
        title: "对应源码 · 发布与消费",
        lang: "java",
        code: `// 生产
mq.publish("order.created", new OrderCreated(id, amount));

// 消费（至少一次 → 业务必须幂等）
@RabbitListener(queues = "order.created")
void on(OrderCreated evt) {
  if (processed.contains(evt.orderId())) return;
  sendSms(evt);
  processed.add(evt.orderId());
}`,
      },
      {
        type: "demo",
        kind: "message-queue",
        title: "动手：生产 / 消费 / 积压",
        hint: "开慢消费者，看队列堆积。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "mq1",
            question: "至少一次投递要求消费者？",
            options: ["可任意重复执行", "幂等处理", "禁用 ACK", "单线程"],
            answer: 1,
            explain: "重复消息不可避免。",
          },
        ],
      },
    ],
  },
  {
    slug: "cap",
    title: "CAP 与 BASE",
    summary: "分区时只能在 C 与 A 间权衡。",
    level: "进阶",
    track: "分布式核心",
    minutes: 12,
    blocks: [
      {
        type: "text",
        title: "CAP 一句话",
        body: "网络分区（P）发生时，系统必须在强一致（C）与可用性（A）之间做选择。现实系统在不同操作上可做不同权衡。\n\nBASE：基本可用、软状态、最终一致——很多业务写可接受短暂不一致。",
      },
      {
        type: "code",
        title: "对应源码 · 读自己的写（会话一致）",
        lang: "java",
        code: `// 写主
master.put(key, value);
// 读从可能落后 → 会话粘到主或带版本读
if (needReadYourWrites) {
  return master.get(key);
}
return replica.get(key); // 可能旧`,
      },
      {
        type: "demo",
        kind: "cap-theorem",
        title: "动手：分区时选 C 还是 A",
        hint: "断开网络，观察 CP / AP 行为差异。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "cap1",
            question: "分区发生时？",
            options: ["C 与 A 可同时满分", "需在 C/A 间权衡", "只需加机器", "CAP 已过时无需管"],
            answer: 1,
            explain: "P 下 C 与 A 冲突。",
          },
        ],
      },
    ],
  },
  {
    slug: "raft",
    title: "Raft 选举直觉",
    summary: "Leader 选举、任期、多数派。",
    level: "进阶",
    track: "分布式核心",
    minutes: 14,
    blocks: [
      {
        type: "text",
        title: "为什么需要共识",
        body: "多副本要就「谁是主、日志顺序」达成一致。Raft 用 term（任期）+ 多数派投票选出唯一 Leader，日志复制也走多数确认。\n\nJava 生态：etcd / ZooKeeper / Consul 提供这类能力；业务系统通常不手写 Raft。",
      },
      {
        type: "code",
        title: "对应源码 · 投票条件（示意）",
        lang: "java",
        code: `boolean grantVote(RequestVote req) {
  if (req.term < currentTerm) return false;
  if (votedFor != null && votedFor != req.candidateId) return false;
  // 候选人日志至少不旧于自己
  return req.lastLogAtLeastAsUpToDateAs(myLog);
}`,
      },
      {
        type: "demo",
        kind: "raft-election",
        title: "动手：模拟选举",
        hint: "启动节点、杀 Leader，观察重新选举。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "rf1",
            question: "Raft Leader 需要？",
            options: ["全部节点同意", "多数派选票", "最老节点自动当选", "客户端指定"],
            answer: 1,
            explain: "majority。",
          },
        ],
      },
    ],
  },
  {
    slug: "clocks",
    title: "时钟与顺序",
    summary: "物理时钟漂移、逻辑时钟、因果序。",
    level: "进阶",
    track: "分布式核心",
    minutes: 10,
    blocks: [
      {
        type: "text",
        title: "不要用墙钟做全局顺序",
        body: "机器时钟会漂。分布式排序更可靠的是：单主序号、逻辑时钟（Lamport）、向量时钟、或共识日志下标。\n\n超时可以依赖单调时钟（nanoTime），业务时间戳要容忍 skew。",
      },
      {
        type: "code",
        title: "对应源码 · 单调时钟测耗时",
        lang: "java",
        code: `long t0 = System.nanoTime();
doWork();
long ms = (System.nanoTime() - t0) / 1_000_000;

// 跨机事件顺序：不要用 System.currentTimeMillis() 直接比大小当真理`,
      },
      {
        type: "demo",
        kind: "clock-skew",
        title: "动手：时钟漂移导致乱序",
        hint: "给节点加偏移，看事件排序变化。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "ck1",
            question: "测量耗时更应用？",
            options: ["currentTimeMillis", "nanoTime 单调时钟", "随机数", "HTTP Date"],
            answer: 1,
            explain: "避免墙钟回拨。",
          },
        ],
      },
    ],
  },
  {
    slug: "consistent-hash",
    title: "一致性哈希",
    summary: "节点增减时最小化数据迁移。",
    level: "进阶",
    track: "分布式核心",
    minutes: 11,
    blocks: [
      {
        type: "text",
        title: "环形空间",
        body: "把 key 与节点哈希到环上，顺时针找最近节点。节点离开只影响相邻区间。虚拟节点改善负载均衡。",
      },
      {
        type: "code",
        title: "对应源码 · 简化一致性哈希",
        lang: "java",
        code: `NavigableMap<Integer, String> ring = new TreeMap<>();
void addNode(String node, int vnodes) {
  for (int i = 0; i < vnodes; i++)
    ring.put(hash(node + "#" + i), node);
}
String locate(String key) {
  var e = ring.ceilingEntry(hash(key));
  return (e != null ? e : ring.firstEntry()).getValue();
}`,
      },
      {
        type: "demo",
        kind: "consistent-hash",
        title: "动手：增删节点看迁移",
        hint: "添加/移除节点，观察 key 归属变化比例。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "ch1",
            question: "一致性哈希目标？",
            options: ["消灭网络分区", "节点变化时减少数据搬迁", "替代数据库", "保证强一致"],
            answer: 1,
            explain: "最小化 remapping。",
          },
        ],
      },
    ],
  },
  {
    slug: "cache-aside",
    title: "缓存模式 Cache-Aside",
    summary: "读穿透、写更新、击穿与雪崩。",
    level: "进阶",
    track: "中间件",
    minutes: 12,
    blocks: [
      {
        type: "text",
        title: "经典旁路缓存",
        body: "读：先缓存，未命中再 DB 并回填。写：先更 DB，再删/更缓存。\n\n注意：缓存与 DB 短暂不一致；热点 key 击穿用互斥或逻辑过期；雪崩用随机 TTL。",
      },
      {
        type: "code",
        title: "对应源码 · Cache-Aside",
        lang: "java",
        code: `User getUser(String id) {
  User u = cache.get(id);
  if (u != null) return u;
  u = db.find(id);
  if (u != null) cache.put(id, u, ttl);
  return u;
}
void updateUser(User u) {
  db.save(u);
  cache.evict(u.id()); // 删缓存，下次读回填
}`,
      },
      {
        type: "demo",
        kind: "cache-aside",
        title: "动手：命中率与击穿",
        hint: "切换读写，观察缓存命中与 DB 次数。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "ca1",
            question: "Cache-Aside 写后常见做法？",
            options: ["只写缓存", "更新 DB 后删缓存", "从不删缓存", "先删 DB"],
            answer: 1,
            explain: "避免脏缓存常驻。",
          },
        ],
      },
    ],
  },
  {
    slug: "service-discovery",
    title: "服务发现与注册",
    summary: "实例上下线、健康检查、客户端负载。",
    level: "进阶",
    track: "微服务",
    minutes: 11,
    blocks: [
      {
        type: "text",
        title: "注册中心做什么",
        body: "服务启动向注册中心登记地址；调用方拉取实例列表并负载均衡。配合健康检查摘除故障实例。\n\nJava 常见：Spring Cloud + Nacos / Eureka / Consul；K8s 用 DNS + Endpoint。",
      },
      {
        type: "code",
        title: "对应源码 · 简化客户端选择",
        lang: "java",
        code: `List<Instance> healthy = registry
  .getInstances("order-svc")
  .stream().filter(Instance::healthy).toList();
Instance pick = loadBalancer.choose(healthy);
return http.post(pick.uri() + "/orders", body);`,
      },
      {
        type: "demo",
        kind: "service-discovery",
        title: "动手：注册 / 摘除 / 调用",
        hint: "上下线实例，看流量是否绕开故障节点。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "sd1",
            question: "健康检查失败的实例应？",
            options: ["继续 50% 流量", "从负载池摘除", "自动升主", "清空注册中心"],
            answer: 1,
            explain: "故障隔离。",
          },
        ],
      },
    ],
  },
  {
    slug: "load-balance",
    title: "负载均衡策略",
    summary: "轮询、加权、最少连接、一致性哈希。",
    level: "进阶",
    track: "微服务",
    minutes: 10,
    blocks: [
      {
        type: "text",
        title: "选策略看流量形态",
        body: "同质实例：轮询 / 随机。异构：加权。长连接：最少连接。会话亲和：一致性哈希。\n\n客户端 LB（服务网格 / Spring Cloud LoadBalancer）与网关 LB 可叠加。",
      },
      {
        type: "code",
        title: "对应源码 · 加权轮询示意",
        lang: "java",
        code: `Instance next(List<Instance> list) {
  int total = list.stream().mapToInt(Instance::weight).sum();
  int r = ThreadLocalRandom.current().nextInt(total);
  for (Instance i : list) {
    r -= i.weight();
    if (r < 0) return i;
  }
  return list.get(0);
}`,
      },
      {
        type: "demo",
        kind: "load-balance",
        title: "动手：策略对比",
        hint: "切换轮询 / 加权，看各实例请求数。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "lb1",
            question: "会话粘滞可用？",
            options: ["纯随机且无状态", "一致性哈希到同一实例", "禁用 LB", "只部署单实例"],
            answer: 1,
            explain: "同 key 落同节点。",
          },
        ],
      },
    ],
  },
  {
    slug: "rate-limit",
    title: "限流",
    summary: "令牌桶 / 漏桶 / 滑动窗口保护系统。",
    level: "实战",
    track: "可靠性",
    minutes: 11,
    blocks: [
      {
        type: "text",
        title: "限流放在哪",
        body: "网关、服务入口、下游客户端都可限。令牌桶允许突发；漏桶平滑；分布式限流用 Redis + 脚本。\n\n被限后返回 429 或快速失败，避免雪崩。",
      },
      {
        type: "code",
        title: "对应源码 · 令牌桶（示意）",
        lang: "java",
        code: `class TokenBucket {
  double tokens; final double rate; final double cap;
  long last = System.nanoTime();
  synchronized boolean tryAcquire() {
    long now = System.nanoTime();
    tokens = Math.min(cap, tokens + (now - last) / 1e9 * rate);
    last = now;
    if (tokens < 1) return false;
    tokens -= 1; return true;
  }
}`,
      },
      {
        type: "demo",
        kind: "rate-limit",
        title: "动手：突发流量与限流",
        hint: "提高 QPS，观察通过 / 拒绝。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "rl1",
            question: "限流的主要目标？",
            options: ["提高精度", "保护系统不被打垮", "替代鉴权", "加密流量"],
            answer: 1,
            explain: "过载保护。",
          },
        ],
      },
    ],
  },
  {
    slug: "circuit-breaker",
    title: "熔断与隔离",
    summary: "失败阈值、半开探测、舱壁隔离。",
    level: "实战",
    track: "可靠性",
    minutes: 12,
    blocks: [
      {
        type: "text",
        title: "熔断状态机",
        body: "关闭 → 失败率过高进入打开（快速失败）→ 冷却后半开放少量探测 → 成功则关闭。\n\n与超时、重试、舱壁（独立线程池/信号量）组合使用。Java：Resilience4j、Sentinel。",
      },
      {
        type: "code",
        title: "对应源码 · Resilience4j 风格",
        lang: "java",
        code: `CircuitBreaker cb = CircuitBreaker.of("pay",
  CircuitBreakerConfig.custom()
    .failureRateThreshold(50)
    .waitDurationInOpenState(Duration.ofSeconds(10))
    .build());

Supplier<String> decorated =
  CircuitBreaker.decorateSupplier(cb, () -> payClient.charge(order));
Try.ofSupplier(decorated).recover(ex -> "fallback");`,
      },
      {
        type: "demo",
        kind: "circuit-breaker",
        title: "动手：熔断状态机",
        hint: "制造下游失败，看 open / half-open。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "cb1",
            question: "熔断打开时调用方应？",
            options: ["无限重试", "快速失败或降级", "加大超时", "重启 JVM"],
            answer: 1,
            explain: "止损。",
          },
        ],
      },
    ],
  },
  {
    slug: "idempotent",
    title: "幂等与去重",
    summary: "网络重试下保证副作用只发生一次。",
    level: "实战",
    track: "可靠性",
    minutes: 11,
    blocks: [
      {
        type: "text",
        title: "幂等键",
        body: "客户端生成 Idempotency-Key，服务端用唯一约束 / 去重表记录处理结果。重复请求返回同一结果。\n\n天然幂等：按主键 upsert；非幂等：扣款需去重表。",
      },
      {
        type: "code",
        title: "对应源码 · 去重表",
        lang: "java",
        code: `@Transactional
Order create(String idemKey, CreateOrder req) {
  var exist = idemRepo.find(idemKey);
  if (exist.isPresent()) return exist.get().result();
  Order o = orderRepo.insert(req);
  idemRepo.insert(idemKey, o.id()); // unique(idemKey)
  return o;
}`,
      },
      {
        type: "demo",
        kind: "idempotent",
        title: "动手：重复提交",
        hint: "同一 key 提交两次，看是否只创建一单。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "id1",
            question: "幂等的含义？",
            options: ["更快", "多次执行效果与一次相同", "从不失败", "只用 POST"],
            answer: 1,
            explain: "副作用一致。",
          },
        ],
      },
    ],
  },
  {
    slug: "2pc",
    title: "两阶段提交 2PC",
    summary: "协调者、参与者、阻塞问题。",
    level: "进阶",
    track: "分布式核心",
    minutes: 12,
    blocks: [
      {
        type: "text",
        title: "准备 → 提交",
        body: "协调者问所有参与者能否提交（prepare）；全票通过才 commit，否则 rollback。\n\n问题：协调者宕机可阻塞；同步链路长。现代业务更常用本地消息表 / 事务消息 / Saga。",
      },
      {
        type: "code",
        title: "对应源码 · 2PC 流程示意",
        lang: "java",
        code: `// Phase 1
for (Participant p : parts)
  if (!p.prepare(txId)) { abortAll(); return; }
// Phase 2
for (Participant p : parts) p.commit(txId);`,
      },
      {
        type: "demo",
        kind: "two-phase-commit",
        title: "动手：2PC 成功 / 中止",
        hint: "让某个参与者 prepare 失败，观察回滚。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "2pc1",
            question: "2PC 主要缺点？",
            options: ["无法回滚", "协调者故障可能阻塞", "不能用于数据库", "只要一阶段"],
            answer: 1,
            explain: "阻塞与可用性代价。",
          },
        ],
      },
    ],
  },
  {
    slug: "saga",
    title: "Saga 长事务",
    summary: "本地事务 + 补偿，最终一致。",
    level: "实战",
    track: "可靠性",
    minutes: 12,
    blocks: [
      {
        type: "text",
        title: "正向步骤与补偿",
        body: "把跨服务事务拆成一系列本地事务。失败则按相反顺序执行补偿（取消订单、退款、回库存）。\n\n编排（Orchestrator）或协同（Choreography / 事件）。补偿也要幂等。",
      },
      {
        type: "code",
        title: "对应源码 · 编排式 Saga",
        lang: "java",
        code: `void placeOrder(cmd) {
  try {
    order.reserve(cmd);
    stock.deduct(cmd);
    pay.charge(cmd);
  } catch (Exception e) {
    pay.refund(cmd);   // 补偿需可空跑
    stock.restore(cmd);
    order.cancel(cmd);
    throw e;
  }
}`,
      },
      {
        type: "demo",
        kind: "saga",
        title: "动手：成功与补偿",
        hint: "在支付步注入失败，看补偿链。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "sg1",
            question: "Saga 追求？",
            options: ["全局锁", "最终一致 + 补偿", "2PC 替代网络", "禁用消息"],
            answer: 1,
            explain: "长事务最终一致。",
          },
        ],
      },
    ],
  },
  {
    slug: "sharding",
    title: "分库分表直觉",
    summary: "分片键、路由、跨片查询代价。",
    level: "实战",
    track: "中间件",
    minutes: 11,
    blocks: [
      {
        type: "text",
        title: "选对分片键",
        body: "按 userId / orderId 哈希或范围分片。热点与倾斜要警惕。跨片 join / 事务代价高——尽量单片闭环。\n\n中间件：ShardingSphere、应用层路由、云数据库代理。",
      },
      {
        type: "code",
        title: "对应源码 · 简单路由",
        lang: "java",
        code: `int shardOf(String userId, int n) {
  return Math.floorMod(userId.hashCode(), n);
}
DataSource ds = shards.get(shardOf(userId, shards.size()));
return ds.query("select * from orders where user_id=?", userId);`,
      },
      {
        type: "demo",
        kind: "sharding",
        title: "动手：数据落片",
        hint: "改分片数，看 key 分布。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "sh1",
            question: "跨分片事务？",
            options: ["与单库一样便宜", "复杂且应尽量避免", "自动 2PC 无代价", "不需要分片键"],
            answer: 1,
            explain: "尽量单片事务。",
          },
        ],
      },
    ],
  },
  {
    slug: "observability",
    title: "可观测性",
    summary: "日志、指标、链路追踪三支柱。",
    level: "实战",
    track: "工程面试",
    minutes: 10,
    blocks: [
      {
        type: "text",
        title: "没有观测就没有分布式",
        body: "Metrics（RED/USE）、结构化日志、TraceId 贯穿调用链。OpenTelemetry 成事实标准。\n\n告警要可行动：错误率、延迟 P99、饱和度。",
      },
      {
        type: "code",
        title: "对应源码 · 传递 trace",
        lang: "java",
        code: `Span span = tracer.spanBuilder("createOrder").startSpan();
try (var scope = span.makeCurrent()) {
  log.info("create order {}", orderId); // 自动带 traceId
  inventoryClient.reserve(orderId);
} finally {
  span.end();
}`,
      },
      {
        type: "tip",
        body: "面试常问：如何定位「偶发 P99 抖动」？答：trace 采样 + 慢 span + 依赖黄金指标。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "ob1",
            question: "跨服务关联请求靠？",
            options: ["仅 IP", "TraceId / Span 上下文", "仅线程名", "仅 host 名"],
            answer: 1,
            explain: "分布式追踪。",
          },
        ],
      },
    ],
  },
  {
    slug: "spring-cloud-map",
    title: "Spring Cloud 地图",
    summary: "网关、配置、发现、熔断如何拼在一起。",
    level: "实战",
    track: "微服务",
    minutes: 12,
    official: "https://spring.io/projects/spring-cloud",
    blocks: [
      {
        type: "text",
        title: "一条请求的旅程",
        body: "客户端 → API Gateway → 服务发现选实例 → 业务服务 →（可选）配置中心拉配置 → 调用下游时带熔断/限流 → 消息或 DB。\n\n先理解职责，再记组件名（Gateway / LoadBalancer / OpenFeign / Config / CircuitBreaker）。",
      },
      {
        type: "code",
        title: "对应源码 · Feign 客户端",
        lang: "java",
        code: `@FeignClient(name = "inventory-svc")
public interface InventoryClient {
  @PostMapping("/reserve")
  ReserveResult reserve(@RequestBody ReserveCmd cmd);
}`,
      },
      {
        type: "demo",
        kind: "service-discovery",
        title: "对照：发现 + 调用",
        hint: "把工坊想象成 Spring Cloud 下游。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "sc1",
            question: "API Gateway 主要职责？",
            options: ["替代数据库", "统一入口：路由/鉴权/限流", "只做静态资源", "编译 Java"],
            answer: 1,
            explain: "南北向流量入口。",
          },
        ],
      },
    ],
  },
  {
    slug: "deploy-k8s",
    title: "部署与滚动发布",
    summary: "健康探针、滚动、回滚。",
    level: "实战",
    track: "工程面试",
    minutes: 10,
    blocks: [
      {
        type: "text",
        title: "云原生发布最小集",
        body: " readiness 决定是否接流量，liveness 决定是否重启。滚动发布保证新旧版本并存时的容量。\n\n配置与密钥外置；镜像不可变。",
      },
      {
        type: "code",
        title: "对应源码 · 探针端点",
        lang: "java",
        code: `// Spring Boot Actuator
// /actuator/health/readiness
// /actuator/health/liveness

@GetMapping("/health/ready")
Map<String,String> ready() {
  return Map.of("status", db.ping() ? "UP" : "DOWN");
}`,
      },
      {
        type: "tip",
        body: "readiness 失败应摘流量而不是杀进程；liveness 失败才重启。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "k8s1",
            question: "readiness 失败时？",
            options: ["应立刻杀 Pod", "从 Service 摘除流量", "删除镜像", "关闭注册中心"],
            answer: 1,
            explain: "未就绪不接流量。",
          },
        ],
      },
    ],
  },
  {
    slug: "interview",
    title: "分布式面试串讲",
    summary: "高频题清单与答题框架。",
    level: "实战",
    track: "工程面试",
    minutes: 14,
    format: "reference",
    blocks: [
      {
        type: "text",
        title: "答题框架",
        body: "场景 → 约束（一致/延迟/成本）→ 方案对比 → 你选什么 → 失败怎么处理 → 如何观测。\n\n高频：缓存一致性、消息重复、分布式事务、限流熔断、接口幂等、分库分表、CAP、Raft 直觉、线程池参数。",
      },
      {
        type: "code",
        title: "对应源码 · 接口幂等一句话",
        lang: "java",
        code: `// 面试金句示例
// 「写接口用 Idempotency-Key + 唯一约束；
//  消息至少一次，消费者幂等；
//  跨库用 Saga 补偿而非强上 2PC。」`,
      },
      {
        type: "tip",
        body: "知识卡片：不计入结业硬门槛，但强烈建议过一遍。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "iv1",
            question: "消息重复消费首选？",
            options: ["关闭 ACK", "业务幂等 / 去重表", "加大并发", "改用同步 RPC 永不异步"],
            answer: 1,
            explain: "至少一次下的标准解。",
          },
        ],
      },
    ],
  },
  {
    slug: "java-memory-model",
    title: "JMM 速览",
    summary: "happens-before 与跨线程可见性。",
    level: "进阶",
    track: "并发基础",
    format: "reference",
    minutes: 9,
    official: "https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html",
    blocks: [
      {
        type: "text",
        title: "happens-before",
        body: "解锁 happens-before 后续加锁；volatile 写 happens-before 后续读；线程 start/join 规则等。理解它比背「主内存工作内存」图更有用。",
      },
      {
        type: "code",
        title: "对应源码 · 安全发布",
        lang: "java",
        code: `// 安全发布不可变对象
final Map<String,String> cfg = Map.copyOf(load());
// 或 volatile 引用在构造完成后发布
volatile Service svc;
void init() { svc = new Service(deps); }`,
      },
      {
        type: "quiz",
        questions: [
          {
            id: "jmm1",
            question: "保证可见性常用？",
            options: ["只有 sleep", "锁 / volatile / 并发工具的 HB", "System.gc", "加大堆"],
            answer: 1,
            explain: "happens-before。",
          },
        ],
      },
    ],
  },
  {
    slug: "net-timeout",
    title: "超时预算与级联失败",
    summary: "端到端超时、重试放大、舱壁。",
    level: "实战",
    track: "网络通信",
    minutes: 10,
    blocks: [
      {
        type: "text",
        title: "超时要会算账",
        body: "入口 1s，下游若也 1s 且串行 3 跳，必然超时。为每跳分配预算；重试要有上限与抖动，防止重试风暴。",
      },
      {
        type: "code",
        title: "对应源码 · 预算传递",
        lang: "java",
        code: `Duration budget = Duration.ofMillis(800);
Duration perHop = budget.dividedBy(3);
callA(perHop);
callB(perHop);
callC(perHop);`,
      },
      {
        type: "demo",
        kind: "rpc-call",
        title: "对照：超时预算",
        hint: "把下游延迟调高，看链路失败。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "to1",
            question: "重试风暴成因？",
            options: ["限流过严", "失败时无节制重试放大流量", "日志太多", "用了 HTTPS"],
            answer: 1,
            explain: "需退避与熔断。",
          },
        ],
      },
    ],
  },
  {
    slug: "distributed-lock",
    title: "分布式锁",
    summary: "Redis / ZK 锁的正确姿势与误区。",
    level: "实战",
    track: "中间件",
    minutes: 11,
    blocks: [
      {
        type: "text",
        title: "锁不是银弹",
        body: "用锁保护临界区前先问：能否幂等设计消掉锁？Redis 锁要设过期、持有者 token、续期（Redisson watchdog）。锁超时与业务执行时间的关系要想清楚。",
      },
      {
        type: "code",
        title: "对应源码 · SET NX PX",
        lang: "java",
        code: `String token = UUID.randomUUID().toString();
Boolean ok = redis.setIfAbsent("lock:order:" + id, token, Duration.ofSeconds(30));
if (!Boolean.TRUE.equals(ok)) throw new LockedException();
try {
  doWork();
} finally {
  // 仅删除自己的 token（Lua 脚本）
  unlockIfOwner("lock:order:" + id, token);
}`,
      },
      {
        type: "tip",
        body: "需要强互斥且高正确性时，优先考虑 DB 唯一约束或共识组件，而不是裸 SET NX。",
      },
      {
        type: "quiz",
        questions: [
          {
            id: "dl1",
            question: "Redis 锁必须？",
            options: ["永不过期", "过期 + 所有权校验", "不用 token", "只在单线程用"],
            answer: 1,
            explain: "防死锁与误删。",
          },
        ],
      },
    ],
  },
  {
    slug: "api-versioning",
    title: "API 演进与兼容",
    summary: "多版本共存、兼容变更。",
    level: "进阶",
    track: "工程面试",
    format: "reference",
    minutes: 8,
    blocks: [
      {
        type: "text",
        title: "兼容优先",
        body: "加字段通常安全；删字段/改语义危险。URL 版本 / Header 版本。消费者驱动契约测试减少破窗。",
      },
      {
        type: "code",
        title: "对应源码 · 可演进 DTO",
        lang: "java",
        code: `// v1
public record UserV1(String id, String name) {}
// v2 增字段，旧客户端忽略
public record UserV2(String id, String name, String avatar) {}`,
      },
      {
        type: "quiz",
        questions: [
          {
            id: "av1",
            question: "破坏性变更应？",
            options: ["悄悄改线上", "发新版本并迁移窗口", "删库", "只改文档"],
            answer: 1,
            explain: "版本化迁移。",
          },
        ],
      },
    ],
  },
];

export const TRACKS = [
  "并发基础",
  "网络通信",
  "分布式核心",
  "中间件",
  "微服务",
  "可靠性",
  "工程面试",
] as const;

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function getLessonIndex(slug: string): number {
  return LESSONS.findIndex((l) => l.slug === slug);
}

export function getAdjacent(slug: string): {
  prev?: Lesson;
  next?: Lesson;
} {
  const i = getLessonIndex(slug);
  if (i < 0) return {};
  return {
    prev: i > 0 ? LESSONS[i - 1] : undefined,
    next: i < LESSONS.length - 1 ? LESSONS[i + 1] : undefined,
  };
}

export function getLessonsByTrack(track: Lesson["track"]) {
  return LESSONS.filter((l) => l.track === track);
}

export function getAllQuizQuestions(): Array<
  QuizQuestion & { lessonSlug: string; lessonTitle: string }
> {
  const out: Array<QuizQuestion & { lessonSlug: string; lessonTitle: string }> = [];
  for (const lesson of LESSONS) {
    for (const block of lesson.blocks) {
      if (block.type === "quiz") {
        for (const q of block.questions) {
          out.push({
            ...q,
            lessonSlug: lesson.slug,
            lessonTitle: lesson.title,
          });
        }
      }
    }
  }
  return out;
}

export function isCourseLesson(l: Lesson): boolean {
  if (l.format === "reference") return false;
  if (l.format === "course") return true;
  return true;
}

export function getCourseLessons(): Lesson[] {
  return LESSONS.filter(isCourseLesson);
}
