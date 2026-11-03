import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  if (!code) return NextResponse.redirect(`${origin}/entrar?error=1`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(`${origin}/entrar?error=1`);

  // Crea la fila de perfil (vacía, sin consentimiento) si no existe. RLS: solo la propia.
  await supabase
    .from("menuya_profiles")
    .upsert({ user_id: data.user.id }, { onConflict: "user_id", ignoreDuplicates: true });

  await logEvent(supabase, "signed_in");

  return NextResponse.redirect(`${origin}/aviso`);
}
