"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { LineItem, LineItemType } from "@/types/database";

type RevenueExpensePanelsProps = {
  lineItems: LineItem[];
  onAddItem: (type: LineItemType, label: string, monthlyValues: number[]) => Promise<void>;
  onEditItem: (item: LineItem) => void;
  onDeleteItem: (itemId: string) => Promise<void>;
  onAISuggest: (type: "revenue" | "expense") => Promise<void>;
  isSuggesting?: boolean;
};

export function RevenueExpensePanels({
  lineItems,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onAISuggest,
  isSuggesting = false,
}: RevenueExpensePanelsProps) {
  const [showAddRevenue, setShowAddRevenue] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [newItemFrequency, setNewItemFrequency] = useState<"monthly" | "one-time">("monthly");

  const revenueItems = lineItems.filter((item) => item.type === "revenue");
  const expenseItems = lineItems.filter((item) => item.type === "cogs" || item.type === "opex");

  const handleAddRevenue = async () => {
    if (!newItemLabel.trim()) return;
    
    const months = lineItems[0]?.monthly_values.length ?? 12;
    const monthlyValues = newItemFrequency === "monthly"
      ? Array(months).fill(parseFloat(newItemAmount) || 0)
      : [parseFloat(newItemAmount) || 0, ...Array(months - 1).fill(0)];

    await onAddItem("revenue", newItemLabel, monthlyValues);
    setNewItemLabel("");
    setNewItemAmount("");
    setShowAddRevenue(false);
  };

  const handleAddExpense = async () => {
    if (!newItemLabel.trim()) return;
    
    const months = lineItems[0]?.monthly_values.length ?? 12;
    const monthlyValues = newItemFrequency === "monthly"
      ? Array(months).fill(parseFloat(newItemAmount) || 0)
      : [parseFloat(newItemAmount) || 0, ...Array(months - 1).fill(0)];

    await onAddItem("opex", newItemLabel, monthlyValues);
    setNewItemLabel("");
    setNewItemAmount("");
    setShowAddExpense(false);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue Streams Panel */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>Revenue Streams</span>
            </div>
          </div>
        }
        className="border-l-4 border-l-[#53E9C5]"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => onAISuggest("revenue")}
              disabled={isSuggesting}
              variant="outline"
              className="flex-1 border-[#53E9C5]/30 text-[#5C6478] hover:bg-[#53E9C5]/10"
            >
              {isSuggesting ? "Suggesting..." : "I'll Suggest"}
            </Button>
            <Button
              onClick={() => setShowAddRevenue(!showAddRevenue)}
              className="flex-1 bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3]"
            >
              <span className="mr-2">+</span>
              Add
            </Button>
          </div>

          {showAddRevenue && (
            <div className="rounded-xl border-2 border-[#53E9C5]/30 bg-white p-4 space-y-3">
              <input
                type="text"
                placeholder="Revenue item name (e.g., Subscription Revenue)"
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                className="w-full rounded-lg border-2 border-[#5C6478]/20 px-3 py-2 text-sm outline-none focus:border-[#53E9C5]"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  className="flex-1 rounded-lg border-2 border-[#5C6478]/20 px-3 py-2 text-sm outline-none focus:border-[#53E9C5]"
                />
                <select
                  value={newItemFrequency}
                  onChange={(e) => setNewItemFrequency(e.target.value as "monthly" | "one-time")}
                  className="rounded-lg border-2 border-[#5C6478]/20 px-3 py-2 text-sm outline-none focus:border-[#53E9C5]"
                >
                  <option value="monthly">Monthly</option>
                  <option value="one-time">One-time</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddRevenue}
                  className="flex-1 bg-[#53E9C5] text-[#15213C] hover:bg-[#45D9B3]"
                >
                  Add Revenue
                </Button>
                <Button
                  onClick={() => {
                    setShowAddRevenue(false);
                    setNewItemLabel("");
                    setNewItemAmount("");
                  }}
                  variant="outline"
                  className="border-[#5C6478]/30"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {revenueItems.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-[#5C6478]/30 bg-[#5C6478]/5 p-8 text-center">
              <p className="text-sm font-semibold text-[#5C6478] mb-2">No revenue streams added yet</p>
              <p className="text-xs text-[#5C6478]/70">Click 'AI Suggest' to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {revenueItems.map((item) => (
                <RevenueExpenseCard
                  key={item.id}
                  item={item}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  type="revenue"
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Expense Items Panel */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📉</span>
              <span>Expense Items</span>
            </div>
          </div>
        }
        className="border-l-4 border-l-[#5C6478]"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={() => onAISuggest("expense")}
              disabled={isSuggesting}
              variant="outline"
              className="flex-1"
            >
              {isSuggesting ? "Suggesting..." : "I'll Suggest"}
            </Button>
            <Button
              onClick={() => setShowAddExpense(!showAddExpense)}
              className="flex-1 bg-red-500 text-white hover:bg-red-600"
            >
              <span className="mr-2">+</span>
              Add
            </Button>
          </div>

          {showAddExpense && (
            <div className="rounded-lg border border-[#E1E4EA] bg-white p-4 space-y-3">
              <input
                type="text"
                placeholder="Expense item name (e.g., Office Rent)"
                value={newItemLabel}
                onChange={(e) => setNewItemLabel(e.target.value)}
                className="w-full rounded-lg border border-[#E1E4EA] px-3 py-2 text-sm outline-none focus:border-[#53E9C5] focus:ring-1 focus:ring-[#53E9C5]"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Amount"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  className="flex-1 rounded-lg border-2 border-[#5C6478]/20 px-3 py-2 text-sm outline-none focus:border-red-500"
                />
                <select
                  value={newItemFrequency}
                  onChange={(e) => setNewItemFrequency(e.target.value as "monthly" | "one-time")}
                  className="rounded-lg border-2 border-[#5C6478]/20 px-3 py-2 text-sm outline-none focus:border-red-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="one-time">One-time</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddExpense}
                  className="flex-1"
                >
                  Add Expense
                </Button>
                <Button
                  onClick={() => {
                    setShowAddExpense(false);
                    setNewItemLabel("");
                    setNewItemAmount("");
                  }}
                  variant="outline"
                  className="border-[#5C6478]/30"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {expenseItems.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-[#5C6478]/30 bg-[#5C6478]/5 p-8 text-center">
              <p className="text-sm font-semibold text-[#5C6478] mb-2">No expenses added yet</p>
              <p className="text-xs text-[#5C6478]/70">Click 'AI Suggest' to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {expenseItems.map((item) => (
                <RevenueExpenseCard
                  key={item.id}
                  item={item}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  type="expense"
                />
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

type RevenueExpenseCardProps = {
  item: LineItem;
  onEdit: (item: LineItem) => void;
  onDelete: (itemId: string) => Promise<void>;
  type: "revenue" | "expense";
};

function RevenueExpenseCard({ item, onEdit, onDelete, type }: RevenueExpenseCardProps) {
  const totalAmount = item.monthly_values.reduce((sum, val) => sum + val, 0);
  const avgMonthly = totalAmount / item.monthly_values.length;
  const isMonthly = item.monthly_values.every((val, i) => i === 0 || val === item.monthly_values[0]);

  return (
    <div className={`rounded-xl border-2 p-4 ${
      type === "revenue" 
        ? "border-[#53E9C5]/30 bg-[#53E9C5]/5" 
        : "border-red-200/50 bg-red-50/30"
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-[#15213C]">{item.label}</h4>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
            <span className={`font-semibold ${
              type === "revenue" ? "text-[#53E9C5]" : "text-red-600"
            }`}>
              £{avgMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span className="rounded-full bg-[#5C6478]/10 px-2 py-1 text-xs text-[#5C6478]">
              {isMonthly ? "Monthly" : "Variable"}
            </span>
            <span className="text-xs text-[#5C6478]">
              Month 0 - {item.monthly_values.length}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="rounded-lg p-2 text-[#5C6478] hover:bg-[#5C6478]/10 text-sm"
            title="Edit"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="rounded-lg p-2 text-red-500 hover:bg-red-50 text-sm"
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

