import { useMemo, useState } from "react";
import type { JavaPreset } from "@/data/java-presets";
import { CodeBlock } from "@/components/CodeBlock";
import { InteractiveDemo } from "@/components/demos/InteractiveDemos";
import type { DemoKind } from "@/data/lessons";
import { cn } from "@/lib/utils";

const PRESET_DEMO: Record<string, DemoKind> = {
  "thread-pool": "thread-pool",
  idempotent: "idempotent",
  circuit: "circuit-breaker",
  "cache-aside": "cache-aside",
  saga: "saga",
  feign: "service-discovery",
};

export function JavaPlayground({ preset }: { preset: JavaPreset }) {
  const [tab, setTab] = useState<"code" | "sim">("sim");
  const demoKind = useMemo(() => PRESET_DEMO[preset.id] ?? "thread-pool", [preset.id]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-soft">
      <div className="flex border-b border-border">
        {(
          [
            { id: "sim" as const, label: "概念模拟" },
            { id: "code" as const, label: "Java 模板" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "px-4 py-2.5 text-sm transition-colors",
              tab === t.id
                ? "border-b-2 border-primary text-primary"
                : "text-muted hover:text-fg",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-4 sm:p-5">
        {tab === "code" ? (
          <div>
            <p className="mb-3 text-sm text-muted">
              浏览器内不运行 JVM——复制到 IDE 即可。右侧/下方模拟器帮助建立直觉。
            </p>
            <CodeBlock code={preset.code} title={preset.title} lang="java" />
          </div>
        ) : (
          <InteractiveDemo
            kind={demoKind}
            title={`${preset.title} · 沙盘`}
            hint={preset.summary}
          />
        )}
      </div>
    </div>
  );
}
