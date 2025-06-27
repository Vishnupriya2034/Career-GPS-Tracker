import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertUserSkillSchema,
  insertUserGoalSchema,
  insertUserProgressSchema,
  insertTaskSchema,
  assessmentFormSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return password in response
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  });
  
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      
      // Don't return password in response
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Career paths routes
  app.get("/api/career-paths", async (_req: Request, res: Response) => {
    const careerPaths = await storage.getCareerPaths();
    return res.json(careerPaths);
  });
  
  app.get("/api/career-paths/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid career path ID" });
    }
    
    const careerPath = await storage.getCareerPath(id);
    if (!careerPath) {
      return res.status(404).json({ message: "Career path not found" });
    }
    
    return res.json(careerPath);
  });
  
  // Skills routes
  app.get("/api/skills", async (_req: Request, res: Response) => {
    const skills = await storage.getSkills();
    return res.json(skills);
  });
  
  // User skills routes
  app.get("/api/users/:userId/skills", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // Check if user exists
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const userSkills = await storage.getUserSkills(userId);
    
    // Get skill details for each user skill
    const skillsPromises = userSkills.map(async (userSkill) => {
      const skill = await storage.getSkill(userSkill.skillId);
      return {
        ...userSkill,
        skillDetails: skill
      };
    });
    
    const userSkillsWithDetails = await Promise.all(skillsPromises);
    return res.json(userSkillsWithDetails);
  });
  
  app.post("/api/users/:userId/skills", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const validatedData = insertUserSkillSchema.parse({ ...req.body, userId });
      const userSkill = await storage.createUserSkill(validatedData);
      return res.status(201).json(userSkill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to create user skill" });
    }
  });
  
  app.patch("/api/user-skills/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user skill ID" });
    }
    
    const proficiencyLevel = parseInt(req.body.proficiencyLevel);
    if (isNaN(proficiencyLevel) || proficiencyLevel < 1 || proficiencyLevel > 5) {
      return res.status(400).json({ message: "Invalid proficiency level" });
    }
    
    const updatedUserSkill = await storage.updateUserSkill(id, proficiencyLevel);
    if (!updatedUserSkill) {
      return res.status(404).json({ message: "User skill not found" });
    }
    
    return res.json(updatedUserSkill);
  });
  
  // User goals routes
  app.get("/api/users/:userId/goal", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const userGoal = await storage.getUserGoal(userId);
    if (!userGoal) {
      return res.status(404).json({ message: "User goal not found" });
    }
    
    // Get career path details
    const careerPath = await storage.getCareerPath(userGoal.careerPathId);
    
    return res.json({
      ...userGoal,
      careerPath
    });
  });
  
  app.post("/api/users/:userId/goal", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const validatedData = insertUserGoalSchema.parse({ ...req.body, userId });
      const userGoal = await storage.createUserGoal(validatedData);
      return res.status(201).json(userGoal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to create user goal" });
    }
  });
  
  app.patch("/api/user-goals/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user goal ID" });
    }
    
    const careerPathId = parseInt(req.body.careerPathId);
    if (isNaN(careerPathId)) {
      return res.status(400).json({ message: "Invalid career path ID" });
    }
    
    const updatedUserGoal = await storage.updateUserGoal(id, careerPathId);
    if (!updatedUserGoal) {
      return res.status(404).json({ message: "User goal not found" });
    }
    
    return res.json(updatedUserGoal);
  });
  
  // Resources routes
  app.get("/api/resources", async (_req: Request, res: Response) => {
    const resources = await storage.getResources();
    return res.json(resources);
  });
  
  app.get("/api/resources/by-skills", async (req: Request, res: Response) => {
    const skillIdsParam = req.query.skillIds as string;
    if (!skillIdsParam) {
      return res.status(400).json({ message: "No skill IDs provided" });
    }
    
    try {
      const skillIds = skillIdsParam.split(',').map(id => parseInt(id));
      if (skillIds.some(isNaN)) {
        return res.status(400).json({ message: "Invalid skill IDs" });
      }
      
      const resources = await storage.getResourcesBySkillIds(skillIds);
      return res.json(resources);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch resources" });
    }
  });
  
  app.get("/api/resources/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid resource ID" });
    }
    
    const resource = await storage.getResource(id);
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }
    
    return res.json(resource);
  });
  
  // Roadmap steps routes
  app.get("/api/career-paths/:careerPathId/roadmap", async (req: Request, res: Response) => {
    const careerPathId = parseInt(req.params.careerPathId);
    if (isNaN(careerPathId)) {
      return res.status(400).json({ message: "Invalid career path ID" });
    }
    
    const careerPath = await storage.getCareerPath(careerPathId);
    if (!careerPath) {
      return res.status(404).json({ message: "Career path not found" });
    }
    
    const roadmapSteps = await storage.getRoadmapSteps(careerPathId);
    
    // Get skill details for each required skill
    const roadmapStepsWithSkills = await Promise.all(
      roadmapSteps.map(async (step) => {
        const skillsPromises = step.requiredSkills.map(async (skillId) => {
          return await storage.getSkill(skillId as number);
        });
        
        const skills = await Promise.all(skillsPromises);
        
        return {
          ...step,
          skills
        };
      })
    );
    
    return res.json({
      careerPath,
      steps: roadmapStepsWithSkills
    });
  });
  
  // User progress routes
  app.get("/api/users/:userId/progress", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // Check if user has a goal
    const userGoal = await storage.getUserGoal(userId);
    if (!userGoal) {
      return res.status(404).json({ message: "User goal not found" });
    }
    
    // Get roadmap steps for the user's career path
    const roadmapSteps = await storage.getRoadmapSteps(userGoal.careerPathId);
    
    // Get user progress for each step
    const userProgress = await storage.getUserProgress(userId);
    
    // Calculate overall progress percentage
    let totalProgress = 0;
    userProgress.forEach(progress => {
      totalProgress += progress.progress;
    });
    
    const overallProgress = roadmapSteps.length > 0 
      ? Math.round(totalProgress / roadmapSteps.length) 
      : 0;
    
    // Get skills acquired (proficiency level >= 3)
    const userSkills = await storage.getUserSkills(userId);
    const acquiredSkills = userSkills.filter(skill => skill.proficiencyLevel >= 3).length;
    
    // Get completed courses/resources count (simplified for demo)
    const completedCourses = userProgress.filter(progress => progress.completed).length * 4; // 4 resources per step (simplified)
    
    // Get completed projects count (simplified for demo)
    const completedProjects = userProgress.filter(progress => progress.completed).length;
    
    // Calculate weeks consistent based on completed steps
    const weeksConsistent = 5; // Hardcoded for demo
    
    // Combine steps with progress information
    const progressDetails = roadmapSteps.map(step => {
      const progress = userProgress.find(p => p.roadmapStepId === step.id);
      return {
        ...step,
        progress: progress?.progress || 0,
        completed: progress?.completed || false,
        completedDate: progress?.completedDate
      };
    });
    
    return res.json({
      overallProgress,
      stats: {
        acquiredSkills,
        completedCourses,
        completedProjects,
        weeksConsistent
      },
      progressDetails
    });
  });
  
  app.post("/api/users/:userId/progress", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const validatedData = insertUserProgressSchema.parse({ ...req.body, userId });
      const userProgress = await storage.createUserProgress(validatedData);
      return res.status(201).json(userProgress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to create user progress" });
    }
  });
  
  app.patch("/api/user-progress/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user progress ID" });
    }
    
    const progress = parseInt(req.body.progress);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({ message: "Invalid progress value" });
    }
    
    const completed = req.body.completed === true;
    
    const updatedUserProgress = await storage.updateUserProgress(id, progress, completed);
    if (!updatedUserProgress) {
      return res.status(404).json({ message: "User progress not found" });
    }
    
    return res.json(updatedUserProgress);
  });
  
  // Tasks routes
  app.get("/api/users/:userId/tasks", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const tasks = await storage.getUserTasks(userId);
    
    // Get additional details for each task
    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        let resource = undefined;
        if (task.relatedResourceId) {
          resource = await storage.getResource(task.relatedResourceId);
        }
        
        let step = undefined;
        if (task.relatedStepId) {
          step = await storage.getRoadmapStep(task.relatedStepId);
        }
        
        return {
          ...task,
          resource,
          step
        };
      })
    );
    
    return res.json(tasksWithDetails);
  });
  
  app.post("/api/users/:userId/tasks", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const validatedData = insertTaskSchema.parse({ ...req.body, userId });
      const task = await storage.createTask(validatedData);
      return res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to create task" });
    }
  });
  
  app.patch("/api/tasks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    
    try {
      const updatedTask = await storage.updateTask(id, req.body);
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      return res.json(updatedTask);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update task" });
    }
  });
  
  app.delete("/api/tasks/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    
    const deleted = await storage.deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    return res.status(204).end();
  });
  
  // Assessment route
  app.post("/api/users/:userId/assessment", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const validatedData = assessmentFormSchema.parse(req.body);
      
      // Process skills assessment
      for (const skillAssessment of validatedData.skillsAssessment) {
        // Check if user already has this skill
        const userSkills = await storage.getUserSkills(userId);
        const existingSkill = userSkills.find(us => us.skillId === skillAssessment.skillId);
        
        if (existingSkill) {
          // Update existing skill
          await storage.updateUserSkill(existingSkill.id, skillAssessment.proficiencyLevel);
        } else {
          // Create new user skill
          await storage.createUserSkill({
            userId,
            skillId: skillAssessment.skillId,
            proficiencyLevel: skillAssessment.proficiencyLevel
          });
        }
      }
      
      // Update or create user goal if provided
      if (validatedData.careerGoal) {
        const userGoal = await storage.getUserGoal(userId);
        
        if (userGoal) {
          // Update existing goal
          await storage.updateUserGoal(userGoal.id, validatedData.careerGoal);
        } else {
          // Create new goal
          await storage.createUserGoal({
            userId,
            careerPathId: validatedData.careerGoal,
            isActive: true
          });
        }
      }
      
      return res.json({ message: "Assessment completed successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to process assessment" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
