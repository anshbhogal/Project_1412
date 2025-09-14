import { DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const taxData = [
  { month: "Jan", liability: 500 },
  { month: "Feb", liability: 600 },
  { month: "Mar", liability: 750 },
  { month: "Apr", liability: 700 },
  { month: "May", liability: 800 },
  { month: "Jun", liability: 900 },
];

function TaxBarChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={taxData}
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
  const totalLiability = taxData.reduce((sum, item) => sum + item.liability, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tax Summary</h1>
          <p className="text-muted-foreground">Overview of your tax liabilities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Your Tax Liability</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              <AnimatedNumber value={totalLiability} prefix="$" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Due in <span className="font-semibold">Y</span> days (placeholder)
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Monthly Tax Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <TaxBarChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
