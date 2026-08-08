import { createFileRoute, Link } from "@tanstack/react-router";
import { DOC_SECTIONS, getDocsCoverage } from "@/data/docs-map";
import { getLesson } from "@/data/lessons";
import { BookOpen, ExternalLink, Library, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/docs")({
  component: DocsMapPage,
});

function DocsMapPage() {
  const coverage = getDocsCoverage();
  const [q, setQ] = useState("");

  const sections = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return DOC_SECTIONS;
    return DOC_SECTIONS.map((sec) => ({
      ...sec,
      items: sec.items.filter(
        (it) =>
          it.title.toLowerCase().includes(query) ||
          it.lessonSlug?.toLowerCase().includes(query) ||
          it.note?.toLowerCase().includes(query) ||
          it.official.toLowerCase().includes(query) ||
          sec.title.toLowerCase().includes(query),
      ),
    })).filter((sec) => sec.items.length > 0);
  }, [q]);

  return (
    <div className="mx-auto max-w-3xl pb-16">
      <header className="mb-6">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
          <Library className="h-3.5 w-3.5" />
          对照权威资料
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-fg sm:text-3xl">
          知识地图
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          左侧是 Oracle / Spring / 经典论文与模式文档，右侧是本站交互课。本站做「讲解 +
          源码 + Demo + 测验 + 工坊」，外链做规范全文。
        </p>
      </header>

      <div className="mb-5 rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-muted">条目挂载本站课</p>
            <p className="mt-0.5 font-display text-2xl font-semibold tabular-nums text-fg">
              {coverage.percent}%
            </p>
            <p className="text-xs text-subtle">
              {coverage.linked}/{coverage.total} 条目已关联课程
            </p>
          </div>
          <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-surface-3 sm:w-48">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${coverage.percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索章节 / 课 slug / 文档 URL…"
          className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm text-fg placeholder:text-subtle"
        />
      </div>

      <div className="grid gap-4">
        {sections.map((sec) => (
          <section
            key={sec.title}
            className="overflow-hidden rounded-xl border border-border bg-surface"
          >
            <h2 className="border-b border-border bg-surface-2 px-4 py-2.5 font-display text-sm font-semibold text-fg">
              {sec.title}
              <span className="ml-2 font-sans text-[11px] font-normal text-subtle">
                {sec.items.length} 条
              </span>
            </h2>
            <ul className="divide-y divide-border">
              {sec.items.map((it) => {
                const lesson = it.lessonSlug ? getLesson(it.lessonSlug) : undefined;
                return (
                  <li
                    key={it.title + it.official}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-fg">{it.title}</p>
                      {it.note ? (
                        <p className="mt-0.5 text-xs text-muted">{it.note}</p>
                      ) : null}
                      <a
                        href={it.official}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 break-all font-mono text-[11px] text-subtle no-underline hover:text-primary"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        {it.official.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                    {lesson ? (
                      <Link
                        to="/lesson/$slug"
                        params={{ slug: lesson.slug }}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-medium text-primary no-underline hover:opacity-90",
                        )}
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        {lesson.title}
                      </Link>
                    ) : (
                      <span className="shrink-0 text-xs text-subtle">暂无对应课</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {sections.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">无匹配条目</p>
        ) : null}
      </div>
    </div>
  );
}
