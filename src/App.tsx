import { useState, useEffect } from "react";
import { AddExpenseDialog, Expense, Department } from "./components/AddExpenseDialog";
import { AddIncomeDialog, Income } from "./components/AddIncomeDialog";
import { DepartmentSummary } from "./components/DepartmentSummary";
import { ExpenseTable } from "./components/ExpenseTable";
import { DepartmentDetailView } from "./components/DepartmentDetailView";
import { ReportsView } from "./components/ReportsView";
import { LoginPage } from "./components/LoginPage";
import { AdminSetup } from "./components/AdminSetup";
import { DepartmentManagerView } from "./components/DepartmentManagerView";
import { DepartmentManagement } from "./components/DepartmentManagement";
import { Button } from "./components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { LogOut, Settings } from "lucide-react";
import logo from "figma:asset/cff10961812a9c5fb76a38299a6c96f962dbce8e.png";

// Import MySQL API utilities
import * as authAPI from "./utils/api/auth";
import * as expensesAPI from "./utils/api/expenses";
import * as incomeAPI from "./utils/api/income";
import * as departmentsAPI from "./utils/api/departments";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "department_manager";
  department: Department | null;
}

function App() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  // Admin-specific state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<Income[]>([]);
  const [filterDepartment, setFilterDepartment] = useState<Department | "All">("All");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showManagement, setShowManagement] = useState(false);

  useEffect(() => {
    checkExistingSession();
  }, []);

  useEffect(() => {
    if (userProfile?.role === "admin") {
      loadData();
    }
  }, [userProfile]);

  const checkExistingSession = async () => {
    try {
      // Check if user is already authenticated
      if (authAPI.isAuthenticated()) {
        const response = await authAPI.verifySession();
        
        if (response.success && response.user) {
          setUserProfile(response.user as any);
          setNeedsSetup(false);
        } else {
          setNeedsSetup(true);
        }
      } else {
        // No active session, check if setup is needed
        // We'll determine this by attempting to verify - if it fails, we assume setup needed
        setNeedsSetup(true);
      }
    } catch (error) {
      console.error("Session check error:", error);
      setNeedsSetup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      if (response.success && response.user) {
        setUserProfile(response.user as any);
        setNeedsSetup(false);
        setLoading(false);
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const handleSetupComplete = () => {
    // After setup is complete, show the login page
    setNeedsSetup(false);
  };

  const loadData = async () => {
    if (!userProfile) return;

    try {
      const [expensesData, incomeData] = await Promise.all([
        expensesAPI.getExpenses(),
        incomeAPI.getIncome(),
      ]);

      setExpenses(expensesData.expenses);
      setIncome(incomeData.income);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleAddExpense = async (expense: Omit<Expense, "id">) => {
    try {
      await expensesAPI.addExpense({
        department: expense.department,
        description: expense.description,
        amount: expense.amount,
        date: expense.date,
        purchased_by: expense.purchasedBy,
        notes: expense.notes,
        reimbursement_status: expense.reimbursementStatus,
        receipt_url: expense.receiptUrl,
        receipt_filename: expense.receiptFilename,
      });

      await loadData();
    } catch (error) {
      console.error("Error adding expense:", error);
      throw error;
    }
  };

  const handleAddIncome = async (income: Omit<Income, "id">) => {
    try {
      await incomeAPI.addIncome({
        department: income.department,
        description: income.description,
        amount: income.amount,
        date: income.date,
        contributed_by: income.contributedBy,
        notes: income.notes,
      });

      await loadData();
    } catch (error) {
      console.error("Error adding income:", error);
      throw error;
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await expensesAPI.deleteExpense(id);
      await loadData();
    } catch (error) {
      console.error("Error deleting expense:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setUserProfile(null);
      setNeedsSetup(true);
      setShowLogoutDialog(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleBack = () => {
    setSelectedDepartment(null);
    setShowManagement(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (needsSetup) {
    return (
      <AdminSetup
        onComplete={handleSetupComplete}
        onSkipToLogin={() => setNeedsSetup(false)}
      />
    );
  }

  if (!userProfile) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onNeedSetup={() => setNeedsSetup(true)}
      />
    );
  }

  // Department Manager View
  if (userProfile.role === "department_manager") {
    return (
      <DepartmentManagerView
        department={userProfile.department!}
        userProfile={userProfile}
        onLogout={() => setShowLogoutDialog(true)}
      />
    );
  }

  // Admin View
  const filteredExpenses =
    filterDepartment === "All"
      ? expenses
      : expenses.filter((e) => e.department === filterDepartment);

  const filteredIncome =
    filterDepartment === "All"
      ? income
      : income.filter((i) => i.department === filterDepartment);

  const departments: Department[] = [
    "Sports",
    "Fellowship",
    "Food",
    "Kids",
    "Worship",
    "Media",
    "General",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <img src={logo} alt="True Light Christian Assembly" className="h-16 w-auto" />
              <div>
                <h1 className="text-blue-900">
                  True Light Christian Assembly
                </h1>
                <p className="text-gray-600">Department Expense Tracker</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">{userProfile.name}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {userProfile.role.replace("_", " ")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowManagement(!showManagement)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        {showManagement ? (
          <DepartmentManagement
            userProfile={userProfile}
            onBack={handleBack}
          />
        ) : selectedDepartment ? (
          <DepartmentDetailView
            department={selectedDepartment}
            onBack={handleBack}
          />
        ) : (
          <>
            <DepartmentSummary
              expenses={expenses}
              income={income}
              filterDepartment={filterDepartment}
              onFilterChange={setFilterDepartment}
              onDepartmentClick={setSelectedDepartment}
            />

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-wrap gap-3 mb-4">
                <AddExpenseDialog onAddExpense={handleAddExpense} />
                <AddIncomeDialog onAddIncome={handleAddIncome} />
              </div>
            </div>

            <ExpenseTable
              expenses={filteredExpenses}
              income={filteredIncome}
              onDeleteExpense={handleDeleteExpense}
            />
          </>
        )}

        {/* Logout Confirmation Dialog */}
        <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to logout?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLogout}>
                Logout
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default App;
