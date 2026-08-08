import { useEffect, useMemo, useState } from "react";
import type { DemoKind } from "@/data/lessons";
import { getDemoSource } from "@/data/demo-sources";
import { CodeBlock } from "@/components/CodeBlock";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, Code2, Play, RotateCcw } from "lucide-react";

export function InteractiveDemo({
  kind,
  title,
  hint,
}: {
  kind: DemoKind;
  title: string;
  hint?: string;
}) {
  const [showCode, setShowCode] = useState(true);
  const source = getDemoSource(kind);

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            交互 Demo · 概念可玩
          </p>
          <h3 className="mt-0.5 font-display text-base font-semibold text-fg">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowCode((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2.5 py-1 text-[11px] text-muted transition-colors hover:text-fg"
        >
          <Code2 className="h-3.5 w-3.5" />
          {showCode ? "收起源码" : "展开源码"}
          {showCode ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div className="p-4 sm:p-5">
        {hint ? <p className="mb-4 text-sm text-muted">{hint}</p> : null}
        <DemoCanvas kind={kind} />
        {showCode ? (
          <div className="mt-4">
            <CodeBlock code={source.code} title={source.title} lang={source.lang} />
          </div>
        ) : null}
      </div>
    </section>
  );
}

function DemoCanvas({ kind }: { kind: DemoKind }) {
  switch (kind) {
    case "thread-pool":
      return <ThreadPoolDemo />;
    case "lock-race":
      return <LockRaceDemo />;
    case "serialize":
      return <SerializeDemo />;
    case "rpc-call":
      return <RpcDemo />;
    case "message-queue":
      return <MqDemo />;
    case "cap-theorem":
      return <CapDemo />;
    case "raft-election":
      return <RaftDemo />;
    case "clock-skew":
      return <ClockDemo />;
    case "cache-aside":
      return <CacheDemo />;
    case "rate-limit":
      return <RateLimitDemo />;
    case "circuit-breaker":
      return <CircuitDemo />;
    case "two-phase-commit":
      return <TwoPcDemo />;
    case "consistent-hash":
      return <HashDemo />;
    case "load-balance":
      return <LbDemo />;
    case "service-discovery":
      return <DiscoveryDemo />;
    case "idempotent":
      return <IdempotentDemo />;
    case "saga":
      return <SagaDemo />;
    case "sharding":
      return <ShardingDemo />;
    default:
      return <p className="text-sm text-muted">Demo 开发中</p>;
  }
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border bg-bg/60 p-3 sm:p-4", className)}>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-surface-2 px-2.5 py-2">
      <p className="text-[10px] uppercase tracking-wider text-subtle">{label}</p>
      <p className="mt-0.5 font-mono text-sm tabular-nums text-fg">{value}</p>
    </div>
  );
}

function ThreadPoolDemo() {
  const [core, setCore] = useState(2);
  const [queue, setQueue] = useState(4);
  const [running, setRunning] = useState(0);
  const [queued, setQueued] = useState(0);
  const [done, setDone] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  function submitBurst(n: number) {
    let r = running;
    let q = queued;
    let rej = 0;
    const lines: string[] = [];
    for (let i = 0; i < n; i++) {
      if (r < core) {
        r += 1;
        lines.push(`任务 #${done + i + 1} → 执行中`);
      } else if (q < queue) {
        q += 1;
        lines.push(`任务 #${done + i + 1} → 入队`);
      } else {
        rej += 1;
        lines.push(`任务 #${done + i + 1} → 拒绝 (CallerRuns/Abort)`);
      }
    }
    setRunning(r);
    setQueued(q);
    setRejected((x) => x + rej);
    setLog((l) => [...lines, ...l].slice(0, 12));
  }

  function tick() {
    setRunning((r) => {
      if (r <= 0) return 0;
      setDone((d) => d + 1);
      setQueued((q) => {
        if (q > 0) {
          setLog((l) => [`队列任务出队执行`, ...l].slice(0, 12));
          return q - 1;
        }
        return 0;
      });
      return Math.max(0, r - 1 + (queued > 0 ? 1 : 0));
    });
  }

  return (
    <Panel>
      <div className="flex flex-wrap gap-3">
        <label className="text-xs text-muted">
          core={core}
          <input
            type="range"
            min={1}
            max={8}
            value={core}
            onChange={(e) => setCore(Number(e.target.value))}
            className="mt-1 block w-36"
          />
        </label>
        <label className="text-xs text-muted">
          queueCap={queue}
          <input
            type="range"
            min={0}
            max={12}
            value={queue}
            onChange={(e) => setQueue(Number(e.target.value))}
            className="mt-1 block w-36"
          />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="执行中" value={running} />
        <Stat label="队列" value={queued} />
        <Stat label="完成" value={done} />
        <Stat label="拒绝" value={rejected} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => submitBurst(1)}>
          提交 1
        </Button>
        <Button size="sm" variant="secondary" onClick={() => submitBurst(5)}>
          突发 5
        </Button>
        <Button size="sm" variant="secondary" onClick={tick}>
          <Play className="h-3.5 w-3.5" /> 推进完成
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setRunning(0);
            setQueued(0);
            setDone(0);
            setRejected(0);
            setLog([]);
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" /> 重置
        </Button>
      </div>
      <ul className="mt-3 max-h-28 space-y-1 overflow-y-auto font-mono text-[11px] text-muted">
        {log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </Panel>
  );
}

function LockRaceDemo() {
  const [unsafe, setUnsafe] = useState(0);
  const [safe, setSafe] = useState(0);
  const [workers, setWorkers] = useState(8);
  const [busy, setBusy] = useState(false);

  function race() {
    setBusy(true);
    let u = 0;
    let s = 0;
    const iters = 1000;
    // simulate lost updates for unsafe
    const lost = Math.floor(Math.random() * workers * 40);
    u = workers * iters - lost;
    s = workers * iters;
    setTimeout(() => {
      setUnsafe(u);
      setSafe(s);
      setBusy(false);
    }, 280);
  }

  return (
    <Panel>
      <p className="text-sm text-muted">
        {workers} 个 worker 各自 +1000 次。无锁会丢更新；Atomic 得到准确值。
      </p>
      <label className="mt-2 block text-xs text-muted">
        workers={workers}
        <input
          type="range"
          min={2}
          max={16}
          value={workers}
          onChange={(e) => setWorkers(Number(e.target.value))}
          className="mt-1 block w-40"
        />
      </label>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="int++ 结果" value={unsafe || "—"} />
        <Stat label="Atomic 结果" value={safe || "—"} />
      </div>
      <div className="mt-3">
        <Button size="sm" onClick={race} disabled={busy}>
          {busy ? "狂奔中…" : "开跑"}
        </Button>
      </div>
    </Panel>
  );
}

function SerializeDemo() {
  const [id, setId] = useState("ord-1001");
  const [amount, setAmount] = useState(1299);
  const json = useMemo(
    () => JSON.stringify({ orderId: id, amountCents: amount, at: "2026-08-09T00:00:00Z" }, null, 2),
    [id, amount],
  );
  return (
    <Panel>
      <div className="flex flex-wrap gap-2">
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="h-9 rounded-md border border-border bg-surface px-2 text-sm"
          placeholder="orderId"
        />
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="h-9 w-28 rounded-md border border-border bg-surface px-2 text-sm"
        />
      </div>
      <p className="mt-2 text-xs text-muted">序列化体积 ≈ {new Blob([json]).size} bytes</p>
      <pre className="mt-2 overflow-x-auto rounded-md bg-code-bg p-3 font-mono text-[12px] text-code-fg">
        {json}
      </pre>
    </Panel>
  );
}

function RpcDemo() {
  const [delay, setDelay] = useState(400);
  const [timeoutMs, setTimeoutMs] = useState(300);
  const [retries, setRetries] = useState(0);
  const [serverOk, setServerOk] = useState(0);
  const [clientOk, setClientOk] = useState(0);
  const [clientTo, setClientTo] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  function call() {
    let cOk = 0;
    let cTo = 0;
    let sOk = 0;
    const lines: string[] = [];
    const attempts = 1 + retries;
    for (let i = 0; i < attempts; i++) {
      sOk += 1; // server always processes in this sim if request arrives
      if (delay <= timeoutMs) {
        cOk += 1;
        lines.push(`尝试 ${i + 1}: 成功 (${delay}ms ≤ ${timeoutMs}ms)`);
        break;
      } else {
        cTo += 1;
        lines.push(`尝试 ${i + 1}: 客户端超时 (服务端可能已成功!)`);
      }
    }
    setServerOk((x) => x + sOk);
    setClientOk((x) => x + cOk);
    setClientTo((x) => x + cTo);
    setLog((l) => [...lines, ...l].slice(0, 10));
  }

  return (
    <Panel>
      <div className="flex flex-wrap gap-3">
        <label className="text-xs text-muted">
          服务端延迟 {delay}ms
          <input type="range" min={50} max={800} step={50} value={delay} onChange={(e) => setDelay(+e.target.value)} className="mt-1 block w-40" />
        </label>
        <label className="text-xs text-muted">
          超时 {timeoutMs}ms
          <input type="range" min={50} max={800} step={50} value={timeoutMs} onChange={(e) => setTimeoutMs(+e.target.value)} className="mt-1 block w-40" />
        </label>
        <label className="text-xs text-muted">
          重试次数 {retries}
          <input type="range" min={0} max={3} value={retries} onChange={(e) => setRetries(+e.target.value)} className="mt-1 block w-40" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="服务端执行" value={serverOk} />
        <Stat label="客户端成功" value={clientOk} />
        <Stat label="客户端超时" value={clientTo} />
      </div>
      <div className="mt-3">
        <Button size="sm" onClick={call}>
          发起 RPC
        </Button>
      </div>
      <ul className="mt-3 space-y-1 font-mono text-[11px] text-muted">
        {log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </Panel>
  );
}

function MqDemo() {
  const [queue, setQueue] = useState<number[]>([]);
  const [processed, setProcessed] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [id, setId] = useState(1);

  useEffect(() => {
    const t = setInterval(() => {
      setQueue((q) => {
        if (q.length === 0) return q;
        const take = Math.min(speed, q.length);
        setProcessed((p) => p + take);
        return q.slice(take);
      });
    }, 500);
    return () => clearInterval(t);
  }, [speed]);

  return (
    <Panel>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="积压" value={queue.length} />
        <Stat label="已消费" value={processed} />
        <Stat label="消费速度" value={`${speed}/tick`} />
      </div>
      <label className="mt-3 block text-xs text-muted">
        消费者速度
        <input type="range" min={1} max={5} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="mt-1 block w-40" />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => {
            setQueue((q) => [...q, id]);
            setId((x) => x + 1);
          }}
        >
          生产 1 条
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            const batch = Array.from({ length: 10 }, (_, i) => id + i);
            setQueue((q) => [...q, ...batch]);
            setId((x) => x + 10);
          }}
        >
          突发 10
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap gap-1">
        {queue.slice(0, 24).map((m) => (
          <span key={m} className="rounded bg-primary-soft px-1.5 py-0.5 font-mono text-[10px] text-primary">
            m{m}
          </span>
        ))}
        {queue.length > 24 ? <span className="text-xs text-muted">+{queue.length - 24}</span> : null}
      </div>
    </Panel>
  );
}

