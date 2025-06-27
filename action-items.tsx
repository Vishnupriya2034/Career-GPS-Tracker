import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ActionItemsProps {
  userId: number;
  className?: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  status: "not_started" | "in_progress" | "completed";
  completed: boolean;
}

const ActionItems: React.FC<ActionItemsProps> = ({ userId, className }) => {
  const { toast } = useToast();
  const [isAddingTask, setIsAddingTask] = useState(false);

  const { data: tasks, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/tasks`],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: number;
      updates: Partial<Task>;
    }) => {
      await apiRequest("PATCH", `/api/tasks/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/users/${userId}/tasks`],
      });
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTaskCompletion = (taskId: number, completed: boolean) => {
    updateTaskMutation.mutate({
      id: taskId,
      updates: {
        completed,
        status: completed ? "completed" : "in_progress",
      },
    });
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
            <div className="h-60 bg-gray-100 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tasks) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p>Error loading tasks.</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate days left for each task
  const tasksWithDaysLeft = tasks.map((task: Task) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      ...task,
      daysLeft: diffDays,
    };
  });

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Action Items</h2>
          <button
            className="text-sm font-medium text-primary hover:text-primary-dark"
            onClick={() => setIsAddingTask(!isAddingTask)}
          >
            + Add Item
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Task
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Due Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Priority
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasksWithDaysLeft.map((task: Task & { daysLeft: number }) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={(checked) =>
                          handleTaskCompletion(task.id, checked as boolean)
                        }
                      />
                      <div className="ml-4">
                        <div
                          className={`text-sm font-medium ${task.completed ? "text-gray-500 line-through" : "text-gray-900"}`}
                        >
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {task.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`text-sm ${task.completed ? "text-gray-500 line-through" : "text-gray-900"}`}
                    >
                      {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div
                      className={`text-xs ${task.completed ? "text-green-500" : "text-gray-500"}`}
                    >
                      {task.completed
                        ? "Completed"
                        : task.daysLeft < 0
                          ? "Overdue"
                          : task.daysLeft === 0
                            ? "Today"
                            : task.daysLeft === 1
                              ? "1 day left"
                              : `${task.daysLeft} days left`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(task.priority)}`}
                    >
                      {task.priority.charAt(0).toUpperCase() +
                        task.priority.slice(1)}
                    </span>
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${task.completed ? "text-green-500" : "text-gray-500"}`}
                  >
                    {task.status === "not_started"
                      ? "Not Started"
                      : task.status === "in_progress"
                        ? "In Progress"
                        : "Completed"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActionItems;
