import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Edit2, Mail, Shield, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: "viewer" | "editor" | "admin";
  status: "active" | "inactive" | "pending";
  last_login: string | null;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({ email: "", full_name: "", role: "viewer" as const });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;
      setUsers(data || []);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!formData.email) {
      setError("Email é obrigatório");
      return;
    }

    setSaving(true);
    setError("");

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: Math.random().toString(36).slice(-12),
        email_confirm: true,
      });

      if (authError) throw authError;

      // Create admin user record
      const { error: dbError } = await supabase.from("admin_users").insert({
        user_id: authData.user.id,
        email: formData.email,
        full_name: formData.full_name || null,
        role: formData.role,
        status: "active",
      });

      if (dbError) throw dbError;

      setFormData({ email: "", full_name: "", role: "viewer" });
      setIsOpen(false);
      loadUsers();
    } catch (err: any) {
      console.error("Error adding user:", err);
      setError(err.message || "Erro ao adicionar usuário");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    setSaving(true);
    setError("");

    try {
      const { error: err } = await supabase
        .from("admin_users")
        .update({
          full_name: formData.full_name || null,
          role: formData.role,
        })
        .eq("id", editingUser.id);

      if (err) throw err;

      setEditingUser(null);
      setFormData({ email: "", full_name: "", role: "viewer" });
      setIsOpen(false);
      loadUsers();
    } catch (err: any) {
      console.error("Error updating user:", err);
      setError(err.message || "Erro ao atualizar usuário");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Tem certeza que deseja remover este usuário?")) return;

    try {
      const { error: err } = await supabase.from("admin_users").delete().eq("id", userId);
      if (err) throw err;
      loadUsers();
    } catch (err: any) {
      console.error("Error deleting user:", err);
      setError(err.message || "Erro ao remover usuário");
    }
  };

  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name || "",
      role: user.role,
    });
    setIsOpen(true);
  };

  const openAddDialog = () => {
    setEditingUser(null);
    setFormData({ email: "", full_name: "", role: "viewer" });
    setError("");
    setIsOpen(true);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      viewer: "Visualizador",
      editor: "Editor",
      admin: "Administrador",
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      viewer: "bg-blue-500/10 text-blue-400",
      editor: "bg-yellow-500/10 text-yellow-400",
      admin: "bg-red-500/10 text-red-400",
    };
    return colors[role] || "bg-gray-500/10 text-gray-400";
  };

  const getStatusIcon = (status: string) => {
    return status === "active" ? (
      <CheckCircle className="w-4 h-4 text-green-400" />
    ) : (
      <AlertCircle className="w-4 h-4 text-yellow-400" />
    );
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="font-serif text-lg font-bold text-foreground">Gestão de Usuários</h2>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openAddDialog} className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Editar Usuário" : "Adicionar Novo Usuário"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-xs p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="usuario@example.com"
                  disabled={!!editingUser}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Nome Completo</label>
                <Input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="João Silva"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">Função</label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Visualizador</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={editingUser ? handleUpdateUser : handleAddUser}
                  disabled={saving}
                  className="flex-1"
                >
                  {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                  {editingUser ? "Atualizar" : "Adicionar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Nenhum usuário administrativo ainda</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Nome</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Função</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">Último Acesso</th>
                <th className="text-right py-3 px-4 text-muted-foreground font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/30 hover:bg-secondary/30 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{user.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-foreground">{user.full_name || "-"}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      {getStatusIcon(user.status)}
                      <span className="text-foreground capitalize">{user.status === "active" ? "Ativo" : "Inativo"}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString("pt-BR") : "Nunca"}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditDialog(user)}
                        className="p-1.5 hover:bg-secondary rounded-lg transition text-muted-foreground hover:text-primary"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 hover:bg-secondary rounded-lg transition text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
