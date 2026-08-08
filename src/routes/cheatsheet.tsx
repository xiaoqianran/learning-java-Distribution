import { createFileRoute, Link } from "@tanstack/react-router";
import { BookMarked } from "lucide-react";

export const Route = createFileRoute("/cheatsheet")({
  component: CheatsheetPage,
});

const SECTIONS: { title: string; items: { k: string; v: string }[] }[] = [
  {
    title: "并发 · 线程池",
    items: [
      { k: "ThreadPoolExecutor", v: "core / max / queue / RejectedHandler" },
      { k: "CallerRunsPolicy", v: "背压：提交线程自己跑" },
      { k: "Atomic*", v: "无锁原子更新" },
      { k: "synchronized / ReentrantLock", v: "互斥与条件变量" },
      { k: "volatile", v: "可见性；不保证 i++ 原子" },
      { k: "happens-before", v: "JMM 排序与可见规则" },
    ],
  },
  {
    title: "网络 · RPC",
    items: [
      { k: "超时预算", v: "端到端拆分到每跳" },
      { k: "重试", v: "仅幂等 + 退避抖动" },
      { k: "Idempotency-Key", v: "写接口去重" },
      { k: "序列化", v: "JSON / Protobuf；慎用 Java 原生" },
      { k: "gRPC / HTTP", v: "契约 + 错误模型" },
    ],
  },
  {
    title: "分布式核心",
    items: [
      { k: "CAP", v: "分区时 C 与 A 权衡" },
      { k: "BASE", v: "基本可用 · 最终一致" },
      { k: "Raft", v: "多数派选举 + 日志复制" },
      { k: "逻辑时钟", v: "勿用墙钟当全局序" },
      { k: "一致性哈希", v: "节点变化少搬迁" },
    ],
  },
  {
    title: "中间件",
    items: [
      { k: "MQ 至少一次", v: "消费者必须幂等" },
      { k: "Cache-Aside", v: "读回填；写后删缓存" },
      { k: "分布式锁", v: "过期 + token；非银弹" },
      { k: "分片键", v: "单片闭环；慎跨片事务" },
    ],
  },
  {
    title: "可靠性",
    items: [
      { k: "限流", v: "令牌桶 / 滑动窗口 / 429" },
      { k: "熔断", v: "closed → open → half-open" },
      { k: "舱壁", v: "独立线程池/信号量" },
      { k: "Saga", v: "本地事务 + 补偿" },
      { k: "2PC", v: "强一致但易阻塞" },
    ],
  },
  {
    title: "微服务 · 工程",
    items: [
      { k: "服务发现", v: "注册 + 健康检查 + LB" },
      { k: "Gateway", v: "路由 / 鉴权 / 限流入口" },
      { k: "TraceId", v: "日志指标链路三支柱" },
      { k: "readiness", v: "摘流量；liveness 才重启" },
      { k: "配置外置", v: "镜像不可变" },
    ],
  },
];

function CheatsheetPage() {
  return (
    <div className="mx-auto max-w-3xl pb-16">
      <header className="mb-6">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
          <BookMarked className="h-3.5 w-3.5" />
          v1 · 速查
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-fg">Java 分布式速查表</h1>
        <p className="mt-2 text-sm text-muted">
          写代码 / 面试前扫一眼。完整路径见{" "}
          <Link to="/" className="text-primary no-underline hover:underline">
            首页
          </Link>
          ，权威外链见{" "}
          <Link to="/docs" className="text-primary no-underline hover:underline">
            知识地图
          </Link>
          。
        </p>
      </header>

      <div className="space-y-5">
        {SECTIONS.map((sec) => (
          <section
            key={sec.title}
            className="overflow-hidden rounded-xl border border-border bg-surface"
          >
            <h2 className="border-b border-border bg-surface-2/50 px-4 py-2.5 font-display text-sm font-semibold text-fg">
              {sec.title}
            </h2>
            <ul className="divide-y divide-border">
              {sec.items.map((it) => (
                <li
                  key={it.k}
                  className="grid gap-1 px-4 py-2.5 sm:grid-cols-[11rem_1fr] sm:gap-4"
                >
                  <code className="font-mono text-[13px] text-primary">{it.k}</code>
                  <span className="text-sm text-muted">{it.v}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
