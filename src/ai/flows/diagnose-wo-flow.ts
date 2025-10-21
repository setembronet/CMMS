'use server';
/**
 * @fileoverview Flow to diagnose a Work Order and suggest title, priority, and technician.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { User, OrderPriority, WorkOrder } from '@/lib/types';

const DiagnoseWoInputSchema = z.object({
  description: z.string().describe('The user-provided description of the problem.'),
  assetName: z.string().describe('The name of the asset with the problem.'),
  technicians: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      squad: z.string().optional(),
    })
  ).describe('A list of available technicians.'),
  assetHistory: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      rootCause: z.string().optional(),
    })
  ).describe('The history of past work orders for this asset.'),
});

export type DiagnoseWoInput = z.infer<typeof DiagnoseWoInputSchema>;

const DiagnoseWoOutputSchema = z.object({
  title: z.string().describe('A concise, informative title for the work order based on the description. Maximum 5 words.'),
  priority: z.enum(['Baixa', 'Média', 'Alta', 'Urgente']).describe('The suggested priority for the work order.'),
  recommendedTechnicianId: z.string().describe('The ID of the most suitable technician for the job.'),
});

export type DiagnoseWoOutput = z.infer<typeof DiagnoseWoOutputSchema>;

export async function diagnoseWo(input: DiagnoseWoInput): Promise<DiagnoseWoOutput> {
  return diagnoseWoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnoseWoPrompt',
  input: { schema: DiagnoseWoInputSchema },
  output: { schema: DiagnoseWoOutputSchema },
  prompt: `You are an expert CMMS assistant. Your task is to analyze a problem description for an asset and suggest a title, priority, and the best technician.

Analyze the user's problem description:
"{{{description}}}"

For the asset named: "{{{assetName}}}"

Consider the list of available technicians:
{{#each technicians}}
- ID: {{id}}, Name: {{name}}, Squad: {{squad}}
{{/each}}

Also, consider the asset's history:
{{#if assetHistory}}
{{#each assetHistory}}
- Past Issue: {{title}} - {{description}} (Cause: {{rootCause}})
{{/each}}
{{else}}
- No relevant history for this asset.
{{/if}}

Based on all this information:
1.  Create a clear and concise title for the work order.
2.  Determine the priority. Use 'Urgente' for critical issues that stop operation. Use 'Alta' for significant but not critical failures. Use 'Média' for routine problems. Use 'Baixa' for minor issues.
3.  Recommend the best technician. Consider their squad and if the asset history suggests a recurring problem that a specific technician might have experience with.

Provide the output in the required JSON format.
`,
});

const diagnoseWoFlow = ai.defineFlow(
  {
    name: 'diagnoseWoFlow',
    inputSchema: DiagnoseWoInputSchema,
    outputSchema: DiagnoseWoOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
