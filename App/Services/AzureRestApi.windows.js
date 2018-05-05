import CryptoJS from 'crypto-js'
import utf8 from 'utf8'
import AuthenticationContext from 'react-native-ms-adal/msadal/AuthenticationContext'

const authority = 'https://login.microsoftonline.com';
const clientId = '<YOUR_APPLICATION_ID>';
const redirectUri = 'x-msauth-AzureIoTDevKitCompanion://com.microsoft.AzureIoTDevKitCompanion';
const resourceUri = 'https://management.azure.com/';

// URIs
const subscriptionsUri = 'https://management.azure.com/subscriptions?api-version=2016-06-01';
let currentTenant = null;

function getDefaultOptions(accessToken, method, body) {
  return {
    method: method || 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: body && JSON.stringify(body)
  };
}

function getSasOptions(sasToken, method, body) {
  return {
    method: method || 'GET',
    headers: {
      Authorization: sasToken,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: body && JSON.stringify(body)
  };
}

function getQueryString(params) {
  const keyValuePairs = [];
  for (const key in params) {
    keyValuePairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
  }
  return keyValuePairs.join('&');
}

function getEndpoint() {
  return `${authority}/${currentTenant || 'common'}`
}

export function setTenant(tenant) {
  currentTenant = tenant;
}

export function interactiveLoginToAzure() {
  const endpoint = getEndpoint()
  return new Promise(function (resolve, reject) {
    let context = new AuthenticationContext(endpoint);
    // We require user credentials, so this triggers the authentication dialog box
    context.acquireTokenAsync(resourceUri, clientId, redirectUri).then(
      function (authDetails) {
        resolve(authDetails);
      },
      function (err) {
        reject(err);
      }
    );
  });
}

export function loginToAzure() {
  const endpoint = getEndpoint()
  return new Promise(function (resolve, reject) {
    let context = new AuthenticationContext(endpoint);
    // Attempt to authorize the user silently
    context.acquireTokenSilentAsync(resourceUri, clientId).then(
      function (authDetails) {
        resolve(authDetails);
      },
      function () {
        // We require user credentials, so this triggers the authentication dialog box
        context.acquireTokenAsync(resourceUri, clientId, redirectUri).then(
          function (authDetails) {
            resolve(authDetails);
          },
          function (err) {
            reject(err);
          }
        );
      }
    );
  });
}

export function logoutFromAzure() {
  const endpoint = getEndpoint()
  const uri = `${endpoint}/oauth2/logout?post_logout_redirect_uri=${redirectUri}`
  return fetch(uri).then(response => {
    currentTenant = null;
    return response;
  });
}

function callApiWithLogin(uri, method, body) {
  return loginToAzure().then(authDetails => {
    return callApi(uri, authDetails.accessToken, method, body);
  });
}

function callApi(uri, accessToken, method, body) {
  const options = getDefaultOptions(accessToken, method, body);
  return fetch(uri, options)
    .then(async (response) => {
      if (response.status >= 400) {
        const body = await response.json();
        const message = body.error && body.error.message;
        throw new Error(message)
      }

      return response ? response.json(response) : '';
    })
    .then(results => {
      if (results && results.value) {
        return results.value;
      }

      return results;
    })
}

export function getSubscriptions(accessToken) {
  return accessToken ?
    callApi(subscriptionsUri, accessToken) :
    callApiWithLogin(subscriptionsUri)
}

export function getResourceGroups(subscriptionId) {
  const resourceGroupsUri = `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups?api-version=2017-05-10`;
  return callApiWithLogin(resourceGroupsUri)
}

export function createResourceGroup(subscriptionId, name, location) {
  const resourceGroupUri = `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups/${name}?api-version=2017-05-10`;
  const body = {
    location
  };
  return callApiWithLogin(resourceGroupUri, 'PUT', body)
}

export function checkResourceGroupNameAvailability(subscriptionId, name) {
  // return 204 if found, 404 otherwise
  const uri = `https://management.azure.com/subscriptions/${subscriptionId}/resourcegroups/${name}?api-version=2017-05-10`;

  return loginToAzure().then(authDetails => {
    const options = getDefaultOptions(authDetails.accessToken, 'HEAD');
    return fetch(uri, options)
      .then(response => {
        return {
          nameAvailable: response.status === 404
        };
      })
  });
}

export function getHubs(subscriptionId) {
  const hubsUri = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Devices/IotHubs?api-version=2017-01-19`;
  return callApiWithLogin(hubsUri)
}

export function getHub(subscriptionId, resourceGroup, hubName) {
  const hubUri = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Devices/IotHubs/${hubName}?api-version=2017-01-19`
  return callApiWithLogin(hubUri)
}

export async function getHubAccessKey(subscriptionId, resourceGroup, hubName) {
  const hubKeyUri = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Devices/IotHubs/${hubName}/listkeys?api-version=2018-04-01`;
  try {
    const keys = await callApiWithLogin(hubKeyUri, 'POST')
    const ownerKey = keys.find(key => key.keyName === 'iothubowner');
    return ownerKey;
  } catch (error) {
    console.log(error)
    return error;
  }
}

export function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function createHub(subscriptionId, resourceGroup, hubName, location, sku) {
  const hubUri = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Devices/IotHubs/${hubName}?api-version=2017-01-19`
  const body = {
    location: location,
    subscriptionid: subscriptionId,
    resourcegroup: resourceGroup,
    sku: { name: sku, capacity: 1 }
  };

  return loginToAzure().then(async (authDetails) => {
    const options = getDefaultOptions(authDetails.accessToken, 'PUT', body);
    try {
      const response = await fetch(hubUri, options)

      if (response.status >= 400) {
        const body = await response.json();
        const message = body.Message || body.error && body.error.message;
        throw new Error(message || 'Error creating IoT hub')
      }

      if (response.status === 201) {
        const azureAsyncOp = response.headers.get('azure-asyncoperation');
        if (azureAsyncOp) {
          let waiting = true
          while (waiting) {
            const statusOptions = getDefaultOptions(authDetails.accessToken)
            const response = await fetch(azureAsyncOp, statusOptions)
              .then(response => response.json())
              .then(results => results)

            if (response.status === 'Succeeded') {
              waiting = false
              return getHub(subscriptionId, resourceGroup, hubName)
            }

            await sleep(5000)
          }
        }
      }

      return response.json().then(results => results)
    } catch (error) {
      console.log(error)
      return Promise.reject(error)
    }
  })
}

export function checkHubNameAvailability(subscriptionId, name) {
  /**
   * If available, returns:
   * {
   * "nameAvailable": true,
   * "reason": "Invalid",
   * "message": null
   * }
   * 
   * If not available, returns:
   * {
   * "nameAvailable": false,
   * "reason": "AlreadyExists",
   * "message": "IotHub name 'malloutesthub' not available"
   * }
   */
  const uri = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Devices/checkNameAvailability?api-version=2017-01-19`;
  return callApiWithLogin(uri, 'POST', { Name: name });
}

export function getHubValidSkus() {
  const skus = [
    { name: 'F1', tier: 'Free' },
    { name: 'S1', tier: 'Standard' },
    { name: 'S2', tier: 'Standard' },
    { name: 'S3', tier: 'Standard' }
  ];

  return skus;
}

export function getDevices(hostName, hubAccessKey) {
  const uri = `https://${hostName}/devices?api-version=2016-11-14`;
  const sasToken = generateSharedAccessToken(hostName, 'iothubowner', hubAccessKey);
  const options = getSasOptions(sasToken);

  return fetch(uri, options)
    .then(response => response.json(response))
}

export function createDevice(hostName, deviceId, hubAccessKey, deviceType) {
  const uri = `https://${hostName}/devices/${deviceId}?api-version=2016-11-14`;
  const sasToken = generateSharedAccessToken(hostName, 'iothubowner', hubAccessKey);
  const body = {
    deviceId,
    capabilities: {
      iotEdge: deviceType === 'iotedge'
    }
  };
  const options = getSasOptions(sasToken, 'PUT', body);

  return fetch(uri, options)
    .then(response => response.json(response))
}

export function updateDeviceTags(hostName, deviceId, hubAccessKey, tags) {
  const uri = `https://${hostName}/twins/${deviceId}?api-version=2016-11-14`;
  const sasToken = generateSharedAccessToken(hostName, 'iothubowner', hubAccessKey);
  const options = getSasOptions(sasToken, 'PATCH', { tags });

  return fetch(uri, options)
    .then(response => response.json(response))
}

export function getIoTHubLocations(subscriptionId) {
  const availableLocations = [
    'eastus',
    'eastus2',
    'centralus',
    'southcentralus',
    'westcentralus',
    'westus',
    'westus2',
    'canadaeast',
    'canadacentral',
    'brazilsouth',
    'northeurope',
    'westeurope',
    'ukwest',
    'uksouth',
    'germanycentral',
    'germanynortheast',
    'southeastasia',
    'eastasia',
    'australiaeast',
    'australiasoutheast',
    'centralindia',
    'southindia',
    'japaneast',
    'japanwest',
    'koreacentral',
    'koreasouth'
  ];
  const locationsUri = `https://management.azure.com/subscriptions/${subscriptionId}/locations?api-version=2016-06-01`;
  return callApiWithLogin(locationsUri).then(locations => {
    return locations.filter(l => availableLocations.indexOf(l.name) !== -1)
  })
}

export function getDevice(hostName, deviceId, hubAccessKey) {
  const uri = `https://${hostName}/devices/${deviceId}?api-version=2016-11-14`;
  const sasToken = generateSharedAccessToken(hostName, 'iothubowner', hubAccessKey);
  const options = getSasOptions(sasToken);

  return fetch(uri, options)
    .then(response => response.json(response))
}

export function getDeviceTwin(hostName, deviceId, hubAccessKey) {
  const uri = `https://${hostName}/twins/${deviceId}?api-version=2016-11-14`;
  const sasToken = generateSharedAccessToken(hostName, 'iothubowner', hubAccessKey);
  const options = getSasOptions(sasToken);

  return fetch(uri, options)
    .then(response => response.json(response))
}

export function setPassword(hub, deviceId, hubAccessKey, user, password) {
  const wordArray = CryptoJS.enc.Utf8.parse(password);
  const base64Pass = CryptoJS.enc.Base64.stringify(wordArray);

  const tags = {
    credentials: {
      user: user,
      password: base64Pass
    }
  };

  return updateDeviceTags(hub.properties.hostName, deviceId, hubAccessKey, tags)
}

export function checkRegistryNameAvailability(subscriptionId, name) {
  const uri = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.ContainerRegistry/checkNameAvailability?api-version=2017-10-01`;
  const body = {
    name,
    type: 'Microsoft.ContainerRegistry/registries'
  };

  return callApiWithLogin(uri, 'POST', body)
}

export function createContainerRegistry(subscriptionId, resourceGroup, name, location, sku) {
  const uri = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.ContainerRegistry/registries/${name}?api-version=2017-10-01`;
  const body = {
    sku: {
      name: sku || 'Basic',
      tier: sku || 'Basic'
    },
    location,
    properties: {
      adminUserEnabled: true
    }
  };

  return callApiWithLogin(uri, 'PUT', body)
}

export function getContainerRegistries(subscriptionId) {
  const uri = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.ContainerRegistry/registries?api-version=2017-10-01`;
  return callApiWithLogin(uri)
}

export function getRegistryValidSkus() {
  const skus = [
    { name: 'Basic', tier: 'Basic' },
    { name: 'Classic', tier: 'Classic' },
    { name: 'Premium', tier: 'Premium' },
    { name: 'Standard', tier: 'Standard' }
  ];

  return skus;
}

export function getContainerRegistryCredentials(registryId) {
  const uri = `https://management.azure.com${registryId}/listCredentials?api-version=2017-10-01`;
  return callApiWithLogin(uri, 'POST')
    .then(result => {
      const pw = result.passwords.find(p => p.name === 'password')
      return {
        username: result.username,
        password: pw.value
      };
    })
}

export function callButtonApi(uri, body) {
  const options = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    timeout: 10
  };

  return fetch(uri, options)
    .then(response => response.json(response))
}

