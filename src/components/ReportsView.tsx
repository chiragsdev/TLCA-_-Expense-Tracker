import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Expense, Department } from "./AddExpenseDialog";
import { Income } from "./AddIncomeDialog";
import { Download, FileText, CalendarIcon, ArrowLeft, FileSpreadsheet, Image, Printer } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, subMonths, subQuarters, subYears } from "date-fns";

interface ReportsViewProps {
  expenses: Expense[];
  income: Income[];
  onBack: () => void;
  initialDepartment?: Department;
  lockDepartment?: boolean;
  accessToken?: string;
}

type DatePreset = "this-month" | "last-month" | "this-quarter" | "last-quarter" | "this-year" | "last-year" | "custom";

const departmentColorsList = [
  "bg-blue-100 text-blue-800 hover:bg-blue-100",
  "bg-purple-100 text-purple-800 hover:bg-purple-100",
  "bg-orange-100 text-orange-800 hover:bg-orange-100",
  "bg-pink-100 text-pink-800 hover:bg-pink-100",
  "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  "bg-green-100 text-green-800 hover:bg-green-100",
  "bg-gray-100 text-gray-800 hover:bg-gray-100",
];

const getDepartmentColor = (department: string, index: number) => {
  return departmentColorsList[index % departmentColorsList.length];
};

