import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import StarRating from "@/components/ui/star-rating";

const Resources: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // In a real app, we would get the current user ID from authentication
  const userId = 1;
  
  // Fetch user goal to get career path
  const { data: goalData } = useQuery({
    queryKey: [`/api/users/${userId}/goal`],
  });
  
  // Fetch resources
  const { data: resources, isLoading } = useQuery({
    queryKey: ['/api/resources'],
  });
  
  // Fetch user skills
  const { data: userSkills } = useQuery({
    queryKey: [`/api/users/${userId}/skills`],
  });
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
          
          <div className="space-y-4">
            <div className="h-12 bg-gray-100 rounded w-full"></div>
            <div className="h-10 bg-gray-100 rounded w-full"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-60 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!resources) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Learning Resources</h1>
          <p className="text-gray-600">
            Error loading resources. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  
  // Get resource categories
  const categories = ["all", ...new Set(resources.map((resource: any) => resource.type))];
  
  // Filter resources based on search query and category
  const filteredResources = resources.filter((resource: any) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.provider?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || resource.type === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Get recommended resources based on user skills
  const getRecommendedResources = () => {
    if (!userSkills) return [];
    
    const userSkillIds = userSkills.map((skill: any) => skill.skillId);
    
    return resources.filter((resource: any) => 
      resource.skillIds.some((skillId: number) => userSkillIds.includes(skillId))
    ).slice(0, 3);
  };
  
  const recommendedResources = getRecommendedResources();
  
  // Format resource type for display
  const formatResourceType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Learning Resources</h1>
        <p className="text-gray-600">
          Explore curated learning materials to help you master new skills.
        </p>
      </div>
      
      {/* Search and filter */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search resources..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Filter:</span>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                <TabsList className="grid grid-cols-3 md:grid-cols-5">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category}>
                      {formatResourceType(category)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Recommended resources */}
      {recommendedResources.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recommended for You</CardTitle>
            <CardDescription>
              Based on your skills and career goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendedResources.map((resource: any) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex border rounded-lg overflow-hidden hover:shadow-md transition-shadow h-full">
                    <div className="w-24 bg-gray-200 flex-shrink-0">
                      <div className="h-full w-full bg-gray-200"></div>
                    </div>
                    <div className="p-3 flex flex-col">
                      <h3 className="text-sm font-medium text-gray-900">{resource.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{resource.provider}</p>
                      <div className="mt-auto pt-2 flex items-center">
                        {resource.rating ? (
                          <StarRating rating={resource.rating} size="sm" />
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
      )}
      
      {/* All resources */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">All Resources</h2>
        <span className="text-sm text-gray-600">{filteredResources.length} resources found</span>
      </div>
      
      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">No resources found matching your criteria.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource: any) => (
            <Card key={resource.id}>
              <CardContent className="p-4">
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="w-full h-40 bg-gray-200 rounded-lg mb-3"></div>
                  
                  <h3 className="text-md font-medium text-gray-900 mb-1">{resource.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{resource.provider}</p>
                  
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">
                      {formatResourceType(resource.type)}
                    </Badge>
                    
                    {resource.rating && (
                      <StarRating rating={resource.rating} size="sm" />
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 line-clamp-2">{resource.description}</p>
                  
                  <div className="mt-3">
                    <Button variant="outline" size="sm" className="w-full">
                      View Resource
                    </Button>
                  </div>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;
