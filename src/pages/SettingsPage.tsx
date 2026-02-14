import { Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/auth");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold tracking-tight">
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account.
        </p>
      </div>

      <div className="glass-card rounded-xl p-8 max-w-lg space-y-6">
        <div className="flex items-center gap-4">
          {user?.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              className="h-12 w-12 rounded-full ring-2 ring-border/50"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15">
              <User className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <p className="font-medium">
              {user?.user_metadata?.full_name || "User"}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="border-t border-border/40 pt-4">
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="gap-2 glass-input hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
