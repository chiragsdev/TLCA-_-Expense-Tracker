import { useState, useEffect } from "react";
import { Department, Expense } from "./AddExpenseDialog";
import { Income, AddIncomeDialog } from "./AddIncomeDialog";
import { AddExpenseDialog } from "./AddExpenseDialog";
import { DepartmentDetailView } from "./DepartmentDetailView";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { LogOut } from "lucide-react";
import logo from "figma:asset/cff10961812a9c5fb76a38299a6c96f962dbce8e.png";
import * as expensesAPI from "../utils/api/expenses";
import * as incomeAPI from "../utils/api/income";

interface DepartmentManagerViewProps {
  accessToken: string;
  department: Department;
  userName: string;
  onLogout: () => void;
}

export function DepartmentManagerView({
  accessToken,
  department,
  userName,
  onLogout,
}: DepartmentManagerViewProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allExpenses, allIncome] = await Promise.all([
        expensesAPI.getExpenses(department),
        incomeAPI.getIncome(department),
      ]);

      setExpenses(allExpenses);
      setIncome(allIncome);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, "id">) => {
    try {
      const result = await expensesAPI.addExpense(expense as any);
      if (result.success) {
        await loadData();
      } else {
        console.error("Error adding expense:", result.message);
      }
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const handleAddIncome = async (inc: Omit<Income, "id">) => {
    try {
      const result = await incomeAPI.addIncome(inc as any);
      if (result.success) {
        await loadData();
      }
    } catch (error) {
      console.error("Error adding income:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-4 sm:py-8 px-3 sm:px-4 max-w-7xl">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <img src={logo} alt="True Light Christian Assembly" className="h-10 sm:h-12 w-auto flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl truncate">True Light Christian Assembly</h1>
              <p className="text-muted-foreground text-xs sm:text-sm truncate">
                {department} Tracker - {userName}
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center flex-wrap w-full sm:w-auto">
            <AddIncomeDialog onAddIncome={handleAddIncome} department={department} />
            <AddExpenseDialog onAddExpense={handleAddExpense} department={department} />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to log out? You will need to sign in again to access the expense tracker.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => { setShowLogoutDialog(false); onLogout(); }}>Logout</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <DepartmentDetailView
          department={department}
          expenses={expenses}
          income={income}
        />
      </div>
    </div>
  );
}
