/**
 * 多步骤表单向导 — 展示 trrn 跨步骤闭包状态持久化
 *
 * 核心模式:
 * - 闭包持有完整表单数据，跨步骤持久化（无需全局 store）
 * - ErrorBoundary 包裹每个步骤，捕获渲染错误
 * - 显式 TRRN_MARKER 标记组件
 * - action() 辅助函数包装提交处理器
 * - 步骤间数据共享和验证
 * - 动态表单字段（条件渲染）
 * - 进度指示器
 */
import type { Ctx, RenderFn } from "trrn";
import { action, ErrorBoundary } from "trrn";
import { TRRN_MARKER } from "trrn";
import { Card } from "../../components/ui/Card.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { FormField } from "../../components/ui/FormField.tsx";

// ── 表单数据类型 ───────────────────────────────────────────────

interface WizardData {
  // Step 1: 基础信息
  projectName: string;
  projectDesc: string;
  teamSize: number;
  // Step 2: 技术选型
  framework: "react" | "vue" | "trrn" | "svelte";
  features: string[];
  deployment: "cloud" | "self-hosted" | "hybrid";
  // Step 3: 预算
  budget: number;
  timeline: "1month" | "3months" | "6months" | "flexible";
  priority: "speed" | "quality" | "cost";
  // Step 4: 确认（无额外字段）
}

const emptyForm: WizardData = {
  projectName: "",
  projectDesc: "",
  teamSize: 1,
  framework: "trrn",
  features: [],
  deployment: "cloud",
  budget: 10000,
  timeline: "3months",
  priority: "quality",
};

// ── 步骤配置 ───────────────────────────────────────────────────

interface StepDef {
  title: string;
  subtitle: string;
  icon: string;
}

const STEPS: StepDef[] = [
  { title: "基础信息", subtitle: "项目概况", icon: "📋" },
  { title: "技术选型", subtitle: "技术栈选择", icon: "⚙️" },
  { title: "预算规划", subtitle: "资源和时间", icon: "💰" },
  { title: "确认提交", subtitle: "最终审核", icon: "✅" },
];

// ── 显式 TRRN_MARKER 标记的步骤容器组件 ────────────────────────

function StepContainer({ children, step }: { children?: any; step: number }, _ctx: Ctx): RenderFn {
  return () => (
    <div style={{ minHeight: "300px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 4px", fontSize: "18px", color: "#111827" }}>
          {STEPS[step].icon} {STEPS[step].title}
        </h3>
        <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>{STEPS[step].subtitle}</p>
      </div>
      {children}
    </div>
  );
}

// 显式标记为 trrn 组件（演示 TRRN_MARKER 用法）
(StepContainer as any)[TRRN_MARKER] = true;

// ── 步骤 1：基础信息 ───────────────────────────────────────────

function StepBasicInfo(
  {
    data,
    errors,
    onChange,
  }: {
    data: WizardData;
    errors: Partial<Record<keyof WizardData, string>>;
    onChange: (patch: Partial<WizardData>) => void;
  },
  _ctx: Ctx,
): RenderFn {
  return () => (
    <StepContainer step={0}>
      <FormField label="项目名称" error={errors.projectName}>
        <input
          value={data.projectName}
          onInput={(e: any) => onChange({ projectName: e.target.value })}
          placeholder="输入你的项目名称"
          style={inputStyle}
        />
      </FormField>
      <FormField label="项目描述" error={errors.projectDesc}>
        <textarea
          value={data.projectDesc}
          onInput={(e: any) => onChange({ projectDesc: e.target.value })}
          placeholder="简单描述这个项目..."
          rows={3}
          style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
        />
      </FormField>
      <FormField label="团队规模" error={errors.teamSize}>
        <input
          type="number"
          value={String(data.teamSize)}
          onInput={(e: any) => onChange({ teamSize: Math.max(1, Number(e.target.value) || 1) })}
          min={1}
          style={inputStyle}
        />
      </FormField>
    </StepContainer>
  );
}

// ── 步骤 2：技术选型 ───────────────────────────────────────────

const ALL_FEATURES = ["TypeScript", "单元测试", "SSR", "PWA", "国际化", "主题系统"];

