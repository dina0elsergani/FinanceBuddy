import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertRecurringTransactionSchema, type Account, type Category } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface RecurringTransactionWithDetails {
  id: number;
  amount: string;
  description: string;
  type: "income" | "expense";
  frequency: "daily" | "weekly" | "monthly";
  nextRunDate: string;
  accountId: number;
  categoryId: number;
  isActive: boolean;
  account: Account;
  category: Category;
}

interface RecurringFormProps {
  recurringTransaction?: RecurringTransactionWithDetails | null;
  onSuccess: () => void;
}

type FormData = {
  amount: string;
  description: string;
  type: "income" | "expense";
  frequency: "daily" | "weekly" | "monthly";
  nextRunDate: string;
  accountId: string;
  categoryId: string;
  isActive: boolean;
};

export function RecurringForm({ recurringTransaction, onSuccess }: RecurringFormProps) {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(insertRecurringTransactionSchema.extend({
      accountId: insertRecurringTransactionSchema.shape.accountId.transform(String),
      categoryId: insertRecurringTransactionSchema.shape.categoryId.transform(String),
    })),
    defaultValues: {
      amount: recurringTransaction?.amount || "",
      description: recurringTransaction?.description || "",
      type: recurringTransaction?.type || "expense",
      frequency: recurringTransaction?.frequency || "monthly",
      nextRunDate: recurringTransaction?.nextRunDate ? new Date(recurringTransaction.nextRunDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      accountId: recurringTransaction?.accountId?.toString() || "",
      categoryId: recurringTransaction?.categoryId?.toString() || "",
      isActive: recurringTransaction?.isActive ?? true,
    },
  });

  const { data: accounts } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const selectedType = form.watch("type");
  const filteredCategories = categories?.filter(cat => cat.type === selectedType) || [];

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        accountId: parseInt(data.accountId),
        categoryId: parseInt(data.categoryId),
        nextRunDate: new Date(data.nextRunDate).toISOString(),
      };
      const res = await apiRequest("POST", "/api/recurring-transactions", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-transactions"] });
      toast({
        title: "Success",
        description: "Recurring transaction created successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create recurring transaction",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        accountId: parseInt(data.accountId),
        categoryId: parseInt(data.categoryId),
        nextRunDate: new Date(data.nextRunDate).toISOString(),
      };
      const res = await apiRequest("PUT", `/api/recurring-transactions/${recurringTransaction!.id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-transactions"] });
      toast({
        title: "Success",
        description: "Recurring transaction updated successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update recurring transaction",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    if (recurringTransaction) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nextRunDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Run Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="e.g., Monthly rent payment"
                  rows={2}
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frequency</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Enable automatic transaction generation
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {recurringTransaction ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
