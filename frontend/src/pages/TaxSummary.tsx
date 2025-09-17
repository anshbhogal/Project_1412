import { useEffect, useState, useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Percent, ShieldHalf, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // New import
import { Slider } from "@/components/ui/slider"; // New import
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // New Import
import { format, getYear, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from '@tanstack/react-query';
import { getTaxSummary, getTaxSlabs, calculateTax, getTaxReport } from "../api/tax";
import { Button } from "@/components/ui/button"; // New Import

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
  tax_liability_without_deductions: number;
  tax_savings: number;
  regime_better: string;
  old_regime_tax_liability: number;
  new_regime_tax_liability: number;
  deductions_used: {
    '80C': number;
    '80D': number;
    HRA: number;
    home_loan: number;
    NPS: number;
    donations: number;
  };
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
  const [deductionInputs, setDeductionInputs] = useState({
    '80C': 0,
    '80D': 0,
    HRA: 0,
    home_loan: 0,
    NPS: 0,
    donations: 0,
  });

  // Scenario Simulator states
  const [simulatedIncomeIncrease, setSimulatedIncomeIncrease] = useState(0);
  const [simulated80CIncrease, setSimulated80CIncrease] = useState(0);
  const [simulatedHRAIncrease, setSimulatedHRAIncrease] = useState(0);

  const { data: taxSummary, isLoading: isLoadingSummary, error: errorSummary } = useQuery({
    queryKey: ['taxSummary', selectedPeriodMonth, selectedPeriodYear],
    queryFn: () => {
      const currentPeriodDate = new Date(Number(selectedPeriodYear), Number(selectedPeriodMonth) - 1, 1);
      const monthStart = startOfMonth(currentPeriodDate);
      const monthEnd = endOfMonth(currentPeriodDate);
      return getTaxSummary({
        start_date: format(monthStart, "yyyy-MM-dd"),
        end_date: format(monthEnd, "yyyy-MM-dd"),
      });
    },
  });

  const { data: taxSlabs, isLoading: isLoadingSlabs, error: errorSlabs } = useQuery({
    queryKey: ['taxSlabs', 'india', isNewRegime ? 'new' : 'old'],
    queryFn: () => getTaxSlabs('india', isNewRegime ? 'new' : 'old'),
  });

  const { data: taxCalculation, isLoading: isLoadingCalculation, error: errorCalculation } = useQuery({
    queryKey: ['taxCalculation', taxSummary, deductionInputs, isNewRegime, simulatedIncomeIncrease, simulated80CIncrease, simulatedHRAIncrease],
    queryFn: () => {
      if (!taxSummary) return null;
      const  adjustedIncome = taxSummary.total_income + simulatedIncomeIncrease;
      const  adjusted80CDeduction = deductionInputs['80C'] + simulated80CIncrease;
      const  adjustedHRADeduction = deductionInputs.HRA + simulatedHRAIncrease;

      return calculateTax({
        income: adjustedIncome,
        expenses: taxSummary.total_expenses,
        deductions: {
          ...deductionInputs,
          '80C': adjusted80CDeduction,
          HRA: adjustedHRADeduction
        },
        regime: isNewRegime ? 'new' : 'old',
      });
    },
    enabled: !!taxSummary, // Only run if taxSummary is available
  });

  useEffect(() => {
    if (taxSummary) {
      setTaxSummaryData(taxSummary);
      // Populate monthlyTaxData for the chart (simplified for now)
      setMonthlyTaxData([
        { month: "Jan", liability: taxSummary.tax_liability * 0.15 },
        { month: "Feb", liability: taxSummary.tax_liability * 0.10 },
        { month: "Mar", liability: taxSummary.tax_liability * 0.20 },
        { month: "Apr", liability: taxSummary.tax_liability * 0.10 },
        { month: "May", liability: taxSummary.tax_liability * 0.25 },
        { month: "Jun", liability: taxSummary.tax_liability * 0.20 },
      ]);
    }
  }, [taxSummary]);

  if (isLoadingSummary || isLoadingSlabs || isLoadingCalculation) return <div>Loading tax data...</div>;
  if (errorSummary || errorSlabs || errorCalculation) return <div>Error: Could not fetch tax data. Please retry.</div>;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleDeductionChange = (key: string, value: string) => {
    setDeductionInputs(prev => ({
      ...prev,
      [key]: parseFloat(value) || 0,
    }));
  };

  const handleExportReport = async (reportType: 'pdf' | 'csv') => {
    try {
      const data = await getTaxReport(reportType, 'india', isNewRegime ? 'new' : 'old');
      const blob = new Blob([data], { type: reportType === 'pdf' ? 'application/pdf' : 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax_summary.${reportType}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting report:", error);
      // TODO: Show a friendly error message
    }
  };

  const currentTotalIncome = taxCalculation?.income || taxSummaryData?.total_income || 0;
  const currentTotalExpenses = taxCalculation?.expenses || taxSummaryData?.total_expenses || 0;

  const effectiveTotalDeductions = taxCalculation?.deductions_used ? Object.values(taxCalculation.deductions_used).reduce((acc: number, curr: any) => acc + curr, 0) : 0;

  const effectiveTaxableIncome = taxCalculation?.taxable_income || 0;

  const currentTaxLiability = taxCalculation?.tax_liability || 0;

  const taxLiabilityNoDeductions = taxCalculation?.tax_liability_without_deductions || 0;

  const taxSavings = taxCalculation?.tax_savings || 0;

  const savingsCardColorClass = useMemo(() => {
    if (taxSavings > 10000) { // Example threshold for "good savings"
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
    } else if (taxSavings > 0) {
      return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
    } else {
      return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"; // Default if no savings or negative
    }
  }, [taxSavings]);

  const pieChartData = useMemo(() => {
    return [
      { name: 'Income', value: currentTotalIncome, color: '#007bff' }, // Blue
      { name: 'Expenses', value: currentTotalExpenses, color: '#ff7f0e' }, // Orange
      { name: 'Deductions', value: effectiveTotalDeductions, color: '#28a745' }, // Green
    ];
  }, [currentTotalIncome, currentTotalExpenses, effectiveTotalDeductions]);

  const PIE_COLORS = pieChartData.map(d => d.color);

  const DEDUCTION_CAPS = useMemo(() => ({
    '80C': 150000,
    '80D': 25000, // Simplified, can be 50000 for seniors
    HRA: Infinity, // HRA calculation is complex and depends on many factors
    home_loan: 200000,
    NPS: 50000,
    donations: Infinity, // 80G has complex limits, simplifying for UI
  }), []);

  const getProgressValue = (deductionKey: string) => {
    const currentAmount = deductionInputs[deductionKey as keyof typeof deductionInputs];
    const cap = DEDUCTION_CAPS[deductionKey as keyof typeof DEDUCTION_CAPS];
    if (cap === Infinity) return 100; // No cap, always show full
    return Math.min((currentAmount / cap) * 100, 100);
  };

  const getProgressLabel = (deductionKey: string) => {
    const currentAmount = deductionInputs[deductionKey as keyof typeof deductionInputs];
    const cap = DEDUCTION_CAPS[deductionKey as keyof typeof DEDUCTION_CAPS];
    if (cap === Infinity) return `${formatCurrency(currentAmount)} Used`;
    return `${formatCurrency(currentAmount)} / ${formatCurrency(cap)} Used`;
  };

  const getTaxSavingSuggestion = () => {
    if (!taxCalculation) return null;

    const oldRegimeTax = taxCalculation.old_regime_tax_liability;
    const newRegimeTax = taxCalculation.new_regime_tax_liability;
    const currentRegimeTax = isNewRegime ? newRegimeTax : oldRegimeTax;

    let suggestionText = "";
    let suggestionColor = "";

    if (oldRegimeTax < newRegimeTax) {
      const savings = newRegimeTax - oldRegimeTax;
      suggestionText = `Old Regime saves you ${formatCurrency(savings)} more!`;
      suggestionColor = "text-green-600";
    } else if (newRegimeTax < oldRegimeTax) {
      const savings = oldRegimeTax - newRegimeTax;
      suggestionText = `New Regime is better by ${formatCurrency(savings)}.`;
      suggestionColor = "text-green-600";
    } else {
      suggestionText = "Both regimes result in similar tax liability.";
      suggestionColor = "text-gray-600";
    }

    // 80C suggestion
    const eightyCSaved = DEDUCTION_CAPS['80C'] - deductionInputs['80C'];
    if (eightyCSaved > 0) {
      const potentialTaxSaving80C = eightyCSaved * (isNewRegime ? 0 : 0.2); // Simplified: assuming 20% slab for old regime
      suggestionText += ` You can still invest ${formatCurrency(eightyCSaved)} more in 80C to save approx. ${formatCurrency(potentialTaxSaving80C)} tax.`;
    }

    return <p className={`text-md font-semibold mt-4 ${suggestionColor}`}>{suggestionText}</p>;
  };

  const regimeComparisonData = useMemo(() => {
    if (!taxCalculation) return [];
    return [
      { name: 'Old Regime', liability: taxCalculation.old_regime_tax_liability },
      { name: 'New Regime', liability: taxCalculation.new_regime_tax_liability },
    ];
  }, [taxCalculation]);

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
          <div className="flex space-x-2 ml-4">
            <Button onClick={() => handleExportReport('pdf')}>Export PDF</Button>
            <Button onClick={() => handleExportReport('csv')}>Export CSV</Button>
            {/* <Button>Email Report</Button> */}
          </div>
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

        <Card className={`shadow-md rounded-2xl ${savingsCardColorClass}`}>
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="80c">80C Deductions</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Covers investments in LIC, ELSS, PPF, EPF, Home Loan Principal, Tuition Fees, etc. Max: {formatCurrency(DEDUCTION_CAPS['80C'])}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input
                  id="80c"
                  type="number"
                  value={deductionInputs['80C']}
                  onChange={(e) => handleDeductionChange('80C', e.target.value)}
                  placeholder="e.g., 150000"
                  className="mt-1"
                />
                <Progress value={getProgressValue('80C')} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">{getProgressLabel('80C')}</p>
              </div>
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="80d">80D Deductions</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Covers health insurance premiums for self, family, and parents. Max: {formatCurrency(DEDUCTION_CAPS['80D'])} (for non-senior citizens)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input
                  id="80d"
                  type="number"
                  value={deductionInputs['80D']}
                  onChange={(e) => handleDeductionChange('80D', e.target.value)}
                  placeholder="e.g., 25000"
                  className="mt-1"
                />
                <Progress value={getProgressValue('80D')} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">{getProgressLabel('80D')}</p>
              </div>
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="hra">HRA Exemption</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>House Rent Allowance exemption. Actual calculation is complex, depends on rent paid, salary, and location.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input
                  id="hra"
                  type="number"
                  value={deductionInputs.HRA}
                  onChange={(e) => handleDeductionChange('HRA', e.target.value)}
                  placeholder="e.g., 60000"
                  className="mt-1"
                />
                <Progress value={getProgressValue('HRA')} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">{getProgressLabel('HRA')}</p>
              </div>
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="home_loan">Home Loan Interest (24b)</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Deduction on interest paid for housing loan. Max: {formatCurrency(DEDUCTION_CAPS.home_loan)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input
                  id="home_loan"
                  type="number"
                  value={deductionInputs.home_loan}
                  onChange={(e) => handleDeductionChange('home_loan', e.target.value)}
                  placeholder="e.g., 200000"
                  className="mt-1"
                />
                <Progress value={getProgressValue('home_loan')} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">{getProgressLabel('home_loan')}</p>
              </div>
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="nps">NPS (80CCD(1B))</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Additional deduction for National Pension System contributions. Max: {formatCurrency(DEDUCTION_CAPS.NPS)}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input
                  id="nps"
                  type="number"
                  value={deductionInputs.NPS}
                  onChange={(e) => handleDeductionChange('NPS', e.target.value)}
                  placeholder="e.g., 50000"
                  className="mt-1"
                />
                <Progress value={getProgressValue('NPS')} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">{getProgressLabel('NPS')}</p>
              </div>
              <div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label htmlFor="donations">Donations (80G)</Label>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Deduction for donations made to certain approved funds and institutions. Limits vary.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Input
                  id="donations"
                  type="number"
                  value={deductionInputs.donations}
                  onChange={(e) => handleDeductionChange('donations', e.target.value)}
                  placeholder="e.g., 10000"
                  className="mt-1"
                />
                <Progress value={getProgressValue('donations')} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">{getProgressLabel('donations')}</p>
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

        <Card className="shadow-md rounded-2xl col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Regime Comparison & Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={regimeComparisonData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="fill-foreground" />
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
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="liability" fill="hsl(var(--primary))" name="Tax Liability" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {getTaxSavingSuggestion()}
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Scenario Simulator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="income-increase">Salary Increase: {formatCurrency(simulatedIncomeIncrease)}</Label>
                <Slider
                  id="income-increase"
                  min={0}
                  max={500000} // Max increase of 5 lakhs for example
                  step={10000}
                  value={[simulatedIncomeIncrease]}
                  onValueChange={([value]) => setSimulatedIncomeIncrease(value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="80c-increase">Extra 80C Investments: {formatCurrency(simulated80CIncrease)}</Label>
                <Slider
                  id="80c-increase"
                  min={0}
                  max={DEDUCTION_CAPS['80C'] - deductionInputs['80C']} // Max up to 80C limit
                  step={10000}
                  value={[simulated80CIncrease]}
                  onValueChange={([value]) => setSimulated80CIncrease(value)}
                  className="mt-2"
                  disabled={(DEDUCTION_CAPS['80C'] - deductionInputs['80C']) <= 0}
                />
              </div>
              <div>
                <Label htmlFor="hra-increase">Higher HRA: {formatCurrency(simulatedHRAIncrease)}</Label>
                <Slider
                  id="hra-increase"
                  min={0}
                  max={100000} // Max increase of 1 lakh for example
                  step={5000}
                  value={[simulatedHRAIncrease]}
                  onValueChange={([value]) => setSimulatedHRAIncrease(value)}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
