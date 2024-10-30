'use client';

import { ChatHeader } from '@/components/custom/chat-header';
import { Model } from '@/lib/model';
import CustomButton from '@/components/custom/custom-button';
import { Session } from 'next-auth';
import { FC, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import classNames from 'classnames';
import { useForm, useWatch } from 'react-hook-form';
import AugmentedPopup from '@/components/augmented/components/augmented-popup';
import DashboardAvatar from '@/components/common/dashboard-avatar';
import FormTextField from '@/components/common/form-text-field';
import { useToast } from '@/components/hooks/use-toast';
import { ViewFrame } from '@/components/custom/view-frame';
import BoderImage from '@/components/common/border-image';
import DropdownSelect from '@/components/common/dropdown-select-button';

import WidgetFrame2 from '@/public/assets/svgs/widget-frame-2.svg';
import useSWR, { mutate } from 'swr';
import { Textarea } from '@/components/ui/textarea';
import MultiSelectTools from '../common/multi-select';
const COIN_LIST_URL = 'https://raw.githubusercontent.com/AnimeSwap/coin-list/main/aptos/mainnet.js';

interface WidgetParam {
  name: string;
  description: string;
  type: string;
}

export function Tool({
  selectedModelName,
  session
}: {
  selectedModelName: Model['name'];
  session: Session | null;
}) {

  const { toast } = useToast();
  const userId = session?.user?.id;
  const [isOpenCreateTool, setIsOpenCreateTool] = useState<boolean>(false);
  const [isOpenCreateAPITool, setIsOpenCreateAPITool] = useState<boolean>(false);
  const [isOpenCreateWidget, setIsOpenCreateWidget] = useState<boolean>(false);
  const [moduleData, setModuleData] = useState<any>(null);
  const [functions, setFunctions] = useState<any>(null);
  const [sourceData, setSourceData] = useState<Record<string, any>>({});
  // const [isOpenSelectTool, setIsOpenSelectTool] = useState<boolean>(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const [loadingFunctions, setLoadingFunctions] = useState<Record<string, boolean>>({});
  // const [coinList, setCoinList] = useState<Array<{ symbol: string; name: string; address: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  const [selectedWidgetTools, setSelectedWidgetTools] = useState<string[]>([]);
  const [previewWidgetCode, setPreviewWidgetCode] = useState<string>('');
  const [widgetPrompt, setWidgetPrompt] = useState<string>('');
  const [widgetCode, setWidgetCode] = useState<string>('');
  const [widgetParams, setWidgetParams] = useState<WidgetParam[]>([]);

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      address: '',
      packages: [],
      functions: [],
      modules: []
    }
  });

  const apiToolForm = useForm({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      spec: '',
      accessToken: ''
    }
  });

  const widgetParamsForm = useForm({
    defaultValues: {
      params: [{ name: '', description: '', type: '' }]
    }
  });


  const widgetForm = useForm({
    mode: 'onChange',
    defaultValues: {
      name:'',
      description: '',
      params: widgetParams
    }
  });


  const handleAddWidgetParam = () => {
    const newParam = { name: '', description: '', type: '' };
    setWidgetParams([...widgetParams, newParam]);
  };

  const handleRemoveWidgetParam = (index: number) => {
    const updatedParams = widgetParams.filter((_, i) => i !== index);

    setWidgetParams(updatedParams);
    widgetParamsForm.setValue('params', updatedParams);
  };

  const { control, setValue } = form;
  //console.log('form', form.getValues());
  const selectedModules = useWatch({ control, name: 'modules' });

  const {
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = form;

  const loadSourceData = async (
    loadSourceDataAccount: string,
    packages: string[],
    modules: string[],
    loadSourceDataFunctions: string[]
  ) => {
    const newFunctions = loadSourceDataFunctions.filter(func => !sourceData[func]);

    if (newFunctions.length === 0) return;

    const newLoadingFunctions = newFunctions.reduce((acc, func) => ({ ...acc, [func]: true }), {});

    setLoadingFunctions(prev => ({ ...prev, ...newLoadingFunctions }));

    try {
      const responses = await Promise.all(
        newFunctions.map(async func => {
          const response = await axios.get('/api/source', {
            params: {
              account: loadSourceDataAccount,
              package: packages.join(','),
              module: modules.join(','),
              functions: func
            }
          });

          setLoadingFunctions(prev => ({ ...prev, [func]: false }));

          return { func, data: response.data };
        })
      );

      const newSourceData = responses.reduce((acc: any, { func, data }) => {
        acc[func] = data?.returns.length > 0 ? data?.returns[0] : data;

        return acc;
      }, {});

      setSourceData(prev => ({ ...prev, ...newSourceData }));
    } catch (error) {
      console.error('Error fetching source data:', error);
      setLoadingFunctions(prev => Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}));
    }
  };

  //console.log('sourceData', sourceData);

  const fetchModuleData = async (fetchModuleDataAccount: string) => {
    setIsLoadingPackages(true);
    try {
      const response = await fetch(`/api/modules?account=${fetchModuleDataAccount}`);
      const data = await response.json();

      setModuleData(data);
      return data;
    } catch (error) {
      console.error('Error fetching module data:', error);
      return null;
    } finally {
      setIsLoadingPackages(false);
    }
  };

  const fetchFunctions = async (fetchFunctionAccount: string) => {
    setIsLoadingModules(true);
    try {
      const response = await fetch(`/api/abis?account=${fetchFunctionAccount}`);
      const data = await response.json();
      setFunctions(data);
      return data;
    } catch (error) {
      console.error('Error fetching functions:', error);
      return null;
    } finally {
      setIsLoadingModules(false);
    }
  };

  const handleFetchModuleData = async () => {
    const address = form.getValues('address');

    if (address) {
      const moduleDataRes = await fetchModuleData(address);
      const functionsData = await fetchFunctions(address);

      if (moduleDataRes) {
        setModuleData(moduleDataRes);
      }
      if (functionsData) {
        setFunctions(functionsData);
      }
    }
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'address' && value.address) {
        handleFetchModuleData();
      }
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  //console.log('form', form.getValues());

  const handleCheckboxChange = (name: 'packages' | 'modules' | 'functions', value: string) => {
    const currentValues = form.getValues(name);
    const newValues = currentValues.includes(value as never)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value];

    setValue(name, newValues as never[], { shouldValidate: true });

    if (name === 'functions') {
      const { address, packages, modules } = form.getValues();

      loadSourceData(address, packages, modules, [value]); // Load data only for the newly selected function
    }
  };

  const uploadDataToApi = async (data: any) => {
    try {
      const response = await axios.post('/api/tools', data);

      console.log('Data uploaded successfully:', response.data);
    } catch (error) {
      console.error('Error uploading data:', error);
    }
  };

  // Function to handle changes in the default value
  const handleDefaultValueChange = (funcName: string, paramName: string, newValue: string) => {
    setSourceData((prevData: any) => {
      const funcData = prevData[funcName] || {};
      const params = funcData.params || {};

      return {
        ...prevData,
        [funcName]: {
          ...funcData,
          params: {
            ...params,
            [paramName]: {
              ...params[paramName],
              default: newValue
            }
          }
        }
      };
    });
  };

  // Function to handle changes in the description
  const handleDescriptionChange = (funcName: string, paramName: string, newDescription: string) => {
    setSourceData((prevData: any) => {
      const funcData = prevData[funcName] || {};
      const params = funcData.params || {};

      return {
        ...prevData,
        [funcName]: {
          ...funcData,
          params: {
            ...params,
            [paramName]: {
              ...params[paramName],
              description: newDescription
            }
          }
        }
      };
    });
  };

  const handleTokenSelection = (funcName: string, paramName: string, tokenAddress: string) => {
    setSourceData((prevData: any) => ({
      ...prevData,
      [funcName]: {
        ...prevData[funcName],
        params: {
          ...prevData[funcName].params,
          [paramName]: {
            ...prevData[funcName].params[paramName],
            tokenAddress: tokenAddress
          }
        },
        type_params: [tokenAddress]
      }
    }));
  };

  const onSubmit = async () => {
    setIsOpenCreateTool(false);
    const selectedFunctions = form.getValues('functions');

    for (const funcName of selectedFunctions) {
      const selectedModule = functions.find((module: any) =>
        module.exposed_functions.some((func: any) => func.name === funcName)
      );
      const selectedFunction = selectedModule?.exposed_functions.find((func: any) => func.name === funcName);

      const toolData = {
        typeName: 'contractTool',
        name: `${form.getValues('address')}::${form.getValues('modules')[0]}::${funcName}`,
        description: sourceData[funcName].description || '',
        params: Object.entries(sourceData[funcName].params).reduce((acc: any, [key, value]: [string, any]) => {
          acc[key] = {
            type: value.type,
            description: value.description
          };

          return acc;
        }, {}),
        type_params: sourceData[funcName].generic_type_params || [],
        typeFunction: selectedFunction?.is_entry ? 'entry' : selectedFunction?.is_view ? 'view' : '',
        functions: funcName,
        userId: userId
      };

      console.log('Tool data:', toolData);
      await uploadDataToApi(toolData);
    }
    handleClose();
    mutate(session ? `/api/tools?userId=${session.user?.id}` : null);
    toast({
      title: 'Tool created successfully!',
      description: 'Your tool has been created successfully.'
    });
    // Clear form data
    form.reset({
      address: '',
      packages: [],
      modules: [],
      functions: []
    });

    // Clear other state
    setModuleData(null);
    setFunctions(null);
    setSourceData({});
    setLoadingFunctions({});
  };

  const { data: toolsData, error: toolsError, isLoading: toolsLoading } = useSWR(`/api/tools?userId=${userId}`, async (url) => {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching tools:', error);
      throw error;
    }
  });


  const { data: coinList, error: coinListError } = useSWR(COIN_LIST_URL, async (url) => {
    try {
      const response = await axios.get(url, {
        responseType: 'text'
      });
      const jsData = response.data;
      // eslint-disable-next-line no-eval
      return eval(jsData);
    } catch (error) {
      console.error('Error fetching or parsing coin list:', error);
      return [];
    }
  });

  const handleClose = () => {
    setIsOpenCreateTool(false);
    // Reset form data
    form.reset({
      address: '',
      packages: [],
      modules: [],
      functions: []
    });

    // Reset other state
    setModuleData(null);
    setFunctions(null);
    setSourceData({});
    setLoadingFunctions({});
    widgetParamsForm.reset();
    setWidgetPrompt('');
    setWidgetCode('');
    setSelectedWidgetTools([]);
    setPreviewWidgetCode('');
    setWidgetParams([]);
  };

  const isFormValid = useCallback(() => {
    const { address, packages, modules, functions: formFunctions } = form.getValues();

    return isValid && address && packages.length > 0 && modules.length > 0 && formFunctions.length > 0;
  }, [form, isValid]);

  const handleCreateApiTool = async (data: any) => {
    try {
      const toolData = {
        typeName: 'apiTool',
        name: data.name,
        description: data.description,
        accessToken: data.accessToken,
        spec: data.spec,
        userId: userId
      };
      await uploadDataToApi(toolData);
      mutate(session ? `/api/tools?userId=${session.user?.id}` : null);
      handleCloseCreateApiTool();
      toast({
        title: 'API Tool created successfully!',
        description: 'Your API Tool has been created successfully.'
      });
    } catch (error) {
      toast({
        title: 'Error creating API Tool',
        description: 'Please try again.'
      });
      console.error('Error creating API Tool:', error);
    }
  };

  const handleCloseCreateApiTool = () => {
    setIsOpenCreateAPITool(false);
    apiToolForm.reset();
  };

  const onchangeWidgetPrompt = (e: any) => {
    setWidgetPrompt(e.target.value);
  };

  const onchangeWidgetCode = (e: any) => {
    setWidgetCode(e.target.value);
  };

  // Add this new function to reset the form and related state
  const resetForm = useCallback(() => {
    widgetForm.reset();
    setWidgetPrompt('');
    setWidgetCode('');
    setSelectedWidgetTools([]);
    setPreviewWidgetCode('');
    setWidgetParams([])
    widgetParamsForm.reset()
  }, [widgetForm,widgetParamsForm]);

  const handleSaveWidget = async () => {
    try {
      const widgetData = {
        typeName: 'widgetTool',
        name: widgetForm.getValues('name'),
        description: widgetForm.getValues('description'),
        prompt: widgetPrompt,
        code: widgetCode,
        toolWidget: selectedWidgetTools,
        params: widgetParamsForm.getValues('params').some((param: any) => param.name.length > 0) ? widgetParamsForm.getValues('params').reduce((acc: any, param: any) => {
          acc[param.name] = {
            description: param.description,
            type: param.type
          };
          return acc;
        }, {}) : {},
        userId: userId
      };

      console.log('widgetData', widgetData);
      const response = await axios.post('/api/tools', widgetData);

      console.log('Widget saved successfully:', response.data);
      setIsOpenCreateWidget(false);
      resetForm();
      mutate(session ? `/api/tools?userId=${session.user?.id}` : null);
      toast({
        title: 'Widget created successfully!',
        description: 'Your widget has been created and saved.'
      });
    } catch (error) {
      console.error('Error saving widget:', error);
      toast({
        title: 'Error creating widget',
        description: 'Please try again.'
      });
    }
  };

  const handlePreviewWidget = async () => {
    try {
      toast({
        title: 'Previewing widget...',
        description: 'Please wait while we generate the preview.'
      });
      const data = {
        prompt: widgetPrompt,
        tool_ids: selectedWidgetTools
      };

      const response = await axios.post('/api/create-widget', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const code = response.data.code;
      setPreviewWidgetCode(code);
      setWidgetCode(code);
      toast({
        title: 'Widget previewed successfully!',
        description: 'Your widget has been previewed successfully.'
      });
      console.log('Previewing widget', response.data);
    } catch (error) {
      console.error('Error previewing widget:', error);
      toast({
        title: 'Error previewing widget',
        description: 'Please try again.'
      });
    }
  };

  const handleCloseCreateWidget = () => {
    setIsOpenCreateWidget(false);
    resetForm();
    setWidgetParams([])

  };


  //console.log(widgetParamsForm.getValues())

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <ChatHeader selectedModelName={selectedModelName} />
      <div className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll scrollbar">
        <div className="flex flex-col w-full h-full items-center max-w-screen-2xl mx-auto ">
          <h1 className="md:text-4xl font-bold text-2xl">Tools</h1>
          <div className="flex flex-row gap-5 w-full mt-12 items-end justify-end">
            <CustomButton onClick={() => setIsOpenCreateAPITool(true)} className='text-xs font-bold'>Create API Tool</CustomButton>
            <CustomButton onClick={() => setIsOpenCreateWidget(true)} className='text-xs font-bold'>Create Widget</CustomButton>
            <CustomButton onClick={() => setIsOpenCreateTool(true)} className='text-xs font-bold'>Create Tool</CustomButton>
          </div>
          <div className='mt-12'>
            {toolsLoading ? (
              <div className="text-center">Loading tools...</div>
            ) : toolsData?.length === 0 ? (
              <div className="text-center">No tools found. Create your first tool!</div>
            ) : (
              <div className="grid w-full grid-cols-3 gap-4">
                {toolsData?.map((tool: any) => (
                  <BoderImage
                    key={tool.id}
                    imageBoder={WidgetFrame2.src} // Use your desired border image URL
                    className="flex flex-col items-start justify-between gap-2 rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <h2 className="text-lg font-semibold">{tool.name}</h2>
                    <span className="rounded text-xs text-gray-500">{tool.typeName || 'Widget'}</span>
                    <p className="text-sm text-white">{tool.description.slice(0, 70) + '...'}</p>
                  </BoderImage>
                ))}
              </div>
            )}
          </div>
        </div>

        <AugmentedPopup visible={isOpenCreateTool} textHeading={'Create Tool from contact'} onClose={handleClose}>
          <form className="flex max-h-[80vh] flex-col gap-3 overflow-y-auto p-8">
            <FormTextField
              error={errors.address}
              form={form}
              label="Contract address"
              name="address"
              isValid={isValid}
            />

            <div className="mb-4">
              <p className="mb-2 text-xl text-white">Packages</p>
              <DropdownSelect
                className="w-full"
                initialValue={form.getValues('packages')[0] || ''}
                options={
                  isLoadingPackages
                    ? [{ value: '', label: 'Loading packages...' }]
                    : moduleData && moduleData.length > 0
                      ? [
                        { value: '', label: 'Choose package' },
                        ...moduleData.map((item: any) => ({ value: item.name, label: item.name }))
                      ]
                      : [{ value: '', label: 'No packages available' }]
                }
                onSelect={selectedOption => {
                  setValue('packages', [selectedOption] as never[], { shouldValidate: true });
                }}
              />
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xl text-white">Modules</p>
              <DropdownSelect
                className="w-full"
                initialValue={form.getValues('modules')[0] || ''}
                options={
                  isLoadingModules
                    ? [{ value: '', label: 'Loading modules...' }]
                    : functions && functions.length > 0
                      ? [
                        { value: '', label: 'Choose module' },
                        ...functions.map((item: any) => ({ value: item.name, label: item.name }))
                      ]
                      : [{ value: '', label: 'No modules available' }]
                }
                onSelect={selectedOption => {
                  setValue('modules', [selectedOption] as never[], { shouldValidate: true });
                }}
              />
            </div>

            {functions && selectedModules && selectedModules?.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 text-xl text-white">Functions</p>
                <div className="flex flex-col gap-3">
                  {functions
                    .filter((item: any) => selectedModules.includes(item.name as never))
                    .flatMap((item: any) =>
                      item.exposed_functions.map((func: any) => (
                        <div key={`${item.name}-${func.name}`}>
                          <label className="mb-2 flex items-center text-[#6B7280]">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={form.getValues('functions').includes(func.name as never)}
                              onChange={() => handleCheckboxChange('functions', func.name)}
                            />
                            {func.name}
                          </label>
                          {form.getValues('functions').includes(func.name as never) && (
                            <div className="ml-6 mt-2">
                              {loadingFunctions[func.name] ? (
                                <div className="flex items-center gap-2">
                                  <p>Loading source data for {func.name}...</p>
                                </div>
                              ) : sourceData[func.name] ? (
                                <div className="flex flex-col gap-2">
                                  {Object.entries(sourceData[func.name].params).map(
                                    ([paramName, paramData]: [string, any]) => (
                                      <div key={paramName} className="flex flex-col gap-2">
                                        <p className="capitalize text-white">{paramName}</p>
                                        <textarea
                                          className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white placeholder:lowercase"
                                          value={paramData.description}
                                          rows={2}
                                          onChange={e => handleDescriptionChange(func.name, paramName, e.target.value)}
                                        />
                                        <input
                                          type="text"
                                          className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white placeholder:lowercase"
                                          value={paramData.default || ''}
                                          placeholder={`Default value`}
                                          onChange={e => handleDefaultValueChange(func.name, paramName, e.target.value)}
                                        />
                                        {func.generic_type_params && func.generic_type_params.length > 0 && (
                                          <div className="mt-2">
                                            <p className="mb-1 text-white">Select Token:</p>
                                            <select
                                              className="w-full rounded border border-gray-600 bg-gray-700 p-2 text-white"
                                              onChange={e => handleTokenSelection(func.name, paramName, e.target.value)}
                                            >
                                              <option value="">Select a token</option>
                                              {coinList.map((coin: any) => (
                                                <option key={coin.address} value={coin.address}>
                                                  {coin.symbol}
                                                </option>
                                              ))}
                                            </select>
                                          </div>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              ) : (
                                <p>Please select a function {func.name} again</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                </div>
              </div>
            )}
            <CustomButton className="w-full md:w-auto" disabled={!isFormValid()} onClick={handleSubmit(onSubmit)}>
              <span className="font-semibold">Create</span>
            </CustomButton>
          </form>
        </AugmentedPopup>
        <AugmentedPopup visible={isOpenCreateAPITool} textHeading={'Create API Tool'} onClose={handleCloseCreateApiTool}>
          <form className="flex max-h-[80vh] flex-col gap-3 overflow-y-auto p-8">
            <FormTextField
              form={apiToolForm}
              label="Name"
              name="name"
              isValid={apiToolForm.formState.isValid}
            />
            <FormTextField
              form={apiToolForm}
              label="Description"
              name="description"
              isValid={apiToolForm.formState.isValid}
            />
            <label htmlFor="apiToolSpec" className="text-xs text-white lg:text-[18px] mb-2">API Tool Specification</label>
            <Textarea
              id="apiToolSpec"
              placeholder={'Enter API Tool Specification'}
              rows={4}
              className="min-h-[120px] text-xs"
              //@ts-ignore
              onChange={e => apiToolForm.setValue('spec', e.target.value)}
            />
            <CustomButton className="w-full md:w-auto" disabled={!apiToolForm.formState.isValid} onClick={apiToolForm.handleSubmit(handleCreateApiTool)}>
              <span className="font-semibold">Create</span>
            </CustomButton>
          </form>
        </AugmentedPopup>
        <AugmentedPopup
          visible={isOpenCreateWidget}
          textHeading={'Create Widget'}
          onClose={handleCloseCreateWidget}
        >
          <form className="flex max-h-[80vh] flex-col gap-4 overflow-y-auto p-8">
            <FormTextField form={widgetForm} name="name" label="Name" />
            <FormTextField form={widgetForm} name="description" label="Description" />
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Select Tools</label>
              <MultiSelectTools
                tools={toolsData || []}
                selectedTools={selectedWidgetTools}
                onChangeSelectedTools={setSelectedWidgetTools}
              />
            </div>
            <div className="mb-5 flex flex-col">
              <div className="flex flex-row items-center justify-between">
                <p className="text-lg font-semibold">Widget Parameters</p>
                <CustomButton onClick={handleAddWidgetParam}>
                  <span className="text-sm font-semibold">Add</span>
                </CustomButton>
              </div>
              {widgetParams.map((param: WidgetParam, index: number) => (
                <form key={index} className="mt-5 flex flex-col gap-3 text-sm">
                  <FormTextField
                    form={widgetParamsForm}
                    name={`params.${index}.name`} // Updated to use dynamic field names
                    label="Name"
                    value={widgetParamsForm.getValues(`params.${index}.name`)} // Get value from form state
                    //@ts-ignore
                    onChange={e => widgetParamsForm.setValue(`params.${index}.name`, e.target.value)} // Update value on change
                  />
                  <FormTextField
                    form={widgetParamsForm}
                    name={`params.${index}.description`} // Updated to use dynamic field names
                    label="Description"
                    value={widgetParamsForm.getValues(`params.${index}.description`)} // Get value from form state
                    //@ts-ignore
                    onChange={e => widgetParamsForm.setValue(`params.${index}.description`, e.target.value)} // Update value on change
                  />
                  <FormTextField
                    form={widgetParamsForm}
                    name={`params.${index}.type`} // Updated to use dynamic field names
                    label="Type"
                    value={widgetParamsForm.getValues(`params.${index}.type`)} // Get value from form state
                    //@ts-ignore
                    onChange={e => widgetParamsForm.setValue(`params.${index}.type`, e.target.value)} // Update value on change
                  />
                  <CustomButton className="text-red-500" onClick={() => handleRemoveWidgetParam(index)}>
                    Remove
                  </CustomButton>
                </form>
              ))}
            </div> 
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Prompt</label>
              <Textarea
                value={widgetPrompt}
                onChange={onchangeWidgetPrompt}
                className="min-h-[100px] text-sm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white">Code</label>
              <Textarea
                value={widgetCode}
                onChange={onchangeWidgetCode}
                className="font-mono min-h-[150px] text-sm"
              />
            </div>
            {previewWidgetCode && (
              <div className="mt-4">
                <label className="mb-2 block text-sm font-medium text-white">Preview</label>
                <ViewFrame code={previewWidgetCode} />
              </div>
            )}
            <div className="flex justify-end gap-4">
              <CustomButton className="w-full md:w-auto" onClick={handlePreviewWidget}>
                <span className="text-sm font-semibold">Preview</span>
              </CustomButton>
              <CustomButton className="w-full md:w-auto" onClick={handleSaveWidget}>
                <span className="text-sm font-semibold">Save</span>
              </CustomButton>
            </div>
          </form>
        </AugmentedPopup>
      </div>
    </div>
  );
}
