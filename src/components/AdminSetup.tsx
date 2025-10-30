import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Department } from "./AddExpenseDialog";
import logo from "figma:asset/cff10961812a9c5fb76a38299a6c96f962dbce8e.png";

interface AdminSetupProps {
  onComplete: () => void;
  onSkipToLogin?: () => void;
}

interface UserForm {
  email: string;
  password: string;
  name: string;
  role: "admin" | "department_manager";
  department?: Department;
}

export function AdminSetup({ onComplete, onSkipToLogin }: AdminSetupProps) {
  const [users, setUsers] = useState<UserForm[]>([]);
  const [currentUser, setCurrentUser] = useState<UserForm>({
    email: "",
    password: "",
    name: "",
    role: "admin",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const departments: Department[] = ["Sports", "Fellowship", "Food", "Kids", "Worship", "Media", "General"];

  const handleAddUser = () => {
    if (!currentUser.email || !currentUser.password || !currentUser.name) {
      setError("Please fill in all fields");
      return;
    }

    if (currentUser.role === "department_manager" && !currentUser.department) {
      setError("Please select a department for department manager");
      return;
    }

    setUsers([...users, currentUser]);
    setCurrentUser({
      email: "",
      password: "",
      name: "",
      role: "admin",
    });
    setError("");
    setSuccess("User added to list");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleRemoveUser = (index: number) => {
    setUsers(users.filter((_, i) => i !== index));
  };

  const handleCreateUsers = async () => {
    if (users.length === 0) {
      setError("Please add at least one user");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const API_BASE_URL = 'https://tlca-expense-tracker-yasz.onrender.com/api/';

      // First, create the default departments
      console.log("Initializing default departments...");
      
      // We need to create an admin user first to get an access token
      const firstAdmin = users.find(u => u.role === "admin");
      if (!firstAdmin) {
        throw new Error("At least one admin user is required");
      }

      // Create the first admin
      console.log("Creating first admin:", firstAdmin.email);
      const adminResponse = await fetch(`${API_BASE_URL}/auth/signup.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(firstAdmin),
      });

      const adminData = await adminResponse.json();
      console.log("Admin signup response:", adminData);

      if (!adminData.success) {
        throw new Error(adminData.message || "Failed to create admin user");
      }

      // Login as admin to get access token
      const loginResponse = await fetch(`${API_BASE_URL}/auth/login.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: firstAdmin.email,
          password: firstAdmin.password,
        }),
      });

      const loginData = await loginResponse.json();
      console.log("Admin login response:", loginData);

      if (!loginData.success || !loginData.token) {
        throw new Error("Failed to login as admin");
      }

      const accessToken = loginData.token;

      // Initialize departments
      for (const dept of departments) {
        const deptResponse = await fetch(`${API_BASE_URL}/departments/add.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ name: dept, description: `${dept} Department` }),
        });

        const deptData = await deptResponse.json();
        console.log(`Department ${dept} creation response:`, deptData);
      }

      // Create remaining users
      const remainingUsers = users.filter(u => u !== firstAdmin);
      for (const user of remainingUsers) {
        console.log("Creating user:", user.email);
        const response = await fetch(`${API_BASE_URL}/auth/signup.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify(user),
        });

        const data = await response.json();
        console.log("Signup response for", user.email, ":", data);

        if (!data.success) {
          throw new Error(data.message || "Failed to create user");
        }
      }

      setSuccess(`Successfully created ${users.length} user(s) and initialized ${departments.length} departments!`);
      setUsers([]);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (err: any) {
      console.error("Setup error:", err);
      setError(err.message || "An error occurred during setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-2">
                <img src={logo} alt="True Light Christian Assembly" className="h-20 w-auto" />
                <h1 className="text-xl font-semibold">True Light Christian Assembly</h1>
              </div>
            </div>
            <div className="text-center">
              <CardTitle className="text-2xl">Initial Setup</CardTitle>
              <CardDescription>
                Create admin accounts and department manager accounts
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Add User Form */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h3 className="font-semibold">Add User</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={currentUser.name}
                    onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={currentUser.email}
                    onChange={(e) => setCurrentUser({ ...currentUser, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={currentUser.password}
                    onChange={(e) => setCurrentUser({ ...currentUser, password: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={currentUser.role}
                    onValueChange={(value) => setCurrentUser({ ...currentUser, role: value as any })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin (See All Departments)</SelectItem>
                      <SelectItem value="department_manager">Department Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {currentUser.role === "department_manager" && (
                  <div className="grid gap-2">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={currentUser.department}
                      onValueChange={(value) => setCurrentUser({ ...currentUser, department: value as Department })}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button onClick={handleAddUser} type="button" variant="outline">
                  Add to List
                </Button>
              </div>
            </div>

            {/* Users List */}
            {users.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Users to Create ({users.length})</h3>
                <div className="space-y-2">
                  {users.map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email} - {user.role === "admin" ? "Admin" : `${user.department} Manager`}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveUser(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* Create Button */}
            <Button
              onClick={handleCreateUsers}
              className="w-full"
              disabled={loading || users.length === 0}
            >
              {loading ? "Creating Users..." : `Create ${users.length} User(s) & Initialize System`}
            </Button>

            {onSkipToLogin && (
              <div className="text-center pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onSkipToLogin}
                  disabled={loading}
                  className="w-full"
                >
                  Already have an account? Login
                </Button>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              After setup, you can log in with any of the created accounts
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
