import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase clients
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
};

const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );
};

// Helper to verify JWT and get user
const verifyUser = async (accessToken: string) => {
  try {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return { user: null, error: error || new Error('User not found') };
    }
    
    return { user, error: null };
  } catch (error) {
    console.error('Error verifying user:', error);
    return { user: null, error };
  }
};

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize storage bucket on startup
const initializeStorage = async () => {
  try {
    const supabase = getSupabaseAdmin();
    const bucketName = 'make-81befd82-receipts';
    
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log('Creating receipts bucket...');
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
      });
      if (error) {
        console.error('Error creating bucket:', error);
      } else {
        console.log('Receipts bucket created successfully');
      }
    } else {
      console.log('Receipts bucket already exists');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
};

// Initialize storage on startup
initializeStorage();

// Health check endpoint
app.get("/make-server-81befd82/health", (c) => {
  return c.json({ status: "ok" });
});

// Debug endpoint to check KV store (REMOVE IN PRODUCTION)
app.get("/make-server-81befd82/debug/users", async (c) => {
  try {
    console.log("Attempting to fetch users from KV store...");
    const users = await kv.getByPrefix("user:");
    console.log("Successfully fetched users:", users);
    return c.json({ users, count: users.length });
  } catch (error: any) {
    console.log("Debug endpoint error:", error);
    console.log("Error stack:", error.stack);
    return c.json({ 
      error: error.message || "Unknown error",
      details: error.toString(),
      stack: error.stack
    }, 500);
  }
});

// Debug endpoint to check Supabase Auth users
app.get("/make-server-81befd82/debug/auth-users", async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log("Error listing auth users:", error);
      return c.json({ error: error.message }, 500);
    }
    
    const userList = data.users.map((u: any) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      confirmed_at: u.confirmed_at,
    }));
    
    return c.json({ users: userList, count: userList.length });
  } catch (error: any) {
    console.log("Debug auth users error:", error);
    return c.json({ error: error.message }, 500);
  }
});

// Signup endpoint
app.post("/make-server-81befd82/signup", async (c) => {
  try {
    const { email, password, name, role, department } = await c.req.json();
    
    if (!email || !password || !name || !role) {
      console.log("Signup validation error: Missing required fields");
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (role === "department_manager" && !department) {
      console.log("Signup validation error: Missing department for manager");
      return c.json({ error: "Department is required for department managers" }, 400);
    }

    const supabase = getSupabaseAdmin();
    
    // Check if user already exists by email
    try {
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const userExists = existingUsers?.users?.find((u: any) => u.email === email);
      
      if (userExists) {
        console.log("User already exists:", email, "ID:", userExists.id);
        // Check if profile exists in KV
        const existingProfile = await kv.get(`user:${userExists.id}`);
        if (!existingProfile) {
          // User exists in auth but not in KV, create the profile
          const userProfile = {
            id: userExists.id,
            email,
            name,
            role,
            department: role === "department_manager" ? department : null,
            createdAt: new Date().toISOString(),
          };
          await kv.set(`user:${userExists.id}`, userProfile);
          console.log("Created missing profile for existing user:", email);
          return c.json({ success: true, user: userProfile, existed: true });
        }
        return c.json({ success: true, user: existingProfile, existed: true });
      }
    } catch (listError) {
      console.log("Error checking existing users:", listError);
      // Continue with creation if we can't check
    }
    
    // Create new user
    console.log("Creating new user:", email);
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email since email server isn't configured
    });

    if (authError) {
      console.log("Signup auth error for", email, ":", authError);
      return c.json({ error: `Signup error: ${authError.message}` }, 400);
    }

    if (!authData?.user?.id) {
      console.log("No user ID returned from auth");
      return c.json({ error: "User creation failed - no ID returned" }, 500);
    }

    // Store user profile in KV store
    const userProfile = {
      id: authData.user.id,
      email,
      name,
      role, // "admin" or "department_manager"
      department: role === "department_manager" ? department : null,
      createdAt: new Date().toISOString(),
    };

    const kvKey = `user:${authData.user.id}`;
    console.log("Storing user profile with key:", kvKey, "data:", userProfile);
    await kv.set(kvKey, userProfile);
    
    // Verify it was stored
    const storedProfile = await kv.get(kvKey);
    console.log("Verification - stored profile:", storedProfile);
    
    if (!storedProfile) {
      console.log("WARNING: Profile was not stored correctly!");
      return c.json({ error: "Profile storage failed" }, 500);
    }
    
    return c.json({ success: true, user: userProfile, existed: false });
  } catch (error: any) {
    console.log("Signup error:", error);
    return c.json({ error: `Signup failed: ${error.message}` }, 500);
  }
});

