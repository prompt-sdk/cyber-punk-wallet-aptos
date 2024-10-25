export function fillUrl(template: any, params: any) {
    return template.replace(/{(\w+)}/g, (_: any, key: any) => params[key]);
}
export async function makeToolApiRequest(accessToken: string, endpoint: string, payload = null, method = 'GET', typeRequest: string) {

    if (method == "parameters") {

        endpoint = fillUrl(endpoint, payload)
        console.log("payload", endpoint)
    }
    const headers: any = {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
    };
    if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`
    }
    const options: any = {
        method,
        headers
    };
    if (typeRequest == 'application/json') {
        headers["Content-Type"] = 'application/json';
        if (payload) {
            options.body = JSON.stringify(payload);
        }
    }
    if (typeRequest == 'application/octet-stream') {
        headers["Content-Type"] = 'application/octet-stream';
        if (payload) {
            options.body = payload;
        }
    }

    if (typeRequest == 'application/x-www-form-urlencoded') {
        headers["Content-Type"] = 'application/x-www-form-urlencoded';

        if (payload) {
            const data = new URLSearchParams(payload);
            options.body = data;
        }
    }

    try {
        const response = await fetch(endpoint, options);

        // if (!response.ok) {
        //     if (response.status === 401) {
        //         throw new Error('Unauthorized: Invalid or expired token.');
        //     }
        //     throw new Error(`Error: ${response.status} ${response.statusText}`);
        // }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to make API request:', error);
        return `Failed to make API request: ${error}`;
    }
}
