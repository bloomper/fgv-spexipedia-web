import type { ReactNode } from "react";
import { Info } from "lucide-react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SidebarProvider } from "@bloomper/fgv-web-ui/ui/sidebar";
import { TooltipProvider } from "@bloomper/fgv-web-ui/ui/tooltip";
import { AppSidebar } from "@/components/app-sidebar.client";
import { SiteHeader } from "@/components/site-header.client";
import { AboutPage } from "@/components/about-page.client";
import { SupportPage } from "@/components/support-page.client";
import { HeaderSearch } from "@/components/header-search.client";
import { LoginButton } from "@/components/login-button.client";
import { NavSecondary } from "@bloomper/fgv-web-ui/shell/sidebar-parts";
import { LinkSegments, LinkTabs } from "@/components/link-tabs";
import { DataEmpty } from "@bloomper/fgv-web-ui/shell/data-empty";
import { HomeSection } from "@/components/home-section";
import { Logo } from "@bloomper/fgv-web-ui/shell/logo";
import { LogoText } from "@bloomper/fgv-web-ui/shell/logo-text";
import { Umami } from "@/components/umami";
import { SpexCard } from "@/components/wiki/spex-card";
import { CreditList, PersonList, PersonName } from "@/components/wiki/person";
import { HtmlContent } from "@/components/wiki/html-content";
import { AppLinks } from "@/components/wiki/app-links";
import { RevisionList } from "@/components/wiki/revision-list";
import { DiffView } from "@/components/wiki/diff-view";

const mocks = vi.hoisted(() => ({ push: vi.fn(), pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => ({ push: mocks.push, refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams("q=finalen"),
}));
vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children?: ReactNode; href: string }) => <a href={href} {...rest}>{children}</a>,
}));
vi.mock("next/script", () => ({ default: (props: { src: string }) => <script data-src={props.src} /> }));
vi.mock("next/server", () => ({ connection: async () => undefined }));
vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string, values?: Record<string, unknown>) => (values ? `${key}:${JSON.stringify(values)}` : key),
  getLocale: async () => "sv",
}));
vi.mock("@bloomper/fgv-web-ui/hooks/use-is-client", () => ({ useIsClient: () => true }));
vi.mock("@/components/nav-user.client", () => ({ NavUser: () => <span>nav-user</span> }));
vi.mock("@bloomper/fgv-web-ui/shell/app-switcher", () => ({ AppSwitcher: ({ title }: { title: string }) => <span>{title}</span> }));
// The language menu is tested in @bloomper/fgv-web-ui, with the shell provider it needs
vi.mock("@bloomper/fgv-web-ui/shell/toggles", async importOriginal => ({
  ...await importOriginal<typeof import("@bloomper/fgv-web-ui/shell/toggles")>(),
  LanguageToggle: () => null,
}));


afterEach(() => {
  vi.unstubAllEnvs();
});

