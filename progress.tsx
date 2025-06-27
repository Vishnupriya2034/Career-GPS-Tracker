import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useQuery } from "@tanstack/react-query";

const ProgressPage: React.FC = () => {
  // In a real app, we would get the current user ID from authentication
  const userId = 1;
  
  // Fetch user goal to get career path
  const { data: goalData } = useQuery({
    queryKey: [`/api/users/${userId}/goal`],
  });
  
  // Fetch progress data
  const { data: progressData, isLoading: isProgressLoading } = useQuery({
    queryKey: [`/api/users/${userId}/progress`],
  });
  
  // Fetch user skills
  const { data: userSkillsData, isLoading: isSkillsLoading } = useQuery({
    queryKey: [`/api/users/${userId}/skills`],
  });
  
  // Fetch all skills for reference
  const { data: allSkills, isLoading: isAllSkillsLoading } = useQuery({
    queryKey: ['/api/skills'],
  });
  
  const isLoading = isProgressLoading || isSkillsLoading || isAllSkillsLoading;
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-gray-100 rounded"></div>
            <div className="h-80 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!progressData || !userSkillsData || !allSkills) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Progress Tracking</h1>
          <p className="text-gray-600">
            Error loading progress data. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  
  const { overallProgress, stats, progressDetails } = progressData;
  
  // Mock data for progress over time chart
  // In a real app, this would come from the API with historical data
  const progressHistory = [
    { week: 'Week 1', progress: 10 },
    { week: 'Week 2', progress: 20 },
    { week: 'Week 3', progress: 30 },
    { week: 'Week 4', progress: 42 },
    { week: 'Week 5', progress: 55 },
    { week: 'Week 6', progress: 65 },
  ];
  
  // Prepare skills data for chart
  const skillsChartData = userSkillsData.map((userSkill: any) => {
    const skillDetails = allSkills.find((skill: any) => skill.id === userSkill.skillId);
    return {
      name: skillDetails ? skillDetails.name : `Skill ${userSkill.skillId}`,
      proficiency: userSkill.proficiencyLevel * 20 // Convert 1-5 scale to percentage
    };
  });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Progress Tracking</h1>
        <p className="text-gray-600">
          Track your learning journey toward becoming a {goalData?.careerPath?.title || "Professional"}
        </p>
      </div>
      
      {/* Overall progress card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Overall Progress</h2>
            <span className="text-sm font-medium text-green-600">{overallProgress}% Complete</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div 
              className="bg-secondary h-2.5 rounded-full" 
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-secondary">{stats.acquiredSkills}</p>
              <p className="text-xs text-gray-600">Skills Acquired</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-primary">{stats.completedCourses}</p>
              <p className="text-xs text-gray-600">Courses Completed</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-accent">{stats.completedProjects}</p>
              <p className="text-xs text-gray-600">Projects Finished</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-amber-500">{stats.weeksConsistent}</p>
              <p className="text-xs text-gray-600">Weeks Consistent</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Analytics section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Progress over time */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
            <CardDescription>
              Your learning journey week by week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={progressHistory}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="hsl(var(--primary))" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Skills proficiency */}
        <Card>
          <CardHeader>
            <CardTitle>Skills Proficiency</CardTitle>
            <CardDescription>
              Your current skill levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={skillsChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="name" type="category" scale="band" />
                  <Tooltip />
                  <Bar 
                    dataKey="proficiency" 
                    fill="hsl(var(--chart-1))" 
                    name="Proficiency %" 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Roadmap progress details */}
      <Card>
        <CardHeader>
          <CardTitle>Roadmap Progress</CardTitle>
          <CardDescription>
            Track your progress through each step of your career roadmap
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Steps</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="space-y-4">
                {progressDetails.map((step: any) => (
                  <div key={step.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-md font-medium text-gray-900">{step.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      </div>
                      <Badge 
                        className={
                          step.completed 
                            ? "bg-green-100 text-green-800 hover:bg-green-100" 
                            : step.progress > 0 
                              ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                        }
                      >
                        {step.completed 
                          ? "Completed" 
                          : step.progress > 0 
                            ? "In Progress"
                            : "Not Started"
                        }
                      </Badge>
                    </div>
                    
                    {!step.completed && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{step.progress}%</span>
                        </div>
                        <Progress value={step.progress} className="h-2" />
                      </div>
                    )}
                    
                    {step.completed && step.completedDate && (
                      <div className="mt-2 text-xs text-gray-600">
                        Completed on: {new Date(step.completedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <div className="space-y-4">
                {progressDetails
                  .filter((step: any) => step.completed)
                  .map((step: any) => (
                    <div key={step.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-md font-medium text-gray-900">{step.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Completed
                        </Badge>
                      </div>
                      
                      {step.completedDate && (
                        <div className="mt-2 text-xs text-gray-600">
                          Completed on: {new Date(step.completedDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))
                }
                
                {progressDetails.filter((step: any) => step.completed).length === 0 && (
                  <p className="text-center text-gray-600 py-4">No completed steps yet.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="in-progress" className="mt-4">
              <div className="space-y-4">
                {progressDetails
                  .filter((step: any) => !step.completed && step.progress > 0)
                  .map((step: any) => (
                    <div key={step.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-md font-medium text-gray-900">{step.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          In Progress
                        </Badge>
                      </div>
                      
                      <div className="mt-4">
                        <div className="flex justify-between items-center text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{step.progress}%</span>
                        </div>
                        <Progress value={step.progress} className="h-2" />
                      </div>
                    </div>
                  ))
                }
                
                {progressDetails.filter((step: any) => !step.completed && step.progress > 0).length === 0 && (
                  <p className="text-center text-gray-600 py-4">No steps in progress.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="upcoming" className="mt-4">
              <div className="space-y-4">
                {progressDetails
                  .filter((step: any) => !step.completed && step.progress === 0)
                  .map((step: any) => (
                    <div key={step.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-md font-medium text-gray-900">{step.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                        </div>
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
                          Not Started
                        </Badge>
                      </div>
                    </div>
                  ))
                }
                
                {progressDetails.filter((step: any) => !step.completed && step.progress === 0).length === 0 && (
                  <p className="text-center text-gray-600 py-4">No upcoming steps.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressPage;
