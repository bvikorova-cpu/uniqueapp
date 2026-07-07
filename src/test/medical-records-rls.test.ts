import { describe, it, expect } from "vitest";

/**
 * Phase 5 — medical_record_access_grants gate.
 * Simulates the RLS EXISTS clause: doctor sees records only when a non-revoked,
 * non-expired grant exists for the record's patient.
 */
interface Grant {
  patient_id: string;
  doctor_id: string;
  revoked_at: string | null;
  expires_at: string;
}
function doctorHasAccess(grants: Grant[], doctorId: string, patientId: string, now = new Date()) {
  return grants.some(
    (g) =>
      g.patient_id === patientId &&
      g.doctor_id === doctorId &&
      g.revoked_at === null &&
      new Date(g.expires_at).getTime() > now.getTime(),
  );
}

describe("medical records access gate", () => {
  const future = new Date(Date.now() + 3600_000).toISOString();
  const past = new Date(Date.now() - 3600_000).toISOString();
  const grants: Grant[] = [
    { patient_id: "P1", doctor_id: "D1", revoked_at: null, expires_at: future },
    { patient_id: "P2", doctor_id: "D1", revoked_at: null, expires_at: past },
    { patient_id: "P3", doctor_id: "D1", revoked_at: new Date().toISOString(), expires_at: future },
  ];

  it("active grant grants access", () => {
    expect(doctorHasAccess(grants, "D1", "P1")).toBe(true);
  });
  it("expired grant denies access", () => {
    expect(doctorHasAccess(grants, "D1", "P2")).toBe(false);
  });
  it("revoked grant denies access", () => {
    expect(doctorHasAccess(grants, "D1", "P3")).toBe(false);
  });
  it("no grant denies access", () => {
    expect(doctorHasAccess(grants, "D2", "P1")).toBe(false);
  });
});
