import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';

const forecastData = [
  { month: "Jan", savings: 1000 },
  { month: "Feb", savings: 1200 },
  { month: "Mar", savings: 1500 },
  { month: "Apr", savings: 1700 },
  { month: "May", savings: 2000 },
  { month: "Jun", savings: 2300 },
  { month: "Jul", savings: 2600 },
  { month: "Aug", savings: 2900 },
  { month: "Sep", savings: 3200 },
  { month: "Oct", savings: 3500 },
  { month: "Nov", savings: 3800 },
  { month: "Dec", savings: 4100 },
];

function SavingsForecastChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={forecastData}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
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
        <Area type="monotone" dataKey="savings" stroke="hsl(var(--primary))" fill="url(#colorSavings)" />
        <defs>
          <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function Forecasts() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Forecasts</h1>
          <p className="text-muted-foreground">Project your future savings and financial health.</p>
        </div>
      </div>

      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Projected Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <SavingsForecastChart />
        </CardContent>
      </Card>

      <Card className="shadow-md rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">AI Insight</CardTitle>
          <Lightbulb className="h-5 w-5 text-accent" />
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            At your current spending rate, you are projected to save <span className="font-semibold text-primary">$X</span> in the next 6 months and <span className="font-semibold text-primary">$Y</span> in the next 12 months. Consider increasing your contributions by Z% to reach your goals faster.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
