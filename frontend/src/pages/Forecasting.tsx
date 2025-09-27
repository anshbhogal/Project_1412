import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import { getForecast } from '../api/forecasting';
import { AnimatedNumber } from '../components/ui/animated-number';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

interface ForecastResult {
  month: string;
  income: number;
  expenses: number;
}

interface ForecastResponse {
  predictions: ForecastResult[];
}

const Forecasting = () => {
  const [months, setMonths] = useState<number>(6);

  const { data, isLoading, error, refetch } = useQuery<ForecastResponse>({
    queryKey: ['forecasts', months],
    queryFn: () => getForecast(months),
  });

  const handleMonthsChange = () => {
    refetch();
  };

  const nextMonthPrediction = data?.predictions[0];
  const projectedSavings =
    (nextMonthPrediction?.income || 0) - (nextMonthPrediction?.expenses || 0);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Financial Forecasting</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Month's Predicted Income
            </CardTitle>
            <span role="img" aria-label="income" className="text-2xl">
              💸
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedNumber value={nextMonthPrediction?.income || 0} />
            </div>
            <p className="text-xs text-muted-foreground">
              Projected for{' '}
              {nextMonthPrediction?.month
                ? format(new Date(nextMonthPrediction.month), 'MMM yyyy')
                : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Month's Predicted Expenses
            </CardTitle>
            <span role="img" aria-label="expenses" className="text-2xl">
              💳
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedNumber value={nextMonthPrediction?.expenses || 0} />
            </div>
            <p className="text-xs text-muted-foreground">
              Projected for{' '}
              {nextMonthPrediction?.month
                ? format(new Date(nextMonthPrediction.month), 'MMM yyyy')
                : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Projected Savings
            </CardTitle>
            <span role="img" aria-label="savings" className="text-2xl">
              💰
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedNumber value={projectedSavings} />
            </div>
            <p className="text-xs text-muted-foreground">
              Income - Expenses for{' '}
              {nextMonthPrediction?.month
                ? format(new Date(nextMonthPrediction.month), 'MMM yyyy')
                : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Income and Expense Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Label htmlFor="months-input" className="text-right">
              Forecast for next
            </Label>
            <Input
              id="months-input"
              type="number"
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-24"
              min="1"
            />
            <Label htmlFor="months-input" className="text-left">
              months
            </Label>
            <Button onClick={handleMonthsChange}>Update Forecast</Button>
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              Loading forecast...
            </div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center text-red-500">
              Error: {(error as Error).message}
            </div>
          ) : data && data.predictions.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={data.predictions.map((p) => ({
                  ...p,
                  month: format(new Date(p.month + '-01'), 'MMM yy'),
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) =>
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(value)
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#22C55E"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  animationDuration={1500}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              No forecast data available. Please add more transactions.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Forecasting;
