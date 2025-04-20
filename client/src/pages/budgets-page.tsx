import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Calculator, AlertTriangle, CheckCircle } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BudgetForm } from "@/components/forms/budget-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Budget, Category } from "@shared/schema";

interface BudgetWithCategory extends Budget {
  category: Category;
}

export default function BudgetsPage() {
  const [editingBudget, setEditingBudget] = useState<BudgetWithCategory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toast } = useToast();

  const { data: budgets, isLoading } = useQuery<BudgetWithCategory[]>({
    queryKey: ["/api/budgets", selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await fetch(`/api/budgets?month=${selectedMonth}&year=${selectedYear}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch budgets");
      return response.json();
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      toast({
        title: "Success",
        description: "Budget deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (budget: BudgetWithCategory) => {
    setEditingBudget(budget);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingBudget(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      deleteBudgetMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingBudget(null);
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Mock spending data for demonstration (in a real app, this would come from the API)
  const getBudgetProgress = (budget: BudgetWithCategory) => {
    // In a real app, you'd fetch actual spending for this category/month/year
    const mockSpent = Math.random() * parseFloat(budget.amount) * 1.5; // Random spending between 0-150% of budget
    const budgetAmount = parseFloat(budget.amount);
    const percentage = Math.min((mockSpent / budgetAmount) * 100, 100);
    
    return {
      spent: mockSpent,
      percentage,
      remaining: Math.max(budgetAmount - mockSpent, 0),
      isOverBudget: mockSpent > budgetAmount,
    };
  };

  const totalBudgeted = budgets?.reduce((sum, budget) => sum + parseFloat(budget.amount), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading budgets...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header title="Budgets" subtitle="Monitor your spending limits" />
        
        <div className="p-6 space-y-6">
          {/* Controls */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Month</label>
                    <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month, index) => (
                          <SelectItem key={index} value={(index + 1).toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Year</label>
                    <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      Total Budgeted: <span className="font-semibold">${totalBudgeted.toFixed(2)}</span>
                    </p>
                  </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAdd}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Budget
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingBudget ? "Edit Budget" : "Add New Budget"}
                      </DialogTitle>
                    </DialogHeader>
                    <BudgetForm
                      budget={editingBudget}
                      defaultMonth={selectedMonth}
                      defaultYear={selectedYear}
                      onSuccess={handleDialogClose}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Budget Cards */}
          {budgets?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No budgets for this period</h3>
                <p className="text-muted-foreground mb-4">
                  Create budgets to track your spending limits for {months[selectedMonth - 1]} {selectedYear}.
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAdd}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Budget
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Budget</DialogTitle>
                    </DialogHeader>
                    <BudgetForm
                      defaultMonth={selectedMonth}
                      defaultYear={selectedYear}
                      onSuccess={handleDialogClose}
                    />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets?.map((budget) => {
                const progress = getBudgetProgress(budget);
                return (
                  <Card key={budget.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          progress.isOverBudget 
                            ? 'bg-red-100 dark:bg-red-900/20' 
                            : progress.percentage > 80 
                            ? 'bg-orange-100 dark:bg-orange-900/20'
                            : 'bg-green-100 dark:bg-green-900/20'
                        }`}>
                          {progress.isOverBudget ? (
                            <AlertTriangle className="text-red-600" />
                          ) : progress.percentage > 80 ? (
                            <AlertTriangle className="text-orange-600" />
                          ) : (
                            <CheckCircle className="text-green-600" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{budget.category.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {months[budget.month - 1]} {budget.year}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(budget)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(budget.id)}
                          disabled={deleteBudgetMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Budget</span>
                        <span className="font-semibold">${parseFloat(budget.amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Spent</span>
                        <span className={`font-semibold ${progress.isOverBudget ? 'text-red-600' : ''}`}>
                          ${progress.spent.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Remaining</span>
                        <span className={`font-semibold ${progress.remaining === 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${progress.remaining.toFixed(2)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(progress.percentage)}%</span>
                        </div>
                        <Progress 
                          value={progress.percentage} 
                          className={`h-2 ${progress.isOverBudget ? '[&>div]:bg-red-500' : progress.percentage > 80 ? '[&>div]:bg-orange-500' : ''}`}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
