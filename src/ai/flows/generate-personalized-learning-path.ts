// use server'

/**
 * @fileOverview Generates a personalized learning path for a student based on their performance in previous courses.
 *
 * - generatePersonalizedLearningPath - A function that generates a personalized learning path.
 * - GeneratePersonalizedLearningPathInput - The input type for the generatePersonalizedLearningPath function.
 * - GeneratePersonalizedLearningPathOutput - The return type for the generatePersonalizedLearningPath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedLearningPathInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  courseHistory: z.array(
    z.object({
      courseName: z.string().describe('The name of the course.'),
      grade: z.number().describe('The grade the student received in the course.'),
      topics: z.array(
        z.object({
          topicName: z.string().describe('The name of the topic.'),
          score: z.number().describe('The score the student received on the topic.'),
        })
      ).describe('List of topics covered in the course and the student\'s score on each topic.')
    })
  ).describe('The student\'s course history.'),
});
export type GeneratePersonalizedLearningPathInput = z.infer<typeof GeneratePersonalizedLearningPathInputSchema>;

const LearningPathItemSchema = z.object({
  topicName: z.string().describe('The name of the topic to learn.'),
  reason: z.string().describe('The reason why this topic is recommended.'),
});

const GeneratePersonalizedLearningPathOutputSchema = z.object({
  learningPath: z.array(
    LearningPathItemSchema
  ).describe('A list of topics the student should focus on, with explanations.'),
});
export type GeneratePersonalizedLearningPathOutput = z.infer<typeof GeneratePersonalizedLearningPathOutputSchema>;

export async function generatePersonalizedLearningPath(
  input: GeneratePersonalizedLearningPathInput
): Promise<GeneratePersonalizedLearningPathOutput> {
  return generatePersonalizedLearningPathFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedLearningPathPrompt',
  input: {schema: GeneratePersonalizedLearningPathInputSchema},
  output: {schema: GeneratePersonalizedLearningPathOutputSchema},
  prompt: `You are an AI learning path generator. You will receive a student's course history and generate a personalized learning path for them.

Course History:
{{#each courseHistory}}
  Course Name: {{courseName}}
  Grade: {{grade}}
  Topics:
  {{#each topics}}
    Topic Name: {{topicName}}
    Score: {{score}}
  {{/each}}
{{/each}}

Based on the student's course history, generate a personalized learning path for them. The learning path should focus on the areas where the student needs the most improvement. Explain why each topic is recommended.

Output the learning path as a JSON array of objects with topicName and reason fields. Here is the schema:
${JSON.stringify(LearningPathItemSchema.description)}

Ensure that the generated JSON is valid and parseable.

Example:
[
  {
    "topicName": "Calculus",
    "reason": "The student struggled with calculus in previous courses."
  },
  {
    "topicName": "Linear Algebra",
    "reason": "The student needs to improve their understanding of linear algebra."
  }
]
`,
});

const generatePersonalizedLearningPathFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedLearningPathFlow',
    inputSchema: GeneratePersonalizedLearningPathInputSchema,
    outputSchema: GeneratePersonalizedLearningPathOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
