import XCTest
import Network
import Foundation

private struct ParsedRequest {
  let method: String
  let target: String
  let headers: [String: String]
  let body: Data
}

extension RunnerTests {
  // MARK: - Connection Lifecycle

  func handle(connection: NWConnection) {
    receiveRequest(connection: connection, buffer: Data())
  }

  // MARK: - Request Parsing

  private func receiveRequest(connection: NWConnection, buffer: Data) {
    connection.receive(minimumIncompleteLength: 1, maximumLength: 1024 * 1024) { [weak self] data, _, _, _ in
      guard let self = self, let data = data else {
        connection.cancel()
        return
      }
      if buffer.count + data.count > self.maxRequestBytes {
        let response = self.jsonResponse(
          status: 413,
          response: Response(ok: false, error: ErrorPayload(message: "request too large"))
        )
        self.sendResponse(response, over: connection) { [weak self] in
          self?.finish()
        }
        return
      }
      let combined = buffer + data
      if let request = self.parseRequest(data: combined) {
        let result = self.handleRequest(request)
        self.sendResponse(result.data, over: connection) { [weak self] in
          if result.shouldFinish {
            self?.finish()
          }
        }
      } else {
        self.receiveRequest(connection: connection, buffer: combined)
      }
    }
  }

  private func sendResponse(
    _ response: Data,
    over connection: NWConnection,
    afterSend: @escaping () -> Void = {}
  ) {
    connection.send(content: response, isComplete: true, completion: .contentProcessed { error in
      if let error {
        NSLog("AGENT_DEVICE_RUNNER_SEND_FAILED=%@", String(describing: error))
      }
      connection.cancel()
      afterSend()
    })
  }

  private func parseRequest(data: Data) -> ParsedRequest? {
    guard let headerEnd = data.range(of: Data("\r\n\r\n".utf8)) else {
      return nil
    }
    let headerData = data.subdata(in: 0..<headerEnd.lowerBound)
    let bodyStart = headerEnd.upperBound
    let headers = String(decoding: headerData, as: UTF8.self)
    let headerLines = headers.split(separator: "\r\n", omittingEmptySubsequences: false)
    guard let requestLine = headerLines.first else {
      return nil
    }
    let requestParts = requestLine.split(separator: " ", omittingEmptySubsequences: false)
    guard requestParts.count >= 2 else {
      return nil
    }
    let contentLength = extractContentLength(headers: headers, method: String(requestParts[0]).uppercased())
    if data.count < bodyStart + contentLength {
      return nil
    }
    let body = data.subdata(in: bodyStart..<(bodyStart + contentLength))
    return ParsedRequest(
      method: String(requestParts[0]).uppercased(),
      target: String(requestParts[1]),
      headers: extractHeaders(from: Array(headerLines.dropFirst())),
      body: body
    )
  }

  private func extractContentLength(headers: String, method: String) -> Int {
    for line in headers.split(separator: "\r\n") {
      let parts = line.split(separator: ":", maxSplits: 1).map { $0.trimmingCharacters(in: .whitespaces) }
      if parts.count == 2 && parts[0].lowercased() == "content-length" {
        return Int(parts[1]) ?? 0
      }
      if parts.count == 2 && parts[0].lowercased() == "transfer-encoding" {
        return 0
      }
    }
    switch method {
    case "POST", "PUT", "PATCH":
      return 0
    default:
      return 0
    }
  }

  private func extractHeaders(from lines: [Substring]) -> [String: String] {
    var headers: [String: String] = [:]
    for line in lines {
      guard !line.isEmpty else { continue }
      let parts = line.split(separator: ":", maxSplits: 1).map {
        $0.trimmingCharacters(in: .whitespaces)
      }
      guard parts.count == 2 else { continue }
      headers[parts[0]] = parts[1]
    }
    return headers
  }

  private func handleRequest(_ request: ParsedRequest) -> (data: Data, shouldFinish: Bool) {
    NSLog("AGENT_DEVICE_RUNNER_REQUEST=%@ %@", request.method, request.target)
    if request.method == "GET" && request.target == "/health" {
      return (httpResponse(status: 200, headers: ["Content-Type": "application/json"], body: Data("{\"ok\":true}".utf8)), false)
    }
    if request.target == "/command" {
      guard isAuthorizedCommandRequest(request) else {
        return (
          httpResponse(
            status: 401,
            headers: [
              "Content-Type": "application/json",
              "WWW-Authenticate": "Bearer realm=\"agent-device-runner\"",
            ],
            body: Data("{\"ok\":false,\"error\":{\"message\":\"unauthorized\"}}".utf8)
          ),
          false
        )
      }
      return handleCommandRequestBody(request.body)
    }
    if let proxyBaseUrl = RunnerEnv.resolveMetroProxyBaseUrl() {
      return (proxyMetroRequest(request, proxyBaseUrl: proxyBaseUrl), false)
    }
    return (
      httpResponse(status: 404, headers: ["Content-Type": "application/json"], body: Data("{\"ok\":false,\"error\":{\"message\":\"not found\"}}".utf8)),
      false
    )
  }

  private func handleCommandRequestBody(_ body: Data) -> (data: Data, shouldFinish: Bool) {
    guard let json = String(data: body, encoding: .utf8) else {
      return (
        jsonResponse(status: 400, response: Response(ok: false, error: ErrorPayload(message: "invalid json"))),
        false
      )
    }
    guard let data = json.data(using: .utf8) else {
      return (
        jsonResponse(status: 400, response: Response(ok: false, error: ErrorPayload(message: "invalid json"))),
        false
      )
    }

    do {
      let command = try JSONDecoder().decode(Command.self, from: data)
      let response = try execute(command: command)
      return (jsonResponse(status: 200, response: response), command.command == .shutdown)
    } catch {
      return (
        jsonResponse(status: 500, response: Response(ok: false, error: ErrorPayload(message: "\(error)"))),
        false
      )
    }
  }