// Get user profile
app.get("/make-server-81befd82/profile", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      console.log("Profile auth error:", error);
      return c.json({ error: "Unauthorized" }, 401);
    }

    console.log("Looking up profile for user ID:", user.id);
    const kvKey = `user:${user.id}`;
    const profile = await kv.get(kvKey);
    
    console.log("Profile lookup result for key", kvKey, ":", profile);
    
    if (!profile) {
      console.log("Profile not found! Checking all users in KV store...");
      const allUsers = await kv.getByPrefix("user:");
      console.log("All users in KV store:", allUsers);
      return c.json({ error: "User profile not found" }, 404);
    }

    return c.json({ profile });
  } catch (error) {
    console.log("Profile fetch error:", error);
    return c.json({ error: `Failed to fetch profile: ${error.message}` }, 500);
  }
});

// Get all expenses
app.get("/make-server-81befd82/expenses", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const expenses = await kv.getByPrefix("expense:");
    return c.json({ expenses });
  } catch (error) {
    console.log("Get expenses error:", error);
    return c.json({ error: `Failed to fetch expenses: ${error.message}` }, 500);
  }
});

// Add expense
app.post("/make-server-81befd82/expenses", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const expense = await c.req.json();
    const expenseId = `expense:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(expenseId, {
      ...expense,
      id: expenseId,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, id: expenseId });
  } catch (error) {
    console.log("Add expense error:", error);
    return c.json({ error: `Failed to add expense: ${error.message}` }, 500);
  }
});

// Get all income
app.get("/make-server-81befd82/income", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const income = await kv.getByPrefix("income:");
    return c.json({ income });
  } catch (error) {
    console.log("Get income error:", error);
    return c.json({ error: `Failed to fetch income: ${error.message}` }, 500);
  }
});

// Add income
app.post("/make-server-81befd82/income", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const income = await c.req.json();
    const incomeId = `income:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(incomeId, {
      ...income,
      id: incomeId,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, id: incomeId });
  } catch (error) {
    console.log("Add income error:", error);
    return c.json({ error: `Failed to add income: ${error.message}` }, 500);
  }
});

// Get all departments
app.get("/make-server-81befd82/departments", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const departments = await kv.get("departments") || [];
    return c.json({ departments });
  } catch (error) {
    console.log("Get departments error:", error);
    return c.json({ error: `Failed to fetch departments: ${error.message}` }, 500);
  }
});

// Add department (admin only)
app.post("/make-server-81befd82/departments", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const profile = await kv.get(`user:${user.id}`);
    if (!profile || profile.role !== "admin") {
      return c.json({ error: "Admin access required" }, 403);
    }

    const { name } = await c.req.json();
    
    if (!name || typeof name !== "string" || name.trim() === "") {
      return c.json({ error: "Department name is required" }, 400);
    }

    const departments = await kv.get("departments") || [];
    
    // Check if department already exists
    if (departments.includes(name)) {
      return c.json({ error: "Department already exists" }, 400);
    }

    departments.push(name);
    await kv.set("departments", departments);

    return c.json({ success: true, departments });
  } catch (error) {
    console.log("Add department error:", error);
    return c.json({ error: `Failed to add department: ${error.message}` }, 500);
  }
});