function CapDemo() {
  const [partition, setPartition] = useState(false);
  const [mode, setMode] = useState<"CP" | "AP">("CP");
  const [master, setMaster] = useState(0);
  const [replica, setReplica] = useState(0);
  const [msg, setMsg] = useState("系统正常，读写主副本");

  function write() {
    if (!partition) {
      setMaster((m) => m + 1);
      setReplica((r) => r + 1);
      setMsg("写入成功，副本同步");
      return;
    }
    if (mode === "CP") {
      setMsg("分区 + CP：拒绝写入以保一致");
    } else {
      setMaster((m) => m + 1);
      setMsg("分区 + AP：本地写入成功，副本暂时落后");
    }
  }

  function heal() {
    setPartition(false);
    setReplica(master);
    setMsg("分区恢复，副本追上主");
  }

  return (
    <Panel>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={partition ? "default" : "secondary"} onClick={() => setPartition((p) => !p)}>
          {partition ? "分区中" : "模拟分区"}
        </Button>
        <Button size="sm" variant={mode === "CP" ? "default" : "secondary"} onClick={() => setMode("CP")}>
          CP
        </Button>
        <Button size="sm" variant={mode === "AP" ? "default" : "secondary"} onClick={() => setMode("AP")}>
          AP
        </Button>
        <Button size="sm" onClick={write}>
          写 +1
        </Button>
        <Button size="sm" variant="ghost" onClick={heal}>
          恢复网络
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="主版本" value={master} />
        <Stat label="副本版本" value={replica} />
      </div>
      <p className="mt-3 text-sm text-muted">{msg}</p>
    </Panel>
  );
}

