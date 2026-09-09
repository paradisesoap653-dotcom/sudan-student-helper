export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { normalizeSudanesePhone } from "@/lib/format";
import { verifyOtp, newSessionToken } from "@/lib/otp";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * POST /api/driver/verify-otp  { phone, code, name?, bankAccount?, vehicleType? }
 * يتحقق من الرمز، ثم ينشئ حساب السائق في جدول drivers (أو يحدّث بياناته)،
 * ويُصدر رمز جلسة (auth_token) يحمله السائق في الطلبات اللاحقة.
 */
export async function POST(request: NextRequest) {
  try {
    const { phone, code, name, bankAccount, vehicleType } = await request.json();
    const normalized = normalizeSudanesePhone(phone);

    if (!normalized) {
      return NextResponse.json(
        { ok: false, error: "رقم الهاتف السوداني غير صحيح" },
        { status: 400 }
      );
    }

    const check = await verifyOtp(normalized, String(code || ""));
    if (!check.ok) {
      return NextResponse.json({ ok: false, error: check.error }, { status: check.status });
    }

    // ── نجح التحقق: سجّل/حدّث السائق ───────────────────────────────
    const admin = getSupabaseAdmin();
    const token = newSessionToken();

    const { data: existing } = await admin
      .from("drivers")
      .select("id")
      .eq("phone", normalized)
      .maybeSingle();

    const clean = (v: unknown, max: number) =>
      typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined;

    let driverRow: Record<string, unknown> | null = null;

    if (existing) {
      const updates: Record<string, unknown> = { auth_token: token };
      const cleanName = clean(name, 50);
      const cleanBank = clean(bankAccount, 50);
      const cleanVehicle = clean(vehicleType, 50);
      if (cleanName) updates.name = cleanName;
      if (cleanBank) updates.bank_account = cleanBank;
      if (cleanVehicle) updates.vehicle_type = cleanVehicle;

      const { data } = await admin
        .from("drivers")
        .update(updates)
        .eq("id", existing.id)
        .select("id, phone, name, bank_account, vehicle_type, is_online")
        .single();
      driverRow = data;
    } else {
      const { data } = await admin
        .from("drivers")
        .insert({
          phone: normalized,
          name: clean(name, 50) || `سائق ${normalized.slice(-4)}`,
          bank_account: clean(bankAccount, 50) || null,
          vehicle_type: clean(vehicleType, 50) || null,
          auth_token: token,
          is_online: true,
        })
        .select("id, phone, name, bank_account, vehicle_type, is_online")
        .single();
      driverRow = data;
    }

    if (!driverRow) {
      return NextResponse.json(
        { ok: false, error: "تعذر إنشاء حساب السائق — حاول مرة أخرى" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      token,
      driver: {
        id: driverRow.id,
        phone: driverRow.phone,
        name: driverRow.name,
        bankAccount: driverRow.bank_account,
        vehicleType: driverRow.vehicle_type,
        isOnline: driverRow.is_online,
      },
    });
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "خدمة التحقق غير مضبوطة على الخادم بعد",
      },
      { status: 503 }
    );
  }
}
