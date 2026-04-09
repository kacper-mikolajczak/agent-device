import Foundation

// MARK: - Environment

enum RunnerEnv {
  static func resolvePort() -> UInt16 {
    if let env = ProcessInfo.processInfo.environment["AGENT_DEVICE_RUNNER_PORT"], let port = UInt16(env) {
      return port
    }
    for arg in CommandLine.arguments {
      if arg.hasPrefix("AGENT_DEVICE_RUNNER_PORT=") {
        let value = arg.replacingOccurrences(of: "AGENT_DEVICE_RUNNER_PORT=", with: "")
        if let port = UInt16(value) { return port }
      }
    }
    return 0
  }

  static func resolveBindHost() -> String? {
    if let env = resolveEnvValue(named: "AGENT_DEVICE_RUNNER_HOST") {
      return env
    }
    if let env = resolveEnvValue(named: "USE_IP") {
      return env
    }
    return nil
  }

  static func resolveMetroProxyBaseUrl() -> String? {
    resolveEnvValue(named: "AGENT_DEVICE_METRO_PROXY_BASE_URL")
  }

  static func resolveCommandToken() -> String? {
    resolveEnvValue(named: "AGENT_DEVICE_RUNNER_COMMAND_TOKEN")
  }

  static func redactUrlForLog(_ rawUrl: String) -> String {
    guard var components = URLComponents(string: rawUrl) else {
      return rawUrl
    }
    components.query = nil
    components.fragment = nil
    return components.string ?? rawUrl
  }

  static func isTruthy(_ name: String) -> Bool {
    guard let raw = ProcessInfo.processInfo.environment[name] else {
      return false
    }
    switch raw.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() {
    case "1", "true", "yes", "on":
      return true
    default:
      return false
    }
  }

  private static func resolveEnvValue(named name: String) -> String? {
    if let env = ProcessInfo.processInfo.environment[name]?.trimmingCharacters(in: .whitespacesAndNewlines), !env.isEmpty {
      return env
    }
    for arg in CommandLine.arguments {
      if arg.hasPrefix("\(name)=") {
        let value = arg.replacingOccurrences(of: "\(name)=", with: "").trimmingCharacters(in: .whitespacesAndNewlines)
        if !value.isEmpty {
          return value
        }
      }
    }
    return nil
  }
}