// Delete department (admin only)
app.delete("/make-server-81befd82/departments/:name", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const profile = await kv.get(`user:${user.id}`);
    if (!profile || profile.role !== "admin") {
      return c.json({ error: "Admin access required" }, 403);
    }

    const name = c.req.param('name');
    const departments = await kv.get("departments") || [];
    const archivedDepartments = await kv.get("archived_departments") || [];
    
    // Check both active and archived
    const activeIndex = departments.indexOf(name);
    const archivedIndex = archivedDepartments.indexOf(name);
    
    if (activeIndex === -1 && archivedIndex === -1) {
      return c.json({ error: "Department not found" }, 404);
    }

    // Check if any users are assigned to this department
    const allUsers = await kv.getByPrefix("user:");
    const assignedUsers = allUsers.filter((u: any) => u.department === name);
    
    if (assignedUsers.length > 0) {
      return c.json({ 
        error: "Cannot delete department with assigned users", 
        assignedUsers: assignedUsers.length 
      }, 400);
    }

    // Remove from appropriate list
    if (activeIndex !== -1) {
      departments.splice(activeIndex, 1);
      await kv.set("departments", departments);
    } else {
      archivedDepartments.splice(archivedIndex, 1);
      await kv.set("archived_departments", archivedDepartments);
    }

    return c.json({ success: true, departments, archivedDepartments });
  } catch (error) {
    console.log("Delete department error:", error);
    return c.json({ error: `Failed to delete department: ${error.message}` }, 500);
  }
});

// Get all users (admin only)
app.get("/make-server-81befd82/users", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const profile = await kv.get(`user:${user.id}`);
    if (!profile || profile.role !== "admin") {
      return c.json({ error: "Admin access required" }, 403);
    }

    const users = await kv.getByPrefix("user:");
    return c.json({ users });
  } catch (error) {
    console.log("Get users error:", error);
    return c.json({ error: `Failed to fetch users: ${error.message}` }, 500);
  }
});

// Update user department (admin only)
app.patch("/make-server-81befd82/users/:userId/department", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const profile = await kv.get(`user:${user.id}`);
    if (!profile || profile.role !== "admin") {
      return c.json({ error: "Admin access required" }, 403);
    }

    const userIdToUpdate = c.req.param('userId');
    const { department } = await c.req.json();

    // Get the user profile
    const userProfile = await kv.get(`user:${userIdToUpdate}`);
    if (!userProfile) {
      return c.json({ error: "User not found" }, 404);
    }

    // Update the department
    userProfile.department = department;
    await kv.set(`user:${userIdToUpdate}`, userProfile);

    return c.json({ success: true, user: userProfile });
  } catch (error) {
    console.log("Update user department error:", error);
    return c.json({ error: `Failed to update user department: ${error.message}` }, 500);
  }
});

// Delete user (admin only)
app.delete("/make-server-81befd82/users/:userId", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const profile = await kv.get(`user:${user.id}`);
    if (!profile || profile.role !== "admin") {
      return c.json({ error: "Admin access required" }, 403);
    }

    const userIdToDelete = c.req.param('userId');
    
    // Prevent deleting yourself
    if (userIdToDelete === user.id) {
      return c.json({ error: "Cannot delete your own account" }, 400);
    }

    // Delete from KV store
    await kv.del(`user:${userIdToDelete}`);
    
    // Delete from Supabase Auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userIdToDelete);
    if (deleteError) {
      console.log("Error deleting user from auth:", deleteError);
      // Continue anyway as KV is already deleted
    }

    return c.json({ success: true });
  } catch (error) {
    console.log("Delete user error:", error);
    return c.json({ error: `Failed to delete user: ${error.message}` }, 500);
  }
});

// Reset user password (admin only)
app.post("/make-server-81befd82/users/:userId/reset-password", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const profile = await kv.get(`user:${user.id}`);
    if (!profile || profile.role !== "admin") {
      return c.json({ error: "Admin access required" }, 403);
    }

    const userIdToUpdate = c.req.param('userId');
    const { newPassword } = await c.req.json();

    if (!newPassword || newPassword.length < 6) {
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }

    // Update password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userIdToUpdate,
      { password: newPassword }
    );

    if (updateError) {
      console.log("Error updating password:", updateError);
      return c.json({ error: `Failed to update password: ${updateError.message}` }, 500);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log("Reset password error:", error);
    return c.json({ error: `Failed to reset password: ${error.message}` }, 500);
  }
});

