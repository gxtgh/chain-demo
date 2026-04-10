# evm-multi-theme SEO 前端页面架构方案

## 1. 目标

本方案面向当前 `evm-multi-theme` 项目，目标不是单纯“加几个 meta”，而是把项目从“可用工具页”升级成“可被搜索引擎理解、可持续产出自然流量、可承接转化”的前端内容架构。

核心目标分为三层：

1. 让搜索引擎更稳定地抓到页面主内容。
2. 让页面结构覆盖交易型、信息型、对比型三类搜索意图。
3. 让自然流量最终流向真正可转化的链上工具页。

## 2. 当前项目现状诊断

### 2.1 当前架构的优点

当前代码里，已经有几项对 SEO 有帮助的基础设施：

- 路由结构带有语言、链、页面维度，见 `src/app/router.tsx`、`src/config/chains.ts`。
- 链信息、文案、SEO 文案都做了中心化配置，后续适合批量生成链别页面。
- 页面里已经有明确的 `h1`，见 `src/components/common/page-header.tsx`。
- 英文和中文两套语言已存在，后续可以扩展成双语流量入口。

### 2.2 当前 SEO 的主要问题

#### 1. 当前是典型 CSR App Shell

- `src/app/App.tsx` 使用的是 `BrowserRouter`。
- `index.html` 首屏只有一个 `#root` 容器。
- `src/components/common/page-seo.tsx` 是在 `useEffect` 里动态写入 title 和 meta。

这意味着：

- 用户打开页面时，初始 HTML 内容非常少。
- 搜索引擎虽然能执行 JavaScript，但抓取和渲染成本更高。
- 非 Google 系搜索引擎、抓取工具、分享爬虫、部分 SEO 工具兼容性会更差。

#### 2. 页面类型过少，几乎只有“工具页”

当前公开页面实际上只有：

- `token-creation`
- `project-acceptance`

其中：

- `token-creation` 是交易/工具意图页。
- `project-acceptance` 更像内部交付页，不适合作为公开索引页。

这会导致站点很难覆盖大量信息型关键词，例如：

- how to create ERC20 token
- ERC20 token creation cost
- how to add liquidity after token launch
- ERC20 vs BEP20
- token launch checklist

#### 3. 主题参数会制造重复 URL

当前 URL 通过 query 传 `theme` 和 `themeColor`，见 `src/config/routes.ts`、`src/app/use-route-context.ts`。

这对产品展示有用，但对 SEO 有两个问题：

- 同一内容存在多组 query URL。
- 如果没有 canonical，搜索引擎会把这些视为重复或近似重复页面。

建议把主题参数视为展示状态，而不是索引维度。

#### 4. 没有索引控制、canonical、hreflang、结构化数据

当前项目里没有看到以下基础 SEO 能力：

- `robots.txt`
- `sitemap.xml`
- canonical
- hreflang
- structured data
- 面向内部页面的 noindex

这意味着双语、重复 URL、页面类型边界都没有被明确告诉搜索引擎。

#### 5. 当前内容深度还不够

`token-creation` 页面目前主要由表单、权限说明和成功后内容组成。对搜索引擎来说，真正稳定可抓的静态内容还不够厚：

- 链别差异说明不足
- 操作步骤不足
- 成本说明不足
- FAQ 不足
- 相关文章入口不足
- 面向长尾词的内容块不足

## 3. SEO 架构总原则

### 3.1 页面分层原则

后续页面建议按 4 类管理：

1. `Landing`：承接核心交易型关键词，目标是排名和转化。
2. `Guide`：承接教程型、问题型、流程型关键词，目标是拿自然流量。
3. `Compare`：承接对比型关键词，目标是截流中高意图用户。
4. `Tool/Internal`：真正执行钱包连接和链上动作的页面，目标是转化，不一定都要索引。

### 3.2 索引策略

- `Landing`：`index,follow`
- `Guide`：`index,follow`
- `Compare`：`index,follow`
- `Tool`：如果有足够静态内容则可索引，否则只做承接页跳转
- `Internal`：`noindex,nofollow`

`project-acceptance` 建议明确放入内部页，不进入 sitemap。

### 3.3 渲染策略

最佳方案不是继续纯 CSR，而是采用“内容页预渲染 + 工具区客户端交互”的混合模式。

推荐优先级：

1. 优先方案：保留 React Router 生态，但升级到支持静态预渲染的模式，把 SEO 页做成预渲染页面。
2. 次优方案：维持现有 Vite SPA，但额外引入静态营销/内容层。
3. 最低可行方案：继续当前架构，仅补内容和 head 信息，但 SEO 天花板最低。

