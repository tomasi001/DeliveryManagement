'use server';

import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

export async function extractWacFromImage(base64Image: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not defined');
  }

  try {
    const { object } = await generateObject({
      model: openai('gpt-4o'), // Upgrading to 4o for better detail extraction
      // Structured Outputs require strict schema adherence.
      // All fields must be required. Use nullable() if they might be missing.
      schema: z.object({
        artworks: z.array(z.object({
          wacCode: z.string().describe("The unique WAC identification code"),
          artist: z.string().nullable().describe("The artist name if visible, or null"),
          title: z.string().nullable().describe("The artwork title if visible, or null"),
          dimensions: z.string().nullable().describe("The artwork dimensions if visible, or null"),
        })),
      }),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Extract all artwork details from this image. For each item, capture the WAC Code, Artist, Title, and Dimensions. If multiple items are present, list them all.' },
            { type: 'image', image: base64Image },
          ],
        },
      ],
    });

    // Map nullable fields back to optional/undefined for frontend consistency if needed,
    // or just pass them as null which JSON handles fine.
    return { success: true, data: object.artworks };
  } catch (error) {
    console.error('AI Extraction Error:', error);
    return { success: false, error: 'Failed to extract artwork details' };
  }
}
