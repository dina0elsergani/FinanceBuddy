import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function IncomeExpenseChart() {
  // For now, using mock data - in a real app, this would come from an API
  const mockData = [
    { month: "Jan", income: 5200, expenses: 3800 },
    { month: "Feb", income: 5400, expenses: 3900 },
    { month: "Mar", income: 5100, expenses: 4100 },
    { month: "Apr", income: 5300, expenses: 3750 },
    { month: "May", income: 5500, expenses: 4200 },
    { month: "Jun", income: 5200, expenses: 3950 },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Income vs Expenses</CardTitle>
        <div className="flex items-center space-x-2">
          <Button size="sm" className="bg-primary text-primary-foreground">
            6M
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            1Y
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-muted-foreground"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                className="text-muted-foreground"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={3}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="hsl(var(--chart-4))" 
                strokeWidth={3}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
