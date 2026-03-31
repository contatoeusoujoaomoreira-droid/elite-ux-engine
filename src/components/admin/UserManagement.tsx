import { Users } from "lucide-react";

const UserManagement = () => {
  return (
    <div className="glass-card rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h2 className="font-serif text-lg font-bold text-foreground">Gestão de Usuários</h2>
      </div>
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">
          Gestão de usuários administrativos em breve.
        </p>
      </div>
    </div>
  );
};

export default UserManagement;