function RaftDemo() {
  const [nodes, setNodes] = useState([
    { id: "A", alive: true, role: "leader" as "leader" | "follower" | "candidate" },
    { id: "B", alive: true, role: "follower" as const },
    { id: "C", alive: true, role: "follower" as const },
    { id: "D", alive: true, role: "follower" as const },
    { id: "E", alive: true, role: "follower" as const },
  ]);
  const [term, setTerm] = useState(1);
  const [log, setLog] = useState<string[]>(["Term 1 · A 当选 Leader"]);

  function killLeader() {
    setNodes((ns) => {
      const leader = ns.find((n) => n.role === "leader" && n.alive);
      if (!leader) return ns;
      const next = ns.map((n) =>
        n.id === leader.id ? { ...n, alive: false, role: "follower" as const } : { ...n, role: "follower" as const },
      );
      const alive = next.filter((n) => n.alive);
      const winner = alive[Math.floor(Math.random() * alive.length)];
      if (!winner) return next;
      const elected = next.map((n) =>
        n.id === winner.id ? { ...n, role: "leader" as const } : n,
      );
      setTerm((t) => {
        const nt = t + 1;
        setLog((l) => [`Term ${nt} · ${winner.id} 当选（${leader.id} 宕机）`, ...l].slice(0, 8));
        return nt;
      });
      return elected;
    });
  }

  function reviveAll() {
    setNodes((ns) => {
      const leader = ns.find((n) => n.role === "leader" && n.alive)?.id ?? "A";
      return ns.map((n) => ({
        ...n,
        alive: true,
        role: n.id === leader ? ("leader" as const) : ("follower" as const),
      }));
    });
    setLog((l) => ["所有节点恢复", ...l].slice(0, 8));
  }

  return (
    <Panel>
      <p className="text-xs text-muted">当前任期 term = {term}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {nodes.map((n) => (
          <div
            key={n.id}
            className={cn(
              "flex h-16 w-16 flex-col items-center justify-center rounded-xl border text-sm font-semibold",
              !n.alive && "opacity-40",
              n.role === "leader" ? "border-primary bg-primary-soft text-primary" : "border-border bg-surface-2 text-fg",
            )}
          >
            <span>{n.id}</span>
            <span className="text-[10px] font-normal text-muted">{n.alive ? n.role : "down"}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={killLeader}>
          杀死 Leader
        </Button>
        <Button size="sm" variant="secondary" onClick={reviveAll}>
          恢复全部
        </Button>
      </div>
      <ul className="mt-3 space-y-1 font-mono text-[11px] text-muted">
        {log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </Panel>
  );
}

function ClockDemo() {
  const [skewB, setSkewB] = useState(0);
  const events = useMemo(() => {
    const a = { node: "A", wall: 1000, mono: 1000 };
    const b = { node: "B", wall: 1000 + skewB, mono: 1005 };
    const c = { node: "A", wall: 1010, mono: 1010 };
    return [a, b, c];
  }, [skewB]);
  const byWall = [...events].sort((x, y) => x.wall - y.wall);
  const byMono = [...events].sort((x, y) => x.mono - y.mono);

  return (
    <Panel>
      <label className="text-xs text-muted">
        节点 B 时钟偏移 {skewB}ms
        <input type="range" min={-80} max={80} value={skewB} onChange={(e) => setSkewB(+e.target.value)} className="mt-1 block w-48" />
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-fg">按墙钟排序（可能乱）</p>
          <ol className="mt-1 space-y-1 font-mono text-[11px] text-muted">
            {byWall.map((e, i) => (
              <li key={i}>
                {e.node} wall={e.wall}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="text-xs font-medium text-fg">按因果/单调序</p>
          <ol className="mt-1 space-y-1 font-mono text-[11px] text-muted">
            {byMono.map((e, i) => (
              <li key={i}>
                {e.node} mono={e.mono}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Panel>
  );
}

function CacheDemo() {
  const [cache, setCache] = useState<Record<string, string>>({});
  const [dbHits, setDbHits] = useState(0);
  const [cacheHits, setCacheHits] = useState(0);
  const db: Record<string, string> = { u1: "Ada", u2: "Linus", u3: "James" };

  function get(id: string) {
    if (cache[id]) {
      setCacheHits((h) => h + 1);
      return cache[id];
    }
    setDbHits((h) => h + 1);
    const v = db[id] ?? "null";
    setCache((c) => ({ ...c, [id]: v }));
    return v;
  }

  function update(id: string, name: string) {
    db[id] = name;
    setCache((c) => {
      const n = { ...c };
      delete n[id];
      return n;
    });
  }

  return (
    <Panel>
      <div className="grid grid-cols-2 gap-2">
        <Stat label="缓存命中" value={cacheHits} />
        <Stat label="DB 查询" value={dbHits} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {["u1", "u2", "u3"].map((id) => (
          <Button key={id} size="sm" variant="secondary" onClick={() => get(id)}>
            读 {id}
          </Button>
        ))}
        <Button size="sm" onClick={() => update("u1", "Ada-" + Date.now().toString().slice(-4))}>
          写 u1 并删缓存
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted">缓存键: {Object.keys(cache).join(", ") || "（空）"}</p>
    </Panel>
  );
}

function RateLimitDemo() {
  const [rate, setRate] = useState(5);
  const [tokens, setTokens] = useState(5);
  const [ok, setOk] = useState(0);
  const [deny, setDeny] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTokens((x) => Math.min(rate, x + 1));
    }, 400);
    return () => clearInterval(t);
  }, [rate]);

  function fire(n: number) {
    let o = 0;
    let d = 0;
    setTokens((t) => {
      let cur = t;
      for (let i = 0; i < n; i++) {
        if (cur >= 1) {
          cur -= 1;
          o += 1;
        } else d += 1;
      }
      setOk((x) => x + o);
      setDeny((x) => x + d);
      return cur;
    });
  }

  return (
    <Panel>
      <label className="text-xs text-muted">
        速率 cap={rate}
        <input type="range" min={1} max={15} value={rate} onChange={(e) => setRate(+e.target.value)} className="mt-1 block w-40" />
      </label>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="令牌" value={tokens.toFixed(0)} />
        <Stat label="通过" value={ok} />
        <Stat label="拒绝" value={deny} />
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => fire(1)}>
          请求 1
        </Button>
        <Button size="sm" variant="secondary" onClick={() => fire(8)}>
          突发 8
        </Button>
      </div>
    </Panel>
  );
}

function CircuitDemo() {
  type St = "closed" | "open" | "half";
  const [state, setState] = useState<St>("closed");
  const [fails, setFails] = useState(0);
  const [ok, setOk] = useState(0);
  const [fastFail, setFastFail] = useState(0);
  const threshold = 3;

  function call(success: boolean) {
    if (state === "open") {
      setFastFail((x) => x + 1);
      return;
    }
    if (success) {
      setOk((x) => x + 1);
      setFails(0);
      if (state === "half") setState("closed");
    } else {
      setFails((f) => {
        const n = f + 1;
        if (n >= threshold) setState("open");
        return n;
      });
    }
  }

  return (
    <Panel>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="状态" value={state} />
        <Stat label="连续失败" value={fails} />
        <Stat label="成功" value={ok} />
        <Stat label="快速失败" value={fastFail} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => call(true)}>
          下游成功
        </Button>
        <Button size="sm" variant="secondary" onClick={() => call(false)}>
          下游失败
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setState("half")}>
          进入半开
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setState("closed");
            setFails(0);
          }}
        >
          重置
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted">失败阈值 = {threshold}。打开后快速失败，半开允许探测。</p>
    </Panel>
  );
}

function TwoPcDemo() {
  const [p1, setP1] = useState(true);
  const [p2, setP2] = useState(true);
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState("—");

  function run() {
    setPhase("prepare");
    setTimeout(() => {
      if (p1 && p2) {
        setPhase("commit");
        setResult("COMMIT 全部提交");
      } else {
        setPhase("abort");
        setResult("ABORT 有参与者拒绝");
      }
    }, 400);
  }

  return (
    <Panel>
      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2 text-muted">
          <input type="checkbox" checked={p1} onChange={(e) => setP1(e.target.checked)} /> 参与者1 prepare OK
        </label>
        <label className="flex items-center gap-2 text-muted">
          <input type="checkbox" checked={p2} onChange={(e) => setP2(e.target.checked)} /> 参与者2 prepare OK
        </label>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="阶段" value={phase} />
        <Stat label="结果" value={result} />
      </div>
      <div className="mt-3">
        <Button size="sm" onClick={run}>
          启动 2PC
        </Button>
      </div>
    </Panel>
  );
}

function HashDemo() {
  const [nodes, setNodes] = useState(["n1", "n2", "n3"]);
  const keys = ["user:1", "user:2", "user:7", "order:9", "order:42", "cart:3", "pay:8", "sku:5"];

  function hash(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }

  function locate(key: string, ring: string[]) {
    if (ring.length === 0) return "—";
    const sorted = [...ring].map((n) => ({ n, h: hash(n) })).sort((a, b) => a.h - b.h);
    const kh = hash(key);
    const found = sorted.find((x) => x.h >= kh) ?? sorted[0]!;
    return found.n;
  }

  const assign = keys.map((k) => ({ k, n: locate(k, nodes) }));

  return (
    <Panel>
      <div className="flex flex-wrap gap-2">
        {["n1", "n2", "n3", "n4"].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() =>
              setNodes((ns) => (ns.includes(n) ? ns.filter((x) => x !== n) : [...ns, n]))
            }
            className={cn(
              "rounded-full px-3 py-1 text-xs",
              nodes.includes(n) ? "bg-primary text-primary-fg" : "bg-surface-3 text-muted",
            )}
          >
            {n} {nodes.includes(n) ? "●" : "○"}
          </button>
        ))}
      </div>
      <ul className="mt-3 grid gap-1 sm:grid-cols-2">
        {assign.map((a) => (
          <li key={a.k} className="font-mono text-[11px] text-muted">
            {a.k} → <span className="text-primary">{a.n}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function LbDemo() {
  const [mode, setMode] = useState<"rr" | "w">("rr");
  const [counts, setCounts] = useState([0, 0, 0]);
  const weights = [1, 2, 3];
  const [rr, setRr] = useState(0);

  function hit() {
    if (mode === "rr") {
      setCounts((c) => {
        const n = [...c];
        n[rr % 3]! += 1;
        return n;
      });
      setRr((x) => x + 1);
    } else {
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      let idx = 0;
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i]!;
        if (r < 0) {
          idx = i;
          break;
        }
      }
      setCounts((c) => {
        const n = [...c];
        n[idx]! += 1;
        return n;
      });
    }
  }

  return (
    <Panel>
      <div className="flex gap-2">
        <Button size="sm" variant={mode === "rr" ? "default" : "secondary"} onClick={() => setMode("rr")}>
          轮询
        </Button>
        <Button size="sm" variant={mode === "w" ? "default" : "secondary"} onClick={() => setMode("w")}>
          加权 1:2:3
        </Button>
        <Button size="sm" onClick={hit}>
          请求
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setCounts([0, 0, 0])}>
          清零
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {counts.map((c, i) => (
          <Stat key={i} label={`实例 ${i + 1}`} value={c} />
        ))}
      </div>
    </Panel>
  );
}

