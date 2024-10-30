import { NextRequest, NextResponse } from 'next/server';
import {
  getToolByUserId,
  createApiTool,
  createContractTool,
  createWidgetTool,
} from '@/db/queries';
import { Tool } from '@/db/schema';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
  }

  try {
    const tool = await getToolByUserId(userId);
    if (tool.length === 0) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    return NextResponse.json(tool);
  } catch (error) {
    console.error('Error fetching tool:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { typeName, name, description, userId, id, params, ...otherProps } = body;

    if (!typeName || !name || !description || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let result;

    const commonProps: Partial<Tool> = {
      id: id || crypto.randomUUID(),
      name,
      description,
      userId,
      typeName,
      createdAt: new Date(),
      params: null,
      type_params: null,
      functions: null,
      typeFunction: null,
      accessToken: null,
      spec: null,
      prompt: null,
      code: null,
      toolWidget: null,
    };

    switch (typeName) {
      case 'apiTool':
        const { accessToken, spec } = otherProps;
        if (!spec) {
          return NextResponse.json(
            { error: 'Missing required fields for API tool' },
            { status: 400 }
          );
        }
        result = await createApiTool({
          ...commonProps,
          accessToken,
          spec,
        } as Tool);
        break;

      case 'contractTool':
        const { typeFunction, functions, type_params } = otherProps;
        if (!params || !typeFunction || !functions) {
          return NextResponse.json(
            { error: 'Missing required fields for Contract tool' },
            { status: 400 }
          );
        }
        result = await createContractTool({
          ...commonProps,
          params,
          typeFunction,
          functions,
          type_params,
        } as Tool);
        break;

      case 'widgetTool':
        const { prompt, code, toolWidget } = otherProps;
        if (!prompt || !toolWidget) {
          return NextResponse.json(
            { error: 'Missing required fields for Widget tool' },
            { status: 400 }
          );
        }
        result = await createWidgetTool({
          ...commonProps,
          prompt,
          params,
          code: JSON.stringify(code),
          toolWidget,
        } as Tool);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid tool type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ message: 'Tool created successfully', result });
  } catch (error) {
    console.error('Error creating tool:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
