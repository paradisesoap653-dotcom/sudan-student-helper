export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { normalizeSudanesePhone } from "@/lib/format";
import { issueOtp } from "@/lib/otp";

/**
 * POST /api/driver/request-otp  { phone }
 * إرسال رمز تحقق حقيقي لهاتف السائق (6 خانات، صلاحية 5 دقائق).
 * خارج بيئة الإنتاج وبدون webhook يُعاد الرمز كـ previewCode للتجربة فقط.
 */
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    const normalized = normalizeSudanesePhone(phone);

    if (!normalized) {
      return NextResponse.json(
        { ok: false, error: "رقم الهاتف السوداني غير صحيح (9 أرقام تبدأ بـ 9)" },
        { status: 400 }
      );
    }

    let result;
    try {
      result = await issueOtp(normalized);
    } catch (err) {
      return NextResponse.json(
        {
          ok: false,
          error:
            err instanceof Error
              ? err.message
              : "خدمة إصدار الرمز غير مضبوطة على الخادم بعد",
        },
        { status: 503 }
      );
    }

    if (!result.ok) {
      const status = result.status || 502;
      return NextResponse.json({ ok: false, error: result.error }, { status });
    }

    return NextResponse.json({
      ok: true,
      message: "تم إرسال رمز التحقق إلى هاتفك",
      ...(result.previewCode ? { previewCode: result.previewCode } : {}),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "طلب غير صالح" }, { status: 400 });
  }
}
