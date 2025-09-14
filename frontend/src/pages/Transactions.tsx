import { useEffect, useState } from "react";
import { Search, Filter, Plus, Download, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getTransactions, uploadTransactions } from "../api/transactions"; // Added uploadTransactions
import { useToast } from "@/components/ui/use-toast"; // For user feedback

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateRange, setDateRange] = useState<Date | undefined>(undefined);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // New state for file
  const { toast } = useToast();

  const fetchTransactions = () => {
    getTransactions()
      .then((data) => setTransactions(data))
      .catch((error) => console.error("Error fetching transactions:", error));
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadClick = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV or Excel file to upload.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await uploadTransactions(formData);
      toast({
        title: "Upload Successful",
        description: "Transactions have been successfully uploaded.",
      });
      setSelectedFile(null); // Clear selected file
      fetchTransactions(); // Refresh transactions list
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.detail || "An error occurred during upload.",
        variant: "destructive",
      });
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = (
      transaction.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) // Changed from notes to description
    );
    const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
    const matchesDate = dateRange ? new Date(transaction.date).toDateString() === dateRange.toDateString() : true;
    return matchesSearch && matchesCategory && matchesDate;
  });

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
    return amount < 0 ? `-${formatted}` : `+${formatted}`;
  };

  const getAmountColor = (amount: number) => {
    return amount < 0 ? "text-danger" : "text-success";
  };

  return (
    <div className="space-y-6 p-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">Track and manage all your financial transactions.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Input 
            type="file" 
            accept=".csv, .xlsx" 
            onChange={handleFileChange} 
            className="hidden" 
            id="transaction-upload"
          />
          <label htmlFor="transaction-upload">
            <Button variant="outline" className="rounded-full" asChild>
              <span>
                <Plus className="mr-2 h-4 w-4" />
                {selectedFile ? selectedFile.name : "Upload File"}
              </span>
            </Button>
          </label>
          {selectedFile && (
            <Button onClick={handleUploadClick} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              Upload
            </Button>
          )}
          <Button variant="outline" className="rounded-full">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by merchant or description..." // Changed from notes to description
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 rounded-full"
                />
              </div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full md:w-[200px] justify-start text-left font-normal rounded-full",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange ? format(dateRange, "PPP") : <span className="rounded-full">Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange}
                  onSelect={setDateRange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48 rounded-full">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Food & Dining">Food & Dining</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Bills & Utilities">Bills & Utilities</SelectItem>
                <SelectItem value="Entertainment">Entertainment</SelectItem>
                <SelectItem value="Income">Income</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="rounded-full">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="shadow-md rounded-2xl">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Transaction History ({filteredTransactions.length} transactions)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="striped-rows">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead> {/* Changed from Notes to Description */}
                <TableHead>Status</TableHead> {/* Status is not in schema, will be removed or added */}
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{transaction.merchant}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={transaction.status === "completed" ? "default" : "secondary"} // Status is not in schema
                        className={transaction.status === "completed" ? "bg-success text-success-foreground" : ""} // Status is not in schema
                      >
                        {transaction.status} {/* Status is not in schema */}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${getAmountColor(transaction.amount)}`}>
                      {formatAmount(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No transactions found for the selected filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Floating Add Transaction Button */}
      <Button
        className="fixed bottom-6 right-6 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full h-14 w-14 shadow-lg"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}