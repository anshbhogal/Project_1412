import { DollarSign, TrendingUp, TrendingDown, Wallet, PiggyBank, CheckCircle2, XCircle } from "lucide-react";
import { MetricCard } from "@/components/ui/metric-card";
import { ExpenseChart } from "@/components/charts/ExpenseChart";
import { IncomeExpenseChart } from "@/components/charts/IncomeExpenseChart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { healthCheck } from "../api/healthService";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { motion } from "framer-motion";
import { getTransactions } from "../api/transactions";
import { getFinancialSummary } from "../api/financial"; // New import

export default function Dashboard() {
  const [backendStatus, setBackendStatus] = useState("pending...");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [financialSummary, setFinancialSummary] = useState({
    total_income: 0,
    total_expenses: 0,
    net_savings: 0,
    investment_value: 0,
    tax_liability: 0,
    income_vs_expenses_chart_data: [],
    expense_breakdown_chart_data: [],
  });

  useEffect(() => {
    healthCheck()
      .then((data) => setBackendStatus(data.status))
      .catch(() => setBackendStatus("error"));

    getTransactions()
      .then((data) => setRecentTransactions(data.slice(0, 5))) // Get latest 5 transactions
      .catch((error) => console.error("Error fetching recent transactions:", error));

    getFinancialSummary()
      .then((data) => setFinancialSummary(data))
      .catch((error) => console.error("Error fetching financial summary:", error));
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Health Check Display */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Backend Health Check</CardTitle>
            {backendStatus === "ok" && <CheckCircle2 className="h-5 w-5 text-success" />}
            {backendStatus === "error" && <XCircle className="h-5 w-5 text-danger" />}
            {backendStatus === "pending..." && <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}
          </CardHeader>
          <CardContent>
            <p>Status: <span className="font-bold capitalize">{backendStatus}</span></p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MetricCard
            title="Total Income"
            value={<AnimatedNumber value={financialSummary.total_income} prefix="$" />}
            change="+8.2% from last month" // Placeholder for now, can be calculated later
            changeType={financialSummary.total_income > 0 ? "positive" : "neutral"}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MetricCard
            title="Total Expenses"
            value={<AnimatedNumber value={financialSummary.total_expenses} prefix="$" />}
            change="-3.1% from last month" // Placeholder
            changeType={financialSummary.total_expenses > 0 ? "negative" : "neutral"}
            icon={<TrendingDown className="h-5 w-5" />}
          />
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <MetricCard
            title="Net Savings"
            value={<AnimatedNumber value={financialSummary.net_savings} prefix="$" />}
            change="+$240 from last month" // Placeholder
            changeType={financialSummary.net_savings > 0 ? "positive" : financialSummary.net_savings < 0 ? "negative" : "neutral"}
            icon={<PiggyBank className="h-5 w-5" />}
          />
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <MetricCard
            title="Investment Value"
            value={<AnimatedNumber value={financialSummary.investment_value} prefix="$" />}
            change="+5.4% this month" // Placeholder
            changeType={financialSummary.investment_value > 0 ? "positive" : "neutral"}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <MetricCard
            title="Tax Liability"
            value={<AnimatedNumber value={financialSummary.tax_liability} prefix="$" />}
            change="Due in 45 days" // Placeholder
            changeType="neutral"
            icon={<DollarSign className="h-5 w-5" />}
          />
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle>Monthly Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseChart data={financialSummary.expense_breakdown_chart_data} />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle>Income vs Expenses Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart data={financialSummary.income_vs_expenses_chart_data} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card className="shadow-md rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full">
                  Download Report
                </Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
                  Add Transaction
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start rounded-md">
                <DollarSign className="mr-2 h-4 w-4" />
                Add Income
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-md">
                <TrendingDown className="mr-2 h-4 w-4" />
                Record Expense
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-md">
                <TrendingUp className="mr-2 h-4 w-4" />
                Add Investment
              </Button>
              <Button variant="outline" className="w-full justify-start rounded-md">
                <Wallet className="mr-2 h-4 w-4" />
                Upload Bank Statement
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 1.0 }}
        >
          <Card className="lg:col-span-2 shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.length > 0 ? (
                  recentTransactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-muted-dark last:border-b-0">
                      <div>
                        <p className="font-medium text-card-foreground">{transaction.merchant}</p>
                        <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()} • {transaction.category}</p>
                      </div>
                      <span className={`font-semibold ${
                        transaction.amount < 0 ? 'text-danger' : 'text-success'
                      }`}>
                        {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No recent transactions found. Add some to get started!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}