// Archive/Unarchive department (admin only)
app.patch("/make-server-81befd82/departments/:name/archive", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const profile = await kv.get(`user:${user.id}`);
    if (!profile || profile.role !== "admin") {
      return c.json({ error: "Admin access required" }, 403);
    }

    const name = c.req.param('name');
    const { archived } = await c.req.json();

    const departments = await kv.get("departments") || [];
    const archivedDepartments = await kv.get("archived_departments") || [];

    if (archived) {
      // Move to archived
      const index = departments.indexOf(name);
      if (index === -1) {
        return c.json({ error: "Department not found" }, 404);
      }
      departments.splice(index, 1);
      if (!archivedDepartments.includes(name)) {
        archivedDepartments.push(name);
      }
    } else {
      // Restore from archived
      const index = archivedDepartments.indexOf(name);
      if (index === -1) {
        return c.json({ error: "Archived department not found" }, 404);
      }
      archivedDepartments.splice(index, 1);
      if (!departments.includes(name)) {
        departments.push(name);
      }
    }

    await kv.set("departments", departments);
    await kv.set("archived_departments", archivedDepartments);

    return c.json({ success: true, departments, archivedDepartments });
  } catch (error) {
    console.log("Archive department error:", error);
    return c.json({ error: `Failed to archive department: ${error.message}` }, 500);
  }
});

// Get archived departments
app.get("/make-server-81befd82/archived-departments", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const archivedDepartments = await kv.get("archived_departments") || [];
    return c.json({ archivedDepartments });
  } catch (error) {
    console.log("Get archived departments error:", error);
    return c.json({ error: `Failed to fetch archived departments: ${error.message}` }, 500);
  }
});

// Upload church members CSV (admin only)
app.post("/make-server-81befd82/upload-members", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Check if user is admin
    const profile = await kv.get(`user:${user.id}`);
    if (!profile || profile.role !== "admin") {
      return c.json({ error: "Admin access required" }, 403);
    }

    const { csvContent } = await c.req.json();
    
    if (!csvContent) {
      return c.json({ error: "CSV content is required" }, 400);
    }

    // Parse CSV - simple parsing for name lists
    const lines = csvContent.split('\n').map((line: string) => line.trim()).filter((line: string) => line);
    
    // Remove header if it exists (check if first line contains common headers)
    const firstLine = lines[0]?.toLowerCase() || '';
    const hasHeader = firstLine.includes('name') || firstLine.includes('first') || firstLine.includes('last');
    const dataLines = hasHeader ? lines.slice(1) : lines;
    
    // Extract names - handle both single column and multi-column CSVs
    const members: string[] = [];
    for (const line of dataLines) {
      const columns = line.split(',').map((col: string) => col.trim().replace(/"/g, ''));
      
      // If multiple columns, assume first is first name, second is last name
      if (columns.length >= 2 && columns[0] && columns[1]) {
        members.push(`${columns[0]} ${columns[1]}`);
      } else if (columns[0]) {
        // Single column or just use first column
        members.push(columns[0]);
      }
    }

    // Remove duplicates and sort
    const uniqueMembers = [...new Set(members)].sort();

    // Store in KV
    await kv.set("church_members", uniqueMembers);

    console.log(`Uploaded ${uniqueMembers.length} church members`);
    return c.json({ success: true, count: uniqueMembers.length, members: uniqueMembers });
  } catch (error: any) {
    console.log("Upload members error:", error);
    return c.json({ error: `Failed to upload members: ${error.message}` }, 500);
  }
});

// Get church members
app.get("/make-server-81befd82/members", async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { user, error } = await verifyUser(accessToken);
    
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const members = await kv.get("church_members") || [];
    return c.json({ members });
  } catch (error: any) {
    console.log("Get members error:", error);
    return c.json({ error: `Failed to fetch members: ${error.message}` }, 500);
  }
});

// Upload receipt endpoint
app.post("/make-server-81befd82/upload-receipt", async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    const bucketName = 'make-81befd82-receipts';
    
    // Parse form data
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: "No file provided" }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 9);
    const fileExtension = file.name.split('.').pop();
    const fileName = `receipt_${timestamp}_${randomString}.${fileExtension}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, uint8Array, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Storage upload error:", error);
      return c.json({ error: `Upload failed: ${error.message}` }, 500);
    }

    // Create a signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 31536000); // 1 year in seconds

    if (signedUrlError) {
      console.error("Signed URL error:", signedUrlError);
      return c.json({ error: `Failed to create signed URL: ${signedUrlError.message}` }, 500);
    }

    return c.json({ success: true, url: signedUrlData.signedUrl, path: fileName });
  } catch (error: any) {
    console.error("Upload receipt error:", error);
    return c.json({ error: `Upload failed: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);
