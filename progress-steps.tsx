import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export type StepStatus = "complete" | "active" | "incomplete";

export interface ProgressStep {
  id: number;
  title: string;
  description?: string;
  status: StepStatus;
  completedDate?: Date;
  progress?: number;
}

interface ProgressStepsProps {
  steps: ProgressStep[];
  className?: string;
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ steps, className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-start">
          <div className="flex flex-col items-center mr-4">
            <div 
              className={cn(
                "w-8 h-8 rounded-full border-2 flex items-center justify-center",
                {
                  "border-secondary bg-green-50": step.status === "complete",
                  "border-primary bg-blue-50": step.status === "active",
                  "border-gray-200 bg-gray-50": step.status === "incomplete"
                }
              )}
            >
              {step.status === "complete" ? (
                <Check className="h-4 w-4 text-secondary" />
              ) : (
                <span 
                  className={cn("text-sm font-medium", {
                    "text-primary": step.status === "active",
                    "text-gray-400": step.status === "incomplete"
                  })}
                >
                  {index + 1}
                </span>
              )}
            </div>
            {index < steps.length - 1 && (
              <div 
                className={cn(
                  "w-0.5 h-16", 
                  {
                    "bg-secondary": step.status === "complete",
                    "bg-gray-200": step.status !== "complete"
                  }
                )}
              ></div>
            )}
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-900">{step.title}</h3>
            {step.description && (
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            )}
            <div className="mt-2 flex items-center">
              {step.status === "complete" && (
                <>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Completed
                  </span>
                  {step.completedDate && (
                    <span className="text-xs text-gray-500 ml-2">
                      {new Date(step.completedDate).toLocaleDateString()}
                    </span>
                  )}
                </>
              )}
              {step.status === "active" && step.progress !== undefined && (
                <>
                  <div className="w-24 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${step.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">{step.progress}% Complete</span>
                </>
              )}
              {step.status === "incomplete" && (
                <span className="text-xs text-gray-500">Coming up next</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProgressSteps;
