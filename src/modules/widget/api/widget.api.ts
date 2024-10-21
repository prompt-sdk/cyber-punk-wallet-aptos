import { API_ENDPOINTS } from '@/common/constants/api-endpoint.constant';
import axiosClient from '@/common/http/http-request';

import { Widget } from '../interfaces/widget.interface';

// import axiosClient from '@/http/http-request';

export const findByUserId = (userId: string) => {
  return axiosClient.get<Widget[]>(API_ENDPOINTS.TOOLS, { params: { userId } });
};

const ToolsApi = {
  findByUserId
};

export default ToolsApi;
