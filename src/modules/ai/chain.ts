import { ChatOpenAI } from '@langchain/openai';

import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { DynamicTool, DynamicStructuredTool, tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const model = new ChatOpenAI({
  model: 'gpt-4',
  temperature: 0.1,
  apiKey: OPENAI_API_KEY
});

export async function executeTool({ sourceCode, functions }: any) {
  const messages = [
    new SystemMessage(`You are a move developer. 
            When the user gives the source code and functions. Provide your response as a JSON object with the following schema: , 
         returns [{ name:name with module name of function  , description : description with module name of function 100 words limit , params : {data types and descriptions of each params}}] `),
    new HumanMessage(`Here is the source code : ${sourceCode} , function : ${functions}  `)
  ];
  const parser = new StringOutputParser();
  const result = await model.invoke(messages);

  const resultParse = await parser.invoke(result);

  return resultParse;
}
export async function widgetTool({ prompt }: any) {
  // Workflow .
  // add tool
  // will import tool and prompt to create demo
  // convert to params data .
  //
  // save data widget load data type from tool .
  // widget ID and code
  // load Widget ID
  // load data from tool
  // Widget thì phải có ID và có chứa sẵn code bên trong . và code bên trong
  //

  const SYSTEM_TEMPLATE = new SystemMessage(`Prompt Template for React Component Assistant:

You are a React component generator assistant. Follow these instructions for all responses:

No Markdown Export:

The response format cannot be exported or interpreted as Markdown style. All text and code should be displayed as raw output, without formatting like *bold* or _italic_.
Response Structure:

All answers must follow this structure:

(props) => {
    return // component code here
}
Action Component Creation:

If the user requests to create an action, generate the corresponding component in the following style:

(props) => {
return (
    <a href="?prompt=action" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
       action
    </a>
    )
}
Response Examples:

Example 1 – Action Button Request:
Input:


Create a button with action "Submit"
Output:


(props) => {
return (
    <a href="?prompt=Submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
        Submit
    </a>
    )
}
Example 2 – Action Button with Custom Text:
Input:


Create an action button with label "Save"
Output:


(props) => {
return (
    <a href="?prompt=Save" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
        Save
    </a>
)

Example 3 – Label with View function:
Input:


Create an label with function.view({account: 'abc'})
Output:


(props) => {
const balance =  function.view({account: 'abc'}) ;
return (
    <a href="?prompt=Save" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
        Your account balance is: {balance}
    </a>
)
}`);

  const tools = [
    new DynamicTool({
      name: 'getBlanace',
      description: 'call this to get balance of account',
      func: async () => '[balance Your account is 5 APT'
    })
  ];

  // làm sao lấy được params data từ câu lệnh prompt
  // sau khi import tool
  // prompt create label with balance of my account
  // agent: create label
  // tool balance of my account => function.view({params})
  //
  // code output like this :
  // const balance = functions.view({account:'0x123123'});
  //
  const parser = new StringOutputParser();
  const HUMAN_TEMPLATE = new HumanMessage(prompt);
  const messages = [SYSTEM_TEMPLATE, HUMAN_TEMPLATE];

  const result = await model.invoke(messages);

  const resultParse = await parser.invoke(result);
  console.log(resultParse);
  return resultParse;
}
export async function searchTool({ prompt }: any) {
  const tools = [
    new DynamicStructuredTool({
      name: 'getBlanace',
      description: 'get balance of account',
      func: async account => `balance Your ${account} : 5 APT`,
      schema: z.object({
        account: z.string().describe('address of account')
      })
    }),
    new DynamicStructuredTool({
      name: 'getTotalVolume',
      description: 'get total volume of account',
      func: async account => `Your volumn ${account} : 1000 APT`,
      schema: z.object({
        account: z.string().describe('address of account')
      })
    }),
    tool(
      async ({ min, max, size }) => {
        const array: number[] = [];
        for (let i = 0; i < size; i++) {
          array.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return [`Successfully generated array of ${size} random ints in [${min}, ${max}].`, array];
      },
      {
        name: 'generateRandomInts',
        description: 'Generate size random ints in the range [min, max].',
        schema: z.object({
          min: z.number(),
          max: z.number(),
          size: z.number()
        }),
        responseFormat: 'content_and_artifact'
      }
    )
  ];

  const systemPrompt = ChatPromptTemplate.fromMessages([
    [
      'system',
      `You are a React component developer assistant assistant AI designed to help users with React component inquiries.\n 
            Analyze each query to determine if it requires plain text information or an action via a tool. Do not ever send tool call arguments with your chat. You must specifically call the tool with the information\n
            For informational queries like "create label show balance of 0x123123123", respond with text, then balance of account you answered with using the 'getBlanace'. Always say something before or after tool usage.\n
            Provide a response clearly and concisely. Always be polite, informative, and efficient.`
    ],
    ['human', '{input}']
  ]);

  const Model = new ChatOpenAI({
    model: 'gpt-4o-mini',
    temperature: 0.1,
    apiKey: process.env.OPENAI_API_KEY,
    streaming: false,
    verbose: false
  }).bindTools(tools);

  const chain = systemPrompt.pipe(Model);
  const res = await chain.invoke({ input: prompt });

  console.log(res);
  if (res.tool_calls && res.tool_calls.length > 0) {
    return {
      toolCall: {
        name: res.tool_calls[0]!.name,
        parameters: res.tool_calls[0]!.args
      }
    };
  }
  return { results: res.content as string };
}
