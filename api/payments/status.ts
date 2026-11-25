import { getGatewayStatus, sendJson, type ApiRequest, type ApiResponse } from '../_lib/security.js'

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed.' })
  }
  return sendJson(res, 200, getGatewayStatus())
}
