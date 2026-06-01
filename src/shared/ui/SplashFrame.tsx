import type { ReactNode } from "react";

import IconSVG from "../../assets/icon";

interface SplashFrameProps {
  children?: ReactNode;
}

const SplashFrame = ({ children }: SplashFrameProps) => (
  <main className="h-svh w-full container mx-auto max-w-sm flex items-center justify-center px-6">
    <div className="flex flex-col items-center justify-center w-full">
      <IconSVG width={120} height={120} />

      <h1 className="font-black text-4xl">Manna</h1>

      {children}
    </div>
  </main>
);

export default SplashFrame;
