import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// This would be set up properly in production with environment variables
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json() as any;
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: query is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would call the OpenAI API
    // const response = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [
    //     { role: "system", content: "You are a helpful assistant for a developer's portfolio website. Provide concise, informative responses about the developer's skills, services, and experience." },
    //     { role: "user", content: query }
    //   ],
    //   max_tokens: 150,
    // });
    
    // For demonstration purposes, we'll simulate a response
    const simulatedResponse = `Thanks for your question about "${query}". As a developer, I specialize in creating modern web applications with cutting-edge technologies like React, Next.js, and TypeScript. I'd be happy to discuss how I can help with your project!`;
    
    // Add a small delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({ 
      response: simulatedResponse,
      // In a real implementation, this would use the actual API response
      // response: response.choices[0].message.content 
    });
    
  } catch (error) {
    console.error('Error processing LLM request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