function DiscoveryDemo() {
  const [instances, setInstances] = useState([
    { id: "i1", healthy: true },
    { id: "i2", healthy: true },
    { id: "i3", healthy: false },
  ]);
  const [hits, setHits] = useState<Record<string, number>>({});

  function call() {
    const healthy = instances.filter((i) => i.healthy);
    if (healthy.length === 0) return;
    const pick = healthy[Math.floor(Math.random() * healthy.length)]!;
    setHits((h) => ({ ...h, [pick.id]: (h[pick.id] ?? 0) + 1 }));
  }

  return (
    <Panel>
      <ul className="space-y-2">
        {instances.map((inst) => (
          <li key={inst.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            <span className="font-mono">
              {inst.id}{" "}
              <span className={inst.healthy ? "text-primary" : "text-danger"}>
                {inst.healthy ? "healthy" : "down"}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted">hits={hits[inst.id] ?? 0}</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  setInstances((list) =>
                    list.map((x) => (x.id === inst.id ? { ...x, healthy: !x.healthy } : x)),
                  )
                }
              >
                切换
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <Button size="sm" onClick={call}>
          发起调用
        </Button>
      </div>
    </Panel>
  );
}

function IdempotentDemo() {
  const [store, setStore] = useState<Record<string, string>>({});
  const [key, setKey] = useState("idem-001");
  const [creates, setCreates] = useState(0);
  const [replays, setReplays] = useState(0);
  const [last, setLast] = useState("—");

  function submit() {
    if (store[key]) {
      setReplays((r) => r + 1);
      setLast(`重复请求 → 返回已有订单 ${store[key]}`);
      return;
    }
    const orderId = "O-" + Math.random().toString(36).slice(2, 7);
    setStore((s) => ({ ...s, [key]: orderId }));
    setCreates((c) => c + 1);
    setLast(`新建订单 ${orderId}`);
  }

  return (
    <Panel>
      <input
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className="h-9 w-full max-w-xs rounded-md border border-border bg-surface px-2 text-sm"
      />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="真实创建" value={creates} />
        <Stat label="幂等回放" value={replays} />
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={submit}>
          提交订单
        </Button>
        <Button size="sm" variant="secondary" onClick={submit}>
          再点一次（同 key）
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted">{last}</p>
    </Panel>
  );
}

function SagaDemo() {
  const [steps, setSteps] = useState<{ name: string; st: string }[]>([
    { name: "预占订单", st: "pending" },
    { name: "扣库存", st: "pending" },
    { name: "支付", st: "pending" },
  ]);
  const [failPay, setFailPay] = useState(true);

  function run() {
    const next = [
      { name: "预占订单", st: "ok" },
      { name: "扣库存", st: "ok" },
      { name: "支付", st: failPay ? "fail" : "ok" },
    ];
    setSteps(next);
    if (failPay) {
      setTimeout(() => {
        setSteps([
          { name: "支付补偿(退款)", st: "compensated" },
          { name: "库存恢复", st: "compensated" },
          { name: "订单取消", st: "compensated" },
        ]);
      }, 500);
    }
  }

  return (
    <Panel>
      <label className="flex items-center gap-2 text-sm text-muted">
        <input type="checkbox" checked={failPay} onChange={(e) => setFailPay(e.target.checked)} />
        在支付步骤注入失败
      </label>
      <ul className="mt-3 space-y-1">
        {steps.map((s) => (
          <li key={s.name} className="flex justify-between rounded-md border border-border px-3 py-2 text-sm">
            <span>{s.name}</span>
            <span className="font-mono text-xs text-primary">{s.st}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <Button size="sm" onClick={run}>
          执行 Saga
        </Button>
      </div>
    </Panel>
  );
}

function ShardingDemo() {
  const [n, setN] = useState(4);
  const keys = ["u1", "u2", "u7", "u9", "u15", "u22", "u30", "u42"];
  function shard(k: string) {
    let h = 0;
    for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) | 0;
    return Math.abs(h) % n;
  }
  const buckets = Array.from({ length: n }, () => [] as string[]);
  for (const k of keys) buckets[shard(k)]!.push(k);

  return (
    <Panel>
      <label className="text-xs text-muted">
        分片数 {n}
        <input type="range" min={2} max={8} value={n} onChange={(e) => setN(+e.target.value)} className="mt-1 block w-40" />
      </label>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {buckets.map((b, i) => (
          <div key={i} className="rounded-md border border-border px-3 py-2">
            <p className="text-xs font-medium text-fg">shard-{i}</p>
            <p className="mt-1 font-mono text-[11px] text-muted">{b.join(", ") || "—"}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
