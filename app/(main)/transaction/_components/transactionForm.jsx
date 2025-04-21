"use client";

import { createTransactions } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import useFetch from "@/hooks/useFetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import React, { useEffect } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateAccountDrawer from "@/components/createAccountDrawer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import { formatDate } from "date-fns";
import { toast } from "sonner";
import ReceiptScanner from "./ReceiptScanner";

const AddTransactionForm = ({ accounts, categories }) => {
  const router = useRouter();

  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: "",
      description: "",
      accountId: accounts.find((ac) => ac.isDefault)?.id,
      date: new Date(),
      isRecurring: false,
    },
  });

  const {
    loading: transactionLoading,
    fn: transactinFn,
    data: transactionResult,
  } = useFetch(createTransactions);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };

    transactinFn(formData);
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success("Transaction created successfully!");
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading]);

  const handleScanComplete= (scannedData)=>{
    console.log("here is the scannedData", scannedData);
  };


  return (
    <form
      className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md dark:bg-gray-800"
      onSubmit={handleSubmit(onSubmit)}
    >
 
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Add New Transaction
      </h2>

        {/* Receipt Scanner using AI  */}
      <ReceiptScanner onScanComplete={handleScanComplete} />

      <div className="space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Type
          </label>
          <Select
            onValueChange={(value) => setValue("type", value)}
            default={type}
          >
            <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
              <SelectItem
                value="EXPENSE"
                className="hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Expense
              </SelectItem>
              <SelectItem
                value="INCOME"
                className="hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Income
              </SelectItem>
            </SelectContent>
          </Select>

          {errors.type && (
            <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Amount
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                {...register("amount")}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500 mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Account
            </label>
            <Select
              onValueChange={(value) => setValue("accountId", value)}
              defaultValue={getValues("accountId")}
            >
              <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                {accounts.map((account) => (
                  <SelectItem
                    key={account.id}
                    value={account.id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    {account.name} (₹{parseFloat(account.balance).toFixed(2)})
                  </SelectItem>
                ))}
                <CreateAccountDrawer>
                  <Button
                    variant="ghost"
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    + Create Account
                  </Button>
                </CreateAccountDrawer>
              </SelectContent>
            </Select>
            {errors.accountId && (
              <p className="text-sm text-red-500 mt-1">
                {errors.accountId.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <Select
            onValueChange={(value) => setValue("category", value)}
            defaultValue={getValues("category")}
          >
            <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
              {filteredCategories.map((category) => (
                <SelectItem
                  key={category.id}
                  value={category.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-red-500 mt-1">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full pl-3 text-left font-normal bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                {date ? formatDate(date, "PPP") : <span>Pick a date</span>}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 border-gray-300 dark:border-gray-600"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => setValue("date", date)}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
                className="bg-white dark:bg-gray-700"
              />
            </PopoverContent>
          </Popover>
          {errors.date && (
            <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <Input
            placeholder="Enter description"
            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-red-500 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="flex flex-row items-center justify-between rounded-lg border p-4 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
          <div className="space-y-0.5">
            <label className="text-base font-medium text-gray-700 dark:text-gray-300">
              Recurring Transaction
            </label>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Set up a recurring schedule for this transaction
            </div>
          </div>
          <Switch
            checked={isRecurring}
            onCheckedChange={(checked) => setValue("isRecurring", checked)}
            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200"
          />
        </div>

        {isRecurring && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Recurring Interval
            </label>
            <Select
              onValueChange={(value) => setValue("recurringInterval", value)}
              defaultValue={getValues("recurringInterval")}
            >
              <SelectTrigger className="w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                <SelectItem
                  value="DAILY"
                  className="hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Daily
                </SelectItem>
                <SelectItem
                  value="WEEKLY"
                  className="hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Weekly
                </SelectItem>
                <SelectItem
                  value="MONTHLY"
                  className="hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Monthly
                </SelectItem>
                <SelectItem
                  value="YEARLY"
                  className="hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Yearly
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.recurringInterval && (
              <p className="text-sm text-red-500 mt-1">
                {errors.recurringInterval.message}
              </p>
            )}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            className="w-1/2 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={transactionLoading}
          >
            {transactionLoading ? "Creating..." : "Create Transaction"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddTransactionForm;
