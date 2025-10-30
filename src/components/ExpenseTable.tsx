import { Expense, Department } from "./AddExpenseDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { FileText, Image } from "lucide-react";
import { getDepartmentBadgeColor } from "../utils/departmentUtils";
import { useState, useEffect } from "react";

interface ExpenseTableProps {
  expenses: Expense[];
  filterDepartment: Department | "All";
  onFilterChange: (dept: Department | "All") => void;
  accessToken?: string;
}

const statusColors = {
  "Pending": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  "Reimbursed": "bg-green-100 text-green-800 hover:bg-green-100",
  "Not Required": "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

export function ExpenseTable({ expenses, filterDepartment, onFilterChange, accessToken }: ExpenseTableProps) {
  const [departments, setDepartments] = useState<Department[]>([]);

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
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const departmentOptions: (Department | "All")[] = ["All", ...departments];

  const filteredExpenses = filterDepartment === "All" 
    ? expenses 
    : expenses.filter((e) => e.department === filterDepartment);

  const sortedExpenses = [...filteredExpenses].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle>Recent Expenses</CardTitle>
          <div className="w-full sm:w-[180px]">
            <Select value={filterDepartment} onValueChange={(value) => onFilterChange(value as Department | "All")}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedExpenses.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No expenses recorded yet. Add your first expense to get started.
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {sortedExpenses.map((expense) => (
                <Card key={expense.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getDepartmentBadgeColor(expense.department, departments)}>
                            {expense.department}
                          </Badge>
                          <Badge className={statusColors[expense.reimbursementStatus]}>
                            {expense.reimbursementStatus}
                          </Badge>
                        </div>
                        <p className="font-medium truncate">{expense.description}</p>
                        {expense.notes && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {expense.notes}
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
                  <TableHead>Department</TableHead>
                  <TableHead>Purchased By</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="whitespace-nowrap">
                      {new Date(expense.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge className={getDepartmentBadgeColor(expense.department, departments)}>
                        {expense.department}
                      </Badge>
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
  );
}
