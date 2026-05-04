import type { Ctx, RenderFn } from "trrn";
import { Card } from "../../components/ui/Card.tsx";
import { Badge } from "../../components/ui/Badge.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { fetchDashboardStats, fetchOrders } from "../../mock/api.ts";
import type { DashboardStats, Order } from "../../mock/types.ts";

export function DashboardPage(_: unknown, { update, onMount }: Ctx): RenderFn {
  let stats: DashboardStats | null = null;
  let recentOrders: Order[] = [];
  let loading = true;
  let error: string | null = null;

  const load = async () => {
    loading = true;
    error = null;
    update();

    const [statsResult, ordersResult] = await Promise.all([fetchDashboardStats(), fetchOrders()]);

    if (statsResult.ok) stats = statsResult.data;
    else {
      error = statsResult.message;
      loading = false;
      update();
      return;
    }

    if (ordersResult.ok) recentOrders = ordersResult.data.slice(-5).reverse();
    else {
      error = ordersResult.message;
    }

    loading = false;
    update();
  };

  onMount(load);

  const statusColor = (s: string) => {
    if (s === "delivered" || s === "active") return "success" as const;
    if (s === "pending" || s === "processing") return "warning" as const;
    if (s === "cancelled" || s === "inactive") return "danger" as const;
    return "default" as const;
  };

  return () => {
    if (loading) {
      return (
        <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>加载中...</div>
      );
    }
    if (error !== null) {
      return (
        <div style={{ textAlign: "center", padding: "60px" }}>
          <p style={{ color: "#dc2626" }}>{error}</p>
          <Button variant="primary" onClick={load}>
            重试
          </Button>
        </div>
      );
    }

    const statCards =
      stats !== null
        ? [
            { label: "总用户", value: stats.totalUsers, color: "#6366f1" },
            { label: "活跃用户", value: stats.activeUsers, color: "#16a34a" },
            { label: "产品数量", value: stats.totalProducts, color: "#f59e0b" },
            { label: "总收入", value: `¥${stats.revenue.toLocaleString()}`, color: "#06b6d4" },
            { label: "总订单", value: stats.totalOrders, color: "#8b5cf6" },
            { label: "待处理", value: stats.pendingOrders, color: "#ef4444" },
          ]
        : [];

    return (
      <div>
        {/* 统计卡片 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          {statCards.map(({ label, value, color }) => (
            <Card key={label}>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#6b7280" }}>{label}</p>
                <p style={{ margin: 0, fontSize: "28px", fontWeight: 700, color }}>{value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* 最近订单 */}
        <Card title="最近订单">
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      color: "#6b7280",
                      fontSize: "12px",
                    }}
                  >
                    订单号
                  </th>
                  <th
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      color: "#6b7280",
                      fontSize: "12px",
                    }}
                  >
                    客户
                  </th>
                  <th
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      color: "#6b7280",
                      fontSize: "12px",
                    }}
                  >
                    金额
                  </th>
                  <th
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      color: "#6b7280",
                      fontSize: "12px",
                    }}
                  >
                    状态
                  </th>
                  <th
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      color: "#6b7280",
                      fontSize: "12px",
                    }}
                  >
                    日期
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 500 }}>#{o.id}</td>
                    <td style={{ padding: "8px 12px" }}>{o.customer}</td>
                    <td style={{ padding: "8px 12px" }}>¥{o.total}</td>
                    <td style={{ padding: "8px 12px" }}>
                      <Badge label={o.status} variant={statusColor(o.status)} />
                    </td>
                    <td style={{ padding: "8px 12px", color: "#6b7280" }}>{o.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };
}
