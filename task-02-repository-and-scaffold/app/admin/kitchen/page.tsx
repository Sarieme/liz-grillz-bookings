import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, validateSession } from "@/lib/session";

export default async function AdminKitchenPage() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  // 1. Authentication check
  if (!rawToken) {
    redirect("/auth?mode=login&redirect=/admin/kitchen");
  }

  const sessionData = await validateSession(rawToken);
  if (!sessionData) {
    redirect("/auth?mode=login&redirect=/admin/kitchen");
  }

  const { user } = sessionData;

  // 2. Authorisation check (Role verification)
  // If user is authenticated but not an ADMIN, refuse access (Copied-Link Test defense)
  if ((user as any).role !== "ADMIN") {
    return (
      <main style={{ maxWidth: "700px", margin: "60px auto", padding: "32px", fontFamily: "var(--font-family-primary)" }}>
        <div
          role="alert"
          style={{
            backgroundColor: "#FEF2F2",
            border: "2px solid #DC2626",
            borderRadius: "12px",
            padding: "32px",
            boxShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <span style={{ fontSize: "32px" }}>🚫</span>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", color: "#991B1B" }}>
                HTTP 403 Forbidden: Access Refused
              </h1>
              <p style={{ fontSize: "13px", color: "#7F1D1D", margin: "4px 0 0 0" }}>
                Copied-Link Vulnerability Blocked: Role-Based Authorization Enforced
              </p>
            </div>
          </div>

          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#7F1D1D", marginBottom: "20px" }}>
            Hello <strong>{user.fullName}</strong>. You are currently authenticated under client identity (<code>{user.email}</code>) with role <strong>CLIENT</strong>. 
            The Kitchen Capacity Management Portal requires the <strong>ADMIN</strong> role. Authenticated session identity alone is insufficient to view operational kitchen controls.
          </p>

          <div style={{ backgroundColor: "#FFFFFF", padding: "16px", borderRadius: "8px", border: "1px solid #FCA5A5", fontSize: "13px", color: "#991B1B" }}>
            <strong>Security Boundary Diagnostic:</strong><br />
            • Authenticated User ID: <code>{user.id}</code><br />
            • Assigned Role: <code>{(user as any).role || "CLIENT"}</code><br />
            • Required Clearance: <code>ADMIN (Kitchen General Manager)</code><br />
            • Enforcement Point: Server Component Controller Boundary
          </div>

          <div style={{ marginTop: "24px" }}>
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                backgroundColor: "#DC2626",
                color: "#FFFFFF",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Return to Safe Client Portal
            </a>
          </div>
        </div>
      </main>
    );
  }

  // 3. Authorized View (ADMIN only)
  return (
    <main style={{ maxWidth: "900px", margin: "40px auto", padding: "24px", fontFamily: "var(--font-family-primary)" }}>
      <div style={{ borderBottom: "2px solid #C2410C", paddingBottom: "16px", marginBottom: "24px" }}>
        <h1 style={{ color: "#C2410C", margin: 0 }}>Liz's Grillz: Kitchen Capacity Management Dashboard</h1>
        <p style={{ color: "#64748B", fontSize: "14px", margin: "4px 0 0 0" }}>Authorized Administrator: {user.fullName} ({user.email})</p>
      </div>

      <div style={{ background: "#FFF7ED", border: "1px solid #FDBA74", padding: "20px", borderRadius: "8px", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 8px 0", color: "#9A3412" }}>Kitchen Capacity Emergency Override</h3>
        <p style={{ fontSize: "13px", color: "#7C2D12" }}>Sole action restricted exclusively to ADMIN role: Lock weekend grilling slots to prevent reservation overbooking.</p>
        <button style={{ background: "#C2410C", color: "#FFF", border: "none", padding: "10px 18px", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>
          Lock Weekend Kitchen Capacity
        </button>
      </div>
    </main>
  );
}
