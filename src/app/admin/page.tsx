import { AdminLogin } from "@/components/admin/login";
import { AdminPanel } from "@/components/admin/panel";
import { currentAdmin, isConfigured } from "@/server/admin-auth";
import { listMedia, readContent } from "@/server/cms-store";
export default async function AdminPage() {
  const user = await currentAdmin();
  if (!user) return <AdminLogin configured={await isConfigured()} />;
  return (
    <AdminPanel
      username={user.username}
      initial={await readContent()}
      uploadedMedia={await listMedia()}
    />
  );
}
