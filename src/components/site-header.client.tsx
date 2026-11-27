"use client";

import { SiteHeader as FgvSiteHeader } from "@bloomper/fgv-web-ui/shell/site-header";
import type { Application } from "@bloomper/fgv-web-ui/shell/applications";
import { LanguageToggle, ModeToggle } from "@bloomper/fgv-web-ui/shell/toggles";
import { HeaderSearch } from "@/components/header-search.client";
import { LoginButton } from "@/components/login-button.client";

/**
 * The FGV header with Spexipedia's own controls: search, and for visitors the login button.
 */
export function SiteHeader({ applications, loggedIn }: { applications: Application[]; loggedIn: boolean }) {
  return (
    <FgvSiteHeader
      applications={applications}
      actions={
        <>
          <HeaderSearch />
          <LanguageToggle />
          <ModeToggle />
          {!loggedIn && <LoginButton compact />}
        </>
      }
    />
  );
}
