import { ReaderScreen } from "../features/reader";
import { SplashView } from "../shared/ui";

import { useAppShell } from "./useAppShell";

const AppShell = () => {
  const status = useAppShell();

  if (status.kind === "progress" || status.kind === "error") {
    return (
      <SplashView
        error={status.kind === "error" ? status.message : null}
        message={status.kind === "progress" ? status.message : undefined}
        onRetry={status.onRetry}
        progress={status.kind === "progress" ? status.progress : null}
      />
    );
  }

  if (status.kind === "splash") {
    return <SplashView />;
  }

  return <ReaderScreen />;
};

export default AppShell;
