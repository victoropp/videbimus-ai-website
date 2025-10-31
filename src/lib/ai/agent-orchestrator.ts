/**
 * State-of-the-art Agent Orchestration System
 * Implements multi-agent collaboration for complex task decomposition and execution
 */

import { enhancedProviders } from './enhanced-providers';
import { enterpriseKnowledgeBase } from './enterprise-knowledge-base';
import { semanticCache } from './semantic-cache';

export type AgentRole = 
  | 'coordinator'
  | 'researcher' 
  | 'analyst'
  | 'coder'
  | 'reviewer'
  | 'documenter'
  | 'validator';

export interface Agent {
  id: string;
  role: AgentRole;
  name: string;
  description: string;
  capabilities: string[];
  systemPrompt: string;
  temperature: number;
  maxIterations: number;
}

export interface Task {
  id: string;
  description: string;
  requiredCapabilities: string[];
  assignedAgent?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dependencies: string[];
  result?: any;
  error?: string;
  startTime?: number;
  endTime?: number;
}

export interface ExecutionPlan {
  id: string;
  goal: string;
  tasks: Task[];
  agents: Agent[];
  executionOrder: string[][];
  status: 'planning' | 'executing' | 'completed' | 'failed';
  results: Map<string, any>;
  logs: string[];
}

