import type { Ctx, RenderFn } from "trrn";
import { Button } from "../../components/ui/Button.tsx";
import { Card } from "../../components/ui/Card.tsx";
import { Badge } from "../../components/ui/Badge.tsx";

interface Plan {
  name: string;
  price: string;
  desc: string;
  features: string[];
  badge?: string;
  highlight?: boolean;
}

const plans: Plan[] = [
  {
    name: "开发者",
    price: "免费",
    desc: "适合个人使用和实验",
    features: ["核心框架", "社区支持", "GitHub Issues", "MIT 许可证"],
  },
  {
    name: "团队",
    price: "¥299",
    desc: "适合小型团队",
    features: ["核心框架", "优先邮件支持", "Slack 社区", "每月 2 次咨询", "MIT 许可证"],
    badge: "推荐",
    highlight: true,
  },
  {
    name: "企业",
    price: "¥999",
    desc: "适合规模化使用",
    features: ["核心框架", "专属技术支持", "定制开发", "SLA 保障", "培训服务", "MIT 许可证"],
  },
];

export function PricingPage(_: unknown, { update }: Ctx): RenderFn {
  let annual = false;

  return () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>
          定价方案
        </h1>
        <p style={{ fontSize: "16px", color: "#6b7280", marginBottom: "24px" }}>
          选择最适合你的方案，随时升级或降级
        </p>
        {/* 年付 / 月付切换 */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            padding: "4px",
            background: "#f3f4f6",
            borderRadius: "8px",
          }}
        >
          <button
            onClick={() => {
              annual = false;
              update();
            }}
            style={{
              padding: "8px 20px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              background: annual ? "transparent" : "#fff",
              color: annual ? "#6b7280" : "#111827",
              boxShadow: annual ? "none" : "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            月付
          </button>
          <button
            onClick={() => {
              annual = true;
              update();
            }}
            style={{
              padding: "8px 20px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 500,
              background: annual ? "#fff" : "transparent",
              color: annual ? "#111827" : "#6b7280",
              boxShadow: annual ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            年付
            <span style={{ color: "#16a34a", fontSize: "12px", marginLeft: "4px" }}>省 20%</span>
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        {plans.map((plan) => {
          const price =
            annual && plan.price !== "免费"
              ? `¥${Math.round(parseInt(plan.price) * 12 * 0.8)}`
              : plan.price;
          return (
            <div
              key={plan.name}
              style={{
                position: "relative",
                transform: plan.highlight ? "scale(1.05)" : "none",
              }}
            >
              {plan.badge !== undefined && (
                <div
                  style={{
                    position: "absolute",
                    top: "-12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 1,
                  }}
                >
                  <Badge label={plan.badge} variant="success" />
                </div>
              )}
              <Card
                style={{
                  border: plan.highlight ? "2px solid #6366f1" : "1px solid #e5e7eb",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: "18px", color: "#111827" }}>
                    {plan.name}
                  </h3>
                  <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#6b7280" }}>
                    {plan.desc}
                  </p>
                  <div style={{ marginBottom: "20px" }}>
                    <span style={{ fontSize: "36px", fontWeight: 700, color: "#111827" }}>
                      {annual ? `${price}` : plan.price}
                    </span>
                    <span style={{ fontSize: "14px", color: "#6b7280" }}>
                      {plan.price === "免费" ? "" : annual ? "/年" : "/月"}
                    </span>
                  </div>
                  <Button variant={plan.highlight ? "primary" : "secondary"} onClick={() => {}}>
                    开始使用
                  </Button>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "24px 0 0" }}>
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        padding: "6px 0",
                        color: "#374151",
                        fontSize: "14px",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      ✓ {f}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
