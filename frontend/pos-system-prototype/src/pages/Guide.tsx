import { Link } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Boxes,
  Download,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Receipt,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sections = [
  { id: "getting-started", title: "Getting started", icon: Zap },
  { id: "roles", title: "Roles & access", icon: ShieldCheck },
  { id: "staff", title: "Adding staff", icon: Users },
  { id: "products", title: "Managing products", icon: Boxes },
  { id: "sales", title: "Running a sale", icon: ShoppingCart },
  { id: "reports", title: "Reports & insights", icon: BarChart3 },
  { id: "shortcuts", title: "Tips & shortcuts", icon: KeyRound },
  { id: "faq", title: "FAQ", icon: LifeBuoy },
];

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground shadow-glow">
        {n}
      </div>
      <div className="flex-1 pt-0.5">
        <p className="font-semibold">{title}</p>
        <div className="mt-1 text-sm text-muted-foreground space-y-1">{children}</div>
      </div>
    </div>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <Card className="p-6 shadow-sm">{children}</Card>
    </section>
  );
}

export default function Guide() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl gradient-primary p-8 sm:p-10 text-primary-foreground shadow-elevated">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-2xl space-y-4">
          <Badge className="bg-white/15 text-primary-foreground border-0 hover:bg-white/20">
            <BookOpen className="mr-1.5 h-3 w-3" /> User Guide
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            Everything you need to run Jambo POS like a pro.
          </h1>
          <p className="text-primary-foreground/85">
            A friendly, no-jargon walkthrough — from your first login to closing out the day.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild variant="secondary" className="gap-2">
              <a href="/jambo-pos-user-guide.pdf" download>
                <Download className="h-4 w-4" /> Download PDF
              </a>
            </Button>
            <Button asChild variant="outline" className="gap-2 bg-transparent border-white/30 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
              <Link to="/sales">
                <ShoppingCart className="h-4 w-4" /> Open POS
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              On this page
            </p>
            <nav className="space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-base hover:bg-accent hover:text-accent-foreground"
                >
                  <s.icon className="h-4 w-4" />
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="space-y-10 min-w-0">
          <Section
            id="getting-started"
            icon={Zap}
            title="Getting started"
            subtitle="From zero to first sale in under a minute."
          >
            <div className="space-y-5">
              <Step n={1} title="Sign in">
                Go to the Login screen and use the default admin —
                <span className="font-mono"> admin</span> /{" "}
                <span className="font-mono">admin123</span>. Change the password right after.
              </Step>
              <Step n={2} title="Add your products">
                Open <b>Products</b>, click <b>Add product</b>, enter a name, price and emoji.
              </Step>
              <Step n={3} title="Run your first sale">
                Open <b>Sales</b>, tap products to fill the cart, then hit <b>Complete sale</b>.
                Print or share the receipt.
              </Step>
              <Step n={4} title="Invite your team">
                Open <b>Staff</b> and create a username + password for each person. Pick a role.
              </Step>
            </div>
          </Section>

          <Section
            id="roles"
            icon={ShieldCheck}
            title="Roles & access"
            subtitle="Three roles with sensible defaults."
          >
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  name: "Admin",
                  color: "bg-primary/10 text-primary border-primary/20",
                  perms: ["Manage staff", "Manage products", "Run sales", "View reports"],
                },
                {
                  name: "Manager",
                  color: "bg-warning/10 text-warning border-warning/20",
                  perms: ["Manage products", "Run sales", "View reports"],
                },
                {
                  name: "Cashier",
                  color: "bg-success/10 text-success border-success/20",
                  perms: ["Run sales", "Print receipts"],
                },
              ].map((r) => (
                <div key={r.name} className={`rounded-2xl border p-4 ${r.color}`}>
                  <p className="font-semibold">{r.name}</p>
                  <ul className="mt-3 space-y-1.5 text-xs text-foreground/80">
                    {r.perms.map((p) => (
                      <li key={p} className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="staff"
            icon={Users}
            title="Adding staff"
            subtitle="Admins create logins. Staff use them to sign in."
          >
            <div className="space-y-5">
              <Step n={1} title="Open the Staff page">
                Only Admins see this. It's in the sidebar under Workspace.
              </Step>
              <Step n={2} title="Click 'Add staff member'">
                Enter their full name, a username (e.g. <span className="font-mono">jane</span>),
                and a password.
              </Step>
              <Step n={3} title="Pick a role">
                Choose Admin, Manager or Cashier. You can change it later.
              </Step>
              <Step n={4} title="Share the credentials">
                Hand the username and password to your teammate — they're ready to sign in.
              </Step>
            </div>
          </Section>

          <Section
            id="products"
            icon={Boxes}
            title="Managing products"
            subtitle="Your catalog, organized and searchable."
          >
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3"><LayoutDashboard className="h-4 w-4 mt-0.5 text-primary" /><span><b>Add</b> — set name, price, category and emoji to make items easy to spot.</span></li>
              <li className="flex gap-3"><Search className="h-4 w-4 mt-0.5 text-primary" /><span><b>Search</b> — filter your grid instantly with the search box.</span></li>
              <li className="flex gap-3"><Boxes className="h-4 w-4 mt-0.5 text-primary" /><span><b>Edit & delete</b> — hover any product card for quick actions.</span></li>
            </ul>
          </Section>

          <Section
            id="sales"
            icon={ShoppingCart}
            title="Running a sale"
            subtitle="Optimized for 2-3 clicks per transaction."
          >
            <div className="space-y-5">
              <Step n={1} title="Pick products">
                Tap items in the grid. Filter by category at the top.
              </Step>
              <Step n={2} title="Adjust the cart">
                Use + / − to set quantities. Remove items with the trash icon.
              </Step>
              <Step n={3} title="Complete the sale">
                Hit the highlighted <b>Complete sale</b> button. Tax (8%) is added automatically.
              </Step>
              <Step n={4} title="Print or share the receipt">
                The receipt opens instantly — print it, or click <b>New order</b> to keep going.
              </Step>
            </div>
          </Section>

          <Section
            id="reports"
            icon={BarChart3}
            title="Reports & insights"
            subtitle="Know what's selling — and what isn't."
          >
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3"><Receipt className="h-4 w-4 mt-0.5 text-primary" /><span>Switch between <b>Today</b>, <b>7 days</b>, and <b>All time</b>.</span></li>
              <li className="flex gap-3"><BarChart3 className="h-4 w-4 mt-0.5 text-primary" /><span>See your top-selling products at a glance.</span></li>
              <li className="flex gap-3"><Download className="h-4 w-4 mt-0.5 text-primary" /><span>Export sales as <b>CSV</b> for your accountant.</span></li>
            </ul>
          </Section>

          <Section
            id="shortcuts"
            icon={KeyRound}
            title="Tips & shortcuts"
            subtitle="Move faster once you know these."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { k: "⌘ K", v: "Focus the global search" },
                { k: "Click a recent transaction", v: "Open its receipt" },
                { k: "Use emojis on products", v: "Easier to scan visually" },
                { k: "Categories", v: "Group by Drinks / Food / Bakery..." },
              ].map((s) => (
                <div key={s.k} className="flex items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3">
                  <span className="text-sm text-muted-foreground">{s.v}</span>
                  <kbd className="rounded-md border border-border bg-background px-2 py-1 font-mono text-xs">
                    {s.k}
                  </kbd>
                </div>
              ))}
            </div>
          </Section>

          <Section
            id="faq"
            icon={LifeBuoy}
            title="FAQ"
            subtitle="Answers to the questions everyone asks."
          >
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold">I forgot my password.</p>
                <p className="text-muted-foreground">
                  Ask an Admin to open <b>Staff</b>, edit your account, and set a new password.
                </p>
              </div>
              <div>
                <p className="font-semibold">Where is my data stored?</p>
                <p className="text-muted-foreground">
                  In this browser (local storage). For multi-device sync, ask us about enabling
                  Lovable Cloud.
                </p>
              </div>
              <div>
                <p className="font-semibold">Can I delete the default admin?</p>
                <p className="text-muted-foreground">
                  Create another admin first, sign in as them, then remove the original.
                </p>
              </div>
            </div>
          </Section>

          <div className="rounded-2xl border border-border bg-gradient-to-br from-primary-soft to-background p-6 text-center">
            <Sparkles className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-2 font-semibold">That's it — you're ready to sell.</p>
            <p className="text-sm text-muted-foreground">Print this guide for your team or keep it open while training.</p>
            <Button asChild className="mt-4 gap-2 shadow-glow">
              <a href="/jambo-pos-user-guide.pdf" download>
                <Download className="h-4 w-4" /> Download the PDF
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
