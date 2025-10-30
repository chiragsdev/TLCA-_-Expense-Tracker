import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Combobox } from "./ui/combobox";
import { PlusCircle } from "lucide-react";
import { Department } from "./AddExpenseDialog";
import * as membersAPI from "../utils/api/members";

export interface Income {
  id: string;
  department: Department;
  description: string;
  amount: number;
  date: string;
  contributedBy: string;
  notes: string;
}

interface AddIncomeDialogProps {
  onAddIncome: (income: Omit<Income, "id">) => void;
  accessToken?: string;
  department?: Department; // If provided, department selector is hidden
}

export function AddIncomeDialog({ onAddIncome, accessToken, department: fixedDepartment }: AddIncomeDialogProps) {
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [department, setDepartment] = useState<Department>(fixedDepartment || "");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [contributedBy, setContributedBy] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (fixedDepartment) {
      setDepartment(fixedDepartment);
    }
  }, [fixedDepartment]);

  useEffect(() => {
    if (open && accessToken) {
      if (!fixedDepartment) {
        fetchDepartments();
      }
      fetchMembers();
    }
  }, [open, accessToken, fixedDepartment]);

  const fetchDepartments = async () => {
    try {
      const { getDepartments } = await import("../utils/api/departments");
      const depts = await getDepartments();
      const deptNames = depts.map(d => d.name);
      setDepartments(deptNames);
      if (deptNames.length > 0 && !department) {
        setDepartment(deptNames[0]);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const fetchMembers = async () => {
    try {
      const membersList = await membersAPI.getMembers();
      const memberNames = membersList.map(m => m.name);
      setMembers(memberNames);
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !contributedBy) return;

    onAddIncome({
      department,
      description,
      amount: parseFloat(amount),
      date,
      contributedBy,
      notes,
    });

    // Reset form
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setContributedBy("");
    setNotes("");
    if (!fixedDepartment) {
      setDepartment("General");
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Add Income</span>
          <span className="sm:hidden">Income</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <DialogTitle>Add Department Income</DialogTitle>
          <DialogDescription>
            Record a contribution or income for a department fund.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!fixedDepartment && (
              <div className="grid gap-2">
                <Label htmlFor="income-department">Department</Label>
                <Select value={department} onValueChange={(value) => setDepartment(value as Department)}>
                  <SelectTrigger id="income-department">
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
            <div className="grid gap-2">
              <Label htmlFor="contributedBy">Contributed By</Label>
              {members.length > 0 ? (
                <Combobox
                  id="contributedBy"
                  value={contributedBy}
                  onValueChange={setContributedBy}
                  options={members}
                  placeholder="Select or type name..."
                  searchPlaceholder="Search members..."
                  emptyText="No member found."
                  allowCustom={true}
                />
              ) : (
                <Input
                  id="contributedBy"
                  placeholder="Name of person or organization"
                  value={contributedBy}
                  onChange={(e) => setContributedBy(e.target.value)}
                  required
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="income-description">Description</Label>
              <Textarea
                id="income-description"
                placeholder="Purpose or source of contribution"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="income-amount">Amount ($)</Label>
              <Input
                id="income-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="income-date">Date</Label>
              <Input
                id="income-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="income-notes">Notes (Optional)</Label>
              <Textarea
                id="income-notes"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Add Income</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