export async function connectButton(host, ssid, passphrase, hubHost, deviceId, deviceKey) {
  const wifiUri = `http://${host}/config/wifi`;
  await callButtonApi(wifiUri, { ssid, password: passphrase })

  const hubUri = `http://${host}/config/iothub`;
  await callButtonApi(hubUri, { iothub: hubHost, iotdevicename: deviceId, iotdevicesecret: deviceKey })

  const opsmodeUri = `http://${host}/config/opsmode`;
  callButtonApi(opsmodeUri, { opsmode: 'client' }).catch(error => console.log(error))
}

// https://docs.microsoft.com/en-us/rest/api/storagerp/storageaccounts/create
export async function createStorageAccount(subscriptionId, resourceGroup, name, location, sku) {
  const checkUri = `https://management.azure.com/subscriptions/${subscriptionId}/providers/Microsoft.Storage/checkNameAvailability?api-version=2017-06-01`;
  const uri = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Storage/storageAccounts/${name}?api-version=2017-06-01`;

  const checkNameResponse = await callApiWithLogin(checkUri, 'POST', { name, type: 'Microsoft.Storage/storageAccounts' })
  if (!checkNameResponse.nameAvailable) {
    return Promise.reject(checkNameResponse)
  }

  const body = {
    sku: {
      name: sku || 'Standard_LRS'
    },
    kind: 'Storage',
    location
  };

  return loginToAzure().then(authDetails => {
    const options = getDefaultOptions(authDetails.accessToken, 'PUT', body);
    return fetch(uri, options)
      .then(async (response) => {
        if (response.status >= 400) {
          const body = await response.json();
          const message = body.error && body.error.message;
          throw new Error(message || 'Error creating storage account')
        }

        if (response.status === 202) {
          let waiting = true;
          while (waiting) {
            try {
              const storageAccount = await getStorageAccount(subscriptionId, resourceGroup, name)

              if (storageAccount.properties.provisioningState === 'Succeeded') {
                waiting = false;
                return await listStorageAccountKeys(subscriptionId, resourceGroup, name)
              }
            } catch (error) {
              console.log(error)
            }

            await sleep(5000)
          }
        } else {
          return response.json().then(results => results)
        }
      })
  })
}

export async function getStorageAccount(subscriptionId, resourceGroup, name) {
  const uri = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Storage/storageAccounts/${name}?api-version=2017-06-01`;
  return callApiWithLogin(uri)
}

