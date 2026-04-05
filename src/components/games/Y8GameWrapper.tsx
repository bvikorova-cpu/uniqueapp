import { useEffect } from "react";

interface Y8GameWrapperProps {
  slug: string;
  title: string;
  onBack: () => void;
}

export const Y8GameWrapper = ({ slug, title, onBack }: Y8GameWrapperProps) => {
  useEffect(() => {
    window.open(`https://poki.com/en/g/${slug}`, "_blank");
    onBack();
  }, [slug, onBack]);

  return null;
};
