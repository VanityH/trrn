import { defineComponent } from "trrn";
import type { Ctx } from "trrn";
import { h } from "preact";
import { ErrorBoundary } from "trrn";
import type { ErrorBoundaryProps } from "trrn";
import { Card } from "../../components/ui/Card.tsx";
import { FormField } from "../../components/ui/FormField.tsx";
import { Button } from "../../components/ui/Button.tsx";

// ── Form data types ────────────────

interface FormData {
  name: string;
  email: string;
  department: string;
  title: string;
  description: string;
  priority: string;
  startDate: string;
  endDate: string;
  notifyViaEmail: boolean;
  notifyViaSMS: boolean;
}

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  department: "",
  title: "",
  description: "",
  priority: "medium",
  startDate: "",
  endDate: "",
  notifyViaEmail: true,
  notifyViaSMS: false,
};

// ── Risky step (wrapped in ErrorBoundary) ──

const RiskyStep = defineComponent<object>(function (_, __: Ctx) {
  let renderCount = 0;

  return () => {
    renderCount++;
    if (renderCount > 5) {
      throw new Error("模拟错误：步骤渲染超过 5 次限制");
    }
    return (
      <div>
        <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "16px" }}>
          这是一个模拟不稳定组件的步骤，渲染超过 5 次会触发错误边界。
        </p>
        <p style={{ fontSize: "13px", color: "#9ca3af" }}>当前渲染次数: {renderCount}</p>
      </div>
    );
  };
});

// ── WizardFormPage ─────────────────

type StepId = 1 | 2 | 3 | 4;

const STEPS: { id: StepId; label: string }[] = [
  { id: 1, label: "基本信息" },
  { id: 2, label: "任务详情" },
  { id: 3, label: "不稳定步骤" },
  { id: 4, label: "确认提交" },
];

export const WizardFormPage = defineComponent<object>(function (_, { update }: Ctx) {
  let currentStep: StepId = 1;
  let form: FormData = { ...INITIAL_FORM };
  let errors: Partial<Record<keyof FormData, string>> = {};
  let submitted = false;
  let errorKey = 0; // key for ErrorBoundary reset

  function validateStep(): boolean {
    errors = {};
    if (currentStep === 1) {
      if (!form.name.trim()) errors.name = "请输入姓名";
      if (!form.email.trim()) errors.email = "请输入邮箱";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "邮箱格式不正确";
      if (!form.department.trim()) errors.department = "请选择部门";
    } else if (currentStep === 2) {
      if (!form.title.trim()) errors.title = "请输入任务标题";
      if (!form.description.trim()) errors.description = "请输入任务描述";
    }
    update();
    return Object.keys(errors).length === 0;
  }

  function setField(field: keyof FormData, value: string | boolean) {
    form = { ...form, [field]: value };
    delete errors[field];
    update();
  }

  function next() {
    if (!validateStep()) return;
    if (currentStep === 4) {
      submitted = true;
      update();
      return;
    }
    currentStep = (currentStep + 1) as StepId;
    update();
  }

  function prev() {
    if (currentStep === 1) return;
    currentStep = (currentStep - 1) as StepId;
    errorKey++;
    update();
  }

  const inputStyle: Record<string, string> = {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    boxSizing: "border-box",
  };
  const selectStyle = { ...inputStyle };

  return () => {
    if (submitted) {
      return (
        <Card title="提交成功">
          <div style={{ textAlign: "center", padding: "20px" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
            <div
              style={{ fontSize: "16px", fontWeight: 600, color: "#166534", marginBottom: "8px" }}
            >
              任务申请已提交
            </div>
            <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "20px" }}>
              我们将尽快处理您的申请
            </div>
            <Button
              onClick={() => {
                form = { ...INITIAL_FORM };
                currentStep = 1;
                submitted = false;
                update();
              }}
            >
              重新填写
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <div>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: 600,
                  background:
                    s.id === currentStep ? "#6366f1" : s.id < currentStep ? "#10b981" : "#e5e7eb",
                  color: s.id <= currentStep ? "#fff" : "#9ca3af",
                }}
              >
                {s.id < currentStep ? "✓" : s.id}
              </div>
              <span
                style={{
                  marginLeft: "8px",
                  fontSize: "13px",
                  color: s.id === currentStep ? "#111827" : "#9ca3af",
                  fontWeight: s.id === currentStep ? 600 : 400,
                }}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: "1px", background: "#e5e7eb", margin: "0 12px" }} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <Card>
          {currentStep !== 3 ? (
            renderFormStep(currentStep, form, errors, setField, inputStyle, selectStyle)
          ) : (
            <ErrorBoundary
              key={errorKey}
              fallback={
                ((err: Error, _reset: () => void) =>
                  h(
                    "div",
                    { style: { textAlign: "center", padding: "20px" } },
                    h("div", { style: { fontSize: "32px", marginBottom: "8px" } }, "⚠️"),
                    h(
                      "div",
                      { style: { fontSize: "14px", color: "#ef4444", marginBottom: "12px" } },
                      err.message,
                    ),
                    h(
                      Button,
                      {
                        onClick: () => {
                          errorKey++;
                          update();
                        },
                      },
                      "重试",
                    ),
                  )) as ErrorBoundaryProps["fallback"]
              }
            >
              <RiskyStep />
            </ErrorBoundary>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
              paddingTop: "16px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <Button variant="secondary" onClick={prev} disabled={currentStep === 1}>
              上一步
            </Button>
            <Button onClick={next}>{currentStep === 4 ? "提交" : "下一步"}</Button>
          </div>
        </Card>
      </div>
    );
  };
});

