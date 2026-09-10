/**
 * The OS-shell surface brings its own chrome (top bar + status bar inside
 * OsShell) — no Navbar/Footer wrapper here, unlike the (site) group used by
 * /projects. Route groups let both live at the same URL level without one
 * page's layout leaking into the other's.
 */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
