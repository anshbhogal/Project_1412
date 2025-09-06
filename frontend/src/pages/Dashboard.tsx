import { DollarSign, TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { ExpenseChart } from "@/components/charts/ExpenseChart";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            Download Report
          </Button>
          <Button className="bg-gradient-primary hover:opacity-90">
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Total Income"
          value="$6,200"
          change="+8.2% from last month"
          changeType="positive"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="Total Expenses"
          value="$4,300"
          change="-3.1% from last month"
          changeType="positive"
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <MetricCard
          title="Net Savings"
          value="$1,900"
          change="+$240 from last month"
          changeType="positive"
          icon={<PiggyBank className="h-5 w-5" />}
        />
        <MetricCard
          title="Investment Value"
          value="$24,500"
          change="+5.4% this month"
          changeType="positive"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <MetricCard
          title="Tax Liability"
          value="$2,100"
          change="Due in 45 days"
          changeType="neutral"
          icon={<DollarSign className="h-5 w-5" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart />
        <IncomeExpenseChart />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              Add Income
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingDown className="mr-2 h-4 w-4" />
              Record Expense
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Add Investment
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Wallet className="mr-2 h-4 w-4" />
              Upload Bank Statement
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { description: "Grocery Store", amount: "-$89.50", date: "Today", category: "Food" },
                { description: "Salary Deposit", amount: "+$3,200.00", date: "Yesterday", category: "Income" },
                { description: "Electric Bill", amount: "-$125.30", date: "2 days ago", category: "Utilities" },
                { description: "Gas Station", amount: "-$45.20", date: "3 days ago", category: "Transportation" },
                { description: "Investment Return", amount: "+$156.80", date: "4 days ago", category: "Investment" },
              ].map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-muted-dark last:border-b-0">
                  <div>
                    <p className="font-medium text-card-foreground">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.date} • {transaction.category}</p>
                  </div>
                  <span className={`font-semibold ${
                    transaction.amount.startsWith('+') ? 'text-success' : 'text-danger'
                  }`}>
                    {transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}