对于当前项目，最适合的是“营销内容和工具交互分层”，不要把所有搜索流量都直接打到一个纯表单页上。

## 4. 建议的前端页面架构规范

## 4.1 路由层规范

建议把路由拆成三层，而不是所有页面都塞进 `/:lang/:chain/:page`。

### A. 公开链别落地页

用于核心交易型词：

```text
/:lang/:chain
/:lang/:chain/create-token
/:lang/:chain/token-creator
/:lang/:chain/create-token-cost
/:lang/:chain/how-to-create-token
```

说明：

- `/:lang/:chain` 作为链别 hub 页面。
- `create-token` 作为主 landing page。
- `token-creator` 可按关键词覆盖做同义入口，但要避免重复内容，可 301 或 canonical 到主页。
- `create-token-cost` 承接价格与预算意图。
- `how-to-create-token` 承接教程意图。

### B. 公共内容页

用于信息型、对比型和长尾词：

```text
/:lang/guides/token-launch-checklist
/:lang/guides/tokenomics-template
/:lang/guides/add-liquidity-guide
/:lang/compare/erc20-vs-bep20
/:lang/compare/base-vs-ethereum-token-launch
```

### C. 工具页 / 内部页

```text
/app/:lang/:chain/token-creation
/internal/:lang/:chain/project-acceptance
```

说明：

- 真正的钱包连接和链上交互建议进入 `/app` 命名空间。
- 内部交付页用 `/internal`，默认 noindex。

如果短期不改大路由，也至少要做到：

- `token-creation` 保留公开索引
- `project-acceptance` noindex
- 新增内容页 page key，不要只有一个工具页

## 4.2 URL 规范

### 必须遵守

- URL 全小写
- 单词使用 `-`
- 一个 URL 只表达一个搜索意图
- 同一页面不要同时被 pathname 和 query 重复表示

### 主题参数规范

`theme` / `themeColor` 不建议作为索引 URL 的一部分：

- 可改为 localStorage 持久化
- 或保留 query，但 canonical 必须指向无 query 的主 URL
- sitemap 中只放 canonical URL

## 4.3 页面模板规范

每个可索引页面至少包含以下模块：

1. `Hero`
2. `Intent Intro`
3. `Main Body`
4. `FAQ`
5. `Related Links`
6. `CTA`
7. `Structured Data`

### Hero 规范

- 只能有一个 `h1`
- `h1` 必须直击关键词
- 首屏副标题要同时说明链、用途、门槛、时间/成本特征

示例：

- `Create ERC20 Token on Ethereum`
- `Create BEP20 Token on BNB Smart Chain`
- `How to Create a Token on Base`

### Intent Intro 规范

首屏下方必须有 80 到 180 字的静态说明，回答：

- 这页解决什么问题
- 适合谁
- 大概需要什么准备
- 页面里能完成什么

### Main Body 规范

核心正文至少包含 4 个二级标题，建议从以下模块里选：

- What this tool does
- Supported chains
- Steps to create token
- Cost breakdown
- Requirements before launch
- Risks and limitations
- What to do after deployment

### FAQ 规范

每个主 landing page 至少 6 个 FAQ。

FAQ 必须围绕真实搜索问题，不要写空泛问答。优先覆盖：

- 需要会写代码吗
- 创建费用包括什么
- 创建后可以提现吗
- 如何上 DEX
- 是否可以改 decimals
- 是否支持 Base / BSC / ETH

### CTA 规范

每页至少两个 CTA：

1. 主 CTA：进入工具页或开始创建
2. 次 CTA：查看教程、查看成本、查看对比页

## 4.4 Head 与技术 SEO 规范

每个可索引页面必须输出：

- 唯一 title
- 唯一 meta description
- canonical
- hreflang
- Open Graph
- Twitter Card
- robots

### title 规范

- 控制在约 50 到 65 字符
- 核心关键词靠前
- 链名称保留
- 品牌词放末尾

示例：

- `Create ERC20 Token on Ethereum | Web3 Token`
- `Create BEP20 Token on BNB Smart Chain | Web3 Token`

### description 规范

- 120 到 160 字符
- 包含关键词、核心卖点、行动导向
- 不要堆砌关键词

### canonical 规范

- 所有主题 query 都 canonical 到主 URL
- 语言版本 canonical 指向本语言版本
- 仅在真正重复时合并 canonical，不要跨语言乱指

### hreflang 规范

当前已有：

- `en-us`
- `zh-cn`

所以每个公开页面都应输出：

- `hreflang="en-us"`
- `hreflang="zh-cn"`
- `hreflang="x-default"`

