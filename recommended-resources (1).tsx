import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import StarRating from "@/components/ui/star-rating";

interface RecommendedResourcesProps {
  userId: number;
  className?: string;
}

interface Resource {
  id: number;
  title: string;
  provider: string;
  rating: string;
  thumbnail: string;
  duration: string;
}

const RecommendedResources: React.FC<RecommendedResourcesProps> = ({ userId, className }) => {
  // Fetch user goal to get career path
  const { data: goalData } = useQuery({
    queryKey: [`/api/users/${userId}/goal`],
  });
  
  // Fetch user skills to get recommended resources
  const { data: userSkillsData } = useQuery({
    queryKey: [`/api/users/${userId}/skills`],
  });
  
  // In a real app, we would use the skill IDs to fetch personalized recommendations
  // For now, we'll fetch all resources
  const { data: resourcesData, isLoading } = useQuery({
    queryKey: ['/api/resources'],
  });
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex border rounded-lg overflow-hidden">
                  <div className="w-24 bg-gray-200 h-24"></div>
                  <div className="p-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!resourcesData) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p>Error loading resources.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Get 3 resources for display
  const resources = resourcesData.slice(0, 3);
  
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended Resources</h2>
        
        <div className="space-y-4">
          {resources.map((resource: Resource) => (
            <a href="#" key={resource.id} className="block">
              <div className="flex border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="w-24 bg-gray-200 flex-shrink-0">
                  <div className="h-full w-full bg-gray-200"></div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900">{resource.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{resource.provider}</p>
                  <div className="mt-1 flex items-center">
                    {resource.rating ? (
                      <StarRating rating={resource.rating} size="sm" />
                    ) : resource.provider.includes("YouTube") ? (
                      <span className="text-xs text-red-600 font-medium">Trending</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Recommended
                      </span>
                    )}
                    
                    {resource.duration && (
                      <span className="text-xs text-gray-500 ml-2">{resource.duration}</span>
                    )}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedResources;