export async function listStorageAccountKeys(subscriptionId, resourceGroup, name) {
  const uri = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Storage/storageAccounts/${name}/listKeys?api-version=2017-06-01`;
  return callApiWithLogin(uri, 'POST')
}

// https://docs.microsoft.com/en-us/rest/api/appservice/appserviceplans/createorupdate
export async function createAppServicePlan(subscriptionId, resourceGroup, name, location, sku) {
  const uri = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/serverfarms/${name}?api-version=2016-09-01`;
  const defaultSku = {
    name: 'S1',
    tier: 'STANDARD'
  };
  const body = {
    sku: sku || defaultSku,
    location,
    properties: {
      name
    }
  };

  return callApiWithLogin(uri, 'PUT', body)
}

// https://docs.microsoft.com/en-us/rest/api/appservice/webapps/createorupdatesourcecontrol
export async function createSourceControl(subscriptionId, resourceGroup, name, repoUrl, branch) {
  const uri = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/sites/${name}/sourcecontrols/web?api-version=2016-08-01`;
  const body = {
    properties: {
      repoUrl: repoUrl || 'https://github.com/ongk/iothubtestfunction',
      branch: branch || 'master',
      isManualIntegration: true
    }
  };

  return loginToAzure().then(authDetails => {
    const options = getDefaultOptions(authDetails.accessToken, 'PUT', body);
    return fetch(uri, options)
      .then(async (response) => {
        if (response.status >= 400) {
          const body = await response.json();
          const message = body.error && body.error.message;
          throw new Error(message || 'Error creating source control')
        }

        if (response.status === 201) {
          let waiting = true;
          while (waiting) {
            try {
              const sourceControl = await getSourceControl(subscriptionId, resourceGroup, name)

              if (sourceControl.properties.provisioningState === 'Succeeded') {
                waiting = false;
                return sourceControl
              }
            } catch (error) {
              console.log(error)
            }

            await sleep(5000)
          }
        } else {
          return response.json().then(results => results)
        }
      })
  })
}

export async function getSourceControl(subscriptionId, resourceGroup, name) {
  const uri = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/sites/${name}/sourcecontrols/web?api-version=2016-08-01`;
  return callApiWithLogin(uri)
}