## 4.5 结构化数据规范

建议优先做 4 类 JSON-LD：

1. `BreadcrumbList`
2. `Organization`
3. `SoftwareApplication`
4. `Article` 或 `HowTo`

说明：

- Landing/tool 页适合 `SoftwareApplication`
- 教程页适合 `HowTo` 或 `Article`
- 所有内容页适合 `BreadcrumbList`
- 站点级适合 `Organization`

注意：

- 结构化数据必须与页面可见内容一致
- 不要给看不见的内容打结构化数据
- 不要伪造评分、评论、案例数据

## 4.6 Sitemap 与 Robots 规范

### sitemap

建议拆成：

- `sitemap-pages.xml`
- `sitemap-guides.xml`
- `sitemap-compare.xml`

不纳入 sitemap 的页面：

- `/internal/*`
- 纯主题变体 URL
- 临时活动页

### robots

至少明确：

- 允许公开内容抓取
- 屏蔽内部页与无价值参数页

## 4.7 内链规范

每个页面都必须承担“导流”职责。

### Landing 页必须链接到

- 对应链别教程页
- 成本页
- 对比页
- 工具页

### Guide 页必须链接到

- 对应 landing 页
- 对应工具页
- 2 到 4 篇相关 guide

### Compare 页必须链接到

- 两边各自 landing 页
- 最终推荐动作页

## 5. 当前项目最适合补充的页面内容

## 5.1 先把 `token-creation` 做成可排名页面

当前这个页面最接近商业核心页，应该优先增强。

建议新增以下静态模块，并保证在用户不连接钱包时也能完整渲染：

1. 链别简介
2. 适用场景
3. 创建步骤
4. 成本构成
5. 创建后要做什么
6. 常见问题
7. 相关教程入口

### 推荐内容结构

```text
H1: Create ERC20/BEP20 Token on {Chain}
  H2: What this token creator helps you do
  H2: Supported token standard on {Chain}
  H2: How to create a token in 4 steps
  H2: Token creation cost on {Chain}
  H2: What happens after token deployment
  H2: Frequently asked questions
  H2: Related guides
```

### 当前页面里最值得立即调整的点

- `TokenNextSteps` 现在只在成功后出现，建议改成“始终可见的静态教育模块”。
- 权限说明已经有基础，可扩展成“Capabilities + Limitations + After Launch Checklist”。
- 页面要增加链别对比信息，不能只替换链名变量。

## 5.2 每条链至少做 4 个核心页面

当前支持：

- BSC
- BSC Testnet
- Ethereum
- Base

其中真正值得做 SEO 的公开链建议优先：

- BSC
- Ethereum
- Base

测试网不建议作为自然流量主入口。

每条主链建议先做：

1. `create-token`
2. `how-to-create-token`
3. `create-token-cost`
4. `token-launch-checklist`

三条链第一阶段就是 12 个高相关页面。

## 5.3 建议新增的内容集群

### 集群 A：交易型

- create ERC20 token
- create BEP20 token
- Base token creator
- token creator no code
- token maker on Ethereum

### 集群 B：教程型

- how to create ERC20 token
- how to launch token on Base
- how to add liquidity after token creation
- how to list token in wallet

### 集群 C：成本型

- ERC20 token creation cost
- BEP20 token creation fee
- Base token launch budget

### 集群 D：对比型

- ERC20 vs BEP20
- Base vs Ethereum for token launch
- token creator vs custom smart contract

### 集群 E：准备与模板型

- token launch checklist
- tokenomics template
- token naming tips
- meme coin launch mistakes

## 5.4 内容不要只做“变量替换页”

如果 Ethereum、BSC、Base 三条链页面只是把链名换一下，会有两个问题：

1. 页面容易变薄。
2. 搜索引擎会认为差异度不够。

每条链页面都至少加入以下专属内容：

- 链的 gas 模式差异
- 常见钱包差异
- 区块浏览器差异
- 用户群和生态差异
- 上线后流动性路径差异

## 6. 建议的前端目录组织

在不脱离当前项目思路的前提下，建议把“业务逻辑”和“内容层”再拆清楚。

```text
src/
  app/
    router/
    providers/
  components/
    seo/
    content/
    layout/
    tool/
  config/
    chains.ts
    routes.ts
    seo.ts
  content/
    pages/
      en-us/
      zh-cn/
    guides/
      en-us/
      zh-cn/
    compare/
      en-us/
      zh-cn/
  features/
    marketing/
      pages/
      sections/
    tokenCreation/
      business/
      shared/
      pages/
```

说明：

