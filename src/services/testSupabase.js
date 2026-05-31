import { supabase } from "./supabaseClient";

export async function testSupabase() {
  console.log("supabase connected:", !!supabase);

  const { data, error } = await supabase
    .from("daily_logs")
    .insert({
      date: "test",
      data: { message: "Hallo Supabase vanuit VoedingsApp" },
    })
    .select();

  console.log("insert data:", data);
  console.log("insert error:", error);
}
