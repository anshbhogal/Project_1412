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
import { format, getYear } from 'date-fns';

export function ManualInputCard() {
  const [salary, setSalary] = useState<string>('');
  const [expenses, setExpenses] = useState<string>('');
  const [investment, setInvestment] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MM')); // Default to current month
  const [selectedYear, setSelectedYear] = useState<string>(String(getYear(new Date()))); // Default to current year

  const handleSave = () => {
    // For now, just log the data to the console
    console.log({
      month: selectedMonth,
      year: selectedYear,
      salary: parseFloat(salary),
      expenses: parseFloat(expenses),
      investment: parseFloat(investment),
    });
    toast({
      title: "Data Saved",
      description: `Your manual input for ${format(new Date(Number(selectedYear), Number(selectedMonth) - 1, 1), 'MMMM yyyy')} has been saved (console logged for now).`,
    });
    // Clear inputs after saving
    setSalary('');
    setExpenses('');
    setInvestment('');
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: format(new Date(0, i), 'MM'),
    label: format(new Date(0, i), 'MMMM'),
  }));

  const years = Array.from({ length: 5 }, (_, i) => String(getYear(new Date()) - 2 + i)); // Current year +/- 2

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
          <Label htmlFor="salary">Monthly Salary ($)</Label>
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
          <Label htmlFor="expenses">Monthly Expenses ($)</Label>
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
          <Label htmlFor="investment">Monthly Investment ($)</Label>
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
