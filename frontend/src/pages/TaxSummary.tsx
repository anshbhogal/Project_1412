import { useEffect, useState, useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet, Percent, ShieldHalf } from "lucide-react";
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
import { getTaxSummary } from "../api/tax";

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
  const [taxSummary, setTaxSummary] = useState(null);
  const [monthlyTaxData, setMonthlyTaxData] = useState([]);

  // Local state for financial inputs
  const [totalIncome, setTotalIncome] = useState(500000); // Placeholder
  const [totalExpenses, setTotalExpenses] = useState(200000); // Placeholder
  const [deductions80C, setDeductions80C] = useState(0);
  const [deductions80D, setDeductions80D] = useState(0);
  const [hraDeduction, setHraDeduction] = useState(0);
  const [investmentDeduction, setInvestmentDeduction] = useState(0);

  const [isNewRegime, setIsNewRegime] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Placeholder for tax calculation logic
  const calculateTax = (income, deductions, regime) => {
    let taxableIncome = income - deductions;
    if (taxableIncome < 0) taxableIncome = 0;

    let tax = 0;

    if (regime === 'old') {
      // Old Regime Slabs (simplified for example)
      if (taxableIncome <= 250000) {
        tax = 0;
      } else if (taxableIncome <= 500000) {
        tax = (taxableIncome - 250000) * 0.05;
      } else if (taxableIncome <= 1000000) {
        tax = 12500 + (taxableIncome - 500000) * 0.20;
      } else {
        tax = 112500 + (taxableIncome - 1000000) * 0.30;
      }
    } else { // New Regime Slabs (simplified for example)
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

  const totalDeductions = useMemo(() => {
    return deductions80C + deductions80D + hraDeduction + investmentDeduction;
  }, [deductions80C, deductions80D, hraDeduction, investmentDeduction]);

  const taxableIncome = useMemo(() => {
    return totalIncome - (totalExpenses + totalDeductions);
  }, [totalIncome, totalExpenses, totalDeductions]);

  const currentTaxLiability = useMemo(() => {
    return calculateTax(totalIncome, (totalExpenses + totalDeductions), isNewRegime ? 'new' : 'old');
  }, [totalIncome, totalExpenses, totalDeductions, isNewRegime]);

  const taxLiabilityNoDeductions = useMemo(() => {
    return calculateTax(totalIncome, totalExpenses, isNewRegime ? 'new' : 'old');
  }, [totalIncome, totalExpenses, isNewRegime]);

  const taxSavings = useMemo(() => {
    return taxLiabilityNoDeductions - currentTaxLiability;
  }, [taxLiabilityNoDeductions, currentTaxLiability]);

  // Placeholder for pie chart data
  const pieChartData = useMemo(() => {
    return [
      { name: 'Income', value: totalIncome, color: '#007bff' }, // Blue
      { name: 'Expenses', value: totalExpenses, color: '#ff7f0e' }, // Orange
      { name: 'Deductions', value: totalDeductions, color: '#28a745' }, // Green
    ];
  }, [totalIncome, totalExpenses, totalDeductions]);

  // Colors for the pie chart cells
  const PIE_COLORS = pieChartData.map(d => d.color);

  useEffect(() => {
    // Removed the backend call for now as per instruction
    // In a real app, the backend would provide this.
    setMonthlyTaxData([ 
      { month: "Jan", liability: currentTaxLiability * 0.15 },
      { month: "Feb", liability: currentTaxLiability * 0.10 },
      { month: "Mar", liability: currentTaxLiability * 0.20 },
      { month: "Apr", liability: currentTaxLiability * 0.10 },
      { month: "May", liability: currentTaxLiability * 0.25 },
      { month: "Jun", liability: currentTaxLiability * 0.20 },
    ]);
  }, [currentTaxLiability]);

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
              {formatCurrency(totalIncome)}
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
              {formatCurrency(totalExpenses)}
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
              {formatCurrency(taxableIncome)}
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
                  value={deductions80C}
                  onChange={(e) => setDeductions80C(parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 150000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="80d">80D Deductions</Label>
                <Input
                  id="80d"
                  type="number"
                  value={deductions80D}
                  onChange={(e) => setDeductions80D(parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 25000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="hra">HRA Exemption</Label>
                <Input
                  id="hra"
                  type="number"
                  value={hraDeduction}
                  onChange={(e) => setHraDeduction(parseFloat(e.target.value) || 0)}
                  placeholder="e.g., 60000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="investments">Other Investments/Deductions</Label>
                <Input
                  id="investments"
                  type="number"
                  value={investmentDeduction}
                  onChange={(e) => setInvestmentDeduction(parseFloat(e.target.value) || 0)}
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
