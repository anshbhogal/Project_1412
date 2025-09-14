import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, getYear, parseISO } from 'date-fns'; // Added parseISO
import { createTransaction } from "../../api/transactions"; // New import
import { useQueryClient } from '@tanstack/react-query'; // New import for cache invalidation

export function ManualInputCard() {
  const [salary, setSalary] = useState<string>('');
  const [expenses, setExpenses] = useState<string>('');
  const [investment, setInvestment] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState<string>(String(getYear(new Date())));
  const queryClient = useQueryClient(); // Initialize query client

  const handleSave = async () => {
    const transactionDate = format(new Date(Number(selectedYear), Number(selectedMonth) - 1, 1), 'yyyy-MM-dd');
    const transactionsToCreate = [];

    if (parseFloat(salary) > 0) {
      transactionsToCreate.push({
        date: transactionDate,
        merchant: "Monthly Salary",
        description: `Manual salary input for ${format(parseISO(transactionDate), 'MMMM yyyy')}`,
        amount: parseFloat(salary),
        category: "Income",
        source: "Manual Input",
      });
    }

    if (parseFloat(expenses) > 0) {
      transactionsToCreate.push({
        date: transactionDate,
        merchant: "Monthly Expenses",
        description: `Manual expenses input for ${format(parseISO(transactionDate), 'MMMM yyyy')}`,
        amount: -parseFloat(expenses),
        category: "Expenses",
        source: "Manual Input",
      });
    }

    if (parseFloat(investment) > 0) {
      transactionsToCreate.push({
        date: transactionDate,
        merchant: "Monthly Investment",
        description: `Manual investment input for ${format(parseISO(transactionDate), 'MMMM yyyy')}`,
        amount: -parseFloat(investment),
        category: "Investment",
        source: "Manual Input",
      });
    }

    try {
      for (const transactionData of transactionsToCreate) {
        await createTransaction(transactionData);
      }

      toast({
        title: "Data Saved",
        description: `Your manual input for ${format(new Date(Number(selectedYear), Number(selectedMonth) - 1, 1), 'MMMM yyyy')} has been saved.`,
      });
      // Invalidate queries to refetch dashboard data
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

      setSalary('');
      setExpenses('');
      setInvestment('');
    } catch (error: any) {
      toast({
        title: "Error Saving Data",
        description: error.response?.data?.detail || "An error occurred while saving manual data.",
        variant: "destructive",
      });
      console.error("Error saving manual input:", error);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: format(new Date(0, i), 'MM'),
    label: format(new Date(0, i), 'MMMM'),
  }));

  const years = Array.from({ length: 5 }, (_, i) => String(getYear(new Date()) - 2 + i));

  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Monthly Financial Input</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="month">Month</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month" className="rounded-md">
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
          </div>
          <div className="grid gap-2">
            <Label htmlFor="year">Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year" className="rounded-md">
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
        <div className="grid gap-2">
          <Label htmlFor="salary">Monthly Salary (₹)</Label>
          <Input
            id="salary"
            type="number"
            placeholder="e.g., 5000"
            value={salary}
            onChange={(e) => setSalary(e.target.value)}
            className="rounded-md"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="expenses">Monthly Expenses (₹)</Label>
          <Input
            id="expenses"
            type="number"
            placeholder="e.g., 3000"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            className="rounded-md"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="investment">Monthly Investment (₹)</Label>
          <Input
            id="investment"
            type="number"
            placeholder="e.g., 500"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            className="rounded-md"
          />
        </div>
        <Button onClick={handleSave} className="w-full rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
          Save Monthly Data
        </Button>
      </CardContent>
    </Card>
  );
}
