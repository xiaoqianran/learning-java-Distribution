/** Studio guided missions for v6 */

export type QuestId =
  | "login"
  | "fail401"
  | "create"
  | "edit"
  | "delete"
  | "logout";

export type QuestDef = {
  id: QuestId;
  title: string;
  hint: string;
};

export const QUEST_DEFS: QuestDef[] = [
  {
    id: "login",
    title: "成功登录",
    hint: "使用 demo@java.dev / password123",
  },
  {
    id: "fail401",
    title: "触发一次 401",
    hint: "故意输错密码登录一次",
  },
  {
    id: "create",
    title: "创建笔记",
    hint: "POST /api/notes",
  },
  {
    id: "edit",
    title: "编辑笔记",
    hint: "PUT /api/notes/:id",
  },
  {
    id: "delete",
    title: "删除笔记",
    hint: "DELETE /api/notes/:id",
  },
  {
    id: "logout",
    title: "安全退出",
    hint: "POST /api/auth/logout",
  },
];

const KEY = "java-dist-studio-quests-v1";

export function loadQuestDone(): QuestId[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as string[];
    return arr.filter((x): x is QuestId =>
      QUEST_DEFS.some((q) => q.id === x),
    );
  } catch {
    return [];
  }
}

export function saveQuestDone(ids: QuestId[]) {
  localStorage.setItem(KEY, JSON.stringify([...new Set(ids)]));
}

export function resetQuests() {
  localStorage.removeItem(KEY);
}
