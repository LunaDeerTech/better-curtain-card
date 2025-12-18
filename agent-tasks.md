## Better Curtain Card

### AI Agent 开发任务总说明（Master Prompt）

你将开发一个 Home Assistant Lovelace 自定义卡片项目，项目名称为 **Better Curtain Card**。

该项目的目标不是重新设计 UI，而是在 **严格保持 Home Assistant 原生 Cover 卡片交互、样式与行为一致** 的前提下，对窗帘控制能力进行增强封装。

任何功能、交互或样式改动，必须满足以下硬性约束：

* 不破坏 Home Assistant Cover 实体的语义
* 不引入非原生视觉风格
* 在未配置增强项时，行为与原生卡片等价
* 所有增强逻辑必须可通过配置关闭或回退

---

## 全局技术约束（必须遵守）

* 使用 TypeScript
* 使用 Lit / LitElement
* 作为 Lovelace Custom Card 实现
* 使用 Home Assistant 官方前端组件（如 ha-slider、ha-icon-button）
* 不修改 Home Assistant 源码
* 不直接 fork 原生卡片代码，而是组合与复用

---

## Task 0：项目初始化与基础结构

### 目标

建立一个可构建、可加载的 Home Assistant 自定义卡片项目骨架。

### 输出物

* 项目目录结构
* 构建配置（Rollup 或 Vite）
* 可被 `resources:` 正确加载的 JS 文件

### 任务要求

1. 初始化 TypeScript 项目
2. 建立 `better-curtain-card.ts` 作为入口
3. 导出一个继承自 `LitElement` 的卡片类
4. 实现最小 `setConfig()`、`hass` setter、`render()` 方法
5. 注册为 `custom:better-curtain-card`

### 验收标准

* Home Assistant 能正常加载卡片
* 卡片在 UI 中不报错
* 尚未实现任何窗帘增强逻辑

---

## Task 1：单片窗帘卡片（原生等价模式）

### 目标

在 **无任何增强配置** 情况下，实现一个与官方 Cover 卡片行为一致的窗帘控制卡片。

### 输入配置

```yaml
type: custom:better-curtain-card
mode: single
entity: cover.xxx
```

### 任务要求

1. 仅支持 `cover` 实体
2. 渲染 open / close / stop 控件
3. 显示当前 position
4. 使用 Home Assistant 服务调用接口
5. 不引入方向或范围逻辑

### 验收标准

* 行为与官方 Cover 卡片一致
* position 显示与实体 state 同步
* 所有操作正确触发服务调用

---

## Task 2：单片窗帘 – 窗帘方向（Direction）

### 目标

支持通过配置控制窗帘 UI 的运动方向，并保持数值语义正确。

### 新增配置

```yaml
direction: up | down | left | right
```

### 任务要求

1. 默认方向为 `up`
2. `up / down` 使用纵向滑块
3. `left / right` 使用横向滑块
4. UI 方向变化不改变实体 position 语义
5. 内部统一使用 0–100 逻辑 position

### 关键约束

* 不直接修改 position 值
* 不直接修改 HA 内部组件源码
* 方向逻辑必须集中在中间映射层

### 验收标准

* UI 方向与配置一致
* 滑块数值变化符合用户直觉
* 实体 position 数据正确

---

## Task 3：单片窗帘 – 活动范围（Active Range）

### 目标

引入逻辑 position 与实体 position 的映射能力。

### 新增配置

```yaml
range:
  min: number  # 0–100
  max: number  # 0–100
```

### 任务要求

1. UI 仍然显示 0–100%
2. 实体 position 映射到 `[min, max]`
3. 实现双向映射函数：

   * UI → 实体
   * 实体 → UI
4. 对越界数据进行 clamp
5. 对非法配置（min >= max）给出错误提示

### 验收标准

* UI 调整符合配置映射
* 实体服务调用 position 正确
* 实体状态回显准确

---

## Task 4：双片窗帘卡片 – 实体建模

### 目标

支持左右两个窗帘实体的组合控制。

### 输入配置

```yaml
mode: double
left_entity: cover.left
right_entity: cover.right
```

### 任务要求

1. 校验两个实体均为 cover
2. 建立内部双实体状态模型
3. 支持实体 unavailable 状态
4. 不假设左右实体行为完全一致

### 验收标准

* 左右实体状态可独立读取
* 单侧异常不影响另一侧

---

## Task 5：双片窗帘 – 活动范围映射

### 目标

左右窗帘分别支持独立活动范围配置。

### 新增配置

```yaml
left_range:
  min: number
  max: number

right_range:
  min: number
  max: number
```

### 任务要求

1. 复用单片窗帘映射逻辑
2. 左右窗帘分别计算 position
3. 映射逻辑互不影响

### 验收标准

* 左右窗帘映射独立生效
* UI 显示逻辑一致

---

## Task 6：双片窗帘 – UI 与控制模式

### 目标

提供“整体控制 + 独立控制”双层交互。

### UI 结构要求

1. 整体控制区

   * open / close / stop
   * 或统一 position 控制
2. 左右独立控制区

   * 独立滑块或按钮
   * 清晰标识左右

### 任务要求

1. 整体控制调用左右实体服务
2. 独立控制仅影响对应实体
3. 状态不一致时显示 partial 状态

### 验收标准

* 整体与独立控制互不冲突
* 状态展示清晰、准确

---

## Task 7：配置校验与错误处理

### 目标

保证配置错误时卡片可诊断、可恢复。

### 任务要求

1. 校验 mode 合法性
2. 校验实体存在性
3. 校验 range 配置合理性
4. 在 UI 中给出错误提示，而非静默失败

### 验收标准

* 错误配置可被用户发现
* 不导致 Home Assistant 崩溃

---

## Task 8：文档与交付

### 目标

提供可使用、可理解、可维护的项目交付物。

### 输出内容

* README.md

  * 项目介绍
  * 安装方式
  * 单片 / 双片示例
  * 配置说明
* 示例 Lovelace YAML
* 构建说明

### 验收标准

* 新用户可独立完成部署
* 示例配置可直接运行

---

## 补充执行原则（必须遵守）

* 不自行增加未说明功能
* 不做“更好看”的视觉设计
* 不引入复杂动画
* 不假设窗帘设备行为一致


