import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole, logAudit, AppRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, ShieldOff, UserCog, History, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserRow {
  id: string;
  email: string;
  roles: AppRole[];
}

const SuperAdminPanel = () => {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: roleData } = await supabase.from("user_roles" as any).select("user_id, role");
    // We cannot list auth.users from the client. Use what we have via roles + current session.
    const map = new Map<string, AppRole[]>();
    (roleData as any[] || []).forEach((r) => {
      const arr = map.get(r.user_id) || [];
      arr.push(r.role);
      map.set(r.user_id, arr);
    });
    const rows: UserRow[] = Array.from(map.entries()).map(([id, roles]) => ({
      id,
      email: id.substring(0, 8) + "…",
      roles,
    }));
    setUsers(rows);

    const { data: logs } = await supabase
      .from("audit_logs" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    setAudit((logs as any[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isSuperAdmin) load();
  }, [isSuperAdmin, load]);

  const grantRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles" as any).insert({ user_id: userId, role });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    await logAudit("role.grant", "user", userId, { role });
    toast({ title: "Permissão concedida", description: `Role ${role} adicionada.` });
    load();
  };

  const revokeRole = async (userId: string, role: AppRole) => {
    const { error } = await supabase.from("user_roles" as any).delete().eq("user_id", userId).eq("role", role);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    await logAudit("role.revoke", "user", userId, { role });
    toast({ title: "Permissão removida" });
    load();
  };

  if (roleLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Verificando permissões…</div>;
  }

  if (!isSuperAdmin) {
    return (
      <Card className="bg-card border-border/50 max-w-xl">
        <CardContent className="p-6 flex items-start gap-3">
          <ShieldOff className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <p className="font-medium">Acesso restrito</p>
            <p className="text-sm text-muted-foreground">Este painel é exclusivo para Super Admin.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Super Admin</h2>
        <p className="text-sm text-muted-foreground">Gestão de usuários, permissões (RBAC) e auditoria.</p>
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><UserCog className="w-4 h-4" /> Usuários e Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Carregando…</div>
          ) : users.length === 0 ? (
            <div className="text-sm text-muted-foreground">Nenhum usuário com role atribuído.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-mono text-xs">{u.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <Badge
                              key={r}
                              variant={r === "super_admin" ? "default" : "secondary"}
                              className="cursor-pointer"
                              onClick={() => revokeRole(u.id, r)}
                              title="Clique para revogar"
                            >
                              {r} ✕
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select onValueChange={(v) => grantRole(u.id, v as AppRole)}>
                          <SelectTrigger className="w-[140px] inline-flex"><SelectValue placeholder="+ Role" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">user</SelectItem>
                            <SelectItem value="admin">admin</SelectItem>
                            <SelectItem value="super_admin">super_admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Para listar e-mails completos e desativar contas, será necessária uma Edge Function com Service Role.
            Por ora, a coluna User ID identifica cada conta e as permissões podem ser atribuídas/revogadas com segurança.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><History className="w-4 h-4" /> Logs de Auditoria (últimos 50)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quando</TableHead>
                  <TableHead>Ator</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audit.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-sm text-muted-foreground">Sem registros ainda.</TableCell></TableRow>
                ) : audit.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs whitespace-nowrap">{new Date(a.created_at).toLocaleString("pt-BR")}</TableCell>
                    <TableCell className="text-xs">{a.actor_email || a.actor_id?.substring(0, 8)}</TableCell>
                    <TableCell className="text-xs font-mono">{a.action}</TableCell>
                    <TableCell className="text-xs">{a.entity_type ? `${a.entity_type}:${(a.entity_id || "").substring(0, 8)}` : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminPanel;
