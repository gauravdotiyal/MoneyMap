"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
import {
  ChevronUp,
  ChevronDown,
  Clock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Trash,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/useFetch";
import { bulkDeleteTransactions } from "@/actions/accounts";
import { toast } from "sonner";
import { BarLoader } from "react-spinners";

const RECCURING_INTERVAL = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionTable = ({ transactions }) => {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions]; 
   
    //apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transactions) =>
        transactions.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply recurring filter
    if (recurringFilter) {
      result = result.filter((transactions) => {
        if (recurringFilter === "recurring") {
          return transactions.isRecurring;
        } else {
          return !transactions.isRecurring;
        }
      });
    }

    // Apply type filter
    if (typeFilter) {
      result = result.filter(
        (transactions) => transactions.type === typeFilter
      );
    }

    //apply sorting
    result.sort((a, b) => {
      let comparision = 0;
      switch (sortConfig.field) {
        case "date":
          comparision = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparision = a.amount - b.amount;
          break;
        case "category":
          comparision = a.category.localeCompare(b.category);
          break;

        default:
          comparision = 0;
      }

      return sortConfig.direction === "asc" ? comparision : -comparision;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  // applying pagination
  const [pages, setPages] = useState(1);
  const setPageHandler = (selectedPage) => {
    setPages(selectedPage);
  };
  const totalPages = Math.ceil(filteredAndSortedTransactions.length / 10);

  // console.log(selectedIds);

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field == field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds(
      (current) =>
        current.includes(id)
          ? current.filter((item) => item != id) // if ID exists remove it
          : [...current, id] // If ID not exists add it
    );
  };

  const handleSelectAll = (id) => {
    setSelectedIds(
      (current) =>
        current.length === filteredAndSortedTransactions.length
          ? [] // if ID exists remove it
          : filteredAndSortedTransactions.map((t) => t.id) // If ID not exists add it
    );
  };

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    ) {
      return;
    }

    deleteFn(selectedIds);
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.error("Transactions Deleted Successfully");
    }
  }, [deleted, deleteLoading]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}
      <h1 className="flex align-items-center justify-center">
        A list of Your Recent Invoices
      </h1>
      {/* Filters  */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Transactions.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income </SelectItem>
              <SelectItem value="EXPENSE">Expense </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={recurringFilter}
            onValueChange={(value) => setRecurringFilter(value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring">Recurring Only </SelectItem>
              <SelectItem value="non-recurring">Non-Recurring Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Selected ({selectedIds.length})
              </Button>
            </div>
          )}

          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Clear Filters"
            >
              <X className="w-5 h-4"></X>
            </Button>
          )}
        </div>
      </div>

      {/* Transactions  */}
      <div className="rounded-md border">
        <Table>
          {/* <TableCaption>A list of your recent invoices</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  className="cursor-pointer"
                  onCheckedChange={handleSelectAll}
                  checked={
                    selectedIds.length ===
                      filteredAndSortedTransactions.length &&
                    filteredAndSortedTransactions.length > 0
                  }
                />
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className="flex items-center">
                  {" "}
                  Date{" "}
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}{" "}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center">
                  {" "}
                  Category{" "}
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className="flex items-center justify-end">
                  {" "}
                  Amount{" "}
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className="ml-1 h-4 w-4" />
                    ))}
                </div>
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
              filteredAndSortedTransactions
                .slice(pages * 10 - 10, pages * 10)
                .map((transactions) => (
                  <TableRow key={transactions.id}>
                    <TableCell>
                      <Checkbox
                        onCheckedChange={() => handleSelect(transactions.id)}
                        checked={selectedIds.includes(transactions.id)}
                      />
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
                        color:
                          transactions.type === "EXPENSE" ? "red" : "green",
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
                                <div className="font-medium">Next Date:</div>
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
                            onClick={() => deleteFn([transactions.id])}
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

        {filteredAndSortedTransactions.length > 0 && (
          <div className="flex justify-center items-center mt-6 space-x-2 text-sm">
            {/* Prev button */}
            <button
              onClick={() => setPageHandler(pages - 1)}
              disabled={pages === 1}
              className={`px-3 py-1 rounded-md border ${
                pages === 1
                  ? "text-gray-400 border-gray-300 cursor-not-allowed"
                  : "hover:bg-gray-100 text-gray-700 border-gray-400"
              }`}
            >
              ◀️
            </button>

            {/* Page numbers */}
            {[1, 2, 3].map((pageNumber) => (
              <button
                key={pageNumber}
                onClick={() => setPageHandler(pageNumber)}
                className={`px-3 py-1 rounded-md border ${
                  pages === pageNumber
                    ? "bg-blue-500 text-white border-blue-500"
                    : "text-gray-700 border-gray-400 hover:bg-gray-100"
                }`}
              >
                {pageNumber}
              </button>
            ))}

            {/* Ellipsis and last page */}
            {totalPages > 4 && (
              <>
                <span className="px-2 text-gray-500">...</span>
                <button
                  onClick={() => setPageHandler(totalPages)}
                  className={`px-3 py-1 rounded-md border ${
                    pages === totalPages
                      ? "bg-blue-500 text-white border-blue-500"
                      : "text-gray-700 border-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {totalPages}
                </button>
              </>
            )}

            {/* Next button */}
            <button
              onClick={() => setPageHandler(pages + 1)}
              disabled={pages === totalPages}
              className={`px-3 py-1 rounded-md border ${
                pages === totalPages
                  ? "text-gray-400 border-gray-300 cursor-not-allowed"
                  : "hover:bg-gray-100 text-gray-700 border-gray-400"
              }`}
            >
              ▶️
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionTable;
