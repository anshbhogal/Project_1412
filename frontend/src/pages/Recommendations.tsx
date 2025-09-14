import { useEffect, useState } from "react";
import { Lightbulb, TrendingUp, ShieldAlert, DollarSign, Wallet, Percent, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { getExpenseRecommendations, getTaxRecommendations, getInvestmentRecommendations, getCashflowRecommendations } from "../api/recommendations";

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
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const [expenseRecs, taxRecs, investmentRecs, cashflowRecs] = await Promise.all([
          getExpenseRecommendations(),
          getTaxRecommendations(),
          getInvestmentRecommendations(),
          getCashflowRecommendations(),
        ]);

        const allRecommendations = [];

        if (expenseRecs && expenseRecs.suggestions) {
          expenseRecs.suggestions.forEach((desc: string) => allRecommendations.push({
            icon: <Lightbulb className="h-5 w-5 text-accent" />,
            title: expenseRecs.category,
            description: desc,
            link: "#"
          }));
        }
        if (taxRecs && taxRecs.suggestions) {
          taxRecs.suggestions.forEach((desc: string) => allRecommendations.push({
            icon: <ShieldAlert className="h-5 w-5 text-warning" />,
            title: taxRecs.category,
            description: desc,
            link: "#"
          }));
        }
        if (investmentRecs && investmentRecs.suggestions) {
          investmentRecs.suggestions.forEach((desc: string) => allRecommendations.push({
            icon: <TrendingUp className="h-5 w-5 text-success" />,
            title: investmentRecs.category,
            description: desc,
            link: "#"
          }));
        }
        if (cashflowRecs && cashflowRecs.suggestions) {
          cashflowRecs.suggestions.forEach((desc: string) => allRecommendations.push({
            icon: <DollarSign className="h-5 w-5 text-primary" />,
            title: cashflowRecs.category,
            description: desc,
            link: "#"
          }));
        }

        setRecommendations(allRecommendations);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };
    fetchRecommendations();
  }, []);

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
        {recommendations.length > 0 ? (
          recommendations.map((recommendation, index) => (
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
          ))
        ) : (
          <p className="text-muted-foreground">No recommendations found. Add more financial data to get personalized insights!</p>
        )}
      </div>
    </div>
  );
}
