import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ApiError,
  apiCreateNote,
  apiDeleteNote,
  apiListNotes,
  apiLogin,
  apiLogout,
  apiMe,
  apiUpdateNote,
  clearLogs,
  getDemoCredentials,
  getLogs,
  resetMockApi,
  type ApiLog,
  type ApiNote,
  type ApiUser,
} from "@/lib/mock-api";
import {
  loadQuestDone,
  saveQuestDone,
  resetQuests,
  QUEST_DEFS,
  type QuestId,
} from "@/lib/studio-quests";
import {
  Server,
  LogOut,
  Plus,
  Trash2,
  Pencil,
  RefreshCw,
  Terminal,
  Check,
  Flag,
  Download,
} from "lucide-react";

const TOKEN_KEY = "java-dist-studio-token";

export const Route = createFileRoute("/studio")({
  component: StudioPage,
});

function StudioPage() {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  );
  const [user, setUser] = useState<ApiUser | null>(null);
  const [notes, setNotes] = useState<ApiNote[]>([]);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [booting, setBooting] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demo = getDemoCredentials();
  const [email, setEmail] = useState(demo.email);
  const [password, setPassword] = useState(demo.password);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [questDone, setQuestDone] = useState<QuestId[]>(() =>
    typeof window !== "undefined" ? loadQuestDone() : [],
  );

  const markQuest = useCallback((id: QuestId) => {
    setQuestDone((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      saveQuestDone(next);
      return next;
    });
  }, []);

  const questProgress = useMemo(() => {
    const done = questDone.length;
    const total = QUEST_DEFS.length;
    return { done, total, pct: Math.round((done / total) * 100) };
  }, [questDone]);

  const allQuestsDone = questProgress.done === questProgress.total;

  const refreshLogs = useCallback(() => setLogs(getLogs()), []);

  const loadNotes = useCallback(
    async (t: string | null) => {
      const list = await apiListNotes(t);
      setNotes(list);
      refreshLogs();
    },
    [refreshLogs],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (token) {
          const me = await apiMe(token);
          if (cancelled) return;
          setUser(me);
          await loadNotes(token);
        }
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setBooting(false);
          refreshLogs();
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, loadNotes, refreshLogs]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await apiLogin(email, password);
      localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user);
      markQuest("login");
      await loadNotes(res.token);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "登录失败";
      setError(msg);
      if (err instanceof ApiError && err.status === 401) markQuest("fail401");
    } finally {
      setBusy(false);
      refreshLogs();
    }
  }

  async function handleLogout() {
    setBusy(true);
    try {
      await apiLogout(token);
      markQuest("logout");
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setNotes([]);
      setBusy(false);
      refreshLogs();
    }
  }

  async function handleSaveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setBusy(true);
    setError(null);
    try {
      if (editingId) {
        await apiUpdateNote(token, editingId, { title, body });
        markQuest("edit");
      } else {
        await apiCreateNote(token, { title, body });
        markQuest("create");
      }
      setTitle("");
      setBody("");
      setEditingId(null);
      await loadNotes(token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "保存失败");
    } finally {
      setBusy(false);
      refreshLogs();
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    setBusy(true);
    try {
      await apiDeleteNote(token, id);
      markQuest("delete");
      await loadNotes(token);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "删除失败");
    } finally {
      setBusy(false);
      refreshLogs();
    }
  }

  function startEdit(n: ApiNote) {
    setEditingId(n.id);
    setTitle(n.title);
    setBody(n.body);
  }

  function hardReset() {
    resetMockApi();
    resetQuests();
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setNotes([]);
    setQuestDone([]);
    setLogs([]);
    setError(null);
    setTitle("");
    setBody("");
    setEditingId(null);
    refreshLogs();
  }

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <header className="mb-5">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-primary">
          <Server className="h-3.5 w-3.5" />
          微服务工坊 · 模拟 REST
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          模拟后端 API
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          完成右侧 6 项闯关：登录、401、创建、编辑、删除、退出。账号{" "}
          <code className="rounded-sm bg-surface-3 px-1 font-mono text-xs">demo@java.dev</code> /{" "}
          <code className="rounded-sm bg-surface-3 px-1 font-mono text-xs">password123</code>
          。把它想象成 Java Spring Boot 提供的订单/笔记服务。
        </p>
        <p className="mt-2 text-xs text-subtle">
          相关课：
          <Link
            to="/lesson/$slug"
            params={{ slug: "rpc" }}
            className="mx-1 text-primary no-underline hover:underline"
          >
            RPC
          </Link>
          ·
          <Link
            to="/lesson/$slug"
            params={{ slug: "idempotent" }}
            className="mx-1 text-primary no-underline hover:underline"
          >
            幂等
          </Link>
          ·
          <Link
            to="/lesson/$slug"
            params={{ slug: "spring-cloud-map" }}
            className="mx-1 text-primary no-underline hover:underline"
          >
            Spring Cloud
          </Link>
        </p>
      </header>

      {allQuestsDone ? (
        <div className="mb-4 rounded-xl border border-primary/35 bg-primary-soft px-4 py-3 text-sm text-primary">
          闯关全部完成。下一步：把同一套鉴权 + CRUD 流程搬到真实 Spring Boot / 网关项目。
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-4">
          {booting ? (
            <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted">
              恢复会话…
            </div>
          ) : !user ? (
            <section className="rounded-xl border border-border bg-surface p-5 shadow-soft sm:p-6">
              <h2 className="font-display text-lg font-semibold text-fg">登录</h2>
              <p className="mt-1 text-sm text-muted">
                真实 <code className="font-mono text-xs">fetch</code> + MSW Service Worker。
                DevTools → Network 可见 POST /api/auth/login。
              </p>
              <form onSubmit={handleLogin} className="mt-4 max-w-sm space-y-3">
                <label className="block">
                  <span className="text-xs text-muted">email</span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-muted">password</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
                  />
                </label>
                <Button type="submit" disabled={busy} className="w-full sm:w-auto">
                  登录
                </Button>
              </form>
            </section>
          ) : (
            <>
              <section className="rounded-xl border border-border bg-surface p-5 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted">已登录</p>
                    <p className="font-medium text-fg">
                      {user.name}{" "}
                      <span className="font-mono text-xs text-subtle">{user.email}</span>
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleLogout} disabled={busy}>
                    <LogOut className="h-3.5 w-3.5" />
                    退出
                  </Button>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-surface p-5 shadow-soft">
                <h2 className="font-display text-base font-semibold text-fg">
                  {editingId ? "编辑笔记" : "新建笔记"}
                </h2>
                <form onSubmit={handleSaveNote} className="mt-3 space-y-3">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="标题"
                    required
                    className="h-10 w-full rounded-md border border-border bg-bg px-3 text-sm"
                  />
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="正文"
                    rows={3}
                    className="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={busy}>
                      <Plus className="h-3.5 w-3.5" />
                      {editingId ? "保存修改" : "创建"}
                    </Button>
                    {editingId ? (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setEditingId(null);
                          setTitle("");
                          setBody("");
                        }}
                      >
                        取消
                      </Button>
                    ) : null}
                  </div>
                </form>
              </section>

              <section className="rounded-xl border border-border bg-surface p-5 shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-base font-semibold text-fg">
                    笔记列表 ({notes.length})
                  </h2>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => loadNotes(token)}
                    disabled={busy}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    刷新
                  </Button>
                </div>
                {notes.length === 0 ? (
                  <p className="text-sm text-muted">还没有笔记，创建一条吧。</p>
                ) : (
                  <ul className="space-y-2">
                    {notes.map((n) => (
                      <li
                        key={n.id}
                        className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-border bg-bg/50 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-fg">{n.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.body}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(n)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(n.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}

          <section className="rounded-xl border border-border bg-surface p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted">
              <Terminal className="h-3.5 w-3.5" />
              API 日志
              <button
                type="button"
                className="ml-auto text-primary hover:underline"
                onClick={() => {
                  clearLogs();
                  refreshLogs();
                }}
              >
                清空
              </button>
            </div>
            <ul className="max-h-40 space-y-1 overflow-y-auto font-mono text-[11px] text-subtle">
              {logs.length === 0 ? (
                <li>暂无请求</li>
              ) : (
                logs.map((l) => (
                  <li key={l.id}>
                    <span className={cn(l.status >= 400 ? "text-danger" : "text-primary")}>
                      {l.status}
                    </span>{" "}
                    {l.method} {l.path}
                    {l.detail ? ` · ${l.detail}` : ""}
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4 text-primary" />
              <h2 className="font-display text-sm font-semibold text-fg">闯关进度</h2>
            </div>
            <p className="mt-1 font-mono text-xs text-muted">
              {questProgress.done}/{questProgress.total} · {questProgress.pct}%
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${questProgress.pct}%` }}
              />
            </div>
            <ul className="mt-3 space-y-2">
              {QUEST_DEFS.map((q) => {
                const done = questDone.includes(q.id);
                return (
                  <li key={q.id} className="flex items-start gap-2 text-sm">
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                        done ? "bg-primary text-primary-fg" : "bg-surface-3 text-muted",
                      )}
                    >
                      {done ? <Check className="h-3 w-3" /> : null}
                    </span>
                    <span>
                      <span className={cn("block", done ? "text-fg" : "text-muted")}>
                        {q.title}
                      </span>
                      <span className="block text-[11px] text-subtle">{q.hint}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-surface-2 p-4 text-xs text-muted">
            <p className="font-medium text-fg">重置工坊</p>
            <p className="mt-1">清空本地 mock 数据、会话与闯关进度。</p>
            <Button size="sm" variant="secondary" className="mt-3" onClick={hardReset}>
              <Download className="h-3.5 w-3.5" />
              硬重置
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}
