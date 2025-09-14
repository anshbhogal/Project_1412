import { FileText, Download, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Reports() {
  const reports = [
    { id: 1, name: "Monthly Spending Report - Jan 2024", date: "2024-02-01", type: "PDF", size: "1.2 MB" },
    { id: 2, name: "Annual Tax Summary - 2023", date: "2024-01-20", type: "PDF", size: "2.5 MB" },
    { id: 3, name: "Investment Performance - Q4 2023", date: "2024-01-10", type: "CSV", size: "0.8 MB" },
  ];

  const handleGenerateReport = () => {
    alert("Generating new report...");
    // In a real application, this would trigger a backend process
  };

  const handleDownload = (reportName: string) => {
    alert(`Downloading ${reportName}...`);
    // In a real application, this would initiate a file download
  };

  const handleShare = (reportName: string) => {
    alert(`Sharing ${reportName}...`);
    // In a real application, this would open a share dialog
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and manage your financial reports.</p>
        </div>
        <Button onClick={handleGenerateReport} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
          <FileText className="mr-2 h-4 w-4" />
          Generate New Report
        </Button>
      </div>

      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Available Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-muted-foreground">No reports available yet. Generate one to get started!</p>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg shadow-sm">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-card-foreground">{report.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {report.date} • {report.type} • {report.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleDownload(report.name)} className="rounded-full">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleShare(report.name)} className="rounded-full">
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