- `features/tokenCreation/business` 继续保留链上业务逻辑。
- 内容文案不要继续只放在 `i18n/messages.ts` 里；长内容建议进入 `content/*`。
- `seo.ts` 只负责组装 meta，不负责持有大段正文。

## 7. 页面内容生产规范

## 7.1 每个可索引页的最小内容要求

- 至少 1 个 H1
- 至少 3 个 H2
- 至少 600 到 1200 字静态正文
- 至少 6 个站内链接
- 至少 1 个 CTA
- 至少 1 组结构化数据

工具页如果正文太薄，很难稳定拿自然排名。

## 7.2 标题与段落规范

- 一个页面只打一个主关键词
- 一个 H2 对应一个子意图
- 首段必须在 2 句内说清关键词和价值
- 避免大面积营销口号，优先解释具体问题

## 7.3 FAQ 写法规范

FAQ 必须来自用户真实疑问，而不是品牌自说自话。

优先模板：

- What is the cost to create a token on {Chain}?
- Do I need coding knowledge to create a token?
- Can I create a token and list it on a DEX later?
- What is the difference between ERC20 and BEP20?
- What do I need after token deployment?

## 7.4 图片与媒体规范

- logo、链图标、流程图使用稳定 URL
- 图片文件名带语义
- 必须有 alt
- 教程类页面可加流程图，但不要把关键信息只放在图里

## 8. 当前项目的实施优先级

## P0：两周内必须完成

1. 把 `project-acceptance` 标记为 `noindex`
2. 给公开页补 canonical、hreflang、robots
3. 给 `token-creation` 增加静态正文模块
4. 让 `theme` / `themeColor` 不参与索引
5. 生成 sitemap 和 robots

这是当前 ROI 最高的一组动作。

## P1：一个版本内完成

1. 新增链别 hub 页
2. 每条主链新增教程页和成本页
3. 增加 Breadcrumb、Organization、SoftwareApplication、HowTo/Article 结构化数据
4. 建立 `content/` 内容目录
5. 建立站内内链矩阵

## P2：中期升级

1. 从纯 `BrowserRouter` 模式升级到可预渲染的模式
2. 把 SEO 页做成静态预渲染
3. 工具区保留客户端钱包交互
4. 做 Search Console + 页面模板级数据复盘

## 9. 推荐的落地路径

### 路径 A：低改动版本

适合先验证方向：

- 保持现有项目结构
- 只补 head、内容块、sitemap、robots、FAQ、内链
- 新增少量公开内容页

优点：

- 改造成本低
- 上线快

缺点：

- SEO 上限有限
- 初始 HTML 仍偏薄

### 路径 B：推荐版本

- 升级路由到支持预渲染的模式
- 公开内容页做静态预渲染
- 工具页保留 CSR 交互能力
- 统一管理 meta、hreflang、structured data、sitemap

优点：

- 兼顾 SEO 与工具交互
- 更适合持续扩内容

缺点：

- 需要重构一部分路由层

## 10. 预期效果与衡量指标

不要只看收录数量，建议按以下指标判断：

1. 可索引页面数量
2. 非品牌词曝光量
3. 链别关键词点击量
4. guide 到 tool 的跳转率
5. token-creation 页的自然流量转化率

建议至少跟踪：

- `create token`
- `create ERC20 token`
- `create BEP20 token`
- `token creation cost`
- `how to create token`

## 11. 结合当前项目的结论

这套项目并不是不能做 SEO，问题不在“React 不行”，而在于当前站点只有工具页骨架，没有形成“可索引内容层”。

对当前项目最重要的判断是：

1. 路由里的 `lang` 和 `chain` 很适合做 SEO 页面矩阵。
2. 纯 `BrowserRouter + useEffect` 写 head 的方式，不适合作为长期 SEO 主架构。
3. `theme` / `themeColor` 应从索引维度里剥离。
4. `project-acceptance` 应转成内部页。
5. `token-creation` 应升级为“内容承接页 + 工具转化页”二合一页面。

## 12. 参考资料

- Google Search Central: JavaScript SEO Basics
  https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
- Google Search Central: Localized Versions / hreflang
  https://developers.google.com/search/docs/specialty/international/localized-versions
- Google Search Central: Canonicalization
  https://developers.google.com/search/docs/crawling-indexing/canonicalization
- Google Search Central: Structured Data Intro
  https://developers.google.com/search/docs/guides/intro-structured-data
- React Router Official Docs: Rendering Strategies
  https://reactrouter.com/start/framework/rendering
- React Router Official Docs: Pre-Rendering
  https://reactrouter.com/how-to/pre-rendering
