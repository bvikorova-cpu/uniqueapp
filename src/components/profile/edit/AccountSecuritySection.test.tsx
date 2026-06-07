import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AccountSecuritySection } from "./AccountSecuritySection";

const updateUser = vi.fn();
const getUser = vi.fn();
const signInWithPassword = vi.fn();
const rpc = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      updateUser: (...a: any[]) => updateUser(...a),
      getUser: (...a: any[]) => getUser(...a),
      signInWithPassword: (...a: any[]) => signInWithPassword(...a),
    },
    rpc: (...a: any[]) => rpc(...a),
  },
}));

const toast = vi.fn();
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));

function setLastSignIn(minutesAgo: number, email = "u@x.com") {
  getUser.mockResolvedValue({
    data: {
      user: {
        email,
        last_sign_in_at: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
      },
    },
  });
}

beforeEach(() => {
  updateUser.mockReset().mockResolvedValue({ error: null });
  signInWithPassword.mockReset().mockResolvedValue({ error: null });
  toast.mockReset();
});

describe("AccountSecuritySection step-up auth", () => {
  it("fresh session (<5min): email change goes through without re-auth dialog", async () => {
    setLastSignIn(1);
    render(<AccountSecuritySection currentEmail="old@x.com" />);
    fireEvent.change(screen.getByLabelText(/Change email/i), { target: { value: "new@x.com" } });
    fireEvent.click(screen.getAllByRole("button", { name: /Update$/i })[0]);
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith({ email: "new@x.com" }));
    expect(screen.queryByText(/Confirm your password/i)).toBeNull();
  });

  it("stale session (>5min): email change opens re-auth dialog, defers update", async () => {
    setLastSignIn(10);
    render(<AccountSecuritySection currentEmail="old@x.com" />);
    fireEvent.change(screen.getByLabelText(/Change email/i), { target: { value: "new@x.com" } });
    fireEvent.click(screen.getAllByRole("button", { name: /Update$/i })[0]);
    await screen.findByText(/Confirm your password/i);
    expect(updateUser).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText(/Current password/i), { target: { value: "pw" } });
    fireEvent.click(screen.getByRole("button", { name: /^Confirm$/i }));
    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({ email: "u@x.com", password: "pw" });
      expect(updateUser).toHaveBeenCalledWith({ email: "new@x.com" });
    });
  });

  it("stale session: password change opens re-auth dialog, defers update", async () => {
    setLastSignIn(10);
    render(<AccountSecuritySection currentEmail="old@x.com" />);
    fireEvent.change(screen.getByPlaceholderText(/^New password/i), { target: { value: "longenoughpw" } });
    fireEvent.change(screen.getByPlaceholderText(/Confirm new password/i), { target: { value: "longenoughpw" } });
    fireEvent.click(screen.getByRole("button", { name: /Update password/i }));
    await screen.findByText(/Confirm your password/i);
    expect(updateUser).not.toHaveBeenCalled();

    fireEvent.change(screen.getByPlaceholderText(/Current password/i), { target: { value: "pw" } });
    fireEvent.click(screen.getByRole("button", { name: /^Confirm$/i }));
    await waitFor(() => expect(updateUser).toHaveBeenCalledWith({ password: "longenoughpw" }));
  });

  it("stale session + wrong password: shows error, does not call updateUser", async () => {
    setLastSignIn(10);
    signInWithPassword.mockResolvedValue({ error: { message: "bad" } });
    render(<AccountSecuritySection currentEmail="old@x.com" />);
    fireEvent.change(screen.getByLabelText(/Change email/i), { target: { value: "new@x.com" } });
    fireEvent.click(screen.getAllByRole("button", { name: /Update$/i })[0]);
    await screen.findByText(/Confirm your password/i);
    fireEvent.change(screen.getByPlaceholderText(/Current password/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: /^Confirm$/i }));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: "Incorrect password" }))
    );
    expect(updateUser).not.toHaveBeenCalled();
  });
});
