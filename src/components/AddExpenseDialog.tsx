import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Combobox } from "./ui/combobox";
import { Plus, Upload, X } from "lucide-react";
import * as departmentsAPI from "../utils/api/departments";
import * as membersAPI from "../utils/api/members";
import * as uploadsAPI from "../utils/api/uploads";

export type Department = string;

export interface Expense {
  id: string;
  department: Department;
  description: string;
  amount: number;
  date: string;
  purchasedBy: string;
  notes: string;
  reimbursementStatus: "Pending" | "Reimbursed" | "Not Required";
  receiptUrl?: string;
}

interface AddExpenseDialogProps {
  onAddExpense: (expense: Omit<Expense, "id">) => void;
  accessToken?: string;
  department?: Department; // If provided, department selector is hidden
}

export function AddExpenseDialog({ onAddExpense, accessToken, department: fixedDepartment }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<string[]>([]);
  const [department, setDepartment] = useState<Department>(fixedDepartment || "");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [purchasedBy, setPurchasedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [reimbursementStatus, setReimbursementStatus] = useState<"Pending" | "Reimbursed" | "Not Required">("Not Required");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
      const depts = await departmentsAPI.getDepartments();
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload an image (JPEG, PNG, GIF) or PDF file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setReceiptFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !purchasedBy) return;

    setUploading(true);
    
    let receiptUrl: string | undefined = undefined;

    // Upload receipt if provided
    if (receiptFile) {
      try {
        const uploadResult = await uploadsAPI.uploadReceipt(receiptFile);
        
        if (uploadResult.success && uploadResult.url) {
          receiptUrl = uploadResult.url;
        } else {
          console.error('Receipt upload failed:', uploadResult.message);
          alert('Failed to upload receipt. The expense will be saved without it.');
        }
      } catch (error) {
        console.error('Error uploading receipt:', error);
        alert('Failed to upload receipt. The expense will be saved without it.');
      }
    }

    onAddExpense({
      department,
      description,
      amount: parseFloat(amount),
      date,
      purchasedBy,
      notes,
      reimbursementStatus,
      receiptUrl,
    });

    // Reset form
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setPurchasedBy("");
    setNotes("");
    setReimbursementStatus("Not Required");
    if (!fixedDepartment) {
      setDepartment("General");
    }
    setReceiptFile(null);
    setUploading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Expense</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto w-[95vw]">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Record a new expense for the church department.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!fixedDepartment && (
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Select value={department} onValueChange={(value) => setDepartment(value as Department)}>
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
            <div className="grid gap-2">
              <Label htmlFor="purchasedBy">Purchased By</Label>
              {members.length > 0 ? (
                <Combobox
                  id="purchasedBy"
                  value={purchasedBy}
                  onValueChange={setPurchasedBy}
                  options={members}
                  placeholder="Select or type member name..."
                  searchPlaceholder="Search members..."
                  emptyText="No member found."
                  allowCustom={true}
                />
              ) : (
                <Input
                  id="purchasedBy"
                  placeholder="Name of person"
                  value={purchasedBy}
                  onChange={(e) => setPurchasedBy(e.target.value)}
                  required
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What was this expense for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reimbursementStatus">Reimbursement Status</Label>
              <Select value={reimbursementStatus} onValueChange={(value) => setReimbursementStatus(value as any)}>
                <SelectTrigger id="reimbursementStatus">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Required">Not Required</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Reimbursed">Reimbursed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="receipt">Receipt (Optional)</Label>
              <div className="space-y-2">
                {receiptFile ? (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm flex-1 truncate">{receiptFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setReceiptFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      id="receipt"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload an image or PDF (max 5MB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