const statusColors = {
  "Pending": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  "Reimbursed": "bg-green-100 text-green-800 hover:bg-green-100",
  "Not Required": "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

export function ReportsView({ expenses, income, onBack, initialDepartment, lockDepartment = false, accessToken }: ReportsViewProps) {
  const [datePreset, setDatePreset] = useState<DatePreset>("this-month");
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [selectedDepartment, setSelectedDepartment] = useState<Department | "All">(initialDepartment || "All");
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [departments, setDepartments] = useState<(Department | "All")[]>(["All"]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81befd82/departments`,
        {
          headers: { Authorization: `Bearer ${accessToken || publicAnonKey}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setDepartments(["All", ...(data.departments || [])]);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const handlePresetChange = (preset: DatePreset) => {
    setDatePreset(preset);
    const today = new Date();
    
    switch (preset) {
      case "this-month":
        setStartDate(startOfMonth(today));
        setEndDate(endOfMonth(today));
        break;
      case "last-month":
        const lastMonth = subMonths(today, 1);
        setStartDate(startOfMonth(lastMonth));
        setEndDate(endOfMonth(lastMonth));
        break;
      case "this-quarter":
        setStartDate(startOfQuarter(today));
        setEndDate(endOfQuarter(today));
        break;
      case "last-quarter":
        const lastQuarter = subQuarters(today, 1);
        setStartDate(startOfQuarter(lastQuarter));
        setEndDate(endOfQuarter(lastQuarter));
        break;
      case "this-year":
        setStartDate(startOfYear(today));
        setEndDate(endOfYear(today));
        break;
      case "last-year":
        const lastYear = subYears(today, 1);
        setStartDate(startOfYear(lastYear));
        setEndDate(endOfYear(lastYear));
        break;
    }
  };

  const filteredData = useMemo(() => {
    const filterByDateAndDept = <T extends { date: string; department: Department }>(items: T[]) => {
      return items.filter(item => {
        const itemDate = new Date(item.date);
        const inDateRange = itemDate >= startDate && itemDate <= endDate;
        const inDepartment = selectedDepartment === "All" || item.department === selectedDepartment;
        return inDateRange && inDepartment;
      });
    };

    const filteredExpenses = filterByDateAndDept(expenses);
    const filteredIncome = filterByDateAndDept(income);

    return { filteredExpenses, filteredIncome };
  }, [expenses, income, startDate, endDate, selectedDepartment]);

  const summary = useMemo(() => {
    const totalExpenses = filteredData.filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalIncome = filteredData.filteredIncome.reduce((sum, inc) => sum + inc.amount, 0);
    const balance = totalIncome - totalExpenses;
    
    const pendingReimbursements = filteredData.filteredExpenses
      .filter(exp => exp.reimbursementStatus === "Pending")
      .reduce((sum, exp) => sum + exp.amount, 0);

    return {
      totalExpenses,
      totalIncome,
      balance,
      pendingReimbursements,
      expenseCount: filteredData.filteredExpenses.length,
      incomeCount: filteredData.filteredIncome.length,
    };
  }, [filteredData]);

  const exportToCSV = () => {
    const csvRows = [];
    
    // Header
    csvRows.push("TRUE LIGHT CHRISTIAN ASSEMBLY");
    csvRows.push("Financial Report");
    csvRows.push(`Period: ${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`);
    csvRows.push(`Department: ${selectedDepartment}`);
    csvRows.push(`Generated: ${format(new Date(), "MMM dd, yyyy 'at' h:mm a")}`);
    csvRows.push("");
    
    // Summary
    csvRows.push("SUMMARY");
    csvRows.push(`Total Income,$${summary.totalIncome.toFixed(2)}`);
    csvRows.push(`Total Expenses,$${summary.totalExpenses.toFixed(2)}`);
    csvRows.push(`Net Balance,$${summary.balance.toFixed(2)}`);
    csvRows.push(`Pending Reimbursements,$${summary.pendingReimbursements.toFixed(2)}`);
    csvRows.push("");
    
    // Expenses
    csvRows.push("EXPENSES");
    csvRows.push("Date,Department,Description,Purchased By,Amount,Status,Notes");
    filteredData.filteredExpenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach(exp => {
        csvRows.push([
          format(new Date(exp.date), "yyyy-MM-dd"),
          exp.department,
          `"${exp.description.replace(/"/g, '""')}"`,
          exp.purchasedBy,
          exp.amount.toFixed(2),
          exp.reimbursementStatus,
          `"${(exp.notes || '').replace(/"/g, '""')}"`
        ].join(","));
      });
    
    csvRows.push("");
    
    // Income
    csvRows.push("INCOME");
    csvRows.push("Date,Department,Description,Contributed By,Amount,Notes");
    filteredData.filteredIncome
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach(inc => {
        csvRows.push([
          format(new Date(inc.date), "yyyy-MM-dd"),
          inc.department,
          `"${inc.description.replace(/"/g, '""')}"`,
          inc.contributedBy,
          inc.amount.toFixed(2),
          `"${(inc.notes || '').replace(/"/g, '""')}"`
        ].join(","));
      });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `TLCA_Report_${format(startDate, "yyyyMMdd")}-${format(endDate, "yyyyMMdd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 15;

    // Logo/Header Section with background
    doc.setFillColor(59, 130, 246); // Blue background
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Church name in white
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("TRUE LIGHT CHRISTIAN ASSEMBLY", pageWidth / 2, yPos + 5, { align: "center" });
    
    doc.setFontSize(10);
    doc.text("Financial Report", pageWidth / 2, yPos + 13, { align: "center" });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    yPos += 25;
    
    // Period and Department
    doc.setFontSize(10);
    doc.text(`Period: ${format(startDate, "MMM dd, yyyy")} - ${format(endDate, "MMM dd, yyyy")}`, 20, yPos);
    yPos += 6;
    doc.text(`Department: ${selectedDepartment}`, 20, yPos);
    yPos += 10;
    
    // Summary Box
    doc.setDrawColor(200);
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos, pageWidth - 40, 40, "F");
    doc.rect(20, yPos, pageWidth - 40, 40, "S");
    
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Total Income: $${summary.totalIncome.toFixed(2)}`, 25, yPos);
    yPos += 8;
    doc.text(`Total Expenses: $${summary.totalExpenses.toFixed(2)}`, 25, yPos);
    yPos += 8;
    doc.setFontSize(11);
    const balanceColor = summary.balance >= 0 ? [0, 128, 0] : [255, 0, 0];
    doc.setTextColor(...balanceColor);
    doc.text(`Net Balance: $${summary.balance.toFixed(2)}`, 25, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 8;
    doc.setFontSize(10);
    doc.text(`Pending Reimbursements: $${summary.pendingReimbursements.toFixed(2)}`, 25, yPos);
    yPos += 15;

    // Transaction counts
    doc.text(`Total Expenses: ${summary.expenseCount} | Total Income: ${summary.incomeCount}`, 20, yPos);
    yPos += 10;

    // Add page break if needed
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Expenses Section
    doc.setFontSize(12);
    doc.text("Expense Details", 20, yPos);
    yPos += 8;
    
    doc.setFontSize(8);
    const expensesData = filteredData.filteredExpenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50); // Limit to 50 items for PDF

    if (expensesData.length > 0) {
      expensesData.forEach((exp, idx) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(`${format(new Date(exp.date), "MM/dd/yyyy")} | ${exp.department} | ${exp.purchasedBy}`, 20, yPos);
        yPos += 5;
        doc.text(`${exp.description.substring(0, 80)} - $${exp.amount.toFixed(2)}`, 25, yPos);
        yPos += 7;
      });
    } else {
      doc.text("No expenses in this period.", 20, yPos);
      yPos += 7;
    }

    yPos += 5;

    // Add page break if needed
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Income Section
    doc.setFontSize(12);
    doc.text("Income Details", 20, yPos);
    yPos += 8;
    
    doc.setFontSize(8);
    const incomeData = filteredData.filteredIncome
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 50); // Limit to 50 items for PDF

    if (incomeData.length > 0) {
      incomeData.forEach((inc) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(`${format(new Date(inc.date), "MM/dd/yyyy")} | ${inc.department} | ${inc.contributedBy}`, 20, yPos);
        yPos += 5;
        doc.text(`${inc.description.substring(0, 80)} - $${inc.amount.toFixed(2)}`, 25, yPos);
        yPos += 7;
      });
    } else {
      doc.text("No income in this period.", 20, yPos);
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, doc.internal.pageSize.getHeight() - 10);
      doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy")}`, 20, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`TLCA_Report_${format(startDate, "yyyyMMdd")}-${format(endDate, "yyyyMMdd")}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Print-only Header with Logo */}
      <div className="hidden print:block print-header">
        <div className="text-center py-6 bg-blue-600 text-white mb-6">
          <h1 className="text-3xl font-bold mb-2">TRUE LIGHT CHRISTIAN ASSEMBLY</h1>
          <p className="text-lg">Financial Report</p>
          <p className="text-sm mt-2">
            {format(startDate, "MMMM dd, yyyy")} - {format(endDate, "MMMM dd, yyyy")}
          </p>
          <p className="text-sm">Department: {selectedDepartment}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4 print:hidden">
        <Button variant="outline" size="icon" onClick={onBack} className="flex-shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl lg:text-3xl">Financial Reports</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">Generate detailed financial reports</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Report Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Date Preset */}
            <div className="space-y-2">
              <label className="text-sm">Date Range</label>
              <Select value={datePreset} onValueChange={(value) => handlePresetChange(value as DatePreset)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-quarter">This Quarter</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <label className="text-sm">Department {lockDepartment && <span className="text-muted-foreground">(Restricted)</span>}</label>
              <Select 
                value={selectedDepartment} 
                onValueChange={(value) => setSelectedDepartment(value as Department | "All")}
                disabled={lockDepartment}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Custom Date Range */}
          {datePreset === "custom" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm">Start Date</label>
                <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        if (date) {
                          setStartDate(date);
                          setShowStartCalendar(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm">End Date</label>
                <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        if (date) {
                          setEndDate(date);
                          setShowEndCalendar(false);
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* Export Buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button onClick={handlePrint} variant="outline" className="gap-2">
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print Report</span>
              <span className="sm:hidden">Print</span>
            </Button>
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">Export to CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>
            <Button onClick={exportToPDF} variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Export to PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm">Total Income</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl text-green-600">${summary.totalIncome.toFixed(2)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{summary.incomeCount} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl text-red-600">${summary.totalExpenses.toFixed(2)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{summary.expenseCount} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm">Net Balance</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className={`text-lg sm:text-2xl ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${summary.balance.toFixed(2)}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {format(startDate, "MMM dd")} - {format(endDate, "MMM dd")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl text-yellow-600">${summary.pendingReimbursements.toFixed(2)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Reimbursements</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Expenses ({filteredData.filteredExpenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.filteredExpenses.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No expenses found for the selected criteria.
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {filteredData.filteredExpenses
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((expense) => (
                    <Card key={expense.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={departmentColors[expense.department]}>
                                {expense.department}
                              </Badge>
                              <Badge className={statusColors[expense.reimbursementStatus]}>
                                {expense.reimbursementStatus}
                              </Badge>
                            </div>
                            <p className="font-medium truncate">{expense.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-lg">${expense.amount.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                          <div className="flex flex-col gap-1">
                            <span>{expense.purchasedBy}</span>
                            <span>{format(new Date(expense.date), "MMM dd, yyyy")}</span>
                          </div>
                          {expense.receiptUrl && (
                            <a
                              href={expense.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600"
                            >
                              {expense.receiptUrl.endsWith('.pdf') ? (
                                <FileText className="h-4 w-4" />
                              ) : (
                                <Image className="h-4 w-4" />
                              )}
                              Receipt
                            </a>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Purchased By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Receipt</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.filteredExpenses
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(expense.date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge className={departmentColors[expense.department]}>
                              {expense.department}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{expense.description}</div>
                              {expense.notes && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Note: {expense.notes}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{expense.purchasedBy}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[expense.reimbursementStatus]}>
                              {expense.reimbursementStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {expense.receiptUrl ? (
                              <a
                                href={expense.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                {expense.receiptUrl.endsWith('.pdf') ? (
                                  <FileText className="h-4 w-4" />
                                ) : (
                                  <Image className="h-4 w-4" />
                                )}
                                View
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Income Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">Income ({filteredData.filteredIncome.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.filteredIncome.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No income found for the selected criteria.
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {filteredData.filteredIncome
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((inc) => (
                    <Card key={inc.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <Badge className={`${departmentColors[inc.department]} mb-1`}>
                              {inc.department}
                            </Badge>
                            <p className="font-medium truncate">{inc.description}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-lg text-green-600">${inc.amount.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                          <span>{inc.contributedBy}</span>
                          <span>{format(new Date(inc.date), "MMM dd, yyyy")}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Contributed By</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.filteredIncome
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((inc) => (
                        <TableRow key={inc.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(inc.date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge className={departmentColors[inc.department]}>
                              {inc.department}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{inc.description}</div>
                              {inc.notes && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Note: {inc.notes}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{inc.contributedBy}</TableCell>
                          <TableCell className="text-right text-green-600">${inc.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
