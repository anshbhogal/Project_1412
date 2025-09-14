import { Lightbulb, TrendingUp, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface RecommendationCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link?: string;
}

function RecommendationCard({ icon, title, description, link }: RecommendationCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="shadow-md rounded-2xl cursor-pointer hover:shadow-lg transition-all duration-200 h-full flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          {icon}
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <p className="text-muted-foreground text-sm">{description}</p>
          {link && (
            <Button variant="link" className="p-0 h-auto mt-3">
              Learn More
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Recommendations() {
  const recommendationsData = [
    {
      icon: <Lightbulb className="h-5 w-5 text-accent" />,
      title: "Emergency Fund Tip",
      description: "Consider saving 3-6 months of living expenses in an easily accessible account.",
      link: "/tips/emergency-fund",
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-success" />,
      title: "Investment Idea: Diversify Portfolio",
      description: "Explore adding low-cost index funds to balance your investment risks.",
      link: "/investments/diversify",
    },
    {
      icon: <ShieldAlert className="h-5 w-5 text-danger" />,
      title: "Risk Alert: High Credit Card Debt",
      description: "Focus on paying down high-interest credit card debt to improve your financial health.",
      link: "/debts/credit-card",
    },
    {
      icon: <Lightbulb className="h-5 w-5 text-primary" />,
      title: "Budgeting Insight",
      description: "Track your spending categories to identify areas where you can save more.",
      link: "/tips/budgeting",
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-primary" />,
      title: "Retirement Planning",
      description: "Increase your 401k contributions by 1% to take full advantage of employer match.",
      link: "/planning/retirement",
    },
    {
      icon: <ShieldAlert className="h-5 w-5 text-warning" />,
      title: "Upcoming Bill Alert",
      description: "You have a large utility bill due next week. Ensure funds are available.",
      link: "/transactions/upcoming-bills",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recommendations</h1>
          <p className="text-muted-foreground">Personalized insights to improve your financial health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendationsData.map((recommendation, index) => (
          <motion.div
            key={index}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
          >
            <RecommendationCard
              icon={recommendation.icon}
              title={recommendation.title}
              description={recommendation.description}
              link={recommendation.link}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
