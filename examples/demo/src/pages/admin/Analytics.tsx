/**
 * 实时分析面板 — 展示 trrn 高级生命周期管理
 *
 * 核心模式:
 * - onMount/onUnmount: 多个模拟数据流的启停和清理
 * - action(ctx, fn): 使用 action 辅助函数自动 update
 * - 闭包数组: 维护历史数据时间序列，计算聚合指标
 * - ctx.update(newProps): 向下传递实时数据给子组件
 * - 多层嵌套组件组合
 */
import type { Ctx, RenderFn } from "trrn";
import { action } from "trrn";
import { Card } from "../../components/ui/Card.tsx";
import { Button } from "../../components/ui/Button.tsx";

// ── 工具函数 ───────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── 实时指标卡片（子组件，接收 update(newProps) 推送） ──────────

function MetricCard(
  { label, color, format }: { label: string; color: string; format?: (v: number) => string },
  _ctx: Ctx,
): RenderFn {
  let value = 0;
  let trend: "up" | "down" | "stable" = "stable";
  let history: number[] = [];

  // 父组件通过 update(newProps) 传入新数据
  const renderFn = (props: Record<string, unknown> | undefined) => {
    if (props !== undefined) {
      value = (props as any).value ?? value;
      trend = (props as any).trend ?? trend;
      history = (props as any).history ?? history;
    }

    const fmt = format ?? String;
    const trendColor = trend === "up" ? "#16a34a" : trend === "down" ? "#dc2626" : "#6b7280";
    const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "→";

    return (
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            margin: "0 0 4px",
            fontSize: "12px",
            color: "#6b7280",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </p>
        <p style={{ margin: "0 0 2px", fontSize: "32px", fontWeight: 700, color }}>{fmt(value)}</p>
        <p style={{ margin: 0, fontSize: "12px", color: trendColor }}>
          {trendIcon} {trend === "stable" ? "持平" : trend === "up" ? "上升" : "下降"}
        </p>
        {/* 迷你走势图（纯 CSS） */}
        {history.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: "2px",
              alignItems: "flex-end",
              height: "24px",
              marginTop: "8px",
              justifyContent: "center",
            }}
          >
            {history.slice(-20).map((v, i) => {
              const max = Math.max(...history.slice(-20), 1);
              const pct = (v / max) * 100;
              return (
                <div
                  key={i}
                  style={{
                    width: "6px",
                    height: `${Math.max(pct, 4)}%`,
                    background: color,
                    borderRadius: "2px 2px 0 0",
                    opacity: 0.7,
                    transition: "height 0.3s ease",
                  }}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  };
  return renderFn;
}

// ── 实时数据流（模拟 WebSocket） ────────────────────────────────

interface StreamState {
  visitors: number;
  sales: number;
  errors: number;
  responseTime: number;
  activeUsers: number;
}

function generateSnapshot(prev: StreamState): StreamState {
  return {
    visitors: prev.visitors + rand(-5, 20),
    sales: prev.sales + rand(0, 8),
    errors: Math.max(0, prev.errors + rand(-1, 3)),
    responseTime: Math.max(50, prev.responseTime + rand(-20, 20)),
    activeUsers: Math.max(10, prev.activeUsers + rand(-3, 5)),
  };
}

// ── 告警列表项（子组件） ────────────────────────────────────────

function AlertItem(
  {
    id,
    message,
    type,
    onDismiss,
  }: {
    id: number;
    message: string;
    type: "info" | "warning" | "error";
    onDismiss: (id: number) => void;
  },
  _ctx: Ctx,
): RenderFn {
  const colors = {
    info: { bg: "#dbeafe", text: "#2563eb" },
    warning: { bg: "#fef3c7", text: "#d97706" },
    error: { bg: "#fef2f2", text: "#dc2626" },
  };
  const c = colors[type];

  return () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 12px",
        background: c.bg,
        borderRadius: "6px",
        marginBottom: "6px",
        fontSize: "13px",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: c.text,
          flexShrink: 0,
        }}
      />
      <span style={{ flex: 1, color: c.text }}>{message}</span>
      <button
        onClick={() => onDismiss(id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: c.text,
          fontSize: "14px",
          padding: "2px",
        }}
      >
        ✕
      </button>
    </div>
  );
}

// ── 主页面 ─────────────────────────────────────────────────────

export function AnalyticsPage(_: unknown, { update, onMount, onUnmount }: Ctx): RenderFn {
  // ── 实时数据状态（闭包） ─────────────────────────────────
  let stream = { visitors: 1250, sales: 87, errors: 2, responseTime: 180, activeUsers: 342 };
  let history: Record<string, number[]> = {
    visitors: [1250],
    sales: [87],
    errors: [2],
    responseTime: [180],
    activeUsers: [342],
  };
  let alerts: { id: number; message: string; type: "info" | "warning" | "error" }[] = [];
  let nextAlertId = 1;
  let timerId: ReturnType<typeof setInterval> | null = null;
  let paused = false;

  // ── 生命周期：启动/停止数据流 ────────────────────────
  onMount(() => {
    timerId = setInterval(() => {
      if (paused) return;
      stream = generateSnapshot(stream);
      // 更新历史
      for (const key of Object.keys(history)) {
        history[key] = [...history[key], stream[key as keyof StreamState]].slice(-60);
      }
      // 随机产生告警
      if (stream.errors > 5 && Math.random() < 0.3) {
        alerts = [
          ...alerts,
          {
            id: nextAlertId++,
            message: `错误率上升: ${stream.errors}/min`,
            type: "error" as const,
          },
        ].slice(-20);
      }
      if (stream.responseTime > 300 && Math.random() < 0.2) {
        alerts = [
          ...alerts,
          {
            id: nextAlertId++,
            message: `响应延迟: ${stream.responseTime}ms`,
            type: "warning" as const,
          },
        ].slice(-20);
      }
      update();
    }, 1500);
  });

  onUnmount(() => {
    if (timerId) clearInterval(timerId);
  });

  // ── action() 示例 ─────────────────────────────────────
  const handleRefresh = action(update as any, () => {
    stream = {
      visitors: rand(1000, 3000),
      sales: rand(50, 200),
      errors: rand(0, 5),
      responseTime: rand(80, 250),
      activeUsers: rand(200, 500),
    };
  });

  const handlePauseToggle = () => {
    paused = !paused;
    update();
  };

  const dismissAlert = (id: number) => {
    alerts = alerts.filter((a) => a.id !== id);
    update();
  };

  // ── 计算聚合指标 ─────────────────────────────────────
  const calcStats = () => {
    const salesVals = history.sales;
    if (salesVals.length < 2) return { avgSale: 0, conversion: 0, uptime: 100 };
    const avgSale = salesVals.reduce((a, b) => a + b, 0) / salesVals.length;
    const conversion =
      history.visitors.length > 1
        ? (salesVals.reduce((a, b) => a + b, 0) / history.visitors.reduce((a, b) => a + b, 0)) * 100
        : 0;
    const errorsRecent = history.errors.slice(-10).reduce((a, b) => a + b, 0);
    const uptime = errorsRecent > 5 ? 99.5 : 100;
    return { avgSale: Math.round(avgSale), conversion: Math.round(conversion * 10) / 10, uptime };
  };

  return () => {
    const stats = calcStats();

    return (
      <div>
        {/* 工具栏 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#111827" }}>
              实时分析面板
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
              {paused ? "⏸ 已暂停" : "🟢 实时更新中（每 1.5s）"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Button variant={paused ? "primary" : "secondary"} onClick={handlePauseToggle}>
              {paused ? "继续" : "暂停"}
            </Button>
            {/* 使用 action() 包装的事件处理器 */}
            <Button variant="primary" onClick={handleRefresh}>
              刷新数据
            </Button>
          </div>
        </div>

        {/* 实时指标卡片（父组件通过 update(newProps) 推送数据） */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <MetricCard
            label="实时访客"
            color="#6366f1"
            format={(v) => v.toLocaleString()}
            // 通过 update(newProps) 方式传递——即使 MetricCard 是独立组件
            // 父组件渲染时传新 props，适配器自动走 internalRef 路径
          />
          <MetricCard label="今日销售" color="#16a34a" format={(v) => `¥${v.toLocaleString()}`} />
          <MetricCard label="错误次数" color="#dc2626" />
          <MetricCard label="响应时间" color="#f59e0b" format={(v) => `${v}ms`} />
          <MetricCard label="活跃用户" color="#06b6d4" format={(v) => v.toLocaleString()} />
        </div>

        {/* 聚合分析 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
            marginBottom: "20px",
          }}
        >
          <Card title="聚合统计">
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {[
                { label: "平均销售额", value: `¥${stats.avgSale.toLocaleString()}`, pct: 65 },
                {
                  label: "转化率",
                  value: `${stats.conversion}%`,
                  pct: Math.min(stats.conversion, 100),
                },
                { label: "系统可用率", value: `${stats.uptime}%`, pct: stats.uptime },
              ].map(({ label, value, pct }) => (
                <div key={label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      marginBottom: "4px",
                    }}
                  >
                    <span style={{ color: "#6b7280" }}>{label}</span>
                    <span style={{ fontWeight: 600 }}>{value}</span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "#e5e7eb",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: "#6366f1",
                        borderRadius: "3px",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="实时数据流">
            <div style={{ fontSize: "13px", lineHeight: 1.8 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <span style={{ color: "#6b7280" }}>访客</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {stream.visitors.toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <span style={{ color: "#6b7280" }}>销售</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  ¥{stream.sales.toLocaleString()}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "4px 0",
                  borderBottom: "1px solid #f3f4f6",
                }}
              >
                <span style={{ color: "#6b7280" }}>错误</span>
                <span
                  style={{
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                    color: stream.errors > 3 ? "#dc2626" : "#374151",
                  }}
                >
                  {stream.errors}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <span style={{ color: "#6b7280" }}>响应</span>
                <span style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {stream.responseTime}ms
                </span>
              </div>
            </div>
          </Card>

          {/* 走势图（纯 CSS 柱状图） */}
          <Card title="销售趋势（近 60 次）">
            <div style={{ display: "flex", gap: "2px", alignItems: "flex-end", height: "120px" }}>
              {history.sales.slice(-60).map((v, i) => {
                const max = Math.max(...history.sales.slice(-60), 1);
                const pct = (v / max) * 100;
                const colorVal = Math.min(200, Math.round((v / max) * 200));
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${Math.max(pct, 2)}%`,
                      background: `rgb(${99 + colorVal}, ${102 + colorVal}, ${241 - colorVal})`,
                      borderRadius: "2px 2px 0 0",
                      transition: "height 0.3s ease",
                      opacity: 0.8,
                    }}
                    title={`¥${v}`}
                  />
                );
              })}
            </div>
          </Card>
        </div>

        {/* 告警列表 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Card title={`实时告警 (${alerts.length})`}>
            {alerts.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "14px", margin: 0 }}>一切正常，无告警</p>
            ) : (
              alerts.map((a) => (
                <AlertItem
                  key={a.id}
                  id={a.id}
                  message={a.message}
                  type={a.type}
                  onDismiss={dismissAlert}
                />
              ))
            )}
          </Card>
          <Card title="系统信息">
            <div style={{ fontSize: "13px", color: "#6b7280", lineHeight: 2 }}>
              <p style={{ margin: 0 }}>🔄 更新间隔: 1.5 秒</p>
              <p style={{ margin: 0 }}>💾 历史数据点: {history.visitors.length}</p>
              <p style={{ margin: 0 }}>🔔 活跃告警: {alerts.length}</p>
              <p style={{ margin: 0 }}>⚡ 框架: trrn (闭包状态)</p>
              <p
                style={{
                  margin: "8px 0 0",
                  padding: "8px",
                  background: "#eef2ff",
                  borderRadius: "6px",
                  color: "#4338ca",
                  fontSize: "12px",
                }}
              >
                💡 离开此页面时 onUnmount 自动清理定时器，回到页面 onMount 重新启动。
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  };
}
