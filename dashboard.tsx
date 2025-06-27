import React from "react";
import ProgressSummary from "@/components/dashboard/progress-summary";
import RoadmapOverview from "@/components/dashboard/roadmap-overview";
import WeeklyFocus from "@/components/dashboard/weekly-focus";
import RecommendedResources from "@/components/dashboard/recommended-resources";
import ActionItems from "@/components/dashboard/action-items";
import { useQuery } from "@tanstack/react-query";

const Dashboard: React.FC = () => {
  // In a real app, we would get the current user ID from authentication
  // For now we'll use the demo user with ID 1
  const userId = 1;
  
  const { data: userData } = useQuery({
    queryKey: [`/api/users/${userId}`],
  });
  
  const { data: goalData } = useQuery({
    queryKey: [`/api/users/${userId}/goal`],
  });
  
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {userData?.firstName || "User"}!
        </h1>
        <p className="text-gray-600">
          Continue your journey toward becoming a{" "}
          <span className="font-medium text-primary">
            {goalData?.careerPath?.title || "Professional"}
          </span>
        </p>
      </div>
      
      <ProgressSummary userId={userId} className="mb-6" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RoadmapOverview userId={userId} className="lg:col-span-2 mb-6" />
        
        <div className="space-y-6">
          <WeeklyFocus userId={userId} />
          <RecommendedResources userId={userId} />
        </div>
      </div>
      
      <ActionItems userId={userId} className="mt-6" />
    </>
  );
};

export default Dashboard;
