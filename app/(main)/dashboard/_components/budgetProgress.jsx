"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil, X } from "lucide-react";
import useFetch from "@/hooks/useFetch";
import { toast } from "sonner";
import { updateBudget } from "@/actions/budget";

const BudgetProgress = ({ initialBudget, currentExpenses }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);


  const percentageUsed = initialBudget
    ? (currentExpenses / initialBudget?.amount) * 100
    : 0;

    

  const handleBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please Enter a Valid Amount");
      return;
    }
  
    await updateBudgetFn(amount);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
        setIsEditing(false);
        toast.success("Budget Updated Successfully");
    }
  }, [updatedBudget]);
  useEffect(() => {
    if (error) {
      toast.error(error.message || "Error Updating Budget");
    }
  }, [error]);

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle>Monthly Budget (Default Account)</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32"
                  placeholder="Enter Amount"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBudget}
                  disabled={isLoading}
                >
                  {" "}
                  <Check className="h-4 w-4 text-green-500" />{" "}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <>
                <CardDescription>
                  {initialBudget
                    ? `$${initialBudget.amount.toFixed(2)} spent`
                    : "No Budget Set"}
                </CardDescription>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6 "
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>
        <CardDescription> </CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card Content</p>
      </CardContent>
    </Card>
  );
};

export default BudgetProgress;
