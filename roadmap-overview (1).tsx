import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ProgressSteps, { ProgressStep } from "@/components/ui/progress-steps";

interface RoadmapOverviewProps {
  userId: number;
  className?: string;
}

const RoadmapOverview: React.FC<RoadmapOverviewProps> = ({ userId, className }) => {
  // Fetch user goal to get career path ID
  const { data: goalData, isLoading: isGoalLoading } = useQuery({
    queryKey: [`/api/users/${userId}/goal`],
  });
  
  // Fetch progress data
  const { data: progressData, isLoading: isProgressLoading } = useQuery({
    queryKey: [`/api/users/${userId}/progress`],
  });
  
  const isLoading = isGoalLoading || isProgressLoading;
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex justify-between mb-6">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex">
                  <div className="w-8 h-8 rounded-full bg-gray-200 mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!goalData || !progressData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p>Error loading roadmap data.</p>
        </CardContent>
      </Card>
    );
  }
  
  const { careerPath } = goalData;
  const { progressDetails } = progressData;
  
  // Convert to ProgressStep format
  const steps: ProgressStep[] = progressDetails
    .slice(0, 3) // Only show the first 3 steps
    .map(step => ({
      id: step.id,
      title: step.title,
      description: step.description,
      status: step.completed ? "complete" : step.progress > 0 ? "active" : "incomplete",
      completedDate: step.completedDate,
      progress: step.progress
    }));
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Your {careerPath.title} Roadmap</h2>
          <Link href="/roadmap">
            <a className="text-sm font-medium text-primary hover:text-primary-dark">View Full Plan →</a>
          </Link>
        </div>
        
        <ProgressSteps steps={steps} />
      </CardContent>
    </Card>
  );
};

export default RoadmapOverview;
