import type { Ctx, RenderFn } from "trrn";
import { Card } from "../../components/ui/Card.tsx";
import { Badge } from "../../components/ui/Badge.tsx";
import { Button } from "../../components/ui/Button.tsx";
import { Modal } from "../../components/ui/Modal.tsx";
import { FormField } from "../../components/ui/FormField.tsx";
import type { Column } from "../../components/ui/Table.tsx";
import { Table } from "../../components/ui/Table.tsx";
import { fetchUsers, createUser, updateUser, deleteUser } from "../../mock/api.ts";
import type { User } from "../../mock/types.ts";

const roleColors: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  admin: "danger",
  editor: "info",
  viewer: "default",
};

export function UsersPage(_: unknown, { update, onMount }: Ctx): RenderFn {
  let users: User[] = [];
  let loading = true;
  let error: string | null = null;

  // Modal state
  let modalOpen = false;
  let editUser: User | null = null;
  let form = {
    name: "",
    email: "",
    role: "viewer" as User["role"],
    status: "active" as User["status"],
  };
  let formError: string | null = null;
  let saving = false;

  const load = async () => {
    loading = true;
    error = null;
    update();
    const result = await fetchUsers();
    if (result.ok) {
      users = result.data;
      loading = false;
      update();
    } else {
      error = result.message;
      loading = false;
      update();
    }
  };

  onMount(load);

  const openCreate = () => {
    editUser = null;
    form = { name: "", email: "", role: "viewer", status: "active" };
    formError = null;
    modalOpen = true;
    update();
  };

  const openEdit = (user: User) => {
    editUser = user;
    form = { name: user.name, email: user.email, role: user.role, status: user.status };
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
    if (!form.name.trim() || !form.email.trim()) {
      formError = "姓名和邮箱为必填";
      update();
      return;
    }
    saving = true;
    formError = null;
    update();

    const result = editUser ? await updateUser(editUser.id, form) : await createUser(form);

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
    if (!confirm("确定删除此用户？")) return;
    const result = await deleteUser(id);
    if (result.ok) await load();
    else {
      error = result.message;
      update();
    }
  };

  const columns: Column<User>[] = [
    {
      key: "id",
      header: "ID",
      render: (u) => <span style={{ color: "#9ca3af" }}>#{u.id}</span>,
      width: "60px",
    },
    {
      key: "name",
      header: "姓名",
      render: (u) => <span style={{ fontWeight: 500 }}>{u.name}</span>,
    },
    { key: "email", header: "邮箱", render: (u) => u.email },
    {
      key: "role",
      header: "角色",
      render: (u) => <Badge label={u.role} variant={roleColors[u.role]} />,
    },
    {
      key: "status",
      header: "状态",
      render: (u) => (
        <Badge
          label={u.status === "active" ? "启用" : "禁用"}
          variant={u.status === "active" ? "success" : "default"}
        />
      ),
    },
    {
      key: "created",
      header: "创建时间",
      render: (u) => <span style={{ color: "#6b7280" }}>{u.created}</span>,
    },
    {
      key: "actions",
      header: "操作",
      render: (u) => (
        <div style={{ display: "flex", gap: "6px" }}>
          <Button size="sm" variant="secondary" onClick={() => openEdit(u)}>
            编辑
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(u.id)}>
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
          marginBottom: "20px",
        }}
      >
        <div>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280" }}>
            共 {users.length} 个用户
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + 新增用户
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
          <Table columns={columns} data={users} />
        </Card>
      )}

      {/* 新增/编辑 Modal */}
      <Modal open={modalOpen} title={editUser ? "编辑用户" : "新增用户"} onClose={closeModal}>
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
        <FormField label="姓名">
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
        <FormField label="邮箱">
          <input
            value={form.email}
            onInput={(e: any) => {
              form = { ...form, email: e.target.value };
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
        <FormField label="角色">
          <select
            value={form.role}
            onChange={(e: any) => {
              form = { ...form, role: e.target.value };
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
            <option value="admin">管理员</option>
            <option value="editor">编辑</option>
            <option value="viewer">查看者</option>
          </select>
        </FormField>
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
            <option value="active">启用</option>
            <option value="inactive">禁用</option>
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
