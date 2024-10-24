import { LanguageModelV1 } from '@ai-sdk/provider';
import { ReactNode } from 'react';
import { z } from 'zod';
import { CallWarning, CoreToolChoice, FinishReason, ProviderMetadata } from 'ai';
import { CallSettings } from 'types/prompt/call-settings';
import { Prompt } from 'types/prompt/prompt';
import { streamText } from 'ai';
import {
  LanguageModelUsage
} from '@/libs/ultil/prompt/usage';

import { createResolvablePromise } from '@/libs/ultil/prompt/create-resolvable-promise';
import { isAsyncGenerator } from '@/libs/ultil/prompt/is-async-generator';
import { isGenerator } from '@/libs/ultil/prompt/is-generator';
import { createStreamableUI } from 'ai/rsc';

import { generateId } from '@ai-sdk/provider-utils';
import { CoreTool } from 'ai';
export const nanoid = generateId;

type Streamable = ReactNode | Promise<ReactNode>;

type Renderer<T extends Array<any>> = (
  ...args: T
) =>
  | Streamable
  | Generator<Streamable, Streamable, void>
  | AsyncGenerator<Streamable, Streamable, void>;

type RenderTool<PARAMETERS extends z.ZodTypeAny = any> = {
  description?: string;
  parameters: PARAMETERS;
  generate?: Renderer<
    [
      z.infer<PARAMETERS>,
      {
        toolName: string;
        toolCallId: string;
      },
    ]
  >;
};

type RenderText = Renderer<
  [
    {
      /**
       * The full text content from the model so far.
       */
      content: string;

      /**
       * The new appended text content from the model since the last `text` call.
       */
      delta: string;

      /**
       * Whether the model is done generating text.
       * If `true`, the `content` will be the final output and this call will be the last.
       */
      done: boolean;
    },
  ]
>;

type RenderResult = {
  value: ReactNode;
} & Awaited<ReturnType<LanguageModelV1['doStream']>>;

const defaultTextRenderer: RenderText = ({ content }: { content: string }) =>
  content;

/**
 * `streamUI` is a helper function to create a streamable UI from LLMs.
 */
export async function streamUIV2<TOOLS extends Record<string, CoreTool>>({
  model,
  tools,
  toolChoice,
  system,
  prompt,
  messages,
  maxRetries,
  abortSignal,
  headers,
  initial,
  text,
  experimental_providerMetadata: providerMetadata,
  onFinish,
  ...settings
}: CallSettings &
  Prompt & {
    /**
     * The language model to use.
     */
    model: LanguageModelV1;

    /**
     * The tools that the model can call. The model needs to support calling tools.
     */
    tools?: TOOLS;

    /**
     * The tool choice strategy. Default: 'auto'.
     */
    toolChoice?: CoreToolChoice<TOOLS>;

    text?: RenderText;
    initial?: ReactNode;

    /**
  Additional provider-specific metadata. They are passed through
  to the provider from the AI SDK and enable provider-specific
  functionality that can be fully encapsulated in the provider.
  */
    experimental_providerMetadata?: ProviderMetadata;

    /**
     * Callback that is called when the LLM response and the final object validation are finished.
     */
    onFinish?: (event: {
      /**
       * The reason why the generation finished.
       */
      finishReason: FinishReason;
      /**
       * The token usage of the generated response.
       */
      usage: LanguageModelUsage;
      /**
       * The final ui node that was generated.
       */
      value: ReactNode;
      /**
       * Warnings from the model provider (e.g. unsupported settings)
       */
      warnings?: CallWarning[];
      /**
       * Optional raw response data.
       */
      rawResponse?: {
        /**
         * Response headers.
         */
        headers?: Record<string, string>;
      };
    }) => Promise<void> | void;
  }): Promise<RenderResult> {

  const ui = createStreamableUI(initial)
  const nodes: [string, ReactNode][] = []
  // map of tool call id to step number
  const stepsMap = new Map<string, number>()

  const updateNodes = (id: string, node: ReactNode): ReactNode => {
    if (stepsMap.has(id)) {
      const step = stepsMap.get(id)
      if (step !== undefined) {
        nodes[step] = [id, node]
      }
    } else {
      nodes.push([id, node])
      stepsMap.set(id, nodes.length - 1)
    }

    return (
      <>
        {nodes.map(([id, node], _) => (
          <div key={id}>{node}</div>
        ))}
      </>
    )
  }

  // The default text renderer just returns the content as string.
  const textRender = text || defaultTextRenderer

  let finished: Promise<void> | undefined

  let finishEvent: {
    finishReason: FinishReason
    usage: LanguageModelUsage
    warnings?: CallWarning[]
    rawResponse?: {
      headers?: Record<string, string>
    }
  } | null = null

  async function render({
    args,
    renderer,
    streamableUI,
    isLastCall,
    stepId
  }: {
    renderer: undefined | Renderer<any>
    args: [payload: any] | [payload: any, options: any]
    streamableUI: ReturnType<typeof createStreamableUI>
    isLastCall?: boolean
    stepId: string
  }): Promise<string> {
    if (!renderer) return ''

    // create a promise that will be resolved when the render call is finished.
    // it is appended to the `finished` promise chain to ensure the render call
    // is finished before the next render call starts.
    const renderFinished = createResolvablePromise<void>()
    finished = finished
      ? finished.then(() => renderFinished.promise)
      : renderFinished.promise
    //@ts-ignore
    const rendererResult: any = await renderer(...args)
    let data = ''

    if (isAsyncGenerator(rendererResult) || isGenerator(rendererResult)) {
      while (true) {
        const { done, value }: any = await rendererResult.next()
        const node = await value.node

        if (isLastCall) {
          streamableUI.done(updateNodes(stepId, node))
        } else {
          streamableUI.update(updateNodes(stepId, node))
        }

        if (done) {
          data = await value.data
          break
        }
      }
    } else {
      const node: any = await rendererResult.node
      data = await rendererResult.data

      if (isLastCall) {
        streamableUI.done(updateNodes(stepId, node))
      } else {
        streamableUI.update(updateNodes(stepId, node))
      }
    }

    // resolve the promise to signal that the render call is finished
    renderFinished.resolve()

    return data
  }

  /* for each tool wrap 'generate' with execute */
  const reformattedTools =
    tools &&
    (Object.entries(tools).reduce((acc: any, [name, tool]: any) => {
      const generate = tool.generate
      acc[name] = {
        ...tool,
        execute: (args: any, options: any) => {
          return render({
            renderer: tool.generate,
            args: [args],
            streamableUI: ui,
            stepId: `${name}-${nanoid()}`
          })
        }
      }
      return acc
    }, {}) as {
        [name in keyof TOOLS]: TOOLS[name]
      })

  let textSection: number = 0

  const result = await streamText({
    model,
    tools: reformattedTools,
    toolChoice,
    system,
    prompt,
    messages,
    maxRetries,
    abortSignal,
    headers,
    maxSteps: 3,
    onChunk: event => {
      if (event.chunk.type === 'text-delta') {
        render({
          renderer: textRender,
          args: [{ done: false, delta: event.chunk.textDelta }],
          streamableUI: ui,
          stepId: `text-${textSection}`
        })
      } else {
        textSection++
      }
    },
    onFinish: event => {
      onFinish &&
        onFinish({
          ...event,
          value: ui.value
        })

      finished
        ? finished.then(() => {
          ui.done()
        })
        : ui.done()
    }
  })

    ; (async () => {
      for await (const _ of result.textStream) {
        // without this the stream will not work
      }
    })()
  //@ts-ignore
  return {
    ...result,
    value: ui.value
  }
}
