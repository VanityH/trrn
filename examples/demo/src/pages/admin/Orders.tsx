import type { Ctx, RenderFn } from "trrn";
import { Card } from "../../components/ui/Card.tsx";
import { Badge } from "../../components/ui/Badge.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { Modal } from "../../components/ui/Modal.tsx";
import { fetchOrders, updateOrderStatus, deleteOrder } from "../../mock/api.ts";
import type { Order, OrderStatus } from "../../mock/types.ts";

const statusColors: Record<OrderStatus, "success" | "warning" | "danger" | "info" | "default"> = {
  pending: "warning",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "待处理",
  processing: "处理中",
  shipped: "已发货",
  delivered: "已送达",
  cancelled: "已取消",
};

export function OrdersPage(_: unknown, { update, onMount }: Ctx): RenderFn {
  let orders: Order[] = [];
  let loading = true;
  let error: string | null = null;

  let filterStatus = "all" as string;
  let detailOrder: Order | null = null;
  let updating = false;

  const load = async () => {
    loading = true;
    error = null;
    update();
    const result = await fetchOrders();
    if (result.ok) {
      orders = result.data;
      loading = false;
      update();
    } else {
      error = result.message;
      loading = false;
      update();
    }
  };

  onMount(load);

  const filtered = () => {
    if (filterStatus === "all") return orders;
    return orders.filter((o) => o.status === filterStatus);
  };

  const handleStatusChange = async (id: number, status: OrderStatus) => {
    updating = true;
    update();
    const result = await updateOrderStatus(id, status);
    if (result.ok) {
      orders = orders.map((o) => (o.id === id ? ({ ...o, status } as Order) : o));
      if (detailOrder?.id === id) detailOrder = { ...detailOrder, status } as Order;
    }
    updating = false;
    update();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除此订单？")) return;
    const result = await deleteOrder(id);
    if (result.ok) {
      await load();
      detailOrder = null;
    }
  };

  return () => (
    <div>
      {/* 状态筛选 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => {
              filterStatus = s;
              update();
            }}
            style={{
              padding: "6px 14px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 500,
              background: filterStatus === s ? "#6366f1" : "#e5e7eb",
              color: filterStatus === s ? "#fff" : "#374151",
            }}
          >
            {s === "all" ? "全部" : statusLabels[s as OrderStatus]}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "#6b7280" }}>加载中...</p>
      ) : error !== null ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ color: "#dc2626" }}>{error}</p>
          <Button variant="primary" onClick={load}>
            重试
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered().length === 0 && (
            <p style={{ textAlign: "center", padding: "40px", color: "#9ca3af" }}>暂无订单</p>
          )}
          {filtered().map((order) => (
            <Card key={order.id}>
              <div
                style={{ cursor: "pointer" }}
                onClick={() => {
                  detailOrder = order;
                  update();
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <strong style={{ fontSize: "15px" }}>#{order.id}</strong>
                    <Badge
                      label={statusLabels[order.status]}
                      variant={statusColors[order.status]}
                    />
                  </div>
                  <span style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>
                    ¥{order.total.toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "13px",
                    color: "#6b7280",
                  }}
                >
                  <span>
                    {order.customer} · {order.email}
                  </span>
                  <span>
                    {order.items.length} 件商品 · {order.created}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 订单详情 Modal */}
      <Modal
        open={detailOrder !== null}
        title={detailOrder ? `订单 #${detailOrder.id}` : ""}
        onClose={() => {
          detailOrder = null;
          update();
        }}
      >
        {detailOrder !== null && (
          <div>
            <div style={{ marginBottom: "16px" }}>
              <div
                style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}
              >
                <span style={{ color: "#6b7280", fontSize: "13px" }}>客户</span>
                <span style={{ fontWeight: 500, fontSize: "14px" }}>{detailOrder.customer}</span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}
              >
                <span style={{ color: "#6b7280", fontSize: "13px" }}>邮箱</span>
                <span style={{ fontWeight: 500, fontSize: "14px" }}>{detailOrder.email}</span>
              </div>
              <div
                style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}
              >
                <span style={{ color: "#6b7280", fontSize: "13px" }}>日期</span>
                <span style={{ fontWeight: 500, fontSize: "14px" }}>{detailOrder.created}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>状态</span>
                <Badge
                  label={statusLabels[detailOrder.status]}
                  variant={statusColors[detailOrder.status]}
                />
              </div>
            </div>

            <div
              style={{ borderTop: "1px solid #e5e7eb", paddingTop: "12px", marginBottom: "16px" }}
            >
              <p
                style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}
              >
                商品明细
              </p>
              {detailOrder.items.map((item) => (
                <div
                  key={item.productId}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    fontSize: "14px",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <span>
                    {item.productName} × {item.quantity}
                  </span>
                  <span style={{ fontWeight: 500 }}>¥{item.price * item.quantity}</span>
                </div>
              ))}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  fontSize: "15px",
                  fontWeight: 700,
                }}
              >
                <span>合计</span>
                <span>¥{detailOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
              <p
                style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}
              >
                更新状态
              </p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                {(
                  ["pending", "processing", "shipped", "delivered", "cancelled"] as OrderStatus[]
                ).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant={detailOrder!.status === s ? "primary" : "secondary"}
                    onClick={() => handleStatusChange(detailOrder!.id, s)}
                    disabled={updating || detailOrder!.status === s}
                  >
                    {statusLabels[s]}
                  </Button>
                ))}
              </div>
              <Button variant="danger" size="sm" onClick={() => handleDelete(detailOrder!.id)}>
                删除订单
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
