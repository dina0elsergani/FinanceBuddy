import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Wallet, TrendingUp, TrendingDown, Percent, Plus, Download } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { IncomeExpenseChart } from "@/components/charts/income-expense-chart";
import { ExpenseDistributionChart } from "@/components/charts/expense-distribution-chart";

interface DashboardData {
  totalBalance: string;
  monthlyIncome: string;
  monthlyExpenses: string;
  recentTransactions: Array<{
    id: number;
    date: string;
    description: string;
    amount: string;
    type: 'income' | 'expense';
    account: { name: string };
    category: { name: string };
  }>;
  budgetProgress: Array<{
    category: { name: string };
    budget: { amount: string };
    spent: string;
  }>;
  accountBalances: Array<{
    id: number;
    name: string;
    type: string;
    balance: string;
  }>;
}

export default function DashboardPage() {
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  const totalBalance = parseFloat(dashboardData?.totalBalance || "0");
  const monthlyIncome = parseFloat(dashboardData?.monthlyIncome || "0");
  const monthlyExpenses = parseFloat(dashboardData?.monthlyExpenses || "0");
  const budgetUsed = monthlyIncome > 0 ? Math.round((monthlyExpenses / monthlyIncome) * 100) : 0;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header title="Dashboard" subtitle={`Welcome back, ${dashboardData ? 'User' : 'Loading...'}`} />
        
        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                    <p className="text-2xl font-bold">${totalBalance.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Wallet className="text-primary text-xl" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <TrendingUp className="text-green-500 text-sm mr-1" />
                  <span className="text-green-500 text-sm font-medium">+2.5%</span>
                  <span className="text-muted-foreground text-sm ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly Income</p>
                    <p className="text-2xl font-bold text-green-600">${monthlyIncome.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <TrendingDown className="text-green-500 text-xl" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <TrendingUp className="text-green-500 text-sm mr-1" />
                  <span className="text-green-500 text-sm font-medium">+8.1%</span>
                  <span className="text-muted-foreground text-sm ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Monthly Expenses</p>
                    <p className="text-2xl font-bold text-red-600">${monthlyExpenses.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-red-500 text-xl" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <TrendingDown className="text-red-500 text-sm mr-1" />
                  <span className="text-red-500 text-sm font-medium">-3.2%</span>
                  <span className="text-muted-foreground text-sm ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Budget Used</p>
                    <p className="text-2xl font-bold text-orange-600">{budgetUsed}%</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                    <Percent className="text-orange-500 text-xl" />
                  </div>
                </div>
                <Progress value={budgetUsed} className="mt-4" />
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeExpenseChart />
            <ExpenseDistributionChart />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Accounts Overview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Accounts</CardTitle>
                <Button variant="link" size="sm">Manage</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData?.accountBalances.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Wallet className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
                      </div>
                    </div>
                    <p className={`font-semibold ${parseFloat(account.balance) < 0 ? 'text-red-600' : ''}`}>
                      ${parseFloat(account.balance).toFixed(2)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Budget Progress */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Budget Progress</CardTitle>
                <Button variant="link" size="sm">View All</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData?.budgetProgress.map((budget, index) => {
                  const spent = parseFloat(budget.spent);
                  const budgetAmount = parseFloat(budget.budget.amount);
                  const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{budget.category.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ${spent.toFixed(2)} / ${budgetAmount.toFixed(2)}
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className={`h-2 ${percentage > 100 ? 'bg-red-100' : ''}`}
                      />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Upcoming Recurring - Placeholder for now */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Recurring</CardTitle>
                <Button variant="link" size="sm">Manage</Button>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  <p>No upcoming recurring transactions</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <div className="flex items-center space-x-2">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Description</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground text-sm">Account</th>
                      <th className="text-right py-3 px-4 font-medium text-muted-foreground text-sm">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm">{transaction.description}</td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{transaction.category.name}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{transaction.account.name}</td>
                        <td className={`py-3 px-4 text-right text-sm font-medium ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
