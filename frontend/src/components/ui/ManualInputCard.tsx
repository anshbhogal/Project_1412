import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

export function ManualInputCard() {
  const [salary, setSalary] = useState<string>('');
  const [expenses, setExpenses] = useState<string>('');
  const [investment, setInvestment] = useState<string>('');

  const handleSave = () => {
    // For now, just log the data to the console
    console.log({
      salary: parseFloat(salary),
      expenses: parseFloat(expenses),
      investment: parseFloat(investment),
    });
    toast({
      title: "Data Saved",
      description: "Your manual input has been saved (console logged for now).",
    });
    // Clear inputs after saving
    setSalary('');
    setExpenses('');
    setInvestment('');
  };

  return (
    <Card className="shadow-md rounded-2xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Monthly Financial Input</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
