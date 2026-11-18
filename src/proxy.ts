import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { contentSecurityPolicy } from "@/utils/csp";
import { lookupRedirect, oldWikiTitle, spexAddressById } from "@/lib/http/old-wiki";

const AUTH_BASE_PATH = "/api/auth";
const ACCOUNT_COOKIE = "account_data";

/**
 * Sends old MediaWiki addresses on, refreshes the account cookie, and gives every page its Content Security Policy,
 * which names Spexipedia's and Spexgram's media hostnames.
 */
export async function proxy(request: NextRequest) {
  const title = request.method === "GET" ? oldWikiTitle(request.nextUrl.pathname, request.nextUrl.searchParams) : null;

  if (title) {
    const target = await lookupRedirect(title, process.env.API_GRAPHQL_ENDPOINT);
    const url = request.nextUrl.clone();

    url.search = "";
    if (target) {
      url.pathname = target;
      return NextResponse.redirect(url, 308);
    }
    url.pathname = "/search";
    url.searchParams.set("q", title);
    return NextResponse.redirect(url, 307);
  }

  const spexAddress = request.method === "GET" ? await spexAddressById(request.nextUrl.pathname, process.env.API_GRAPHQL_ENDPOINT) : null;

  if (spexAddress) {
    const url = request.nextUrl.clone();

    url.pathname = spexAddress;
    return NextResponse.redirect(url, 308);
  }

  const result = await refresh(request);

  if (!request.nextUrl.pathname.startsWith("/api/")) {
    result.headers.set("Content-Security-Policy",
      contentSecurityPolicy([process.env.MEDIA_ORIGIN, process.env.SPEXGRAM_MEDIA_ORIGIN], process.env.NODE_ENV === "development"));
  }
  return result;
}

async function refresh(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.next();

  const { pathname } = request.nextUrl;

  if (pathname === AUTH_BASE_PATH || pathname.startsWith(`${AUTH_BASE_PATH}/`)) {
    return response;
  }

  if (request.headers.get("next-router-prefetch") === "1") {
    return response;
  }

  const hasAccountCookie = request.cookies
    .getAll()
    .some(({ name }) => name.includes(ACCOUNT_COOKIE));

  if (!hasAccountCookie) {
    return response;
  }

  try {
    const { headers } = await auth.api.getAccessToken({
      body: { useAccountCookie: true },
      headers: request.headers,
      returnHeaders: true,
    });
    const setCookies = headers.getSetCookie();

    if (setCookies.length === 0) {
      return response;
    }

    for (const setCookie of setCookies) {
      applySetCookie(request, setCookie);
    }

    const refreshed = NextResponse.next({ request: { headers: request.headers } });

    for (const setCookie of setCookies) {
      refreshed.headers.append("set-cookie", setCookie);
    }

    return refreshed;
  } catch {
  }

  return response;
}

function applySetCookie(request: NextRequest, setCookie: string) {
  const [pair, ...attributes] = setCookie.split(";").map(part => part.trim());
  const separator = pair.indexOf("=");
  const name = pair.slice(0, separator);
  const value = pair.slice(separator + 1);
  const expired = value === "" || attributes.some(attribute => {
    const [key, attributeValue = ""] = attribute.split("=");

    return (key.toLowerCase() === "max-age" && Number(attributeValue) <= 0)
      || (key.toLowerCase() === "expires" && Date.parse(attributeValue) <= Date.now());
  });

  if (expired) {
    request.cookies.delete(name);
  } else {
    request.cookies.set(name, value);
  }
}

// The parts of a spex package's zip skip the proxy, which would otherwise copy each request body into memory
// (proxyClientMaxBodySize); their route handler streams them on with the user's token.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|static/|stats/|api/packages/[^/]+/zip).*)"],
};
