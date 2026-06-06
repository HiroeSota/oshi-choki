import { redirect } from "next/navigation";
import { OshiSettingsForm } from "@/components/OshiSettingsForm";
import { createClient } from "@/lib/supabase/server";
import type { DbOshi } from "@/lib/types";

export default async function NewOshiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 既存の推しがあれば一覧に戻る、なければ "/" に戻る
  const { data: oshisData } = await supabase
    .from("oshis")
    .select("id")
    .eq("user_id", user.id)
    .returns<Pick<DbOshi, "id">[]>();

  const hasOshi = (oshisData ?? []).length > 0;
  const backHref = hasOshi ? "/settings/oshi" : "/";

  return <OshiSettingsForm oshi={null} goal={null} backHref={backHref} />;
}
