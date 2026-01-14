import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, ArrowLeft, Plus, Trash2, PiggyBank, TrendingUp, Lightbulb, Download, Sparkles, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  category: string;
  name: string;
  amount: number;
}

const expenseCategories = [
  "Housing", "Utilities", "Food", "Transportation", "Healthcare",
  "Entertainment", "Shopping", "Subscriptions", "Debt Payments", "Other"
];

const BudgetHelper = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({ category: "", name: "", amount: "" });
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [savingGoal, setSavingGoal] = useState("");

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const income = parseFloat(monthlyIncome) || 0;
  const remaining = income - totalExpenses;
  const savingsRate = income > 0 ? ((remaining / income) * 100) : 0;

  const addExpense = () => {
    if (!newExpense.category || !newExpense.name || !newExpense.amount) {
      toast({
        title: "Incomplete Entry",
        description: "Please fill in all expense fields.",
        variant: "destructive"
      });
      return;
    }

    setExpenses(prev => [...prev, {
      id: Date.now().toString(),
      category: newExpense.category,
      name: newExpense.name,
      amount: parseFloat(newExpense.amount)
    }]);
    setNewExpense({ category: "", name: "", amount: "" });
  };

  const removeExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const generateAITips = () => {
    if (expenses.length === 0) {
      toast({
        title: "No Expenses",
        description: "Add some expenses first to get personalized tips.",
        variant: "destructive"
      });
      return;
    }

    // Generate tips based on expense patterns
    const tips: string[] = [];

    // Check for high entertainment spending
    const entertainmentTotal = expenses
      .filter(e => e.category === "Entertainment" || e.category === "Subscriptions")
      .reduce((sum, e) => sum + e.amount, 0);
    
    if (entertainmentTotal > income * 0.1) {
      tips.push("Consider auditing your subscriptions - services you rarely use could be cancelled to save $" + (entertainmentTotal * 0.3).toFixed(0) + "/month.");
    }

    // General savings tips
    tips.push("Set up automatic transfers to savings on payday - even $50/month adds up to $600/year!");
    tips.push("Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings & debt repayment.");
    
    if (savingsRate < 10) {
      tips.push("Your savings rate is below 10%. Try to find one expense to cut by 20% this month.");
    }

    // Food tips
    const foodTotal = expenses.filter(e => e.category === "Food").reduce((sum, e) => sum + e.amount, 0);
    if (foodTotal > income * 0.15) {
      tips.push("Food spending is above 15% of income. Meal prepping on Sundays could save $200-300/month.");
    }

    tips.push("Review your utility bills - switching to LED bulbs and adjusting thermostat by 2° can save 10%.");
    tips.push("Consider a 'no-spend weekend' once a month - you'll save money and discover free activities!");

    setAiTips(tips.slice(0, 5));
  };

  const exportBudget = () => {
    const text = `Monthly Budget Summary
========================
Income: $${income.toFixed(2)}

Expenses:
${expenses.map(e => `- ${e.name} (${e.category}): $${e.amount.toFixed(2)}`).join('\n')}

Total Expenses: $${totalExpenses.toFixed(2)}
Remaining: $${remaining.toFixed(2)}
Savings Rate: ${savingsRate.toFixed(1)}%

AI Tips:
${aiTips.map(t => `• ${t}`).join('\n')}
`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'monthly-budget.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Budget Exported!",
      description: "Your budget summary has been downloaded.",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Housing": "bg-blue-500",
      "Utilities": "bg-yellow-500",
      "Food": "bg-green-500",
      "Transportation": "bg-purple-500",
      "Healthcare": "bg-red-500",
      "Entertainment": "bg-pink-500",
      "Shopping": "bg-orange-500",
      "Subscriptions": "bg-cyan-500",
      "Debt Payments": "bg-rose-500",
      "Other": "bg-gray-500"
    };
    return colors[category] || "bg-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-emerald-950/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
              Budgeting & Saving Helper
            </h1>
            <p className="text-muted-foreground">AI-powered expense tracking and savings tips</p>
          </div>
        </div>

        <Tabs defaultValue="tracker" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="tracker">Tracker</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="tips">AI Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="tracker" className="space-y-6">
            {/* Income Input */}
            <Card className="border-emerald-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-emerald-400" />
                  Monthly Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>After-tax Income</Label>
                    <Input
                      type="number"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(e.target.value)}
                      placeholder="Enter your monthly income"
                      className="mt-1 bg-emerald-950/30 border-emerald-500/30"
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Saving Goal (optional)</Label>
                    <Input
                      type="number"
                      value={savingGoal}
                      onChange={(e) => setSavingGoal(e.target.value)}
                      placeholder="Monthly saving target"
                      className="mt-1 bg-emerald-950/30 border-emerald-500/30"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Expense */}
            <Card className="border-emerald-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-emerald-400" />
                  Add Expense
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={newExpense.category} 
                      onValueChange={(v) => setNewExpense(prev => ({ ...prev, category: v }))}
                    >
                      <SelectTrigger className="mt-1 bg-emerald-950/30 border-emerald-500/30">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {expenseCategories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={newExpense.name}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Rent, Netflix"
                      className="mt-1 bg-emerald-950/30 border-emerald-500/30"
                    />
                  </div>
                  <div>
                    <Label>Amount ($)</Label>
                    <Input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      className="mt-1 bg-emerald-950/30 border-emerald-500/30"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={addExpense} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expense List */}
            <Card className="border-emerald-500/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Monthly Expenses</span>
                  <Badge className="bg-emerald-600">${totalExpenses.toFixed(2)}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No expenses added yet. Add your first expense above!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/20"
                      >
                        <div className="flex items-center gap-3">
                          <Badge className={getCategoryColor(expense.category) + " text-xs"}>
                            {expense.category}
                          </Badge>
                          <span>{expense.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">${expense.amount.toFixed(2)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeExpense(expense.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-emerald-500/30">
                <CardContent className="pt-6 text-center">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                  <p className="text-sm text-muted-foreground">Income</p>
                  <p className="text-2xl font-bold">${income.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-500/30">
                <CardContent className="pt-6 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-red-400" />
                  <p className="text-sm text-muted-foreground">Expenses</p>
                  <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-500/30">
                <CardContent className="pt-6 text-center">
                  <PiggyBank className="h-8 w-8 mx-auto mb-2 text-green-400" />
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${remaining.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Savings Progress */}
            <Card className="border-emerald-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-400" />
                  Savings Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Current Rate</span>
                    <span className={savingsRate >= 20 ? 'text-green-400' : savingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'}>
                      {savingsRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(savingsRate, 100)} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span>Target: 20%</span>
                    <span>50%+</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {savingsRate >= 20 
                      ? "🎉 Great job! You're above the recommended 20% savings rate!"
                      : savingsRate >= 10
                      ? "👍 Good progress! Try to reach 20% for financial security."
                      : "💡 Consider reviewing expenses to increase your savings rate."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="border-emerald-500/30">
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
              </CardHeader>
              <CardContent>
                {expenses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Add expenses to see your spending breakdown.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {expenseCategories.map(category => {
                      const categoryTotal = expenses
                        .filter(e => e.category === category)
                        .reduce((sum, e) => sum + e.amount, 0);
                      if (categoryTotal === 0) return null;
                      const percentage = income > 0 ? (categoryTotal / income) * 100 : 0;
                      
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <Badge className={getCategoryColor(category) + " text-xs"}>{category}</Badge>
                            </span>
                            <span>${categoryTotal.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Button onClick={exportBudget} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Budget Summary
            </Button>
          </TabsContent>

          <TabsContent value="tips" className="space-y-6">
            <Card className="border-emerald-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                  AI Saving Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateAITips}
                  className="w-full mb-6 bg-emerald-600 hover:bg-emerald-700"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Personalized Tips
                </Button>

                {aiTips.length > 0 ? (
                  <div className="space-y-4">
                    {aiTips.map((tip, index) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/20"
                      >
                        <Lightbulb className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                        <p className="text-sm">{tip}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Add your expenses and click the button above to get personalized saving tips!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="border-emerald-500/30">
              <CardHeader>
                <CardTitle>Quick Money-Saving Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Cancel unused subscriptions",
                    "Cook meals at home more often",
                    "Use public transport when possible",
                    "Set up automatic savings",
                    "Use cashback apps and cards",
                    "Buy generic brands",
                    "Negotiate bills annually",
                    "Wait 24 hours before impulse buys"
                  ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      {tip}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BudgetHelper;
