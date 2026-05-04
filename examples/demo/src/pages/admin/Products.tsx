import type { Ctx, RenderFn } from "trrn";
import { Card } from "../../components/ui/Card.tsx";
import { Badge } from "../../components/ui/Badge.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { Modal } from "../../components/ui/Modal.tsx";
import { FormField } from "../../components/ui/FormField.tsx";
import type { Column } from "../../components/ui/Table.tsx";
import { Table } from "../../components/ui/Table.tsx";
import { fetchProducts, createProduct, updateProduct, deleteProduct } from "../../mock/api.ts";
import type { Product } from "../../mock/types.ts";

const statusColors: Record<string, "success" | "warning" | "default"> = {
  active: "success",
  draft: "warning",
  archived: "default",
};

export function ProductsPage(_: unknown, { update, onMount }: Ctx): RenderFn {
  let products: Product[] = [];
  let loading = true;
  let error: string | null = null;

  let modalOpen = false;
  let editProduct: Product | null = null;
  let form = { name: "", category: "", price: 0, stock: 0, status: "draft" as Product["status"] };
  let formError: string | null = null;
  let saving = false;

  // 筛选
  let filterStatus = "all" as string;

  const load = async () => {
    loading = true;
    error = null;
    update();
    const result = await fetchProducts();
    if (result.ok) {
      products = result.data;
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
    if (filterStatus === "all") return products;
    return products.filter((p) => p.status === filterStatus);
  };

  const openCreate = () => {
    editProduct = null;
    form = { name: "", category: "", price: 0, stock: 0, status: "draft" };
    formError = null;
    modalOpen = true;
    update();
  };

  const openEdit = (p: Product) => {
    editProduct = p;
    form = { name: p.name, category: p.category, price: p.price, stock: p.stock, status: p.status };
    formError = null;
    modalOpen = true;
    update();
  };

  const closeModal = () => {
    modalOpen = false;
    update();
  };

  const handleSave = async () => {
    if (saving) return;
    if (!form.name.trim()) {
      formError = "产品名称为必填";
      update();
      return;
    }
    saving = true;
    formError = null;
    update();

    const result = editProduct
      ? await updateProduct(editProduct.id, form)
      : await createProduct(form);

    if (result.ok) {
      await load();
      modalOpen = false;
      saving = false;
      update();
    } else {
      formError = result.message;
      saving = false;
      update();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定删除此产品？")) return;
    const result = await deleteProduct(id);
    if (result.ok) await load();
    else {
      error = result.message;
      update();
    }
  };

  const columns: Column<Product>[] = [
    {
      key: "id",
      header: "ID",
      render: (p) => <span style={{ color: "#9ca3af" }}>#{p.id}</span>,
      width: "60px",
    },
    {
      key: "name",
      header: "产品名称",
      render: (p) => <span style={{ fontWeight: 500 }}>{p.name}</span>,
    },
    { key: "category", header: "分类", render: (p) => p.category },
    {
      key: "price",
      header: "价格",
      render: (p) => <span style={{ fontWeight: 500 }}>¥{p.price}</span>,
    },
    {
      key: "stock",
      header: "库存",
      render: (p) => (
        <span style={{ color: p.stock === 0 ? "#ef4444" : "#374151" }}>
          {p.stock === 0 ? "无货" : p.stock}
        </span>
      ),
    },
    {
      key: "status",
      header: "状态",
      render: (p) => <Badge label={p.status} variant={statusColors[p.status]} />,
    },
    {
      key: "created",
      header: "创建时间",
      render: (p) => <span style={{ color: "#6b7280" }}>{p.created}</span>,
    },
    {
      key: "actions",
      header: "操作",
      render: (p) => (
        <div style={{ display: "flex", gap: "6px" }}>
          <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>
            编辑
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>
            删除
          </Button>
        </div>
      ),
    },
  ];

  return () => (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          {["all", "active", "draft", "archived"].map((s) => (
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
              {s === "all" ? "全部" : s === "active" ? "在售" : s === "draft" ? "草稿" : "已归档"}
            </button>
          ))}
        </div>
        <Button variant="primary" onClick={openCreate}>
          + 新增产品
        </Button>
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
        <Card>
          <Table columns={columns} data={filtered()} />
        </Card>
      )}

      <Modal open={modalOpen} title={editProduct ? "编辑产品" : "新增产品"} onClose={closeModal}>
        {formError !== null && (
          <div
            style={{
              padding: "10px 14px",
              background: "#fef2f2",
              color: "#dc2626",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "12px",
            }}
          >
            {formError}
          </div>
        )}
        <FormField label="产品名称">
          <input
            value={form.name}
            onInput={(e: any) => {
              form = { ...form, name: e.target.value };
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
          />
        </FormField>
        <FormField label="分类">
          <select
            value={form.category}
            onChange={(e: any) => {
              form = { ...form, category: e.target.value };
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              background: "#fff",
              boxSizing: "border-box",
            }}
          >
            <option value="">请选择</option>
            <option value="电子产品">电子产品</option>
            <option value="配件">配件</option>
            <option value="运动">运动</option>
          </select>
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <FormField label="价格 (¥)">
            <input
              type="number"
              value={form.price || ""}
              onInput={(e: any) => {
                form = { ...form, price: Number(e.target.value) || 0 };
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </FormField>
          <FormField label="库存">
            <input
              type="number"
              value={form.stock || ""}
              onInput={(e: any) => {
                form = { ...form, stock: Number(e.target.value) || 0 };
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </FormField>
        </div>
        <FormField label="状态">
          <select
            value={form.status}
            onChange={(e: any) => {
              form = { ...form, status: e.target.value };
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "14px",
              background: "#fff",
              boxSizing: "border-box",
            }}
          >
            <option value="active">在售</option>
            <option value="draft">草稿</option>
            <option value="archived">已归档</option>
          </select>
        </FormField>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
          <Button variant="secondary" onClick={closeModal}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