describe("the shell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pathname = "/";
  });

  it("shows each role the pages it opens, and visitors the public ones", () => {
    const sidebar = (roles: ("USER" | "AUTHOR" | "EDITOR" | "ADMIN")[], user: { name: string; email: string } | null) => render(
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar roles={roles} accountUrl="https://auth/account" user={user as never} />
        </SidebarProvider>
      </TooltipProvider>,
    );

    const visitor = sidebar([], null);
    const visitorLinks = screen.getAllByRole("link").length;
    visitor.unmount();

    mocks.pathname = "/manage/base-data";
    sidebar(["USER", "EDITOR", "ADMIN"], { name: "Sara", email: "sara@example.org" });
    expect(screen.getAllByRole("link").length).toBeGreaterThan(visitorLinks);
    expect(screen.getByText("nav-user")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nav.baseData" })).toHaveAttribute("href", "/manage/base-data");
  });

  it("gives authors the trash and change log but not base data", async () => {
    render(
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar roles={["USER", "AUTHOR"]} accountUrl="https://auth/account" user={{ name: "A", email: "a@example.org" } as never} />
        </SidebarProvider>
      </TooltipProvider>,
    );
    expect(screen.queryByRole("link", { name: "Nav.manage" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Nav.manage" }));
    expect(screen.getByRole("link", { name: "Nav.trash" })).toHaveAttribute("href", "/manage/trash");
    expect(screen.getByRole("link", { name: "Nav.auditLog" })).toHaveAttribute("href", "/manage/audit");
    expect(screen.queryByRole("link", { name: "Nav.baseData" })).not.toBeInTheDocument();
  });

  it("has a header with the menu button, search and login", async () => {
    render(<TooltipProvider><SidebarProvider><SiteHeader applications={[]} loggedIn={false} /></SidebarProvider></TooltipProvider>);
    await userEvent.click(screen.getByRole("button", { name: "showMenu" }));
    expect(screen.getAllByRole("link", { name: /login/i }).length).toBeGreaterThan(0);
  });

  it("searches from the header", async () => {
    render(<HeaderSearch />);
    const field = screen.getByRole("searchbox");

    expect(field).toHaveValue("finalen");
    await userEvent.clear(field);
    await userEvent.type(field, "kören{enter}");
    expect(mocks.push).toHaveBeenCalledWith("/search?q=k%C3%B6ren");
    await userEvent.clear(field);
    await userEvent.type(field, "{enter}");
    expect(mocks.push).toHaveBeenLastCalledWith("/search");
  });

  it("logs in back to the page", () => {
    mocks.pathname = "/spex/1984-lasse-maja";
    render(<><LoginButton /><LoginButton compact size="default" /></>);
    expect(screen.getAllByRole("link")[0].getAttribute("href")).toContain(encodeURIComponent("/spex/1984-lasse-maja"));
  });

  it("renders the about and support pages, the secondary links and small pieces", () => {
    render(
      <SidebarProvider>
        <AboutPage feedbackEmail="feedback@example.org" />
        <SupportPage supportEmail="support@example.org" />
        <NavSecondary items={[{ title: "Om", url: "/about", icon: Info }]} />
        <LinkTabs label="Rankning" items={[{ href: "/a", label: "A", active: true }, { href: "/b", label: "B", active: false }]} />
        <LinkSegments label="Typ" items={[{ href: "/c", label: "C", active: false }]} />
        <DataEmpty title="Inget" description="Här finns inget" />
        <HomeSection id="s" title="Senaste" more={{ href: "/spex", label: "Alla" }}>innehåll</HomeSection>
        <Logo /><LogoText />
      </SidebarProvider>,
    );
    expect(screen.getByRole("link", { name: "A" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Alla" })).toHaveAttribute("href", "/spex");
    expect(screen.getAllByText(/support@example.org|feedback@example.org/).length).toBeGreaterThan(0);
  });

  it("renders spex tiles, people and credits as the viewer may see them", () => {
    render(<>
      <SpexCard spex={{ id: "s1", slug: "1984-lasse-maja", year: "1984", title: "Lasse-Maja", revival: true, published: false, poster: null }} introduction="Om en tjuv" />
      <PersonName person={{ id: "p1", name: "Bertil Basson", nickname: "Basen", url: "https://register/spexare/p1" }} />
      <PersonName person={{ nickname: null, name: null }} />
      <p data-testid="people"><PersonList people={[{ nickname: "Cellan" }, { nickname: null }, { nickname: "Fiolen" }]} /></p>
      <p data-testid="credits"><CreditList credits={[{ name: "Benny Andersson" }, { person: { nickname: "Evita" } }, { person: { nickname: null } }]} /></p>
    </>);
    expect(screen.getByRole("link", { name: /Lasse-Maja/ })).toHaveAttribute("href", "/spex/1984-lasse-maja");
    expect(screen.getByText("revival")).toBeInTheDocument();
    expect(screen.getByText("unpublished")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bertil Basson ”Basen”" })).toHaveAttribute("href", "https://register/spexare/p1");
    expect(screen.getByTestId("people").textContent).toBe("Cellan, Fiolen");
    expect(screen.getByTestId("credits").textContent).toBe("Benny Andersson, Evita");
  });

  it("renders the server's HTML, links to other applications, revisions and differences", () => {
    const { container } = render(<>
      <HtmlContent html="<p>Hej <strong>där</strong></p>" />
      <HtmlContent html={null} />
      <AppLinks links={[{ kind: "SPEXIFY_TRACK", title: "Ouvertyr", url: "https://spexify/t1" }]} compact />
      <RevisionList revisions={[{ id: "r1", target: "ARTICLE", targetId: "a1", targetTitle: "Traditioner", field: null, comment: "Stavning", hidden: true, authorName: "Anna", createdAt: "2026-01-01T10:00:00Z" }]}
                    compare={revision => `?revision=${revision.id}`} />
      <DiffView before={"a\nb"} after={"a\nc"} />
    </>);
    expect(container.querySelector(".prose-wiki strong")?.textContent).toBe("där");
    expect(container.querySelectorAll(".prose-wiki")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "SPEXIFY_TRACK" })).toHaveAttribute("href", "https://spexify/t1");
    expect(screen.getByRole("link", { name: "Traditioner" })).toHaveAttribute("href", "/articles/a1");
    expect(screen.getByRole("link", { name: "compare" })).toHaveAttribute("href", "?revision=r1");
    expect(screen.getByText("hidden")).toBeInTheDocument();
    expect(container.querySelector("pre")?.textContent).toContain("−b");
    expect(container.querySelector("pre")?.textContent).toContain("+c");
  });
});

describe("server components", () => {
  it("load Umami only when it is configured", async () => {
    expect(await Umami()).toBeNull();
    vi.stubEnv("UMAMI_URL", "http://umami");
    vi.stubEnv("UMAMI_WEBSITE_ID", "w1");
    render(await Umami() as React.ReactElement);
    expect(document.querySelector("script[data-src='/stats/script.js']")).not.toBeNull();
  });
});
