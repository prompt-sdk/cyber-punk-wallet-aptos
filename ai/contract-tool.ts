import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const model = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0.1,
  apiKey: OPENAI_API_KEY
});

export async function contractTool({ sourceCode, account, moduleName, functions }: any) {
    const messages = [
      new SystemMessage(`You are a move developer. 
              When the user gives the source code and functions. Provide your response as a JSON object with the following schema: , 
           returns [{ name:  ${account}::${moduleName}::<function>  , description : description with module name of function 100 words limit , params : (name if params) : { type : data types params ,description about params }} `),
      new HumanMessage(
        `Your response will not be in Markdown format, only JSON.Here is the source code : ${sourceCode} , function : ${functions}  `
      )
    ];
    const parser = new StringOutputParser();
    const result = await model.invoke(messages);
  
    const resultParse = await parser.invoke(result);
    return resultParse;
  }