// https://docs.microsoft.com/en-us/rest/api/appservice/webapps/createorupdate
export async function createFunctionApp(subscriptionId, resourceGroup, name, location, planId, storageAccountConnectionString, hubConnectionString, eventHubConnectionString) {
  const uri = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/sites/${name}?api-version=2016-08-01`;
  const body = {
    kind: 'functionapp',
    location,
    properties: {
      clientAffinityEnabled: false,
      serverFarmId: planId,
      siteConfig: {
        alwaysOn: true,
        appSettings: [
          { name: 'FUNCTIONS_EXTENSION_VERSION', value: '~1' },
          { name: 'AzureWebJobsStorage', value: storageAccountConnectionString },
          { name: 'AzureWebJobsDashboard', value: storageAccountConnectionString },
          { name: 'AzureIoTHubConnectionString', value: hubConnectionString },
          { name: 'AzureIoTHubEventHubConnectionString', value: eventHubConnectionString }
        ]
      }
    }
  };

  return loginToAzure().then(authDetails => {
    const options = getDefaultOptions(authDetails.accessToken, 'PUT', body);
    return fetch(uri, options)
      .then(async (response) => {
        if (response.status >= 400) {
          const body = await response.json();
          const message = body.error && body.error.message;
          throw new Error(message || 'Error creating function app')
        }

        if (response.status === 202) {
          let waiting = true;
          while (waiting) {
            try {
              const app = await getApp(subscriptionId, resourceGroup, name)

              if (app.properties.state === 'Running') {
                waiting = false;
                return app
              }
            } catch (error) {
              console.log(error)
            }

            await sleep(5000)
          }
        } else if (response.status === 200) {
          return response.json().then(results => results)
        }
      })
  })
}

export async function getApp(subscriptionId, resourceGroup, name) {
  const uri = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/sites/${name}?api-version=2016-08-01`;
  return callApiWithLogin(uri)
}

