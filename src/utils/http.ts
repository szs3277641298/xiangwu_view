import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResult } from '@/types/bigscreen'
import { message } from '@/plugins/naive'

type AnyObject = Record<string, any>

const toCamelCase = (key: string) =>
  key
    .replace(/[-_\s]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : ''))
    .replace(/^(.)/, (match) => match.toLowerCase())

export const normalizeKeys = (input: any): any => {
  if (Array.isArray(input)) {
    return input.map(item => normalizeKeys(item))
  }

  if (input !== null && typeof input === 'object') {
    return Object.keys(input as AnyObject).reduce<AnyObject>((acc, key) => {
      const value = (input as AnyObject)[key]
      acc[toCamelCase(key)] = normalizeKeys(value)
      return acc
    }, {})
  }

  return input
}

const http = axios.create({
  baseURL: '',
  timeout: 15000
})

http.interceptors.request.use((config: AxiosRequestConfig) => {
  return config
})

http.interceptors.response.use(
  (response: AxiosResponse<ApiResult<any>>) => {
    const payload = response.data

    if (payload && typeof payload === 'object') {
      if (payload.code === 200) {
        return normalizeKeys(payload.data)
      }

      message.error(payload.msg || '请求失败，请稍后重试')
      return Promise.reject(new Error(payload.msg || '请求失败'))
    }

    return normalizeKeys(payload)
  },
  (error) => {
    const errMsg = error?.response?.data?.msg || error.message || '网络异常'
    message.error(errMsg)
    return Promise.reject(error)
  }
)

export default http
