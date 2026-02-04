export default class ApiCaller 
{
    _baseUrl = ''
    constructor(URL = 'https://localhost:7211/api') {
        this._baseUrl = URL
        this._token = ''
    }

    setBaseUrl(url) {
        console.debug(`*** call-api: új base url: ${url}`)
        this._baseUrl = url
    }

    _token = ''
    setToken(token) {
        console.debug(`*** call-api: új token: ${token}`)
        this._token = token
    }

    _options = {
    body: null,
    headers: new Headers({'content-type': 'application/json', 'Authorization': ''}),
    method: 'get',
    mode: 'cors',
    }

    prepareCall(method, data) 
    {
        this._options.body = data != null ? JSON.stringify(data) : null
        this._options.method = method
        if (this._token) 
        {
            this._options.headers.set('Authorization', `Bearer ${this._token}`)
        }
    }

    callApiThen(url, method = 'get', data = null) 
    {
        this.prepareCall(method, data)
        return fetch(`${this._baseUrl}/${url}`, this._options)
        .then(resp => resp.json())
        .then(json => json)
        .catch(reason => {
            console.error('*** callApiThen: ' + reason)
            throw reason
        })
    }
    async callApiAsync(url, method, data, json = true, params = null) {
    this.prepareCall(method, data)
    try {
            let resp = await fetch(`${this._baseUrl}/${url}${params ? `/${params}` : ''}`, this._options)
            if(json)
                {
                    return await resp.json()
                }
            else
                {
                    return await resp.text()
                }
            
        } catch (reason) {
            console.error('*** callApiAsync: ' + reason)
            throw reason
        }
    }

}