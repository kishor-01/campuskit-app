"use client";

import React, { useActionState, useEffect, useRef, useState, useOptimistic, startTransition } from "react";
import { updateUserRole, deleteUser } from "@/actions/userActions";
import { User, Role } from "@prisma/client";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFormStatus } from "react-dom";
import { DataTable } from "@/components/ui/data-table";
import { columns, UserData } from "./users/columns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

type FormState = {
  message?: string | null;
  error?: string | Record<string, string[]> | null;
  success?: boolean;
};

function EditSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

export default function UserManager({
  users,
  currentUserRole
}: {
  users: User[];
  currentUserRole: Role;
}) {
  const [deleteState, deleteActionHook] = useActionState<FormState, FormData>(deleteUser, { message: null, error: null });
  const [updateState, updateAction] = useActionState<FormState, FormData>(updateUserRole, { message: null, error: null });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const [optimisticUsers, removeOptimisticUser] = useOptimistic<User[], string>(
    users,
    (currentState, userIdToRemove) => {
      return currentState.filter((user) => user.id !== userIdToRemove);
    }
  );

  const handleDeleteUser = (userId: string) => {
    startTransition(() => {
      removeOptimisticUser(userId);
      const formData = new FormData();
      formData.append("id", userId);
      deleteActionHook(formData);
    });
  };

  const handleEditClick = (user: UserData) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
    editFormRef.current?.reset();
  };

  useEffect(() => {
    if (deleteState?.message && !deleteState.error) {
      toast.success(deleteState.message);
    }
    if (deleteState?.error) {
      if (typeof deleteState.error === 'string') {
        toast.error(deleteState.error);
      } else if (deleteState.error && typeof deleteState.error === 'object') {
        if (deleteState.error._form) {
          const formError = Array.isArray(deleteState.error._form) 
            ? deleteState.error._form[0] 
            : deleteState.error._form;
          toast.error(formError);
        } else {
          const errorMessages = Object.values(deleteState.error).flat();
          if (errorMessages.length > 0) {
            toast.error(errorMessages.join('\n'));
          } else {
            toast.error("Failed to delete user");
          }
        }
      } else {
        toast.error("Failed to delete user");
      }
    }
  }, [deleteState]);

  useEffect(() => {
    if (updateState?.message) {
      toast.success(updateState.message);
      setIsEditDialogOpen(false);
      setEditingUser(null);
    }
    if (updateState?.error) {
      if (typeof updateState.error === 'string') {
        toast.error(updateState.error);
      } else if (updateState.error && typeof updateState.error === 'object') {
        if (updateState.error._form) {
          const formError = Array.isArray(updateState.error._form) 
            ? updateState.error._form[0] 
            : updateState.error._form;
          toast.error(formError);
        } else {
          const errorMessages = Object.values(updateState.error).flat();
          if (errorMessages.length > 0) {
            toast.error(errorMessages.join('\n'));
          } else {
            toast.error("Failed to update user");
          }
        }
      } else {
        toast.error("Failed to update user");
      }
    }
  }, [updateState]);

  const tableColumns = React.useMemo(
    () => columns(handleEditClick, handleDeleteUser),
    []
  );

  return (
    <>
      <div className="bg-muted/50 p-6 rounded-lg border border-border">
        <h2 className="text-2xl font-bold text-foreground mb-4">Manage Users</h2>
        <DataTable columns={tableColumns} data={optimisticUsers} />
        {optimisticUsers.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No users match the current filters.</p>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[400px] max-h-[90vh] overflow-y-auto px-6">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              {editingUser ? `Modifying role for ${editingUser.email || editingUser.username}` : ''}
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <form
              key={editingUser.id}
              ref={editFormRef}
              action={updateAction}
              className="space-y-4 pt-4"
            >
              <input type="hidden" name="userId" value={editingUser.id} />

              <div>
                <label htmlFor="edit-role" className="text-sm font-medium">Role</label>
                <Select name="role" required defaultValue={editingUser.role}>
                  <SelectTrigger id="edit-role" className="mt-1">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.VIEWER}>Viewer</SelectItem>
                    <SelectItem value={Role.CONTRIBUTOR}>Contributor</SelectItem>
                    <SelectItem value={Role.EDITOR}>Editor</SelectItem>
                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                    {currentUserRole === 'SUPER_ADMIN' && (
                      <SelectItem value={Role.SUPER_ADMIN}>Super Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {updateState?.error && typeof updateState.error === 'object' && updateState.error.role && (
                  <p className="text-xs text-destructive mt-1">{Array.isArray(updateState.error.role) ? updateState.error.role[0] : updateState.error.role}</p>
                )}
              </div>

              {updateState?.error && typeof updateState.error === 'string' && (
                <p className="text-sm text-destructive text-center">{updateState.error}</p>
              )}
              {updateState?.error && typeof updateState.error === 'object' && updateState.error._form && (
                <p className="text-sm text-destructive text-center">
                  {Array.isArray(updateState.error._form) ? updateState.error._form[0] : updateState.error._form}
                </p>
              )}

              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <EditSubmitButton />
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
