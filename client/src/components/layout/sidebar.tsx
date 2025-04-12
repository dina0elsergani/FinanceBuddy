import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { TrendingUp, BarChart3, University, ArrowLeftRight, Tag, Calculator, Repeat, User } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Accounts", href: "/accounts", icon: University },
  { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Budgets", href: "/budgets", icon: Calculator },
  { name: "Recurring", href: "/recurring", icon: Repeat },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border flex-shrink-0">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="text-sidebar-primary-foreground text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">FinanceBuddy</h1>
            <p className="text-sm text-muted-foreground">Personal Finance</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  isActive
                    ? "text-sidebar-primary bg-blue-50 dark:bg-blue-900/20"
                    : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
