import { useEffect, useState, useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Percent, ShieldHalf, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, getYear, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { getTaxSummary } from "../api/tax";

interface TaxSummaryData {
  total_income: number;
  total_expenses: number;
  deductions_80c: number;
  deductions_80d: number;
  hra_deduction: number;
  investment_deduction: number;
  total_deductions: number;
  taxable_income: number;
  tax_liability: number;
}

function TaxBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="fill-foreground" />
        <YAxis className="fill-foreground" />
        <Tooltip 
          cursor={{ fill: 'hsl(var(--muted))', opacity: '0.2' }} 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))', 
            borderColor: 'hsl(var(--border))', 
            borderRadius: 'var(--radius)' 
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend />
        <Bar dataKey="liability" fill="hsl(var(--primary))" name="Tax Liability" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function TaxSummary() {
  const [taxSummaryData, setTaxSummaryData] = useState<TaxSummaryData | null>(null);
  const [monthlyTaxData, setMonthlyTaxData] = useState([]);

  const [selectedPeriodMonth, setSelectedPeriodMonth] = useState<string>(format(new Date(), 'MM'));
  const [selectedPeriodYear, setSelectedPeriodYear] = useState<string>(String(getYear(new Date())));

  const [isNewRegime, setIsNewRegime] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Tax calculation logic (now uses fetched data when available, otherwise defaults)
  const calculateTax = (income: number, deductions: number, regime: string) => {
    let taxableIncome = income - deductions;
    if (taxableIncome < 0) taxableIncome = 0;

    let tax = 0;

    if (regime === 'old') {
      if (taxableIncome <= 250000) {
        tax = 0;
      } else if (taxableIncome <= 500000) {
        tax = (taxableIncome - 250000) * 0.05;
      } else if (taxableIncome <= 1000000) {
        tax = 12500 + (taxableIncome - 500000) * 0.20;
      } else {
        tax = 112500 + (taxableIncome - 1000000) * 0.30;
      }
    } else { // New Regime Slabs
      if (taxableIncome <= 300000) {
        tax = 0;
      } else if (taxableIncome <= 600000) {
        tax = (taxableIncome - 300000) * 0.05;
      } else if (taxableIncome <= 900000) {
        tax = 15000 + (taxableIncome - 600000) * 0.10;
      } else if (taxableIncome <= 1200000) {
        tax = 45000 + (taxableIncome - 900000) * 0.15;
      } else if (taxableIncome <= 1500000) {
        tax = 90000 + (taxableIncome - 1200000) * 0.20;
      } else {
        tax = 150000 + (taxableIncome - 1500000) * 0.30;
      }
    }
    return tax;
  };

  // Use memoized values for calculations based on fetched data or local inputs
  const currentTotalIncome = taxSummaryData?.total_income || 0;
  const currentTotalExpenses = taxSummaryData?.total_expenses || 0;
  const currentDeductions80C = taxSummaryData?.deductions_80c || 0;
  const currentDeductions80D = taxSummaryData?.deductions_80d || 0;
  const currentHraDeduction = taxSummaryData?.hra_deduction || 0;
  const currentInvestmentDeduction = taxSummaryData?.investment_deduction || 0;

  const effectiveTotalDeductions = useMemo(() => {
    // Frontend logic for deductions, allowing user input to override/supplement fetched data
    // For now, we'll just use fetched data if available, otherwise 0
    return currentDeductions80C + currentDeductions80D + currentHraDeduction + currentInvestmentDeduction;
  }, [currentDeductions80C, currentDeductions80D, currentHraDeduction, currentInvestmentDeduction]);

  const effectiveTaxableIncome = useMemo(() => {
    return currentTotalIncome - (currentTotalExpenses + effectiveTotalDeductions);
  }, [currentTotalIncome, currentTotalExpenses, effectiveTotalDeductions]);

  const currentTaxLiability = useMemo(() => {
    return calculateTax(currentTotalIncome, (currentTotalExpenses + effectiveTotalDeductions), isNewRegime ? 'new' : 'old');
  }, [currentTotalIncome, currentTotalExpenses, effectiveTotalDeductions, isNewRegime]);

  const taxLiabilityNoDeductions = useMemo(() => {
    return calculateTax(currentTotalIncome, currentTotalExpenses, isNewRegime ? 'new' : 'old');
  }, [currentTotalIncome, currentTotalExpenses, isNewRegime]);

  const taxSavings = useMemo(() => {
    return taxLiabilityNoDeductions - currentTaxLiability;
  }, [taxLiabilityNoDeductions, currentTaxLiability]);

  const pieChartData = useMemo(() => {
    return [
      { name: 'Income', value: currentTotalIncome, color: '#007bff' }, // Blue
      { name: 'Expenses', value: currentTotalExpenses, color: '#ff7f0e' }, // Orange
      { name: 'Deductions', value: effectiveTotalDeductions, color: '#28a745' }, // Green
    ];
  }, [currentTotalIncome, currentTotalExpenses, effectiveTotalDeductions]);

  const PIE_COLORS = pieChartData.map(d => d.color);

  useEffect(() => {
    const fetchTaxData = async () => {
      const currentPeriodDate = new Date(Number(selectedPeriodYear), Number(selectedPeriodMonth) - 1, 1);
      const monthStart = startOfMonth(currentPeriodDate);
      const monthEnd = endOfMonth(currentPeriodDate);

      try {
        const data = await getTaxSummary({
          start_date: format(monthStart, "yyyy-MM-dd"),
          end_date: format(monthEnd, "yyyy-MM-dd"),
        });
        setTaxSummaryData(data);
        // Populate monthlyTaxData for the chart (simplified for now)
        setMonthlyTaxData([
          { month: "Jan", liability: data.tax_liability * 0.15 },
          { month: "Feb", liability: data.tax_liability * 0.10 },
          { month: "Mar", liability: data.tax_liability * 0.20 },
          { month: "Apr", liability: data.tax_liability * 0.10 },
          { month: "May", liability: data.tax_liability * 0.25 },
          { month: "Jun", liability: data.tax_liability * 0.20 },
        ]);
      } catch (error) {
        console.error("Error fetching tax summary:", error);
        setTaxSummaryData(null); // Clear data on error
      }
    };
    fetchTaxData();
  }, [selectedPeriodMonth, selectedPeriodYear]);

  // Months and Years for selection
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: format(new Date(0, i), 'MM'),
    label: format(new Date(0, i), 'MMMM'),
  }));
  const years = Array.from({ length: 5 }, (_, i) => String(getYear(new Date()) - 2 + i));

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tax Summary</h1>
          <p className="text-muted-foreground">Overview of your tax liabilities and savings.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="regime-switch">New Regime</Label>
          <Switch
            id="regime-switch"
            checked={isNewRegime}
            onCheckedChange={setIsNewRegime}
          />
          <Select value={selectedPeriodMonth} onValueChange={setSelectedPeriodMonth}>
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
          <Select value={selectedPeriodYear} onValueChange={setSelectedPeriodYear}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-md rounded-2xl bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Total Income</CardTitle>
            <TrendingUp className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {formatCurrency(currentTotalIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-2"></p>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Total Expenses</CardTitle>
            <TrendingDown className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {formatCurrency(currentTotalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-2"></p>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Taxable Income</CardTitle>
            <Wallet className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {formatCurrency(effectiveTaxableIncome)}
            </div>
            <p className="text-xs text-muted-foreground mt-2"></p>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Tax Liability</CardTitle>
            <Percent className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {formatCurrency(currentTaxLiability)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tax Savings: <span className="font-semibold">{formatCurrency(taxSavings)}</span> compared to no deductions.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Deductions Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="80c">80C Deductions</Label>
                <Input
                  id="80c"
                  type="number"
                  value={currentDeductions80C}
                  onChange={(e) => setTaxSummaryData(prev => prev ? { ...prev, deductions_80c: parseFloat(e.target.value) || 0 } : null)}
                  placeholder="e.g., 150000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="80d">80D Deductions</Label>
                <Input
                  id="80d"
                  type="number"
                  value={currentDeductions80D}
                  onChange={(e) => setTaxSummaryData(prev => prev ? { ...prev, deductions_80d: parseFloat(e.target.value) || 0 } : null)}
                  placeholder="e.g., 25000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hra">HRA Exemption</Label>
                <Input
                  id="hra"
                  type="number"
                  value={currentHraDeduction}
                  onChange={(e) => setTaxSummaryData(prev => prev ? { ...prev, hra_deduction: parseFloat(e.target.value) || 0 } : null)}
                  placeholder="e.g., 60000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="investments">Other Investments/Deductions</Label>
                <Input
                  id="investments"
                  type="number"
                  value={currentInvestmentDeduction}
                  onChange={(e) => setTaxSummaryData(prev => prev ? { ...prev, investment_deduction: parseFloat(e.target.value) || 0 } : null)}
                  placeholder="e.g., 50000"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Income, Expenses & Deductions Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Monthly Tax Liability Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyTaxData.length > 0 ? <TaxBarChart data={monthlyTaxData} /> : <p className="text-muted-foreground">Loading chart data...</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
