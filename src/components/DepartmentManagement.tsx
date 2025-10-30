import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Badge } from "./ui/badge";
import { Building2, Plus, Trash2, Users, UserPlus, ArrowLeft, KeyRound, Archive, ArchiveRestore, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { MembersUpload } from "./MembersUpload";
import * as departmentsAPI from "../utils/api/departments";
import * as usersAPI from "../utils/api/users";
import * as authAPI from "../utils/api/auth";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "department_manager";
  department: string | null;
}

interface DepartmentManagementProps {
  accessToken: string;
  onBack: () => void;
}

export function DepartmentManagement({ accessToken, onBack }: DepartmentManagementProps) {
  const [departments, setDepartments] = useState<string[]>([]);
  const [archivedDepartments, setArchivedDepartments] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(null);
  
  // Department form
  const [newDepartment, setNewDepartment] = useState("");
  const [addingDepartment, setAddingDepartment] = useState(false);
  
  // User form
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedDepartmentForUser, setSelectedDepartmentForUser] = useState<string>("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "department_manager">("department_manager");
  const [addingUser, setAddingUser] = useState(false);
  
  // Password reset
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  
  // Reassign user
  const [userToReassign, setUserToReassign] = useState<User | null>(null);
  const [reassignToDepartment, setReassignToDepartment] = useState("");
  const [reassigning, setReassigning] = useState(false);
  
  // Delete confirmations
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [departmentToArchive, setDepartmentToArchive] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptResponse, archivedResponse, usersResponse] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-81befd82/departments`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-81befd82/archived-departments`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-81befd82/users`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      if (deptResponse.ok) {
        const data = await deptResponse.json();
        setDepartments(data.departments || []);
      }

      if (archivedResponse.ok) {
        const data = await archivedResponse.json();
        setArchivedDepartments(data.archivedDepartments || []);
      }

      if (usersResponse.ok) {
        const data = await usersResponse.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) {
      toast.error("Department name is required");
      return;
    }

    try {
      setAddingDepartment(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-81befd82/departments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ name: newDepartment.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Department added successfully");
        setDepartments(data.departments);
        setNewDepartment("");
        setExpandedDepartment(newDepartment.trim());
      } else {
        toast.error(data.error || "Failed to add department");
      }
    } catch (error) {
      console.error("Failed to add department:", error);
      toast.error("Failed to add department");
    } finally {
      setAddingDepartment(false);
    }
  };

  const handleDeleteDepartment = async (name: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81befd82/departments/${encodeURIComponent(name)}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Department deleted successfully");
        setDepartments(data.departments);
        setArchivedDepartments(data.archivedDepartments || archivedDepartments);
        setDepartmentToDelete(null);
      } else {
        if (data.assignedUsers) {
          toast.error(`Cannot delete department with ${data.assignedUsers} assigned user(s). Please reassign or delete users first.`);
        } else {
          toast.error(data.error || "Failed to delete department");
        }
      }
    } catch (error) {
      console.error("Failed to delete department:", error);
      toast.error("Failed to delete department");
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail.trim() || !newUserName.trim() || !newUserPassword.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (newUserRole === "department_manager" && !selectedDepartmentForUser) {
      toast.error("Please select a department");
      return;
    }

    try {
      setAddingUser(true);
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-81befd82/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email: newUserEmail.trim(),
          password: newUserPassword,
          name: newUserName.trim(),
          role: newUserRole,
          department: newUserRole === "department_manager" ? selectedDepartmentForUser : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("User added successfully");
        await fetchData();
        setShowAddUser(false);
        setNewUserEmail("");
        setNewUserName("");
        setNewUserPassword("");
        setNewUserRole("department_manager");
        setSelectedDepartmentForUser("");
      } else {
        toast.error(data.error || "Failed to add user");
      }
    } catch (error) {
      console.error("Failed to add user:", error);
      toast.error("Failed to add user");
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81befd82/users/${user.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response.ok) {
        toast.success("User deleted successfully");
        await fetchData();
        setUserToDelete(null);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete user");
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleResetPassword = async () => {
    if (!userToResetPassword || !newPassword) return;

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setResettingPassword(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81befd82/users/${userToResetPassword.id}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ newPassword }),
        }
      );

      if (response.ok) {
        toast.success("Password reset successfully");
        setUserToResetPassword(null);
        setNewPassword("");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.error("Failed to reset password:", error);
      toast.error("Failed to reset password");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleReassignUser = async () => {
    if (!userToReassign || !reassignToDepartment) return;

    try {
      setReassigning(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81befd82/users/${userToReassign.id}/department`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ department: reassignToDepartment }),
        }
      );

      if (response.ok) {
        toast.success("User reassigned successfully");
        await fetchData();
        setUserToReassign(null);
        setReassignToDepartment("");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to reassign user");
      }
    } catch (error) {
      console.error("Failed to reassign user:", error);
      toast.error("Failed to reassign user");
    } finally {
      setReassigning(false);
    }
  };

  const handleArchiveDepartment = async (name: string, archive: boolean) => {
    // Check if department has users
    const deptUsers = users.filter(u => u.department === name);
    if (archive && deptUsers.length > 0) {
      toast.error(`Cannot archive department with ${deptUsers.length} assigned user(s). Please reassign or delete users first.`);
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81befd82/departments/${encodeURIComponent(name)}/archive`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ archived: archive }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(archive ? "Department archived successfully" : "Department restored successfully");
        setDepartments(data.departments);
        setArchivedDepartments(data.archivedDepartments);
        setDepartmentToArchive(null);
      } else {
        toast.error(data.error || "Failed to archive department");
      }
    } catch (error) {
      console.error("Failed to archive department:", error);
      toast.error("Failed to archive department");
    }
  };

  const getUsersForDepartment = (department: string) => {
    return users.filter(u => u.department === department && u.role === "department_manager");
  };

  const getAdminUsers = () => {
    return users.filter(u => u.role === "admin");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl lg:text-3xl">Department & User Management</h2>
          <p className="text-muted-foreground text-sm">Manage departments and their assigned users</p>
        </div>
      </div>

      {/* Members Upload and Add Department - Side by Side */}
      <div className="grid gap-6 md:grid-cols-2">
        <MembersUpload accessToken={accessToken} />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Create New Department
            </CardTitle>
            <CardDescription>Add a new department to your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Department name (e.g., Youth Ministry)"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddDepartment()}
              />
              <Button onClick={handleAddDepartment} disabled={addingDepartment}>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Users Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Administrators
              </CardTitle>
              <CardDescription>System administrators with full access</CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => {
                setSelectedDepartmentForUser("");
                setNewUserRole("admin");
                setShowAddUser(true);
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {getAdminUsers().length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No admin users</p>
            ) : (
              getAdminUsers().map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name}</span>
                      <Badge variant="default">Admin</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUserToResetPassword(user)}
                      title="Reset password"
                    >
                      <KeyRound className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUserToDelete(user)}
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Departments Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active Departments ({departments.length})
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived ({archivedDepartments.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-3 mt-4">
          {departments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-sm text-muted-foreground text-center">
                  No active departments. Create your first department above.
                </p>
              </CardContent>
            </Card>
          ) : (
            departments.map((dept) => {
              const deptUsers = getUsersForDepartment(dept);
              const isExpanded = expandedDepartment === dept;
              
              return (
                <Card key={dept}>
                  <Collapsible open={isExpanded} onOpenChange={(open) => setExpandedDepartment(open ? dept : null)}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto hover:bg-transparent">
                            <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            <div className="text-left">
                              <CardTitle>{dept}</CardTitle>
                              <CardDescription>
                                {deptUsers.length} {deptUsers.length === 1 ? 'manager' : 'managers'}
                              </CardDescription>
                            </div>
                          </Button>
                        </CollapsibleTrigger>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDepartmentForUser(dept);
                              setNewUserRole("department_manager");
                              setShowAddUser(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add User
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDepartmentToArchive(dept)}
                            title="Archive department"
                          >
                            <Archive className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDepartmentToDelete(dept)}
                            title="Delete department"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="space-y-2 border-t pt-3">
                          {deptUsers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No users assigned to this department
                            </p>
                          ) : (
                            deptUsers.map((user) => (
                              <div
                                key={user.id}
                                className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setUserToReassign(user);
                                      setReassignToDepartment("");
                                    }}
                                  >
                                    Reassign
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setUserToResetPassword(user)}
                                    title="Reset password"
                                  >
                                    <KeyRound className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setUserToDelete(user)}
                                    title="Delete user"
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-3 mt-4">
          {archivedDepartments.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <p className="text-sm text-muted-foreground text-center">
                  No archived departments.
                </p>
              </CardContent>
            </Card>
          ) : (
            archivedDepartments.map((dept) => (
              <Card key={dept} className="bg-muted/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-muted-foreground">{dept}</CardTitle>
                      <Badge variant="outline" className="text-xs">Archived</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleArchiveDepartment(dept, false)}
                      >
                        <ArchiveRestore className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDepartmentToDelete(dept)}
                        title="Delete permanently"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      {showAddUser && (
        <AlertDialog open={showAddUser} onOpenChange={setShowAddUser}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Add New User</AlertDialogTitle>
              <AlertDialogDescription>
                {newUserRole === "admin" 
                  ? "Create a new administrator account"
                  : `Create a new manager for ${selectedDepartmentForUser || "a department"}`
                }
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {newUserRole === "department_manager" && !selectedDepartmentForUser && (
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={selectedDepartmentForUser} onValueChange={setSelectedDepartmentForUser}>
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
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setNewUserEmail("");
                setNewUserName("");
                setNewUserPassword("");
                setSelectedDepartmentForUser("");
              }}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAddUser} disabled={addingUser}>
                {addingUser ? "Adding..." : "Add User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Reassign User Dialog */}
      {userToReassign && (
        <AlertDialog open={!!userToReassign} onOpenChange={() => {
          setUserToReassign(null);
          setReassignToDepartment("");
        }}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Reassign User</AlertDialogTitle>
              <AlertDialogDescription>
                Reassign {userToReassign.name} to a different department
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Current Department</Label>
                <div className="p-2 bg-muted rounded text-sm">{userToReassign.department}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-department">New Department</Label>
                <Select value={reassignToDepartment} onValueChange={setReassignToDepartment}>
                  <SelectTrigger id="new-department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.filter(d => d !== userToReassign.department).map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setReassignToDepartment("")}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleReassignUser} disabled={reassigning || !reassignToDepartment}>
                {reassigning ? "Reassigning..." : "Reassign"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Department Confirmation */}
      {departmentToDelete && (
        <AlertDialog open={!!departmentToDelete} onOpenChange={() => setDepartmentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Department</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{departmentToDelete}"? This action cannot be undone.
                {getUsersForDepartment(departmentToDelete).length > 0 && (
                  <span className="block mt-2 text-destructive font-medium">
                    This department has {getUsersForDepartment(departmentToDelete).length} assigned user(s). 
                    Please reassign or delete them first.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteDepartment(departmentToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete User Confirmation */}
      {userToDelete && (
        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {userToDelete.name} ({userToDelete.email})? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteUser(userToDelete)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Reset Password Dialog */}
      {userToResetPassword && (
        <AlertDialog open={!!userToResetPassword} onOpenChange={() => {
          setUserToResetPassword(null);
          setNewPassword("");
        }}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Password</AlertDialogTitle>
              <AlertDialogDescription>
                Reset password for {userToResetPassword.name} ({userToResetPassword.email})
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setNewPassword("")}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetPassword} disabled={resettingPassword}>
                {resettingPassword ? "Resetting..." : "Reset Password"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Archive Department Confirmation */}
      {departmentToArchive && (
        <AlertDialog open={!!departmentToArchive} onOpenChange={() => setDepartmentToArchive(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Department</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to archive "{departmentToArchive}"? Archived departments will be hidden but can be restored later.
                {getUsersForDepartment(departmentToArchive).length > 0 && (
                  <span className="block mt-2 text-destructive font-medium">
                    This department has {getUsersForDepartment(departmentToArchive).length} assigned user(s). 
                    Please reassign or delete them first.
                  </span>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleArchiveDepartment(departmentToArchive, true)}
              >
                Archive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
