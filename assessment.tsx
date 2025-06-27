import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { assessmentFormSchema, AssessmentFormData } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const Assessment: React.FC = () => {
  const { toast } = useToast();
  // In a real app, we would get the current user ID from authentication
  const userId = 1;
  
  // Fetch skills for the assessment
  const { data: skills, isLoading: isSkillsLoading } = useQuery({
    queryKey: ['/api/skills'],
  });
  
  // Fetch career paths
  const { data: careerPaths, isLoading: isCareerPathsLoading } = useQuery({
    queryKey: ['/api/career-paths'],
  });
  
  // Fetch existing user skills to pre-populate the form
  const { data: userSkills, isLoading: isUserSkillsLoading } = useQuery({
    queryKey: [`/api/users/${userId}/skills`],
  });
  
  // Fetch user goal to pre-populate the form
  const { data: userGoal, isLoading: isUserGoalLoading } = useQuery({
    queryKey: [`/api/users/${userId}/goal`],
  });
  
  const isLoading = isSkillsLoading || isCareerPathsLoading || isUserSkillsLoading || isUserGoalLoading;
  
  // Initialize form with default values
  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      skillsAssessment: [],
      interests: [],
      education: "",
      experience: "",
      careerGoal: undefined
    }
  });
  
  // Submit assessment
  const submitMutation = useMutation({
    mutationFn: async (data: AssessmentFormData) => {
      await apiRequest("POST", `/api/users/${userId}/assessment`, data);
    },
    onSuccess: () => {
      toast({
        title: "Assessment submitted!",
        description: "Your career roadmap has been updated based on your input.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/skills`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/goal`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/progress`] });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit assessment",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: AssessmentFormData) => {
    submitMutation.mutate(data);
  };
  
  // Update form values when existing data is loaded
  React.useEffect(() => {
    if (userSkills && skills) {
      const skillsAssessment = userSkills.map((userSkill: any) => ({
        skillId: userSkill.skillId,
        proficiencyLevel: userSkill.proficiencyLevel
      }));
      
      form.setValue("skillsAssessment", skillsAssessment);
    }
    
    if (userGoal) {
      form.setValue("careerGoal", userGoal.careerPathId);
    }
  }, [userSkills, userGoal, skills, form]);
  
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
  
  const calculateSkillsProficiency = (skillId: number) => {
    if (!userSkills) return 0;
    
    const userSkill = userSkills.find((skill: any) => skill.skillId === skillId);
    return userSkill ? userSkill.proficiencyLevel : 0;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Skills Assessment</h1>
        <p className="text-gray-600">
          Let's understand your current skills and career goals to create a personalized roadmap.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Career Goal Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Career Goals</CardTitle>
                <CardDescription>
                  Select the role you're aiming for so we can create a tailored learning path.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="careerGoal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Desired Career Path</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a career path" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {careerPaths && careerPaths.map((path: any) => (
                            <SelectItem key={path.id} value={path.id.toString()}>
                              {path.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Skills Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Skills</CardTitle>
                <CardDescription>
                  Rate your proficiency in the following skills from 1 (beginner) to 5 (expert).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {skills && skills.map((skill: any) => (
                    <FormField
                      key={skill.id}
                      control={form.control}
                      name={`skillsAssessment`}
                      render={() => (
                        <FormItem>
                          <div className="mb-1">
                            <FormLabel className="text-base">{skill.name}</FormLabel>
                            <FormDescription>{skill.description}</FormDescription>
                          </div>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => {
                                const currentValues = form.getValues().skillsAssessment || [];
                                const existingIndex = currentValues.findIndex(s => s.skillId === skill.id);
                                
                                if (existingIndex >= 0) {
                                  currentValues[existingIndex].proficiencyLevel = parseInt(value);
                                } else {
                                  currentValues.push({
                                    skillId: skill.id,
                                    proficiencyLevel: parseInt(value)
                                  });
                                }
                                
                                form.setValue("skillsAssessment", currentValues);
                              }}
                              defaultValue={calculateSkillsProficiency(skill.id).toString()}
                              className="flex flex-row space-x-2"
                            >
                              {[1, 2, 3, 4, 5].map((level) => (
                                <FormItem key={level} className="flex items-center space-x-1">
                                  <FormControl>
                                    <RadioGroupItem value={level.toString()} />
                                  </FormControl>
                                  <FormLabel className="text-sm">{level}</FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Education & Experience */}
            <Card>
              <CardHeader>
                <CardTitle>Education & Experience</CardTitle>
                <CardDescription>
                  Share your academic background and any relevant work experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Education</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Degrees, certifications, or courses completed"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any relevant work experience, internships, or projects"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Interests */}
            <Card>
              <CardHeader>
                <CardTitle>Areas of Interest</CardTitle>
                <CardDescription>
                  Select the areas that interest you the most to help us personalize your recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="interests"
                  render={() => (
                    <FormItem>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {["Web Development", "Data Science", "Machine Learning", 
                          "Mobile Development", "Cloud Computing", "DevOps", 
                          "Cybersecurity", "Blockchain", "Game Development", 
                          "UI/UX Design"].map((interest) => (
                          <FormField
                            key={interest}
                            control={form.control}
                            name="interests"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={interest}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(interest)}
                                      onCheckedChange={(checked) => {
                                        const currentInterests = [...(field.value || [])];
                                        
                                        if (checked) {
                                          if (!currentInterests.includes(interest)) {
                                            currentInterests.push(interest);
                                          }
                                        } else {
                                          const index = currentInterests.indexOf(interest);
                                          if (index !== -1) {
                                            currentInterests.splice(index, 1);
                                          }
                                        }
                                        
                                        field.onChange(currentInterests);
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    {interest}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="px-6"
                disabled={submitMutation.isPending}
              >
                {submitMutation.isPending ? "Saving..." : "Save Assessment"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Assessment;
