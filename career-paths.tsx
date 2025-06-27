import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CareerPaths: React.FC = () => {
  const { toast } = useToast();
  // In a real app, we would get the current user ID from authentication
  const userId = 1;
  
  // Fetch career paths
  const { data: careerPaths, isLoading: isCareerPathsLoading } = useQuery({
    queryKey: ['/api/career-paths'],
  });
  
  // Fetch current user goal
  const { data: userGoal, isLoading: isUserGoalLoading } = useQuery({
    queryKey: [`/api/users/${userId}/goal`],
  });
  
  // Fetch skills for displaying required skills
  const { data: skills, isLoading: isSkillsLoading } = useQuery({
    queryKey: ['/api/skills'],
  });
  
  const isLoading = isCareerPathsLoading || isUserGoalLoading || isSkillsLoading;
  
  // Set career goal
  const updateGoalMutation = useMutation({
    mutationFn: async (careerPathId: number) => {
      if (userGoal) {
        // Update existing goal
        await apiRequest("PATCH", `/api/user-goals/${userGoal.id}`, { careerPathId });
      } else {
        // Create new goal
        await apiRequest("POST", `/api/users/${userId}/goal`, { careerPathId, isActive: true });
      }
    },
    onSuccess: () => {
      toast({
        title: "Career path updated!",
        description: "Your career goal has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/goal`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update career path",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleSelectPath = (careerPathId: number) => {
    updateGoalMutation.mutate(careerPathId);
  };
  
  // Get skill name by ID
  const getSkillName = (skillId: number) => {
    if (!skills) return "Loading...";
    
    const skill = skills.find((s: any) => s.id === skillId);
    return skill ? skill.name : "Unknown Skill";
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-60 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Career Paths</h1>
        <p className="text-gray-600">
          Explore different career paths in computer science and select your goal.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {careerPaths && careerPaths.map((path: any) => {
          const isSelected = userGoal && userGoal.careerPathId === path.id;
          
          return (
            <Card key={path.id} className={isSelected ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>{path.title}</CardTitle>
                <CardDescription>{path.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Required Skills:</h4>
                  <div className="flex flex-wrap gap-2">
                    {path.requiredSkills.map((skillId: number) => (
                      <Badge key={skillId} variant="outline">
                        {getSkillName(skillId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSelectPath(path.id)}
                  disabled={updateGoalMutation.isPending || isSelected}
                  variant={isSelected ? "outline" : "default"}
                  className="w-full"
                >
                  {isSelected ? "Current Goal" : "Set as Goal"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CareerPaths;
