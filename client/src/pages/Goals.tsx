import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from "@/hooks/use-goals";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Trash2, CheckCircle2, Circle, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";

type GoalFormInputs = {
  title: string;
  description?: string;
};

export default function Goals() {
  const { data: goals = [], isLoading } = useGoals();
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const [showForm, setShowForm] = useState(false);

  const form = useForm<GoalFormInputs>({
    defaultValues: { title: "", description: "" },
  });

  const onSubmit = async (data: GoalFormInputs) => {
    await createGoal.mutateAsync({
      title: data.title,
      description: data.description,
    });
    form.reset();
    setShowForm(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto pt-12 px-6 pb-24 space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto pt-12 px-6 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <header className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground mt-2">Track what matters to you</p>
        </header>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-white/80 backdrop-blur-sm border border-primary/20 p-6 rounded-2xl"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Exercise 3x a week" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add more details..." {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createGoal.isPending}
                  >
                    Add Goal
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        )}

        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="w-full mb-8 bg-primary"
            data-testid="button-add-goal"
          >
            <Plus className="w-4 h-4 mr-2" /> New Goal
          </Button>
        )}

        <div className="space-y-3">
          {goals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No goals yet. Start by adding your first goal.</p>
            </div>
          ) : (
            goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/60 hover:bg-white/80 border border-border p-4 rounded-2xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() =>
                      updateGoal.mutate({
                        id: goal.id,
                        updates: { completed: !goal.completed },
                      })
                    }
                    className="mt-1 flex-shrink-0 text-primary hover:scale-110 transition-transform"
                    data-testid={`button-toggle-goal-${goal.id}`}
                  >
                    {goal.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-semibold text-foreground ${
                        goal.completed && "line-through text-muted-foreground"
                      }`}
                      data-testid={`text-goal-title-${goal.id}`}
                    >
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteGoal.mutate(goal.id)}
                    className="text-destructive hover:scale-110 transition-transform"
                    data-testid={`button-delete-goal-${goal.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
