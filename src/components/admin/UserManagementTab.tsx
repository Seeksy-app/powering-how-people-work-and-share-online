import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Search, Trash2 } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  created_at: string | null;
  roles: string[];
}

interface UserManagementTabProps {
  users: UserProfile[];
  filteredUsers: UserProfile[];
  searchQuery: string;
  roleFilter: string;
  setSearchQuery: (query: string) => void;
  setRoleFilter: (filter: string) => void;
  onToggleRole: (userId: string, role: string) => void;
  onDeleteUser: (userId: string, username: string) => void;
}

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin", color: "bg-purple-600" },
  { value: "admin", label: "Admin", color: "bg-red-500" },
  { value: "manager", label: "Manager", color: "bg-orange-500" },
  { value: "scheduler", label: "Scheduler", color: "bg-blue-500" },
  { value: "sales", label: "Sales", color: "bg-green-500" },
  { value: "advertiser", label: "Advertiser", color: "bg-yellow-500" },
  { value: "member", label: "Member", color: "bg-gray-500" },
];

export default function UserManagementTab({
  users,
  filteredUsers,
  searchQuery,
  roleFilter,
  setSearchQuery,
  setRoleFilter,
  onToggleRole,
  onDeleteUser,
}: UserManagementTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>Find and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by username or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{user.full_name || user.username}</h3>
                    <Badge variant="outline" className="text-xs">
                      @{user.username}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Joined {new Date(user.created_at || "").toLocaleDateString()}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {user.roles.length === 0 && (
                      <Badge variant="secondary">No roles assigned</Badge>
                    )}
                    {user.roles.map((role) => {
                      const roleConfig = ROLE_OPTIONS.find((r) => r.value === role);
                      return (
                        <Badge key={role} className={`${roleConfig?.color} hover:opacity-80`}>
                          {roleConfig?.label || role}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <Select
                    value={user.roles?.[0] || "member"}
                    onValueChange={(newRole) => onToggleRole(user.id, newRole)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="gap-2">
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete <strong>{user.full_name || user.username}</strong>?
                          This action cannot be undone. All of their data including events, meetings, polls,
                          and contacts will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteUser(user.id, user.username)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete User
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No users found matching your criteria
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
