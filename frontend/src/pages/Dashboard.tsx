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
import { getFinancialSummary } from "../api/financial";
import { format, subMonths, startOfMonth, endOfMonth, getYear } from "date-fns"; // Added getYear
import { ManualInputCard } from "@/components/ui/ManualInputCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // New imports

interface FinancialSummaryData {
  total_income: number;
  total_expenses: number;
  net_savings: number;
  investment_value: number;
  tax_liability: number;
  income_vs_expenses_chart_data: any[];
  expense_breakdown_chart_data: any[];
}

export default function Dashboard() {
  const [backendStatus, setBackendStatus] = useState("pending...");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [selectedDashboardMonth, setSelectedDashboardMonth] = useState<string>(format(new Date(), 'MM')); // New state
  const [selectedDashboardYear, setSelectedDashboardYear] = useState<string>(String(getYear(new Date()))); // New state
  const [currentMonthSummary, setCurrentMonthSummary] = useState<FinancialSummaryData>({
    total_income: 0,
    total_expenses: 0,
    net_savings: 0,
    investment_value: 0,
    tax_liability: 0,
    income_vs_expenses_chart_data: [],
    expense_breakdown_chart_data: [],
  });
  const [previousMonthSummary, setPreviousMonthSummary] = useState<FinancialSummaryData>({
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

    const fetchFinancialData = async () => {
      const currentPeriodDate = new Date(Number(selectedDashboardYear), Number(selectedDashboardMonth) - 1, 1); // Use selected month/year
      const currentMonthStart = startOfMonth(currentPeriodDate);
      const currentMonthEnd = endOfMonth(currentPeriodDate);
      const previousMonthStart = startOfMonth(subMonths(currentPeriodDate, 1));
      const previousMonthEnd = endOfMonth(subMonths(currentPeriodDate, 1));

      try {
        const currentSummary = await getFinancialSummary({
          start_date: format(currentMonthStart, "yyyy-MM-dd"),
          end_date: format(currentMonthEnd, "yyyy-MM-dd"),
        });
        setCurrentMonthSummary(currentSummary);

        const previousSummary = await getFinancialSummary({
          start_date: format(previousMonthStart, "yyyy-MM-dd"),
          end_date: format(previousMonthEnd, "yyyy-MM-dd"),
        });
        setPreviousMonthSummary(previousSummary);
      } catch (error) {
        console.error("Error fetching financial summary:", error);
      }
    };

    fetchFinancialData();
  }, [selectedDashboardMonth, selectedDashboardYear]); // Rerun effect when month/year changes

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: "N/A", type: "neutral" };
    const change = ((current - previous) / previous) * 100;
    const type = change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
    return { value: `${change.toFixed(1)}% from last month`, type };
  };

  const incomeChange = calculateChange(currentMonthSummary.total_income, previousMonthSummary.total_income);
  const expenseChange = calculateChange(currentMonthSummary.total_expenses, previousMonthSummary.total_expenses);
  const netSavingsChange = calculateChange(currentMonthSummary.net_savings, previousMonthSummary.net_savings);
  const investmentValueChange = calculateChange(currentMonthSummary.investment_value, previousMonthSummary.investment_value);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: format(new Date(0, i), 'MM'),
    label: format(new Date(0, i), 'MMMM'),
  }));

  const years = Array.from({ length: 5 }, (_, i) => String(getYear(new Date()) - 2 + i));

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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedDashboardMonth} onValueChange={setSelectedDashboardMonth}>
            <SelectTrigger className="w-[140px] rounded-md">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedDashboardYear} onValueChange={setSelectedDashboardYear}>
            <SelectTrigger className="w-[100px] rounded-md">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            value={<AnimatedNumber value={currentMonthSummary.total_income} prefix="$" />}
            change={incomeChange.value}
            changeType={incomeChange.type}
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
            value={<AnimatedNumber value={currentMonthSummary.total_expenses} prefix="$" />}
            change={expenseChange.value}
            changeType={expenseChange.type}
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
            value={<AnimatedNumber value={currentMonthSummary.net_savings} prefix="$" />}
            change={netSavingsChange.value}
            changeType={netSavingsChange.type}
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
            value={<AnimatedNumber value={currentMonthSummary.investment_value} prefix="$" />}
            change={investmentValueChange.value}
            changeType={investmentValueChange.type}
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
            value={<AnimatedNumber value={currentMonthSummary.tax_liability} prefix="$" />}
            change="Due in 45 days" // Keep placeholder for now, as backend doesn't provide this
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
              <ExpenseChart data={currentMonthSummary.expense_breakdown_chart_data} />
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
              <IncomeExpenseChart data={currentMonthSummary.income_vs_expenses_chart_data} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Manual Input Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <ManualInputCard />
        </motion.div>

        {/* Recent Transactions (now takes up two columns) */}
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