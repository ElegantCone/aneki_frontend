import {API_MODE} from './config.js'
import {httpAppApi} from './http/appApi.js'
import {mockAppApi} from './mock/appApi.js'

export const appApi = API_MODE === 'http' ? httpAppApi : mockAppApi

