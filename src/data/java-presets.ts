export type JavaPreset = {
  id: string;
  title: string;
  summary: string;
  code: string;
};

export const JAVA_PRESETS: JavaPreset[] = [
  {
    id: "thread-pool",
    title: "线程池模板",
    summary: "有界队列 + 拒绝策略",
    code: `import java.util.concurrent.*;

public class PoolDemo {
  static final ExecutorService POOL = new ThreadPoolExecutor(
      4, 16,
      60L, TimeUnit.SECONDS,
      new ArrayBlockingQueue<>(200),
      new ThreadPoolExecutor.CallerRunsPolicy()
  );

  public static void main(String[] args) {
    POOL.submit(() -> System.out.println("hello pool"));
    POOL.shutdown();
  }
}`,
  },
  {
    id: "idempotent",
    title: "幂等服务",
    summary: "Idempotency-Key 去重",
    code: `public class OrderService {
  private final Map<String, Order> idem = new ConcurrentHashMap<>();

  public Order create(String key, CreateOrder req) {
    return idem.computeIfAbsent(key, k -> doCreate(req));
  }

  private Order doCreate(CreateOrder req) {
    return new Order(UUID.randomUUID().toString(), req.amount());
  }
}`,
  },
  {
    id: "circuit",
    title: "熔断调用",
    summary: "失败率阈值示意",
    code: `class SimpleBreaker {
  int fails;
  boolean open;

  String call(Supplier<String> remote) {
    if (open) return "fallback";
    try {
      String r = remote.get();
      fails = 0;
      return r;
    } catch (Exception e) {
      if (++fails >= 5) open = true;
      throw e;
    }
  }
}`,
  },
  {
    id: "cache-aside",
    title: "Cache-Aside",
    summary: "读穿透 / 写删缓存",
    code: `User get(String id) {
  User u = cache.get(id);
  if (u != null) return u;
  u = db.find(id);
  if (u != null) cache.put(id, u);
  return u;
}

void update(User u) {
  db.save(u);
  cache.evict(u.id());
}`,
  },
  {
    id: "saga",
    title: "Saga 编排",
    summary: "正向步骤 + 补偿",
    code: `void placeOrder(Cmd cmd) {
  try {
    order.reserve(cmd);
    stock.deduct(cmd);
    pay.charge(cmd);
  } catch (Exception e) {
    pay.refund(cmd);
    stock.restore(cmd);
    order.cancel(cmd);
    throw e;
  }
}`,
  },
  {
    id: "feign",
    title: "Feign 客户端",
    summary: "声明式 HTTP",
    code: `@FeignClient(name = "inventory-svc")
public interface InventoryClient {
  @PostMapping("/reserve")
  ReserveResult reserve(@RequestBody ReserveCmd cmd);
}`,
  },
];

export function getPreset(id: string): JavaPreset {
  return JAVA_PRESETS.find((p) => p.id === id) ?? JAVA_PRESETS[0]!;
}
