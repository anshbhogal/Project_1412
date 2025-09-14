import { TrendingUp, TrendingDown, DollarSign, Wallet, Percent, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { ResponsiveContainer, LineChart, Line } from 'recharts';

interface InvestmentCardProps {
  title: string;
  value: number;
  percentageChange: number;
  changeType: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  sparklineData: { name: string; value: number }[];
}

function InvestmentCard({
  title,
  value,
  percentageChange,
  changeType,
  icon,
  sparklineData,
}: InvestmentCardProps) {
  const changeColor = changeType === "positive" ? "text-success" : changeType === "negative" ? "text-danger" : "text-muted-foreground";
  const arrowIcon = changeType === "positive" ? <TrendingUp className="h-4 w-4 inline-block ml-1" /> : changeType === "negative" ? <TrendingDown className="h-4 w-4 inline-block ml-1" /> : null;

  return (
    <Card className="shadow-md rounded-2xl h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="text-3xl font-bold">
          <AnimatedNumber value={value} prefix="$" />
        </div>
        <div className={`text-sm font-medium flex items-center ${changeColor} mt-2`}>
          {percentageChange.toFixed(2)}% {arrowIcon}
        </div>
        <div className="h-16 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={changeType === "positive" ? "hsl(var(--success))" : "hsl(var(--danger))"}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Investments() {
  const stockData = [
    { name: "Jan", value: 100 }, { name: "Feb", value: 120 }, { name: "Mar", value: 110 },
    { name: "Apr", value: 130 }, { name: "May", value: 150 }, { name: "Jun", value: 140 },
  ];
  const fdData = [
    { name: "Jan", value: 5000 }, { name: "Feb", value: 5050 }, { name: "Mar", value: 5100 },
    { name: "Apr", value: 5120 }, { name: "May", value: 5150 }, { name: "Jun", value: 5180 },
  ];
  const cryptoData = [
    { name: "Jan", value: 1000 }, { name: "Feb", value: 950 }, { name: "Mar", value: 1050 },
    { name: "Apr", value: 1100 }, { name: "May", value: 1080 }, { name: "Jun", value: 1200 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investments</h1>
          <p className="text-muted-foreground">Your portfolio at a glance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InvestmentCard
          title="Stocks"
          value={14000}
          percentageChange={5.23}
          changeType="positive"
          icon={<TrendingUp className="h-5 w-5 text-success" />}
          sparklineData={stockData}
        />
        <InvestmentCard
          title="Fixed Deposits"
          value={52000}
          percentageChange={0.85}
          changeType="positive"
          icon={<Wallet className="h-5 w-5 text-primary" />}
          sparklineData={fdData}
        />
        <InvestmentCard
          title="Crypto"
          value={8500}
          percentageChange={-2.10}
          changeType="negative"
          icon={<DollarSign className="h-5 w-5 text-danger" />}
          sparklineData={cryptoData}
        />
        <InvestmentCard
          title="Real Estate"
          value={150000}
          percentageChange={7.15}
          changeType="positive"
          icon={<Home className="h-5 w-5 text-primary" />}
          sparklineData={stockData}
        />
        <InvestmentCard
          title="Mutual Funds"
          value={25000}
          percentageChange={3.50}
          changeType="positive"
          icon={<Percent className="h-5 w-5 text-success" />}
          sparklineData={fdData}
        />
      </div>
    </div>
  );
}
