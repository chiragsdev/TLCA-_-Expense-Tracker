import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Expense, Department } from "./AddExpenseDialog";
import { Income } from "./AddIncomeDialog";
import { ReportsView } from "./ReportsView";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { ArrowLeft, FileText, Image } from "lucide-react";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DepartmentDetailViewProps {
  department: Department;
  expenses: Expense[];
  income: Income[];
  onBack?: () => void;
  isAdmin?: boolean;
}

const statusColors = {
  "Pending": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  "Reimbursed": "bg-green-100 text-green-800 hover:bg-green-100",
  "Not Required": "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

const chartColors: Record<Department, string> = {
  Sports: "#2563eb",
  Fellowship: "#9333ea",
  Food: "#ea580c",
  Kids: "#ec4899",
  Worship: "#4f46e5",
  Media: "#16a34a",
  General: "#6b7280",
};

export function DepartmentDetailView({ department, expenses, income, onBack, isAdmin = false }: DepartmentDetailViewProps) {
  const [showReports, setShowReports] = useState(false);

  const departmentExpenses = expenses
    .filter((e) => e.department === department)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const departmentIncome = income
    .filter((i) => i.department === department)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalExpenses = departmentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalIncome = departmentIncome.reduce((sum, inc) => sum + inc.amount, 0);
  const balance = totalIncome - totalExpenses;
  const averageExpense = departmentExpenses.length > 0 ? totalExpenses / departmentExpenses.length : 0;

  // Pending reimbursements
  const pendingReimbursements = departmentExpenses
    .filter((e) => e.reimbursementStatus === "Pending")
    .reduce((sum, e) => sum + e.amount, 0);

  // Group expenses by date for chart
  const expensesByDate = departmentExpenses.reduce((acc, expense) => {
    const date = new Date(expense.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByDate)
    .map(([date, amount]) => ({
      date,
      amount: parseFloat(amount.toFixed(2)),
    }))
    .reverse()
    .slice(-10);

  // Group expenses by month
  const expensesByMonth = departmentExpenses.reduce((acc, expense) => {
    const month = new Date(expense.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    if (!acc[month]) {
      acc[month] = { total: 0, count: 0 };
    }
    acc[month].total += expense.amount;
    acc[month].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const monthlyChartData = Object.entries(expensesByMonth)
    .map(([month, data]) => ({
      month,
      total: parseFloat(data.total.toFixed(2)),
      count: data.count,
    }))
    .reverse()
    .slice(-6);

  if (showReports) {
    return (
      <ReportsView
        expenses={expenses}
        income={income}
        onBack={() => setShowReports(false)}
        initialDepartment={department}
        lockDepartment={!isAdmin}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:gap-4 justify-between">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {onBack && (
            <Button variant="outline" size="icon" onClick={onBack} className="flex-shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl truncate">{department} $Tracker</h2>
            <p className="text-muted-foreground text-xs sm:text-sm">Financial overview and transaction history</p>
          </div>
        </div>
        <Button 
          variant="outline"
          onClick={() => setShowReports(true)} 
          className="gap-2 flex-shrink-0"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Reports</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${balance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Income - Expenses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">${totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {departmentIncome.length} {departmentIncome.length === 1 ? "contribution" : "contributions"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {departmentExpenses.length} {departmentExpenses.length === 1 ? "transaction" : "transactions"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Reimbursements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-600">${pendingReimbursements.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting reimbursement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {departmentExpenses.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Expense Timeline</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke={chartColors[department]}
                    strokeWidth={2}
                    name="Amount ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="total" fill={chartColors[department]} name="Total ($)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions Tabs */}
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expenses" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All {department} Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {departmentExpenses.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No expenses recorded for this department yet.
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="sm:hidden space-y-3">
                    {departmentExpenses.map((expense) => (
                      <Card key={expense.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <Badge className={`${statusColors[expense.reimbursementStatus]} mb-1`}>
                                {expense.reimbursementStatus}
                              </Badge>
                              <p className="font-medium truncate">{expense.description}</p>
                              {expense.notes && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  Note: {expense.notes}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-lg">${expense.amount.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <div className="flex flex-col gap-1">
                              <span>{expense.purchasedBy}</span>
                              <span>
                                {new Date(expense.date).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            {expense.receiptUrl && (
                              <a
                                href={expense.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
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
                        <TableHead>Purchased By</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Receipt</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departmentExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(expense.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell>{expense.purchasedBy}</TableCell>
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
        </TabsContent>

        <TabsContent value="income" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All {department} Income</CardTitle>
            </CardHeader>
            <CardContent>
              {departmentIncome.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No income recorded for this department yet.
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="sm:hidden space-y-3">
                    {departmentIncome.map((inc) => (
                      <Card key={inc.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{inc.description}</p>
                              {inc.notes && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  Note: {inc.notes}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-semibold text-lg text-green-600">${inc.amount.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                            <span>{inc.contributedBy}</span>
                            <span>
                              {new Date(inc.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
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
                          <TableHead>Contributed By</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departmentIncome.map((inc) => (
                          <TableRow key={inc.id}>
                            <TableCell className="whitespace-nowrap">
                              {new Date(inc.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell>{inc.contributedBy}</TableCell>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
