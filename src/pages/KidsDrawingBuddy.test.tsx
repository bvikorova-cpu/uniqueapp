import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import KidsDrawingBuddy from "./KidsDrawingBuddy";

const { invokeMock, getSessionMock } = vi.hoisted(() => ({
  invokeMock: vi.fn(),
  getSessionMock: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: getSessionMock,
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    functions: { invoke: invokeMock },
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock("@/components/Navbar", () => ({ default: () => <div data-testid="navbar" /> }));
vi.mock("@/components/ads/HeroRewardedAd", () => ({ HeroRewardedAd: () => <div data-testid="ad" /> }));
vi.mock("@/components/common/FloatingHowItWorks", () => ({ FloatingHowItWorks: () => null }));
vi.mock("@/components/kids/KidsGoldPassBanner", () => ({ KidsGoldPassBanner: () => <div data-testid="gold-pass" /> }));
vi.mock("@/hooks/useKidsGoldPass", () => ({ useKidsGoldPass: () => ({ hasGoldPass: true }) }));
vi.mock("@/hooks/useKidsDrawingCredits", () => ({
  KIDS_DRAWING_CREDIT_COST: 4,
  useKidsDrawingCredits: () => ({ balance: 0, canUse: true, refresh: vi.fn(), costPerUse: 4 }),
}));
vi.mock("@/hooks/useKidsDrawingCount", () => ({ useKidsDrawingCount: () => ({ count: 0 }) }));
vi.mock("@/components/kids-drawing/DrawingBuddyHero", () => ({ DrawingBuddyHero: () => <h1>Drawing Buddy</h1> }));
vi.mock("@/components/kids-drawing/DrawingWizardStepper", () => ({ DrawingWizardStepper: () => <div data-testid="stepper" /> }));
vi.mock("@/components/kids-drawing/DrawingCategorySelector", () => ({ DrawingCategorySelector: () => <div data-testid="category" /> }));
vi.mock("@/components/kids-drawing/DrawingDifficultySelector", () => ({ DrawingDifficultySelector: () => <div data-testid="difficulty" /> }));
vi.mock("@/components/kids-drawing/DrawingCanvas", () => ({ DrawingCanvas: ({ stepNumber }: { stepNumber: number }) => <div data-testid="canvas">Canvas step {stepNumber}</div> }));
vi.mock("@/components/kids-drawing/DrawingGallery", () => ({ DrawingGallery: () => <div data-testid="gallery" /> }));
vi.mock("@/components/kids-drawing/SketchEnhancer", () => ({ SketchEnhancer: () => <div data-testid="sketch" /> }));
vi.mock("@/components/kids-drawing/DrawingAchievements", () => ({ DrawingAchievements: () => <div data-testid="awards" /> }));
vi.mock("@/components/kids-drawing/QuickDrawTemplates", () => ({
  QuickDrawTemplates: ({ onSelectTemplate }: { onSelectTemplate: (topic: string, difficulty: string) => void }) => (
    <button type="button" onClick={() => onSelectTemplate("cat", "easy")}>Use Cat Template</button>
  ),
}));

const tutorialResponse = {
  title: "How to draw a happy cat",
  steps: [
    { instruction: "Draw a big circle for the head." },
    { instruction: "Add two triangle ears." },
    { instruction: "Draw eyes and a smile." },
  ],
};

function renderPage() {
  sessionStorage.setItem(
    "parental_gate_verified_kids_drawing_buddy",
    JSON.stringify({ expiresAt: Date.now() + 60_000 })
  );
  render(
    <MemoryRouter initialEntries={["/kids-drawing-buddy"]}>
      <KidsDrawingBuddy />
    </MemoryRouter>
  );
}

async function startTutorial() {
  renderPage();
  await screen.findByText("Drawing Buddy");
  fireEvent.click(screen.getByRole("tab", { name: /quick/i }));
  fireEvent.click(screen.getByRole("button", { name: /use cat template/i }));
  await screen.findByText("Step 1 of 3");
}

describe("KidsDrawingBuddy tutorial navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    getSessionMock.mockResolvedValue({ data: { session: { user: { id: "user-1" } } } });
    invokeMock.mockResolvedValue({ data: tutorialResponse, error: null });
  });

  it("advances to the next tutorial step with a desktop click", async () => {
    await startTutorial();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => expect(screen.getByText("Step 2 of 3")).toBeInTheDocument());
    expect(screen.getByText("Add two triangle ears.")).toBeInTheDocument();
    expect(screen.getByTestId("canvas")).toHaveTextContent("Canvas step 2");
  });

  it("advances to the next tutorial step with mobile pointer/touch events", async () => {
    await startTutorial();
    const next = screen.getByRole("button", { name: /next/i });

    fireEvent.pointerUp(next);
    fireEvent.touchEnd(next);

    await waitFor(() => expect(screen.getByText("Step 2 of 3")).toBeInTheDocument());
    expect(screen.getByText("Add two triangle ears.")).toBeInTheDocument();
    expect(screen.getByTestId("canvas")).toHaveTextContent("Canvas step 2");
  });
});