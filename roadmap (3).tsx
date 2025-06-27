import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import ProgressSteps, { ProgressStep } from "@/components/ui/progress-steps";

const Roadmap: React.FC = () => {
  // In a real app, we would get the current user ID from authentication
  const userId = 1;
  
  // Fetch current user goal to get career path ID
  const { data: userGoal, isLoading: isUserGoalLoading } = useQuery({
    queryKey: [`/api/users/${userId}/goal`],
  });
  
  // Fetch roadmap steps once we have the career path ID
  const { data: roadmapData, isLoading: isRoadmapLoading } = useQuery({
    queryKey: userGoal ? [`/api/career-paths/${userGoal.careerPathId}/roadmap`] : null,
    enabled: !!userGoal
  });
  
  // Fetch user progress
  const { data: progressData, isLoading: isProgressLoading } = useQuery({
    queryKey: [`/api/users/${userId}/progress`],
  });
  
  const isLoading = isUserGoalLoading || isRoadmapLoading || isProgressLoading;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
          
          <Card>
            <CardContent className="p-6">
              <div className="h-60 bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  if (!userGoal || !roadmapData || !progressData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Career Roadmap</h1>
          <p className="text-gray-600">
            Please select a career goal to view your personalized roadmap.
          </p>
        </div>
      </div>
    );
  }
  
  const { careerPath, steps } = roadmapData;
  const { progressDetails, overallProgress } = progressData;
  
  // Convert to ProgressStep format for the UI component
  const stepsForUI: ProgressStep[] = steps.map((step: any) => {
    const progress = progressDetails.find((p: any) => p.id === step.id);
    
    return {
      id: step.id,
      title: step.title,
      description: step.description,
      status: progress?.completed ? "complete" : progress?.progress > 0 ? "active" : "incomplete",
      completedDate: progress?.completedDate,
      progress: progress?.progress || 0
    };
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {careerPath.title} Career Roadmap
        </h1>
        <p className="text-gray-600">
          Your personalized learning path to become a {careerPath.title}.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Overall Progress</CardTitle>
            <span className="text-sm font-medium">{overallProgress}% Complete</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Learning Path</CardTitle>
          <CardDescription>
            Follow these steps to acquire the necessary skills for your career goal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressSteps steps={stepsForUI} />
        </CardContent>
      </Card>
      
      {/* Detailed steps section */}
      <div className="mt-8 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Detailed Steps</h2>
        
        {steps.map((step: any, index: number) => {
          const stepProgress = progressDetails.find((p: any) => p.id === step.id);
          
          return (
            <Card key={step.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    <span className="text-primary mr-2">Step {index + 1}:</span> {step.title}
                  </CardTitle>
                  {stepProgress?.completed ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
                  ) : (
                    <Badge variant="outline">{stepProgress?.progress || 0}% Complete</Badge>
                  )}
                </div>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Required Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {step.skills.map((skill: any) => (
                      <Badge key={skill.id} variant="outline">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {!stepProgress?.completed && stepProgress?.progress > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">Progress:</h4>
                    <Progress value={stepProgress?.progress || 0} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Roadmap;
