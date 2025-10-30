import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Expense, Department } from "./AddExpenseDialog";
import { Income } from "./AddIncomeDialog";
import { getDepartmentIcon, getDepartmentColor } from "../utils/departmentUtils";
import * as departmentsAPI from "../utils/api/departments";

interface DepartmentSummaryProps {
  expenses: Expense[];
  income: Income[];
  onDepartmentClick: (dept: Department) => void;
  accessToken?: string;
}

export function DepartmentSummary({ expenses, income, onDepartmentClick, accessToken }: DepartmentSummaryProps) {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const depts = await departmentsAPI.getDepartments();
      const deptNames = depts.map(d => d.name);
      setDepartments(deptNames);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const calculateExpenses = (dept: Department) => {
    return expenses
      .filter((expense) => expense.department === dept)
      .reduce((sum, expense) => sum + expense.amount, 0);
  };

  const calculateIncome = (dept: Department) => {
    return income
      .filter((inc) => inc.department === dept)
      .reduce((sum, inc) => sum + inc.amount, 0);
  };

  const calculateBalance = (dept: Department) => {
    return calculateIncome(dept) - calculateExpenses(dept);
  };

  const grandTotalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const grandTotalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const grandBalance = grandTotalIncome - grandTotalExpenses;

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {departments.map((dept) => {
          const expenseTotal = calculateExpenses(dept);
          const incomeTotal = calculateIncome(dept);
          const balance = calculateBalance(dept);
          return (
            <Card 
              key={dept} 
              className="cursor-pointer transition-all hover:shadow-md active:scale-95 sm:hover:scale-105"
              onClick={() => onDepartmentClick(dept)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
                <CardTitle className="text-xs sm:text-sm truncate">{dept}</CardTitle>
                <div className={`${getDepartmentColor(dept, departments)} flex-shrink-0`}>
                  {getDepartmentIcon(dept)}
                </div>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
                <div className="space-y-1">
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Balance</p>
                    <div className={`text-lg sm:text-2xl ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${balance.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between text-[10px] sm:text-xs gap-0.5 sm:gap-0">
                    <span className="text-muted-foreground truncate">
                      In: ${incomeTotal.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground truncate">
                      Out: ${expenseTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card className="bg-primary text-primary-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Overall Church Finances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <p className="text-xs opacity-90">Total Balance</p>
              <div className="text-3xl">${grandBalance.toFixed(2)}</div>
            </div>
            <div className="flex justify-between text-sm opacity-90">
              <span>Income: ${grandTotalIncome.toFixed(2)}</span>
              <span>Expenses: ${grandTotalExpenses.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
