import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, DollarSign, Wallet, Percent, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { getInvestments, getInvestmentPerformance } from "../api/investments";

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
  const [investments, setInvestments] = useState([]);
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const investmentsData = await getInvestments();
        setInvestments(investmentsData);
        const performanceData = await getInvestmentPerformance();
        setPerformance(performanceData);
      } catch (error) {
        console.error("Error fetching investment data:", error);
      }
    };
    fetchInvestments();
  }, []);

  const getChangeType = (percentage: number) => {
    if (percentage > 0) return "positive";
    if (percentage < 0) return "negative";
    return "neutral";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investments</h1>
          <p className="text-muted-foreground">Your portfolio at a glance.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investments.length > 0 ? (
          investments.map((investment) => (
            <InvestmentCard
              key={investment.id}
              title={investment.name}
              value={investment.current_price * investment.units}
              percentageChange={((investment.current_price - investment.buy_price) / investment.buy_price) * 100}
              changeType={getChangeType( ((investment.current_price - investment.buy_price) / investment.buy_price) * 100)}
              icon={investment.type === "Stocks" ? <TrendingUp className="h-5 w-5 text-success" /> : investment.type === "Fixed Deposits" ? <Wallet className="h-5 w-5 text-primary" /> : investment.type === "Crypto" ? <DollarSign className="h-5 w-5 text-danger" /> : <Home className="h-5 w-5 text-primary" />}
              sparklineData={[
                { name: "Buy", value: investment.buy_price },
                { name: "Current", value: investment.current_price }
              ]} // Simplified sparkline data for now
            />
          ))
        ) : (
          <p className="text-muted-foreground">No investments found. Add some to get started!</p>
        )}
      </div>
    </div>
  );
}
