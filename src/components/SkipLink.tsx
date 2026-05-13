import { handleSkipLink } from "@/utils/accessibility";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      onClick={(e) => {
        e.preventDefault();
        handleSkipLink("main-content");
      }}
    >
      Skip to main content
    </a>
  );
}

export default SkipLink;
