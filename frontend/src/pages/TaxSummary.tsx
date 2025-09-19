import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Percent, ShieldHalf, CalendarIcon, Lightbulb, CheckCircle, TrendingUp as TrendingUpIcon, MessageCircle, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
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
import { Tooltip as ShadcnTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Renamed import
import { format, getYear, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery, useMutation } from '@tanstack/react-query'; // Added useMutation
import { getTaxSummary, getTaxSlabs, calculateTax, getTaxReport } from "../api/tax";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"; // New Dialog imports
import { postChatbotQuery } from "../api/chatbot"; // New Chatbot API import

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

function TaxLineChart({ data, showExpenses }: { data: any[], showExpenses: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart
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
        <Line type="monotone" dataKey="income" stroke="hsl(var(--primary))" name="Income" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        {showExpenses && <Line type="monotone" dataKey="expenses" stroke="hsl(var(--orange-500))" name="Expenses" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />}
      </LineChart>
    </ResponsiveContainer>
  );
}

function RegimeComparisonChart({ data, formatCurrency }: { data: any[], formatCurrency: (value: number) => string }) {
  const oldRegime = data.find(d => d.name === 'Old Regime');
  const newRegime = data.find(d => d.name === 'New Regime');

  const oldRegimeColor = oldRegime && newRegime && oldRegime.liability < newRegime.liability ? "hsl(var(--success))" : "hsl(var(--muted-foreground))";
  const newRegimeColor = oldRegime && newRegime && newRegime.liability < oldRegime.liability ? "hsl(var(--success))" : "hsl(var(--muted-foreground))";

  const CustomBarLabel = ({ x, y, width, value }: any) => (
    <text x={x + width / 2} y={y} fill="hsl(var(--foreground))" textAnchor="middle" dy={-10}>
      {formatCurrency(value)}
    </text>
  );

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={data}
        margin={{
          top: 20,
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
        <Bar dataKey="liability" name="Tax Liability" radius={[4, 4, 0, 0]} animationBegin={800} animationDuration={800} animationEasing="ease-in-out">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.name === 'Old Regime' ? oldRegimeColor : newRegimeColor} />
          ))}
          <LabelList dataKey="liability" content={CustomBarLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Custom Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload, formatCurrency }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const total = payload.reduce((sum, entry) => sum + entry.value, 0);
    const percentage = ((data.value / total) * 100).toFixed(2);
    return (
      <div className="rounded-md border bg-popover p-2 text-sm shadow-md">
        <p className="font-semibold text-foreground">{data.name}: {formatCurrency(data.value)}</p>
        <p className="text-muted-foreground">{percentage}% of Total</p>
      </div>
    );
  }
  return null;
};

