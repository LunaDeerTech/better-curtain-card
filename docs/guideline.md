# Better Curtain Card 设计与实现方案

### 一、项目背景与总体目标

Better Curtain Card 的定位并非“重新设计窗帘交互”，而是在 **完全复用 Home Assistant 原生 Cover 卡片设计语言与核心行为** 的基础上，对窗帘类实体进行更精细、更符合真实物理结构的增强封装。

项目核心目标包括三点：
第一，解决原生卡片无法表达窗帘方向（上下 / 左右）的问题，使 UI 的交互方向与真实窗帘运动方向一致；
第二，引入“活动范围映射”能力，使逻辑 0–100% 与设备可动区间解耦，适配半开、限位、非满幅轨道等实际安装场景；
第三，通过双片窗帘卡片，统一管理左右窗帘的联动与独立控制，避免用户自行拼装多个卡片导致的体验割裂。

---

### 二、技术选型与整体架构

项目建议采用 **Home Assistant Lovelace 自定义卡片** 标准技术路线，使用 **TypeScript + Lit（LitElement）** 作为实现基础，完全遵循官方前端规范。

整体结构建议拆分为三层：

* **Card Presentation Layer（UI 层）**
  负责渲染单片 / 双片窗帘卡片，控制滑块、按钮、状态展示等。
  尽量复用 Home Assistant 内部组件（如 ha-cover-controls、ha-slider、ha-icon-button），避免自定义样式偏离原生体验。

* **Behavior & Mapping Layer（逻辑层）**
  负责窗帘方向适配、活动范围映射、双窗帘联动计算等核心逻辑，是本项目的技术重点。

* **Config & Schema Layer（配置层）**
  定义 YAML / UI 编辑器配置结构，提供默认值、校验规则以及向后兼容能力。

---

### 三、单片窗帘卡片设计方案

#### 1. 实体与基础行为

单片窗帘卡片仅绑定一个 `cover` 实体，必须支持 Home Assistant 原生 cover 服务与状态，包括但不限于：

* `open_cover`
* `close_cover`
* `stop_cover`
* `set_cover_position`
* `current_position`

在未启用任何增强配置的情况下，其表现应与官方 Cover 卡片完全一致，作为基线行为。

---

#### 2. 窗帘方向配置（Direction）

**配置项定义：**

```yaml
direction: up | down | left | right
```

默认值建议为 `up`，以保持与原生纵向滑块一致。

**方向对 UI 的影响：**

* `up / down`
  使用纵向滑块，数值变化方向与视觉方向严格一致。
* `left / right`
  使用横向滑块，滑块增长方向需根据方向进行反转。

**实现要点：**

* UI 层仅关心“显示方向”，不直接使用实体 position；
* 所有 position 值先经过逻辑层的方向映射再传入 UI；
* 避免直接修改 Home Assistant 内部组件，而是通过参数或 CSS 变量实现方向适配。

---

#### 3. 窗帘活动范围（Active Range）

**配置项定义：**

```yaml
range:
  min: 0    # 默认 0
  max: 100  # 默认 100
```

**核心设计思想：**

用户在 UI 上看到和操作的始终是 **逻辑 0–100%**，而实际发送给设备的 position 会被映射到 `[min, max]` 区间。

**映射公式：**

* UI → 实体：

  ```
  real = min + ui * (max - min) / 100
  ```

* 实体 → UI：

  ```
  ui = (real - min) * 100 / (max - min)
  ```

**边界处理策略：**

* UI 输入始终限制在 0–100；
* 若实体返回 position 超出配置范围，需进行 clamp；
* 当 `min >= max` 时，卡片应进入 error 状态并提示配置错误。

---

### 四、双片窗帘卡片设计方案

#### 1. 实体模型

双片窗帘卡片绑定两个 `cover` 实体：

```yaml
left_entity: cover.curtain_left
right_entity: cover.curtain_right
```

逻辑上将其视为一个组合实体，但保留完全独立的控制能力。

---

#### 2. 活动范围配置

左右窗帘分别支持独立活动范围配置：

```yaml
left_range:
  min: 10
  max: 90

right_range:
  min: 20
  max: 80
```

映射逻辑与单片窗帘完全一致，但需分别计算。

---

#### 3. UI 与交互模式设计

双片窗帘卡片建议包含三种交互层级：

**整体控制区**

* 一个“合并滑块”或“开 / 关 / 停”按钮组；
* 调整时按统一逻辑控制左右窗帘；
* 适用于日常快速操作。

**左右独立控制区**

* 左右窗帘各自独立的滑块；
* 明确标识（Left / Right 或图形化窗帘示意）；
* 适用于精细调整。

**状态展示区**

* 显示左右窗帘当前实际 position（映射后 UI 值）；
* 当左右状态不一致时，整体状态应显示为 `partial`。

---

#### 4. 联动控制逻辑

当用户使用整体控制时：

* 若设置 position，则左右窗帘分别计算各自的实际 position；
* 若执行 open / close，则分别调用左右实体服务；
* 若某一实体 unavailable，不阻断另一侧操作，但需提示状态异常。

---

### 五、配置结构与编辑体验

#### 1. YAML 配置示例

```yaml
type: custom:better-curtain-card
mode: double
direction: left
left_entity: cover.left
right_entity: cover.right
left_range:
  min: 15
  max: 85
right_range:
  min: 20
  max: 80
```

单片模式：

```yaml
type: custom:better-curtain-card
mode: single
entity: cover.bedroom
direction: up
range:
  min: 10
  max: 90
```

---

#### 2. 可视化编辑器（可选阶段）

建议作为第二阶段目标，实现 `setConfig()` + `configElement`，提供：

* 下拉选择方向；
* 百分比输入范围；
* 实体选择器；
* 实时校验提示。

---

### 六、开发阶段拆解（建议）

第一阶段重点在功能可用性与一致性，第二阶段再考虑编辑体验与细节打磨。

**阶段一：基础能力**

* 单片窗帘卡片
* 方向适配
* 活动范围映射
* YAML 配置支持

**阶段二：双片窗帘**

* 双实体绑定
* 独立 / 联动控制逻辑
* 状态一致性处理

**阶段三：体验增强**

* UI 编辑器
* 错误提示与 fallback
* 文档与示例

---

### 七、质量与一致性要求

* 禁止修改 Home Assistant 核心行为语义；
* 禁止引入非必要视觉风格；
* 所有增强必须可关闭并回退到原生行为；
* 在 HA 更新时，优先保证兼容性而非自定义特性。

---

### 八、交付物清单（供 AI Agent 执行）

* 项目结构与构建配置（Vite / Rollup）
* 单片窗帘卡片完整实现
* 双片窗帘卡片完整实现
* 类型定义与配置 Schema
* README（安装、配置、示例）
* 最少一个 demo Lovelace 配置

