import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { JAVA_PRESETS, getPreset } from "@/data/java-presets";
import { JavaPlayground } from "@/components/JavaPlayground";
import { Code2, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

type PlaygroundSearch = {
  example?: string;
};

export const Route = createFileRoute("/playground")({
  validateSearch: (search: Record<string, unknown>): PlaygroundSearch => ({
    example:
      typeof search.example === "string" && search.example.length > 0
        ? search.example
        : undefined,
  }),
  component: PlaygroundPage,
});

function PlaygroundPage() {
  const { example } = Route.useSearch();
  const [activeId, setActiveId] = useState(example ?? "thread-pool");
  const preset = useMemo(() => getPreset(activeId), [activeId]);

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <header className="mb-5">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
          <Code2 className="h-3.5 w-3.5" />
          概念沙盘 · Java 模板
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          交互实验室
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          选一个主题：左侧是可复制的 Java 模板，沙盘用模拟器把线程池、熔断、Saga
          等概念跑给你看（浏览器内不启动真实 JVM）。
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        {JAVA_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActiveId(p.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150",
              activeId === p.id
                ? "bg-primary text-primary-fg"
                : "bg-surface-3 text-muted hover:text-fg",
            )}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm">
          <span className="font-medium text-fg">{preset.title}</span>
          <span className="text-muted"> · {preset.summary}</span>
        </div>
        <p className="inline-flex items-center gap-1.5 text-[11px] text-subtle">
          <Keyboard className="h-3 w-3" />
          切换「概念模拟 / Java 模板」标签
        </p>
      </div>

      <JavaPlayground key={preset.id} preset={preset} />

      <aside className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          {
            t: "读模板",
            d: "Java 代码可直接复制到 IntelliJ / VS Code，作为项目骨架。",
          },
          {
            t: "玩模拟",
            d: "沙盘演示超时、积压、熔断状态机等，比纯文字好记。",
          },
          {
            t: "回课程",
            d: "每个主题在主路径里都有完整讲解 + 测验。",
          },
        ].map((item) => (
          <div
            key={item.t}
            className="rounded-lg border border-border bg-surface-2 px-3.5 py-3"
          >
            <p className="text-sm font-medium text-fg">{item.t}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">{item.d}</p>
          </div>
        ))}
      </aside>
    </div>
  );
}