function StepTechStack(
  {
    data,
    errors,
    onChange,
  }: {
    data: WizardData;
    errors: Partial<Record<keyof WizardData, string>>;
    onChange: (patch: Partial<WizardData>) => void;
  },
  _ctx: Ctx,
): RenderFn {
  return () => (
    <StepContainer step={1}>
      <FormField label="主要框架" error={errors.framework}>
        <div style={{ display: "flex", gap: "8px" }}>
          {(["react", "vue", "trrn", "svelte"] as const).map((f) => (
            <button
              key={f}
              onClick={() => onChange({ framework: f })}
              style={{
                padding: "8px 16px",
                border: data.framework === f ? "2px solid #6366f1" : "1px solid #d1d5db",
                borderRadius: "8px",
                background: data.framework === f ? "#eef2ff" : "#fff",
                color: data.framework === f ? "#4338ca" : "#374151",
                cursor: "pointer",
                fontWeight: data.framework === f ? 600 : 400,
                fontSize: "14px",
                transition: "all 0.15s",
              }}
            >
              {f === "trrn" ? "🔥 trrn" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="所需功能" error={errors.features}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {ALL_FEATURES.map((f) => {
            const active = data.features.includes(f);
            return (
              <label
                key={f}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background: active ? "#eef2ff" : "#fff",
                  fontSize: "13px",
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => {
                    onChange({
                      features: active
                        ? data.features.filter((x) => x !== f)
                        : [...data.features, f],
                    });
                  }}
                  style={{ accentColor: "#6366f1" }}
                />
                {f}
              </label>
            );
          })}
        </div>
      </FormField>

      <FormField label="部署方式">
        <select
          value={data.deployment}
          onChange={(e: any) => onChange({ deployment: e.target.value })}
          style={selectStyle}
        >
          <option value="cloud">云托管</option>
          <option value="self-hosted">自建服务器</option>
          <option value="hybrid">混合部署</option>
        </select>
      </FormField>

      {/* 条件渲染：根据 framework 显示额外提示 */}
      {data.framework === "trrn" && (
        <div
          style={{
            padding: "10px 14px",
            background: "#fef3c7",
            borderRadius: "6px",
            fontSize: "13px",
            color: "#92400e",
          }}
        >
          💡 trrn 当前为实验性框架，建议搭配闭包状态管理体验最佳
        </div>
      )}
    </StepContainer>
  );
}

// ── 步骤 3：预算和时间 ─────────────────────────────────────────

function StepBudget(
  {
    data,
    errors,
    onChange,
  }: {
    data: WizardData;
    errors: Partial<Record<keyof WizardData, string>>;
    onChange: (patch: Partial<WizardData>) => void;
  },
  _ctx: Ctx,
): RenderFn {
  return () => (
    <StepContainer step={2}>
      <FormField label="预算 (¥)" error={errors.budget}>
        <input
          type="range"
          min={5000}
          max={100000}
          step={5000}
          value={data.budget}
          onInput={(e: any) => onChange({ budget: Number(e.target.value) })}
          style={{ width: "100%" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "13px",
            color: "#6b7280",
          }}
        >
          <span>¥5,000</span>
          <strong style={{ color: "#6366f1", fontSize: "16px" }}>
            ¥{data.budget.toLocaleString()}
          </strong>
          <span>¥100,000</span>
        </div>
      </FormField>

      <FormField label="时间线">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {(
            [
              { value: "1month", label: "1 个月" },
              { value: "3months", label: "3 个月" },
              { value: "6months", label: "6 个月" },
              { value: "flexible", label: "时间灵活" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ timeline: opt.value as any })}
              style={{
                padding: "10px",
                border: data.timeline === opt.value ? "2px solid #6366f1" : "1px solid #d1d5db",
                borderRadius: "8px",
                background: data.timeline === opt.value ? "#eef2ff" : "#fff",
                color: data.timeline === opt.value ? "#4338ca" : "#374151",
                cursor: "pointer",
                fontWeight: data.timeline === opt.value ? 600 : 400,
                fontSize: "13px",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="优先级">
        <div style={{ display: "flex", gap: "8px" }}>
          {(
            [
              { value: "speed", label: "⏱ 速度优先" },
              { value: "quality", label: "✨ 质量优先" },
              { value: "cost", label: "💰 成本优先" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ priority: opt.value as any })}
              style={{
                flex: 1,
                padding: "10px",
                border: data.priority === opt.value ? "2px solid #6366f1" : "1px solid #d1d5db",
                borderRadius: "8px",
                background: data.priority === opt.value ? "#eef2ff" : "#fff",
                color: data.priority === opt.value ? "#4338ca" : "#374151",
                cursor: "pointer",
                fontWeight: data.priority === opt.value ? 600 : 400,
                fontSize: "13px",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FormField>
    </StepContainer>
  );
}

// ── 步骤 4：确认和提交 ─────────────────────────────────────────

function StepReview(
  { data, submitted }: { data: WizardData; submitted: boolean },
  _ctx: Ctx,
): RenderFn {
  return () => {
    if (submitted) {
      return (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
          <h3 style={{ margin: "0 0 8px", color: "#16a34a" }}>提交成功！</h3>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            你的项目 <strong>{data.projectName}</strong> 已成功创建。
          </p>
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              background: "#f0fdf4",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#166534",
            }}
          >
            💡 这是 trrn 闭包状态的完整演示——所有步骤的数据都保存在一个闭包变量中， 从未使用
            useState 或任何状态管理库。
          </div>
        </div>
      );
    }

    return (
      <StepContainer step={3}>
        <Card>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <tbody>
              {[
                { label: "项目名称", value: data.projectName },
                { label: "描述", value: data.projectDesc || "（未填写）" },
                { label: "团队规模", value: `${data.teamSize} 人` },
                { label: "框架", value: data.framework },
                {
                  label: "功能",
                  value: data.features.length > 0 ? data.features.join(", ") : "（未选择）",
                },
                {
                  label: "部署",
                  value:
                    data.deployment === "cloud"
                      ? "云托管"
                      : data.deployment === "self-hosted"
                        ? "自建"
                        : "混合",
                },
                { label: "预算", value: `¥${data.budget.toLocaleString()}` },
                {
                  label: "时间线",
                  value:
                    data.timeline === "1month"
                      ? "1个月"
                      : data.timeline === "3months"
                        ? "3个月"
                        : data.timeline === "6months"
                          ? "6个月"
                          : "灵活",
                },
                {
                  label: "优先级",
                  value:
                    data.priority === "speed"
                      ? "速度"
                      : data.priority === "quality"
                        ? "质量"
                        : "成本",
                },
              ].map(({ label, value }) => (
                <tr key={label} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 12px", color: "#6b7280", width: "100px" }}>{label}</td>
                  <td style={{ padding: "8px 12px", fontWeight: 500 }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </StepContainer>
    );
  };
}

// ── 错误回退函数（演示 ErrorBoundary 在表单中的使用） ───────────

function StepFallback(error: Error, reset: () => void): any {
  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <p style={{ color: "#dc2626", fontSize: "14px", marginBottom: "12px" }}>
        步骤渲染出错: {error.message}
      </p>
      <Button variant="primary" onClick={reset}>
        重试此步骤
      </Button>
    </div>
  );
}

// ── 样式 ───────────────────────────────────────────────────────

const inputStyle: Record<string, string> = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "14px",
  boxSizing: "border-box",
};

const selectStyle: Record<string, string> = {
  ...inputStyle,
  background: "#fff",
};

// ── 主页面 ─────────────────────────────────────────────────────

export function WizardFormPage(_: unknown, { update }: Ctx): RenderFn {
  // ── 所有状态在闭包中 ────────────────────────
  let step = 0;
  let formData: WizardData = { ...emptyForm };
  let errors: Partial<Record<keyof WizardData, string>> = {};
  let submitted = false;

  // ── 验证当前步骤 ─────────────────────────────
  const validateStep = (): boolean => {
    errors = {};
    if (step === 0) {
      if (!formData.projectName.trim()) errors.projectName = "项目名称为必填";
      if (formData.projectName.trim().length < 2) errors.projectName = "项目名称至少 2 个字符";
      if (formData.teamSize < 1) errors.teamSize = "至少需要 1 人";
    }
    if (step === 1) {
      if (formData.features.length === 0) errors.features = "请至少选择一个功能";
    }
    if (step === 2) {
      if (formData.budget < 5000) errors.budget = "预算至少 ¥5,000";
    }
    return Object.keys(errors).length === 0;
  };

  // ── 使用 action() 包装的导航操作 ─────────────
  const goNext = () => {
    if (validateStep()) {
      step = Math.min(step + 1, 3);
      errors = {};
      update();
    } else {
      update();
    }
  };

  const goBack = () => {
    step = Math.max(step - 1, 0);
    errors = {};
    update();
  };

  // action() 包装提交
  const handleSubmit = action(update as any, () => {
    if (!validateStep()) return;
    submitted = true;
  });

  const handleChange = (patch: Partial<WizardData>) => {
    formData = { ...formData, ...patch };
    // 实时清除当前字段错误
    for (const key of Object.keys(patch)) {
      if (errors[key as keyof WizardData]) {
        errors = { ...errors };
        delete errors[key as keyof WizardData];
      }
    }
    update();
  };

  const handleReset = () => {
    step = 0;
    formData = { ...emptyForm };
    errors = {};
    submitted = false;
    update();
  };

  return () => (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: 600, color: "#111827" }}>
          项目创建向导
        </h2>
        <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
          所有表单数据通过闭包状态管理 — 无需全局 store，跨步骤自动持久化
        </p>
      </div>

      {/* 进度指示器 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "28px",
          padding: "16px",
          background: "#f9fafb",
          borderRadius: "10px",
        }}
      >
        {STEPS.map((s, i) => (
          <div key={s.title} style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                opacity: i <= step ? 1 : 0.4,
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: i < step ? "#16a34a" : i === step ? "#6366f1" : "#e5e7eb",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 600,
                  transition: "all 0.3s",
                }}
              >
                {i < step ? "✓" : s.icon}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: i === step ? "#6366f1" : "#374151",
                  }}
                >
                  {s.title}
                </div>
                <div style={{ fontSize: "11px", color: "#9ca3af" }}>{s.subtitle}</div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: "2px",
                  margin: "0 16px",
                  background: i < step ? "#16a34a" : "#e5e7eb",
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* 当前步骤内容（ErrorBoundary 包裹） */}
      <Card>
        <ErrorBoundary fallback={StepFallback}>
          {step === 0 && <StepBasicInfo data={formData} errors={errors} onChange={handleChange} />}
          {step === 1 && <StepTechStack data={formData} errors={errors} onChange={handleChange} />}
          {step === 2 && <StepBudget data={formData} errors={errors} onChange={handleChange} />}
          {step === 3 && <StepReview data={formData} submitted={submitted} />}
        </ErrorBoundary>
      </Card>

      {/* 操作按钮 */}
      {!submitted && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
          <div>
            {step > 0 && (
              <Button variant="secondary" onClick={goBack}>
                上一步
              </Button>
            )}
          </div>
          <div>
            {step < 3 ? (
              <Button variant="primary" onClick={goNext}>
                {step === 2 ? "查看确认" : "下一步 →"}
              </Button>
            ) : (
              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="secondary" onClick={goBack}>
                  返回修改
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                  提交项目
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 重置按钮 */}
      {submitted && (
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Button variant="secondary" onClick={handleReset}>
            创建新项目
          </Button>
        </div>
      )}

      {/* 闭包状态调试面板 */}
      <Card title="闭包状态（Debug）" style={{ marginTop: "16px" }}>
        <pre style={{ margin: 0, fontSize: "12px", color: "#6b7280", whiteSpace: "pre-wrap" }}>
          {JSON.stringify({ step, submitted, errors: Object.keys(errors) }, null, 2)}
        </pre>
        <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#9ca3af" }}>
          ↑ 所有数据存储在 trrn 闭包中 — 不是 React state，不是 Vue reactive，就是普通的 JavaScript
          变量
        </p>
      </Card>
    </div>
  );
}
