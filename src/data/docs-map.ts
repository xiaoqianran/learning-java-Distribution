/** 知识地图：权威资料 ↔ 本站课程 */

export type DocLink = {
  title: string;
  official: string;
  lessonSlug?: string;
  note?: string;
};

export type DocSection = {
  title: string;
  items: DocLink[];
};

export const DOC_SECTIONS: DocSection[] = [
  {
    title: "Java 并发",
    items: [
      {
        title: "java.util.concurrent",
        official:
          "https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html",
        lessonSlug: "thread-model",
      },
      {
        title: "JLS §17 Memory Model",
        official: "https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html",
        lessonSlug: "java-memory-model",
      },
      {
        title: "锁与竞态",
        official: "https://docs.oracle.com/javase/tutorial/essential/concurrency/",
        lessonSlug: "locks",
      },
    ],
  },
  {
    title: "分布式理论",
    items: [
      {
        title: "CAP 定理",
        official: "https://en.wikipedia.org/wiki/CAP_theorem",
        lessonSlug: "cap",
      },
      {
        title: "Raft 论文 / 可视化",
        official: "https://raft.github.io/",
        lessonSlug: "raft",
      },
      {
        title: "一致性哈希",
        official: "https://en.wikipedia.org/wiki/Consistent_hashing",
        lessonSlug: "consistent-hash",
      },
      {
        title: "两阶段提交",
        official: "https://en.wikipedia.org/wiki/Two-phase_commit_protocol",
        lessonSlug: "2pc",
      },
    ],
  },
  {
    title: "微服务与 Spring",
    items: [
      {
        title: "Spring Cloud",
        official: "https://spring.io/projects/spring-cloud",
        lessonSlug: "spring-cloud-map",
      },
      {
        title: "Resilience4j",
        official: "https://resilience4j.readme.io/",
        lessonSlug: "circuit-breaker",
      },
      {
        title: "OpenTelemetry Java",
        official: "https://opentelemetry.io/docs/languages/java/",
        lessonSlug: "observability",
      },
      {
        title: "服务发现",
        official: "https://kubernetes.io/docs/concepts/services-networking/service/",
        lessonSlug: "service-discovery",
      },
    ],
  },
  {
    title: "可靠性模式",
    items: [
      {
        title: "幂等与重试",
        official:
          "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
        lessonSlug: "idempotent",
      },
      {
        title: "Saga",
        official: "https://microservices.io/patterns/data/saga.html",
        lessonSlug: "saga",
      },
      {
        title: "限流 · 令牌桶",
        official: "https://en.wikipedia.org/wiki/Token_bucket",
        lessonSlug: "rate-limit",
      },
    ],
  },
  {
    title: "本站主路径",
    items: [
      {
        title: "什么是 Java 分布式",
        official: "https://docs.oracle.com/en/java/",
        lessonSlug: "intro",
      },
      {
        title: "RPC",
        official: "https://en.wikipedia.org/wiki/Remote_procedure_call",
        lessonSlug: "rpc",
      },
      {
        title: "消息队列",
        official: "https://www.rabbitmq.com/tutorials",
        lessonSlug: "mq-basics",
      },
      {
        title: "缓存 Cache-Aside",
        official: "https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/caching-patterns.html",
        lessonSlug: "cache-aside",
      },
      {
        title: "分库分表",
        official: "https://shardingsphere.apache.org/document/current/en/overview/",
        lessonSlug: "sharding",
      },
      {
        title: "部署与探针",
        official: "https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes",
        lessonSlug: "deploy-k8s",
      },
    ],
  },
];

export function getDocsCoverage() {
  let total = 0;
  let linked = 0;
  for (const sec of DOC_SECTIONS) {
    for (const it of sec.items) {
      total += 1;
      if (it.lessonSlug) linked += 1;
    }
  }
  return {
    total,
    linked,
    percent: total ? Math.round((linked / total) * 100) : 0,
  };
}