// ── Step rendering helpers ──────────

interface SetField {
  (field: keyof FormData, value: string | boolean): void;
}

function renderFormStep(
  step: number,
  form: FormData,
  errors: Partial<Record<keyof FormData, string>>,
  setField: SetField,
  inputStyle: Record<string, string>,
  selectStyle: Record<string, string>,
) {
  switch (step) {
    case 1:
      return (
        <div>
          <FormField label="姓名" required error={errors.name}>
            <input
              value={form.name}
              onInput={(e) => setField("name", (e.target as HTMLInputElement).value)}
              {...({ style: inputStyle } as any)}
            />
          </FormField>
          <FormField label="邮箱" required error={errors.email}>
            <input
              type="email"
              value={form.email}
              onInput={(e) => setField("email", (e.target as HTMLInputElement).value)}
              {...({ style: inputStyle } as any)}
            />
          </FormField>
          <FormField label="部门" required error={errors.department}>
            <select
              value={form.department}
              onChange={(e) => setField("department", (e.target as HTMLSelectElement).value)}
              {...({ style: selectStyle } as any)}
            >
              <option value="">请选择部门</option>
              <option value="engineering">工程部</option>
              <option value="design">设计部</option>
              <option value="product">产品部</option>
            </select>
          </FormField>
        </div>
      );

    case 2:
      return (
        <div>
          <FormField label="任务标题" required error={errors.title}>
            <input
              value={form.title}
              onInput={(e) => setField("title", (e.target as HTMLInputElement).value)}
              {...({ style: inputStyle } as any)}
            />
          </FormField>
          <FormField label="任务描述" required error={errors.description}>
            <textarea
              value={form.description}
              onInput={(e) => setField("description", (e.target as HTMLTextAreaElement).value)}
              {...({ style: { ...inputStyle, minHeight: "80px", resize: "vertical" } } as any)}
            />
          </FormField>
          <FormField label="优先级">
            <select
              value={form.priority}
              onChange={(e) => setField("priority", (e.target as HTMLSelectElement).value)}
              {...({ style: selectStyle } as any)}
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="urgent">紧急</option>
            </select>
          </FormField>
          <div style={{ display: "flex", gap: "16px" }}>
            <FormField label="开始日期">
              <input
                type="date"
                value={form.startDate}
                onInput={(e) => setField("startDate", (e.target as HTMLInputElement).value)}
                {...({ style: selectStyle } as any)}
              />
            </FormField>
            <FormField label="结束日期">
              <input
                type="date"
                value={form.endDate}
                onInput={(e) => setField("endDate", (e.target as HTMLInputElement).value)}
                {...({ style: selectStyle } as any)}
              />
            </FormField>
          </div>
        </div>
      );

    case 4:
      return (
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px", color: "#111827" }}>
            请确认以下信息
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              fontSize: "14px",
            }}
          >
            {[
              ["姓名", form.name],
              ["邮箱", form.email],
              ["部门", form.department],
              ["任务标题", form.title],
              ["优先级", form.priority],
              ["开始日期", form.startDate || "未设置"],
              ["结束日期", form.endDate || "未设置"],
              ["邮件通知", form.notifyViaEmail ? "是" : "否"],
              ["短信通知", form.notifyViaSMS ? "是" : "否"],
            ].map(([label, value]) => (
              <div key={label as string}>
                <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "2px" }}>
                  {label as string}
                </div>
                <div style={{ fontWeight: 500 }}>{value as string}</div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
