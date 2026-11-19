import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { getTravelStops } from "@/lib/travel";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Travel link appears once there is at least one published place. */}
      <Navbar showTravel={getTravelStops().length > 0} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
