import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, University, PiggyBank, CreditCard } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AccountForm } from "@/components/forms/account-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Account } from "@shared/schema";

export default function AccountsPage() {
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: accounts, isLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Success",
        description: "Account deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <University className="text-blue-600" />;
      case 'savings':
        return <PiggyBank className="text-green-600" />;
      case 'credit':
        return <CreditCard className="text-orange-600" />;
      default:
        return <University className="text-blue-600" />;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'checking':
        return 'default';
      case 'savings':
        return 'secondary';
      case 'credit':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingAccount(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this account?")) {
      deleteAccountMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingAccount(null);
  };

  const totalBalance = accounts?.reduce((sum, account) => sum + parseFloat(account.balance), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading accounts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header title="Accounts" subtitle="Manage your financial accounts" />
        
        <div className="p-6 space-y-6">
          {/* Summary Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
                  <p className="text-3xl font-bold">${totalBalance.toFixed(2)}</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAdd}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingAccount ? "Edit Account" : "Add New Account"}
                      </DialogTitle>
                    </DialogHeader>
                    <AccountForm
                      account={editingAccount}
                      onSuccess={handleDialogClose}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts?.map((account) => (
              <Card key={account.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{account.name}</CardTitle>
                      <Badge variant={getBadgeVariant(account.type)} className="mt-1">
                        {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(account)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(account.id)}
                      disabled={deleteAccountMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Balance</div>
                    <div className={`text-2xl font-bold ${
                      parseFloat(account.balance) < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ${parseFloat(account.balance).toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {accounts?.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <University className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No accounts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first financial account to begin tracking your finances.
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAdd}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Account</DialogTitle>
                    </DialogHeader>
                    <AccountForm onSuccess={handleDialogClose} />
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