export default function TaxSummary() {
  const [taxSummaryData, setTaxSummaryData] = useState<TaxSummaryData | null>(null);
  const [monthlyTaxData, setMonthlyTaxData] = useState([]);
  const [showMonthlyExpenses, setShowMonthlyExpenses] = useState(false); // New state for line chart toggle

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

  // Chatbot states
  interface ChatMessage {
    sender: 'user' | 'bot';
    message: string;
  }
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{ sender: 'bot', message: 'Hello! How can I help you with your taxes today?' }]);
  const [chatInput, setChatInput] = useState('');

  const chatbotMutation = useMutation({
    mutationFn: postChatbotQuery,
    onSuccess: (data) => {
      setChatHistory(prev => [...prev, { sender: 'bot', message: data.answer }]);
    },
    onError: (error) => {
      console.error("Chatbot query failed:", error);
      setChatHistory(prev => [...prev, { sender: 'bot', message: 'Sorry, something went wrong. Please try again later.' }]);
    }
  });

  const handleSendMessage = () => {
    if (chatInput.trim() === '') return;
    setChatHistory(prev => [...prev, { sender: 'user', message: chatInput }]);
    chatbotMutation.mutate({ question: chatInput });
    setChatInput('');
  };

  const handleQuickSuggestion = (term: string) => {
    setChatInput(term);
  };

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
        { month: "Jan", income: taxSummary.total_income * 0.15, expenses: taxSummary.total_expenses * 0.10 },
        { month: "Feb", income: taxSummary.total_income * 0.10, expenses: taxSummary.total_expenses * 0.15 },
        { month: "Mar", income: taxSummary.total_income * 0.20, expenses: taxSummary.total_expenses * 0.12 },
        { month: "Apr", income: taxSummary.total_income * 0.10, expenses: taxSummary.total_expenses * 0.08 },
        { month: "May", income: taxSummary.total_income * 0.25, expenses: taxSummary.total_expenses * 0.20 },
        { month: "Jun", income: taxSummary.total_income * 0.20, expenses: taxSummary.total_expenses * 0.18 },
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

  const oldRegimeTaxLiability = taxCalculation?.old_regime_tax_liability || 0;
  const newRegimeTaxLiability = taxCalculation?.new_regime_tax_liability || 0;

  const regimeSavings = useMemo(() => {
    if (oldRegimeTaxLiability < newRegimeTaxLiability) {
      return newRegimeTaxLiability - oldRegimeTaxLiability;
    } else if (newRegimeTaxLiability < oldRegimeTaxLiability) {
      return oldRegimeTaxLiability - newRegimeTaxLiability;
    } else {
      return 0;
    }
  }, [oldRegimeTaxLiability, newRegimeTaxLiability]);

  const savingsCardColorClass = useMemo(() => {
    if (oldRegimeTaxLiability < newRegimeTaxLiability) {
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
    } else if (newRegimeTaxLiability < oldRegimeTaxLiability) {
      return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
    } else {
      return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  }, [oldRegimeTaxLiability, newRegimeTaxLiability]);

  const pieChartData = useMemo(() => {
    return [
      { name: 'Income', value: currentTotalIncome, color: '#3b82f6' }, // Blue-500
      { name: 'Expenses', value: currentTotalExpenses, color: '#f97316' }, // Orange-500
      { name: 'Deductions', value: effectiveTotalDeductions, color: '#22c55e' }, // Green-500
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

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(0, i);
    return { value: format(date, 'MM'), label: format(date, 'MMM') };
  });

  const years = Array.from({ length: 5 }, (_, i) => String(getYear(new Date()) - 2 + i));

  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // New state for chatbot visibility

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

  const getTaxSavingSuggestions = useMemo(() => {
    const suggestions = [];
    if (!taxCalculation) return suggestions;

    const oldRegimeTax = taxCalculation.old_regime_tax_liability;
    const newRegimeTax = taxCalculation.new_regime_tax_liability;

    if (oldRegimeTax < newRegimeTax) {
      const savings = newRegimeTax - oldRegimeTax;
      suggestions.push({
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        title: "Switch to Old Regime",
        description: `Old Regime saves you ${formatCurrency(savings)} more tax this year!`,
        color: "bg-green-50 dark:bg-green-950"
      });
    } else if (newRegimeTax < oldRegimeTax) {
      const savings = oldRegimeTax - newRegimeTax;
      suggestions.push({
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        title: "Consider New Regime",
        description: `New Regime is better by ${formatCurrency(savings)} this year.`,
        color: "bg-green-50 dark:bg-green-950"
      });
    } else {
      suggestions.push({
        icon: <Lightbulb className="h-5 w-5 text-gray-500" />,
        title: "Regime Neutral",
        description: "Both regimes result in similar tax liability.",
        color: "bg-gray-50 dark:bg-gray-900"
      });
    }

    // 80C suggestion
    const eightyCSaved = DEDUCTION_CAPS['80C'] - deductionInputs['80C'];
    if (eightyCSaved > 0) {
      // Simplified: assuming a flat 20% tax slab benefit for additional 80C investment
      const potentialTaxSaving80C = eightyCSaved * (isNewRegime ? 0 : 0.20);
      suggestions.push({
        icon: <TrendingUpIcon className="h-5 w-5 text-blue-600" />,
        title: "Maximize 80C Savings",
        description: `Investing ${formatCurrency(eightyCSaved)} more in 80C can save approx. ${formatCurrency(potentialTaxSaving80C)} tax.`,
        color: "bg-blue-50 dark:bg-blue-950"
      });
    }

    // Example: HRA suggestion (more complex, simplified for demo)
    const hraSaved = DEDUCTION_CAPS.HRA === Infinity ? 0 : DEDUCTION_CAPS.HRA - deductionInputs.HRA;
    if (hraSaved > 0 && deductionInputs.HRA === 0) {
      suggestions.push({
        icon: <Lightbulb className="h-5 w-5 text-purple-600" />,
        title: "Claim HRA Exemption",
        description: "Don't forget to claim your House Rent Allowance exemption if you are paying rent.",
        color: "bg-purple-50 dark:bg-purple-950"
      });
    }

    return suggestions;
  }, [taxCalculation, deductionInputs, isNewRegime, formatCurrency, DEDUCTION_CAPS]);

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

      {/* Chatbot Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={isChatbotOpen} onOpenChange={setIsChatbotOpen}>
          <DialogTrigger asChild>
            <Button
              className="rounded-full p-4 shadow-lg w-16 h-16"
              aria-label="Open Chatbot"
            >
              <MessageCircle className="h-8 w-8" />
            </Button>
          </DialogTrigger>
          <DialogContent className="fixed bottom-6 right-6 top-auto left-auto -translate-x-0 -translate-y-0 w-[90vw] max-w-sm h-[70vh] max-h-[500px] flex flex-col sm:w-96 sm:h-[500px]">
            <DialogHeader>
              <DialogTitle>Tax Chatbot</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((chat, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex",
                    chat.sender === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg max-w-[70%]",
                      chat.sender === 'user'
                        ? "bg-blue-500 text-white dark:bg-blue-700"
                        : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    )}
                  >
                    {chat.message}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t flex flex-wrap gap-2">
              {['80C', '80D', 'HRA', '24b', '80G', 'Standard Deduction'].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickSuggestion(term)}
                  className="rounded-full"
                >
                  {term}
                </Button>
              ))}
            </div>
            <div className="border-t p-4 flex items-center">
              <Input
                placeholder="Ask about deductions..."
                className="flex-1 mr-2"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
              />
              <Button onClick={handleSendMessage} disabled={chatbotMutation.isPending}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
            <CardTitle className="text-lg font-semibold">Tax Saved</CardTitle>
            <Percent className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              <AnimatedNumber value={regimeSavings} format={formatCurrency} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Compared to the other regime.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Deductions Input</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ShadcnTooltipProvider>
                  <ShadcnTooltip>
                    <ShadcnTooltipTrigger asChild>
                      <Label htmlFor="80c">80C Deductions</Label>
                    </ShadcnTooltipTrigger>
                    <ShadcnTooltipContent>
                      <p>Covers investments in LIC, ELSS, PPF, EPF, Home Loan Principal, Tuition Fees, etc. Max: {formatCurrency(DEDUCTION_CAPS['80C'])}</p>
                    </ShadcnTooltipContent>
                  </ShadcnTooltip>
                </ShadcnTooltipProvider>
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
                <ShadcnTooltipProvider>
                  <ShadcnTooltip>
                    <ShadcnTooltipTrigger asChild>
                      <Label htmlFor="80d">80D Deductions</Label>
                    </ShadcnTooltipTrigger>
                    <ShadcnTooltipContent>
                      <p>Covers health insurance premiums for self, family, and parents. Max: {formatCurrency(DEDUCTION_CAPS['80D'])} (for non-senior citizens)</p>
                    </ShadcnTooltipContent>
                  </ShadcnTooltip>
                </ShadcnTooltipProvider>
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
                <ShadcnTooltipProvider>
                  <ShadcnTooltip>
                    <ShadcnTooltipTrigger asChild>
                      <Label htmlFor="hra">HRA Exemption</Label>
                    </ShadcnTooltipTrigger>
                    <ShadcnTooltipContent>
                      <p>House Rent Allowance exemption. Actual calculation is complex, depends on rent paid, salary, and location.</p>
                    </ShadcnTooltipContent>
                  </ShadcnTooltip>
                </ShadcnTooltipProvider>
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
                <ShadcnTooltipProvider>
                  <ShadcnTooltip>
                    <ShadcnTooltipTrigger asChild>
                      <Label htmlFor="home_loan">Home Loan Interest (24b)</Label>
                    </ShadcnTooltipTrigger>
                    <ShadcnTooltipContent>
                      <p>Deduction on interest paid for housing loan. Max: {formatCurrency(DEDUCTION_CAPS.home_loan)}</p>
                    </ShadcnTooltipContent>
                  </ShadcnTooltip>
                </ShadcnTooltipProvider>
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
                <ShadcnTooltipProvider>
                  <ShadcnTooltip>
                    <ShadcnTooltipTrigger asChild>
                      <Label htmlFor="nps">NPS (80CCD(1B))</Label>
                    </ShadcnTooltipTrigger>
                    <ShadcnTooltipContent>
                      <p>Additional deduction for National Pension System contributions. Max: {formatCurrency(DEDUCTION_CAPS.NPS)}</p>
                    </ShadcnTooltipContent>
                  </ShadcnTooltip>
                </ShadcnTooltipProvider>
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
                <ShadcnTooltipProvider>
                  <ShadcnTooltip>
                    <ShadcnTooltipTrigger asChild>
                      <Label htmlFor="donations">Donations (80G)</Label>
                    </ShadcnTooltipTrigger>
                    <ShadcnTooltipContent>
                      <p>Deduction for donations made to certain approved funds and institutions. Limits vary.</p>
                    </ShadcnTooltipContent>
                  </ShadcnTooltip>
                </ShadcnTooltipProvider>
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
                  animationBegin={800} // Animation start delay
                  animationDuration={800} // Animation duration
                  animationEasing="ease-in-out" // Easing function
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip formatCurrency={formatCurrency} />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Monthly Tax Trend</CardTitle>
            <div className="flex items-center space-x-2">
              <Switch
                id="show-expenses"
                checked={showMonthlyExpenses}
                onCheckedChange={setShowMonthlyExpenses}
              />
              <Label htmlFor="show-expenses">Show Expenses</Label>
            </div>
          </CardHeader>
          <CardContent>
            {monthlyTaxData.length > 0 ? <TaxLineChart data={monthlyTaxData} showExpenses={showMonthlyExpenses} /> : <p className="text-muted-foreground">Loading chart data...</p>}
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Regime Comparison & Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <RegimeComparisonChart data={regimeComparisonData} formatCurrency={formatCurrency} />
            <div className="mt-4 space-y-3">
              {getTaxSavingSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className={cn("flex items-start space-x-3 p-4 shadow-sm rounded-lg", suggestion.color)}>
                    <div className="mt-1">
                      {suggestion.icon}
                    </div>
                    <div>
                      <CardTitle className="text-md font-semibold">{suggestion.title}</CardTitle>
                      <CardContent className="p-0 text-sm mt-1 text-muted-foreground">
                        {suggestion.description}
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl">
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