export class AgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private activePlans: Map<string, ExecutionPlan> = new Map();
  
  constructor() {
    this.initializeAgents();
  }

  /**
   * Initialize specialized agents with specific roles and capabilities
   */
  private initializeAgents() {
    const agentConfigs: Agent[] = [
      {
        id: 'coordinator',
        role: 'coordinator',
        name: 'Task Coordinator',
        description: 'Breaks down complex requests into subtasks and coordinates execution',
        capabilities: ['task_decomposition', 'planning', 'coordination', 'synthesis'],
        systemPrompt: `You are a task coordinator agent. Your role is to:
1. Analyze complex user requests and break them into subtasks
2. Identify dependencies between tasks
3. Assign tasks to appropriate specialist agents
4. Coordinate execution and synthesize results
5. Ensure all requirements are met

Be precise in task decomposition and consider edge cases.`,
        temperature: 0.3,
        maxIterations: 5,
      },
      {
        id: 'researcher',
        role: 'researcher',
        name: 'Research Agent',
        description: 'Gathers information from knowledge bases and external sources',
        capabilities: ['research', 'data_gathering', 'fact_checking', 'summarization'],
        systemPrompt: `You are a research specialist agent. Your role is to:
1. Search and retrieve relevant information from knowledge bases
2. Verify facts and cross-reference sources
3. Summarize findings concisely
4. Identify knowledge gaps
5. Provide citations and confidence levels

Focus on accuracy and relevance.`,
        temperature: 0.2,
        maxIterations: 3,
      },
      {
        id: 'analyst',
        role: 'analyst',
        name: 'Data Analyst',
        description: 'Analyzes data, identifies patterns, and provides insights',
        capabilities: ['data_analysis', 'pattern_recognition', 'statistics', 'visualization'],
        systemPrompt: `You are a data analysis agent. Your role is to:
1. Analyze structured and unstructured data
2. Identify patterns, trends, and anomalies
3. Perform statistical analysis when needed
4. Generate insights and recommendations
5. Create clear data visualizations descriptions

Be thorough and data-driven in your analysis.`,
        temperature: 0.3,
        maxIterations: 4,
      },
      {
        id: 'coder',
        role: 'coder',
        name: 'Code Generator',
        description: 'Writes, reviews, and optimizes code',
        capabilities: ['code_generation', 'debugging', 'optimization', 'testing'],
        systemPrompt: `You are a code generation agent. Your role is to:
1. Write clean, efficient, and well-documented code
2. Follow best practices and design patterns
3. Include error handling and edge cases
4. Write unit tests when appropriate
5. Optimize for performance and maintainability

Use modern frameworks and libraries appropriately.`,
        temperature: 0.1,
        maxIterations: 3,
      },
      {
        id: 'reviewer',
        role: 'reviewer',
        name: 'Quality Reviewer',
        description: 'Reviews outputs for quality, accuracy, and completeness',
        capabilities: ['quality_assurance', 'validation', 'feedback', 'improvement'],
        systemPrompt: `You are a quality review agent. Your role is to:
1. Review outputs for accuracy and completeness
2. Check for logical consistency
3. Validate against requirements
4. Identify areas for improvement
5. Provide constructive feedback

Be thorough and constructive in your reviews.`,
        temperature: 0.2,
        maxIterations: 2,
      },
      {
        id: 'documenter',
        role: 'documenter',
        name: 'Documentation Agent',
        description: 'Creates clear documentation and explanations',
        capabilities: ['documentation', 'explanation', 'tutorial_creation', 'api_docs'],
        systemPrompt: `You are a documentation agent. Your role is to:
1. Create clear and comprehensive documentation
2. Write user-friendly explanations
3. Include examples and use cases
4. Structure information logically
5. Ensure technical accuracy

Focus on clarity and completeness.`,
        temperature: 0.3,
        maxIterations: 2,
      },
    ];

    for (const agent of agentConfigs) {
      this.agents.set(agent.id, agent);
    }
  }

  /**
   * Create an execution plan for a complex task
   */
  async createExecutionPlan(goal: string, context?: any): Promise<ExecutionPlan> {
    const coordinator = this.agents.get('coordinator')!;
    
    // Use coordinator to decompose the task
    const decompositionPrompt = `
Goal: ${goal}
Context: ${JSON.stringify(context || {})}

Decompose this goal into specific subtasks. For each task:
1. Provide a clear description
2. List required capabilities
3. Identify dependencies on other tasks
4. Suggest the appropriate agent role

Return as JSON: { tasks: [...], executionOrder: [[...parallel tasks], [...next parallel batch]] }
`;

    try {
      const response = await enhancedProviders.chatCompletion({
        messages: [
          { role: 'system', content: coordinator.systemPrompt },
          { role: 'user', content: decompositionPrompt }
        ],
        temperature: coordinator.temperature,
        model: 'gpt-4',
      });

      // Parse the execution plan
      const content = 'content' in response ? response.content : '';
      const planData = this.parseExecutionPlan(content);
      
      const plan: ExecutionPlan = {
        id: this.generateId(),
        goal,
        tasks: planData.tasks,
        agents: Array.from(this.agents.values()),
        executionOrder: planData.executionOrder,
        status: 'planning',
        results: new Map(),
        logs: [`Plan created for goal: ${goal}`],
      };

      this.activePlans.set(plan.id, plan);
      return plan;
    } catch (error) {
      console.error('Failed to create execution plan:', error);
      throw new Error('Failed to decompose task into execution plan');
    }
  }

  /**
   * Execute a plan using multi-agent collaboration
   */
  async executePlan(planId: string): Promise<ExecutionPlan> {
    const plan = this.activePlans.get(planId);
    if (!plan) throw new Error('Plan not found');

    plan.status = 'executing';
    plan.logs.push('Starting plan execution...');

    try {
      // Execute tasks in order (parallel batches)
      for (const batch of plan.executionOrder) {
        plan.logs.push(`Executing batch: ${batch.join(', ')}`);
        
        // Execute tasks in parallel within each batch
        const batchPromises = batch.map(taskId => 
          this.executeTask(plan, taskId)
        );
        
        await Promise.all(batchPromises);
      }

      // Synthesize results using coordinator
      const synthesis = await this.synthesizeResults(plan);
      plan.results.set('final', synthesis);
      
      plan.status = 'completed';
      plan.logs.push('Plan execution completed successfully');
      
      return plan;
    } catch (error) {
      plan.status = 'failed';
      plan.logs.push(`Execution failed: ${error}`);
      throw error;
    }
  }

  /**
   * Execute a single task with the appropriate agent
   */
  private async executeTask(plan: ExecutionPlan, taskId: string): Promise<void> {
    const task = plan.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    task.status = 'in_progress';
    task.startTime = Date.now();

    try {
      // Select appropriate agent based on required capabilities
      const agent = this.selectAgent(task.requiredCapabilities);
      task.assignedAgent = agent.id;

      // Prepare context with dependencies
      const context = this.prepareTaskContext(plan, task);

      // Execute task with selected agent
      const prompt = `
Task: ${task.description}
Dependencies: ${JSON.stringify(context.dependencies)}
Context: ${JSON.stringify(context.data)}

Complete this task and provide a structured response.
`;

      const response = await enhancedProviders.chatCompletion({
        messages: [
          { role: 'system', content: agent.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: agent.temperature,
      });

      const taskContent = 'content' in response ? response.content : '';
      task.result = taskContent;
      task.status = 'completed';
      task.endTime = Date.now();

      plan.results.set(task.id, task.result);
      plan.logs.push(`Task ${task.id} completed by ${agent.name}`);
    } catch (error) {
      task.status = 'failed';
      task.error = String(error);
      task.endTime = Date.now();
      plan.logs.push(`Task ${task.id} failed: ${error}`);
      throw error;
    }
  }

  /**
   * Select the best agent for a task based on capabilities
   */
  private selectAgent(requiredCapabilities: string[]): Agent {
    let bestAgent: Agent | null = null;
    let bestScore = 0;

    for (const agent of this.agents.values()) {
      const score = requiredCapabilities.reduce((acc, cap) => 
        acc + (agent.capabilities.includes(cap) ? 1 : 0), 0
      );
      
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent || this.agents.get('coordinator')!;
  }

  /**
   * Prepare context for task execution
   */
  private prepareTaskContext(plan: ExecutionPlan, task: Task): any {
    const dependencies: any = {};
    
    for (const depId of task.dependencies) {
      const depTask = plan.tasks.find(t => t.id === depId);
      if (depTask && depTask.result) {
        dependencies[depId] = depTask.result;
      }
    }

    return {
      goal: plan.goal,
      dependencies,
      data: plan.results,
    };
  }

  /**
   * Synthesize results from all tasks
   */
  private async synthesizeResults(plan: ExecutionPlan): Promise<string> {
    const coordinator = this.agents.get('coordinator')!;
    
    const prompt = `
Goal: ${plan.goal}
Task Results: ${JSON.stringify(Array.from(plan.results.entries()))}

Synthesize all task results into a comprehensive response that addresses the original goal.
Highlight key findings, recommendations, and any important considerations.
`;

    const response = await enhancedProviders.chatCompletion({
      messages: [
        { role: 'system', content: coordinator.systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });

    return 'content' in response ? response.content : '';
  }

  /**
   * Parse execution plan from LLM response
   */
  private parseExecutionPlan(content: string): any {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Ensure tasks have IDs
        if (parsed.tasks) {
          parsed.tasks = parsed.tasks.map((task: any, index: number) => ({
            id: task.id || `task_${index}`,
            description: task.description,
            requiredCapabilities: task.requiredCapabilities || [],
            dependencies: task.dependencies || [],
            status: 'pending',
          }));
        }
        
        return parsed;
      }
    } catch (error) {
      console.error('Failed to parse execution plan:', error);
    }

    // Fallback to simple task
    return {
      tasks: [{
        id: 'task_0',
        description: 'Complete the requested goal',
        requiredCapabilities: ['research', 'analysis'],
        dependencies: [],
        status: 'pending',
      }],
      executionOrder: [['task_0']],
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get plan status and progress
   */
  getPlanStatus(planId: string): ExecutionPlan | null {
    return this.activePlans.get(planId) || null;
  }

  /**
   * Cancel a running plan
   */
  cancelPlan(planId: string): boolean {
    const plan = this.activePlans.get(planId);
    if (plan && plan.status === 'executing') {
      plan.status = 'failed';
      plan.logs.push('Plan cancelled by user');
      return true;
    }
    return false;
  }
}

// Export singleton instance
export const agentOrchestrator = new AgentOrchestrator();