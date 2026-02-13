import { Settings } from "lucide-react";

const SettingsPage = () => {
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

      <div className="glass-card rounded-xl p-8 max-w-lg space-y-4">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Sign in to manage your account settings.
          </span>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
