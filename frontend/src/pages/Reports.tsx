import { FileText, Download, Share2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import apiClient from "@/api/index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Reports() {
  const [reports, setReports] = useState<any[]>([]); // To store generated reports (if any)
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingCsv, setIsDownloadingCsv] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("monthly"); // Default to monthly
  const { toast } = useToast();
  const userId = localStorage.getItem("user_id") || 1; // Placeholder: get actual user ID

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await apiClient.post("/reports/generate", { period: selectedPeriod });
      toast({
        title: "Report Generation Initiated",
        description: `A new ${selectedPeriod} report is being generated. You can download it shortly.`,
      });
      // In a real application, you might refetch the list of available reports here
      // For now, we'll just show the toast.
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "There was an error generating the report.",
        variant: "destructive",
      });
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = async (reportId: number) => {
    setIsDownloadingPdf(true);
    try {
      const response = await apiClient.get(`/reports/${userId}/download/pdf?period=${selectedPeriod}`, {
        responseType: "blob", // Important for downloading files
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `financial_report_${selectedPeriod}.pdf`); // Dynamic filename
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your PDF report download has begun.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the PDF report.",
        variant: "destructive",
      });
      console.error("Error downloading PDF:", error);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadCsv = async (reportId: number) => {
    setIsDownloadingCsv(true);
    try {
      const response = await apiClient.get(`/reports/${userId}/download/csv?period=${selectedPeriod}`, {
        responseType: "blob", // Important for downloading files
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `financial_report_${selectedPeriod}.csv`); // Dynamic filename
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your CSV report download has begun.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was an error downloading the CSV report.",
        variant: "destructive",
      });
      console.error("Error downloading CSV:", error);
    } finally {
      setIsDownloadingCsv(false);
    }
  };

  // Dummy reports for display, replace with fetched data later
  const dummyReports = [
    { id: 1, name: "Monthly Spending Report", date: "2024-07-01", type: "PDF" },
    { id: 2, name: "Annual Tax Summary", date: "2023-12-31", type: "CSV" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and manage your financial reports.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px] rounded-md">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full" disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Generate Report
          </Button>
        </div>
      </div>

      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Available Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dummyReports.length === 0 ? (
            <p className="text-muted-foreground">No reports available yet. Generate one to get started!</p>
          ) : (
            <div className="grid gap-4">
              {dummyReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-card-foreground">{report.name} ({report.type})</p>
                      <p className="text-sm text-muted-foreground">
                        Generated: {report.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {report.type === "PDF" && (
                      <Button variant="outline" size="icon" onClick={() => handleDownloadPdf(report.id)} className="rounded-full" disabled={isDownloadingPdf}>
                        {isDownloadingPdf ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    {report.type === "CSV" && (
                      <Button variant="outline" size="icon" onClick={() => handleDownloadCsv(report.id)} className="rounded-full" disabled={isDownloadingCsv}>
                        {isDownloadingCsv ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button variant="outline" size="icon" onClick={() => alert("Share not implemented")} className="rounded-full">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