// https://docs.microsoft.com/en-us/rest/api/appservice/webapps/createfunction
export async function createFunction(subscriptionId, resourceGroup, name, functionName, iotHubName) {
  const uri = `https://management.azure.com/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/Microsoft.Web/sites/${name}/functions/${functionName}?api-version=2016-08-01`;
  const body = {
    properties: {
      config: {
        bindings: [
          {
            name: "IoTButtonMessages",
            direction: 'in',
            type: 'eventHubTrigger',
            path: iotHubName,
            connection: 'AzureIoTHubEventHubConnectionString',
            cardinality: 'many',
            consumerGroup: '$Default'
          }
        ],
        disabled: false
      },
      testData: `TestMessage`
    }
  };

  return callApiWithLogin(uri, 'PUT', body)
}

function generateSharedAccessToken(resourceUri, saKeyName, saKey) {
  if (!resourceUri || !saKeyName || !saKey) {
    throw 'Missing required parameter';
  }

  const now = new Date();
  const expiry = Math.round(now.getTime() / 1000) + (60 * 60);
  const skn = encodeUriComponentStrict(saKeyName);
  const signature = resourceUri + '\n' + expiry;
  const wordArray = CryptoJS.enc.Base64.parse(saKey);
  const hmacHash = CryptoJS.HmacSHA256(signature, wordArray);
  const base64String = CryptoJS.enc.Base64.stringify(hmacHash);
  const sig = encodeUriComponentStrict(base64String);

  return 'SharedAccessSignature sr=' + resourceUri + '&sig=' + sig + '&se=' + expiry + '&skn=' + skn;
}

function encodeUriComponentStrict(str) {
  // this stricter version of encodeURIComponent is a recommendation straight out of the MDN docs, see:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent#Description
  return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}
