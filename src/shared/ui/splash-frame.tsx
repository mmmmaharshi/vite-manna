import type { ReactNode } from "react";

import IconSVG from "../../assets/icon";

interface SplashFrameProps {
  children?: ReactNode;
}

const SplashFrame = ({ children }: SplashFrameProps) => (
  <main className="container mx-auto flex h-svh w-full max-w-md items-center justify-center px-6 sm:max-w-lg md:max-w-xl">
    <div className="flex w-full flex-col items-center justify-center">
      <IconSVG width={120} height={120} aria-hidden="true" />

      <h1 className="text-4xl font-black">Manna</h1>

      {children}
    </div>
  </main>
);

export default SplashFrame;
