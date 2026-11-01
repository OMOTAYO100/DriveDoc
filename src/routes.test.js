import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

/**
 * Static audit of in-app navigation.
 *
 * The "Add Document" button shipped broken because the router refactor
 * pointed it at /dashboard?add=1 and nothing ever read that parameter. The
 * link was valid, the route existed, and the button silently did nothing.
 *
 * These tests read the source rather than render anything, so they catch a
 * dangling destination without needing a DOM — cheap insurance against the
 * same mistake.
 */

const SRC = new URL("./", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return [".js", ".jsx"].includes(extname(entry)) ? [full] : [];
  });

const sources = walk(SRC)
  .filter((f) => !f.endsWith(".test.js"))
  .map((f) => ({ file: f, text: readFileSync(f, "utf8") }));

const appJsx = sources.find((s) => s.file.endsWith("App.jsx")).text;

/** Route patterns declared in App.jsx, e.g. "/documents/:documentId". */
const declaredRoutes = [...appJsx.matchAll(/path="([^"]+)"/g)].map((m) => m[1]);

/** Every internal destination: <Link to="/x"> and navigate("/x"). */
const destinations = sources.flatMap(({ file, text }) =>
  [
    ...[...text.matchAll(/\bto="(\/[^"{]*)"/g)].map((m) => m[1]),
    ...[...text.matchAll(/\bnavigate\("(\/[^"]*)"/g)].map((m) => m[1]),
  ].map((path) => ({ file, path }))
);

const matchesRoute = (pathname) => {
  if (declaredRoutes.includes("*")) {
    // "*" catches everything, but a deliberate link landing on the 404 page
    // is a bug, so ignore the catch-all when matching.
  }
  return declaredRoutes.some((pattern) => {
    if (pattern === "*") return false;
    const re = new RegExp(
      "^" + pattern.replace(/:[A-Za-z]+/g, "[^/]+").replace(/\//g, "\\/") + "$"
    );
    return re.test(pathname);
  });
};

describe("in-app navigation", () => {
  it("finds destinations to check", () => {
    expect(destinations.length).toBeGreaterThan(5);
  });

  it("every link and navigate() target resolves to a declared route", () => {
    const broken = destinations
      .map(({ file, path }) => ({ file, path, pathname: path.split("?")[0] }))
      .filter(({ pathname }) => !matchesRoute(pathname))
      .map(({ file, path }) => `${path}  (in ${file.split(/[\\/]/).pop()})`);

    expect(broken, "these would land on the 404 page").toEqual([]);
  });

  it("every query parameter a link sets is read somewhere", () => {
    // A link that sets ?add=1 is useless unless some component reads "add".
    const written = new Set(
      destinations
        .filter(({ path }) => path.includes("?"))
        .flatMap(({ path }) => [...new URLSearchParams(path.split("?")[1]).keys()])
    );

    const read = new Set(
      sources.flatMap(({ text }) =>
        [...text.matchAll(/searchParams\.get\("([^"]+)"\)/g)].map((m) => m[1])
      )
    );

    const orphaned = [...written].filter((key) => !read.has(key));
    expect(orphaned, "set by a link but never read — the button will do nothing").toEqual([]);
  });

  it("the routes a notification or email can deep-link to exist", () => {
    // The backend sends these; if a route is renamed the link dies silently.
    for (const pathname of ["/documents/abc123", "/reset-password"]) {
      expect(matchesRoute(pathname), `${pathname} has no route`).toBe(true);
    }
  });
});
