# Java 分布式实战学习

交互式中文 **Java 分布式** 教程：课程 + 测验 + 进度 + 概念沙盘 + 模拟微服务工坊。

参考姊妹项目：[learning-vue3](https://github.com/xiaoqianran/learning-vue3)

**仓库：** [https://github.com/xiaoqianran/learning-java-Distribution](https://github.com/xiaoqianran/learning-java-Distribution)

---

## 这是什么

面向想系统学习 **Java 并发与分布式系统** 的同学。内容以「读一点、动手一点、测一点」组织。

你可以：

- 按路径学完 **27 节** 课程（讲解 + Java 源码 + 交互 Demo + 小测验）
- 在 **概念沙盘** 里玩线程池、CAP、Raft、熔断、Saga 等模拟器
- 在 **微服务工坊** 里练登录、401、CRUD（模拟 REST API）
- 用 **速查表 / 学习中心 / 错题本 / 结业证明** 跟进度

> 说明：本站用 React + TanStack Start 承载教学内容；Java 代码为可复制模板，沙盘在浏览器内模拟分布式概念（不启动真实 JVM）。

---

## 功能一览

| 模块 | 路径 | 说明 |
|------|------|------|
| 课程 | `/lesson/:slug` | 正文、源码、交互 Demo、测验、笔记 |
| 首页大纲 | `/` | 搜索、路径筛选、进度条 |
| 概念沙盘 | `/playground` | 模拟器 + Java 模板 |
| 微服务工坊 | `/studio` | 模拟 API + 闯关任务 |
| 知识地图 | `/docs` | 权威资料 ↔ 本站课 |
| 主题 | 全局 | Catppuccin（默认 Peach 强调色） |
| 速查表 | `/cheatsheet` | 一页核心约定 |
| 学习中心 | `/hub` | 打卡、收藏、路径进度 |
| 练习场 | `/lab` | 综合测验 |
| 错题本 | `/mistakes` | 错题回顾 |
| 结业证明 | `/certificate` | 主修掌握后解锁 |

### 工坊演示账号

```text
邮箱：demo@java.dev
密码：password123
```

---

## 学习路径

| 路径 | 你学到什么 |
|------|------------|
| **并发基础** | 线程池、锁、JMM |
| **网络通信** | 序列化、RPC、超时预算 |
| **分布式核心** | CAP、Raft、时钟、一致性哈希、2PC |
| **中间件** | MQ、缓存、分片、分布式锁 |
| **微服务** | 发现、负载、Spring Cloud 地图 |
| **可靠性** | 限流、熔断、幂等、Saga |
| **工程面试** | 可观测、部署、串讲 |

---

## 本地运行

环境：Node 22+ 推荐。

```bash
git clone https://github.com/xiaoqianran/learning-java-Distribution.git
cd learning-java-Distribution
npm install
npm run dev
```

开发服务默认绑定 `0.0.0.0:8080`。

```bash
npm run build        # 生产构建
npm run build:pages  # GitHub Pages
npm run typecheck
```

GitHub Pages 构建设置 `GITHUB_PAGES=true`，`base` 为 `/learning-java-Distribution/`。

---

## 技术栈

- React 19、TanStack Start / Router、Vite
- Tailwind CSS v4、Zustand
- MSW（工坊 mock API）
- 部署：GitHub Actions → GitHub Pages

---

## 进度与隐私

- 学习进度、笔记、错题、工坊数据保存在 **浏览器 localStorage**
- 不上传到服务器
- 结业证明为本地成就，**非正式官方证书**

---

## 许可证与声明

- 教程内容用于学习与演示
- Java / Spring 等相关商标归各自所有者
- 欢迎提 Issue / PR
