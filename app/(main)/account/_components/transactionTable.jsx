"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { categoryColors } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import { Clock, MoreHorizontal, RefreshCw, Router } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const RECCURING_INTERVAL = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionTable = ({ transactions }) => {
  const filteredAndSortedTransactions = transactions;

  const router = useRouter();

  const handleSort = () => {};

  return (
    <div className="space-y-4">
      {/* Filters  */}

      {/* Transactions  */}
      <div className="rounded-md border">
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center"> Date</div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center"> Category</div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end"> Amount</div>
              </TableHead>
              <TableHead>Recurring</TableHead>
              <TableHead className="w-50px" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions.map((transactions) => (
                <TableRow key={transactions.id}>
                  <TableCell>
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    {format(new Date(transactions.date), "PP")}
                  </TableCell>
                  <TableCell>{transactions.description}</TableCell>
                  <TableCell className="capitalize">
                    {" "}
                    <span
                      style={{
                        background:
                          categoryColors[transactions.category] || "gray",
                      }}
                      className="px-2 py-1 rounded text-white text-sm"
                    >
                      {transactions.category}
                    </span>{" "}
                  </TableCell>
                  <TableCell
                    className="text-right font-medium"
                    style={{
                      color: transactions.type === "EXPENSE" ? "red" : "green",
                    }}
                  >
                    {transactions.type === "EXPENSE" ? "-" : "+"}
                    Rs.{transactions.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {transactions.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              variant="outline"
                              className="gap-1 text-purple-700 bg-purple-100 hover:bg-purple-200"
                            >
                              <RefreshCw className="h-3 w-3" />
                              {
                                RECCURING_INTERVAL[
                                  transactions.recurringInterval
                                ]
                              }
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div>Next Date:</div>
                              <div>
                                {format(
                                  new Date(transactions.nextRecurringDate),
                                  "PP"
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        One-Time
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-8 h-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />{" "}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transactions.id}`
                            )
                          }
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          //  onClick={()=>deleteFn([transactions.id])}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
