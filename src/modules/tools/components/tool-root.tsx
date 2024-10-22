'use client';

import { FC, useCallback, useEffect, useState } from 'react';
import { Session } from 'next-auth/types';
import axios from 'axios';
import classNames from 'classnames';
import { useForm, useWatch } from 'react-hook-form';
import { ComponentBaseProps } from '@/common/interfaces';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import CustomButton from '@/libs/svg-icons/input/custom-button';

import { useToast } from '@/hooks/use-toast';

import BoderImage from '@/components/common/border-image';
import DropdownSelect from '@/components/common/dropdown-select-button';

import AugmentedPopup from '@/modules/augmented/components/augmented-popup';
import FormTextField from '@/modules/form/components/form-text-field';

import WidgetFrame2 from '@/assets/svgs/widget-frame-2.svg';

type ToolRootProps = ComponentBaseProps & {
  session: Session | null;
};

const COIN_LIST_URL = 'https://raw.githubusercontent.com/AnimeSwap/coin-list/main/aptos/mainnet.js';

const ToolRoot: FC<ToolRootProps> = ({ className, session }) => {
  const { account } = useWallet();
  const { toast } = useToast();
  const accountAddress = session?.user.username;
  const [isOpenCreateTool, setIsOpenCreateTool] = useState<boolean>(false);
  const [tools, setTools] = useState<any[]>([]);
  const [moduleData, setModuleData] = useState<any>(null);
  const [functions, setFunctions] = useState<any>(null);
  const [sourceData, setSourceData] = useState<Record<string, any>>({});
  // const [isOpenSelectTool, setIsOpenSelectTool] = useState<boolean>(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  console.log('🚀 ~ setSelectedTools:', setSelectedTools);

  console.log('🚀 ~ selectedTools:', selectedTools);
  const [loadingFunctions, setLoadingFunctions] = useState<Record<string, boolean>>({});
  const [coinList, setCoinList] = useState<Array<{ symbol: string; name: string; address: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);

  const form = useForm({
    mode: 'onChange',
    defaultValues: {
      address: '',
      packages: [],
      functions: [],
      modules: []
    }
  });

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
      const response = await axios.get(`/api/modules?account=${fetchModuleDataAccount}`);

      setModuleData(response.data);

      return response.data;
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
      const response = await axios.get(`/api/abis?account=${fetchFunctionAccount}`);
      //console.log('API Response:', response.data);

      // Check if is_entry is present in the response
      // const hasIsEntry = response.data.some((module: any) =>
      //   module.exposed_functions.some((func: any) => 'is_entry' in func)
      // );

      //console.log('Has is_entry property:', hasIsEntry);

      setFunctions(response.data);

      return response.data;
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
        generic_type_params: [tokenAddress]
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
        type: 'contractTool',
        name: `${form.getValues('address')}::${form.getValues('modules')[0]}::${funcName}`,
        tool: {
          name: `${form.getValues('address')}::${form.getValues('modules')[0]}::${funcName}`,
          description: sourceData[funcName].description || '',
          params: Object.entries(sourceData[funcName].params).reduce((acc: any, [key, value]: [string, any]) => {
            acc[key] = {
              type: value.type,
              description: value.description
            };

            return acc;
          }, {}),
          generic_type_params: sourceData[funcName].generic_type_params || [],
          return: sourceData[funcName].return || [],
          type: selectedFunction?.is_entry ? 'entry' : selectedFunction?.is_view ? 'view' : '',
          functions: funcName,
          address: form.getValues('address')
        },
        user_id: accountAddress
      };

      console.log('Tool data:', toolData);
      await uploadDataToApi(toolData);
    }
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
    fetchTools();
  };

  const fetchTools = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = accountAddress;
      const response = await axios.get(`/api/tools?userId=${userId}`);
      const contractTools = response.data.filter((tool: any) => tool.type === 'contractTool');

      setTools(contractTools);
      console.log('contractTools', contractTools);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  // const handleToolSelection = (toolId: string) => {
  //   setSelectedTools(prev => (prev.includes(toolId) ? prev.filter(id => id !== toolId) : [...prev, toolId]));
  // };

  const fetchCoinList = useCallback(async () => {
    try {
      const response = await axios.get(COIN_LIST_URL, {
        responseType: 'text'
      });
      const jsData = response.data;
      // eslint-disable-next-line no-eval
      const coinListArray = eval(jsData);

      //console.log('Parsed coin list:', coinListArray);
      setCoinList(coinListArray);
    } catch (error) {
      console.error('Error fetching or parsing coin list:', error);
      setCoinList([]);
    }
  }, []);

  useEffect(() => {
    fetchCoinList();
  }, [fetchCoinList]);

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
  };

  const isFormValid = useCallback(() => {
    const { address, packages, modules, functions: formFunctions } = form.getValues();

    return isValid && address && packages.length > 0 && modules.length > 0 && formFunctions.length > 0;
  }, [form, isValid]);

  console.log('sourceData', sourceData);

  return (
    <div className={classNames('scrollbar flex w-full grow overflow-hidden py-4', className)}>
      <div className="container flex flex-col items-center gap-6">
        <h1 className="mt-5 text-h5 font-bold">Tools</h1>
        <div className="flex w-full justify-end">
          <CustomButton className="w-full md:w-auto" onClick={() => setIsOpenCreateTool(true)}>
            <span className="font-semibold">Create Tool</span>
          </CustomButton>
        </div>
        {isLoading ? (
          <div className="text-center">Loading tools...</div>
        ) : tools.length === 0 ? (
          <div className="text-center">No tools found. Create your first tool!</div>
        ) : (
          <div className="grid w-full grid-cols-3 gap-4">
            {tools.map((tool: any) => (
              <BoderImage
                key={tool._id}
                imageBoder={WidgetFrame2.src} // Use your desired border image URL
                className="flex flex-col items-start justify-between gap-2 rounded-lg border p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <h2 className="text-lg font-semibold">{tool.name}</h2>
                <span className="rounded text-xs text-gray-500">{tool.tool.type || 'Widget'}</span>
                <p className="text-sm text-white">{tool.tool.description.slice(0, 70) + '...'}</p>
              </BoderImage>
            ))}
          </div>
        )}
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
      </div>
    </div>
  );
};

export default ToolRoot;