  private func isAuthorizedCommandRequest(_ request: ParsedRequest) -> Bool {
    guard let expectedToken = RunnerEnv.resolveCommandToken(), !expectedToken.isEmpty else {
      return true
    }
    guard let header = headerValue(named: "Authorization", in: request.headers) else {
      return false
    }
    return header == "Bearer \(expectedToken)"
  }

  private func headerValue(named name: String, in headers: [String: String]) -> String? {
    let normalized = name.lowercased()
    for (key, value) in headers where key.lowercased() == normalized {
      return value
    }
    return nil
  }

  private func proxyMetroRequest(_ request: ParsedRequest, proxyBaseUrl: String) -> Data {
    guard let upstreamUrl = buildProxyUrl(baseUrl: proxyBaseUrl, target: request.target) else {
      NSLog("AGENT_DEVICE_RUNNER_PROXY_INVALID_BASE=%@", RunnerEnv.redactUrlForLog(proxyBaseUrl))
      return httpResponse(
        status: 502,
        headers: ["Content-Type": "text/plain; charset=utf-8"],
        body: Data("invalid metro proxy base url".utf8)
      )
    }
    NSLog("AGENT_DEVICE_RUNNER_PROXY_UPSTREAM=%@", RunnerEnv.redactUrlForLog(upstreamUrl.absoluteString))

    var urlRequest = URLRequest(url: upstreamUrl)
    urlRequest.httpMethod = request.method
    if !request.body.isEmpty {
      urlRequest.httpBody = request.body
    }
    for (name, value) in request.headers {
      let lowercased = name.lowercased()
      if ["host", "connection", "content-length"].contains(lowercased) {
        continue
      }
      urlRequest.setValue(value, forHTTPHeaderField: name)
    }

    let semaphore = DispatchSemaphore(value: 0)
    var responseData: Data?
    var responseStatus = 502
    var responseHeaders: [String: String] = [:]
    var responseError: String?

    let task = URLSession.shared.dataTask(with: urlRequest) { data, response, error in
      defer { semaphore.signal() }
      if let error {
        NSLog("AGENT_DEVICE_RUNNER_PROXY_ERROR=%@", error.localizedDescription)
        responseError = error.localizedDescription
        return
      }
      if let httpResponse = response as? HTTPURLResponse {
        NSLog(
          "AGENT_DEVICE_RUNNER_PROXY_STATUS=%d %@",
          httpResponse.statusCode,
          RunnerEnv.redactUrlForLog(upstreamUrl.absoluteString)
        )
        responseStatus = httpResponse.statusCode
        for (name, value) in httpResponse.allHeaderFields {
          guard let key = name as? String else { continue }
          responseHeaders[key] = String(describing: value)
        }
      }
      responseData = data ?? Data()
    }
    task.resume()

    let waitResult = semaphore.wait(timeout: .now() + 30)
    if waitResult == .timedOut {
      task.cancel()
      return httpResponse(
        status: 504,
        headers: ["Content-Type": "text/plain; charset=utf-8"],
        body: Data("metro proxy timed out".utf8)
      )
    }

    if let responseError {
      return httpResponse(
        status: 502,
        headers: ["Content-Type": "text/plain; charset=utf-8"],
        body: Data(responseError.utf8)
      )
    }

    return httpResponse(status: responseStatus, headers: responseHeaders, body: responseData ?? Data())
  }

  private func buildProxyUrl(baseUrl: String, target: String) -> URL? {
    guard var baseComponents = URLComponents(string: baseUrl) else {
      return nil
    }
    let requestComponents = URLComponents(string: target)
    let requestPath = requestComponents?.path ?? target
    let normalizedRequestPath = requestPath.hasPrefix("/") ? String(requestPath.dropFirst()) : requestPath
    if !baseComponents.path.hasSuffix("/") {
      baseComponents.path += "/"
    }
    baseComponents.path += normalizedRequestPath
    let baseQueryItems = baseComponents.queryItems ?? []
    let requestQueryItems = requestComponents?.queryItems ?? []
    baseComponents.queryItems = baseQueryItems + requestQueryItems
    return baseComponents.url
  }

  // MARK: - Response Encoding

  private func jsonResponse(status: Int, response: Response) -> Data {
    let encoder = JSONEncoder()
    let body = (try? encoder.encode(response)).flatMap { String(data: $0, encoding: .utf8) } ?? "{}"
    return httpResponse(
      status: status,
      headers: ["Content-Type": "application/json"],
      body: Data(body.utf8)
    )
  }

  private func httpResponse(status: Int, headers: [String: String], body: Data) -> Data {
    let forbiddenHeaders = Set([
      "connection",
      "content-length",
      "content-encoding",
      "keep-alive",
      "proxy-authenticate",
      "proxy-authorization",
      "te",
      "trailer",
      "transfer-encoding",
      "upgrade",
    ])
    var headerLines = [
      "HTTP/1.1 \(status) OK",
      "Connection: close",
      "Content-Length: \(body.count)",
    ]
    for (name, value) in headers where !name.isEmpty && !value.isEmpty {
      if forbiddenHeaders.contains(name.lowercased()) {
        continue
      }
      headerLines.append("\(name): \(value)")
    }
    headerLines.append("")
    let headerData = Data(headerLines.joined(separator: "\r\n").utf8) + Data("\r\n".utf8)
    return headerData + body
  }

  private func finish() {
    listener?.cancel()
    listener = nil
    doneExpectation?.fulfill()
  }
}
