//
//  RunnerTests.swift
//  AgentDeviceRunnerUITests
//
//  Created by Michał Pierzchała on 30/01/2026.
//

import XCTest
import Network
#if canImport(UIKit)
import UIKit
typealias RunnerImage = UIImage
#elseif canImport(AppKit)
import AppKit
typealias RunnerImage = NSImage
#endif

final class RunnerTests: XCTestCase {
  enum RunnerErrorDomain {
    static let general = "AgentDeviceRunner"
    static let exception = "AgentDeviceRunner.NSException"
  }

  enum RunnerErrorCode {
    static let noResponseFromMainThread = 1
    static let commandReturnedNoResponse = 2
    static let mainThreadExecutionTimedOut = 3
    static let objcException = 1
  }

  static let springboardBundleId = "com.apple.springboard"
  static let defaultRecordingFps: Int32 = 15
  var listener: NWListener?
  var doneExpectation: XCTestExpectation?
  lazy var app = XCUIApplication()
  lazy var springboard = XCUIApplication(bundleIdentifier: Self.springboardBundleId)
  var currentApp: XCUIApplication?
  var currentBundleId: String?
  let maxRequestBytes = 2 * 1024 * 1024
  let maxSnapshotElements = 600
  let fastSnapshotLimit = 300
  let mainThreadExecutionTimeout: TimeInterval = 30
  let appExistenceTimeout: TimeInterval = 30
  let retryCooldown: TimeInterval = 0.2
  let postSnapshotInteractionDelay: TimeInterval = 0.2
  let firstInteractionAfterActivateDelay: TimeInterval = 0.25
  let scrollInteractionIdleTimeoutDefault: TimeInterval = 1.0
  let tvRemoteDoublePressDelayDefault: TimeInterval = 0.0
  let minRecordingFps = 1
  let maxRecordingFps = 120
  var needsPostSnapshotInteractionDelay = false
  var needsFirstInteractionDelay = false
  var activeRecording: ScreenRecorder?
  let interactiveTypes: Set<XCUIElement.ElementType> = [
    .button,
    .cell,
    .checkBox,
    .collectionView,
    .link,
    .menuItem,
    .picker,
    .searchField,
    .segmentedControl,
    .slider,
    .stepper,
    .switch,
    .tabBar,
    .textField,
    .secureTextField,
    .textView
  ]
  // Keep blocker actions narrow to avoid false positives from generic hittable containers.
  let actionableTypes: Set<XCUIElement.ElementType> = [
    .button,
    .cell,
    .link,
    .menuItem,
    .checkBox,
    .switch
  ]

  // MARK: - XCTest Entry

  override func setUp() {
    continueAfterFailure = true
  }

  @MainActor
  func testCommand() throws {
    doneExpectation = expectation(description: "agent-device command handled")
    let queue = DispatchQueue(label: "agent-device.runner")
    let desiredPort = RunnerEnv.resolvePort()
    let desiredHost = RunnerEnv.resolveBindHost()
    NSLog("AGENT_DEVICE_RUNNER_DESIRED_PORT=%d", desiredPort)
    if let desiredHost {
      NSLog("AGENT_DEVICE_RUNNER_BIND_HOST=%@", desiredHost)
    } else {
      NSLog("AGENT_DEVICE_RUNNER_BIND_HOST=default")
    }
    if let metroProxyBaseUrl = RunnerEnv.resolveMetroProxyBaseUrl() {
      NSLog(
        "AGENT_DEVICE_RUNNER_METRO_PROXY_BASE_URL=%@",
        RunnerEnv.redactUrlForLog(metroProxyBaseUrl)
      )
    }
    listener = try makeRunnerListener(desiredPort: desiredPort, desiredHost: desiredHost)
    listener?.stateUpdateHandler = { [weak self] state in
      switch state {
      case .ready:
        NSLog("AGENT_DEVICE_RUNNER_LISTENER_READY")
        if let listenerPort = self?.listener?.port {
          NSLog("AGENT_DEVICE_RUNNER_PORT=%d", listenerPort.rawValue)
        } else {
          NSLog("AGENT_DEVICE_RUNNER_PORT_NOT_SET")
        }
      case .failed(let error):
        NSLog("AGENT_DEVICE_RUNNER_LISTENER_FAILED=%@", String(describing: error))
        self?.doneExpectation?.fulfill()
      default:
        break
      }
    }
    listener?.newConnectionHandler = { [weak self] conn in
      conn.start(queue: queue)
      self?.handle(connection: conn)
    }
    listener?.start(queue: queue)

    guard let expectation = doneExpectation else {
      XCTFail("runner expectation was not initialized")
      return
    }
    NSLog("AGENT_DEVICE_RUNNER_WAITING")
    let result = XCTWaiter.wait(for: [expectation], timeout: 24 * 60 * 60)
    NSLog("AGENT_DEVICE_RUNNER_WAIT_RESULT=%@", String(describing: result))
    if result != .completed {
      XCTFail("runner wait ended with \(result)")
    }
  }

  private func makeRunnerListener(desiredPort: UInt16, desiredHost: String?) throws -> NWListener {
    let parameters = NWParameters.tcp
    parameters.allowLocalEndpointReuse = true
    if desiredPort > 0, let port = NWEndpoint.Port(rawValue: desiredPort) {
      if let desiredHost, !desiredHost.isEmpty {
        parameters.requiredLocalEndpoint = .hostPort(host: NWEndpoint.Host(desiredHost), port: port)
        return try NWListener(using: parameters)
      }
      #if os(macOS)
        parameters.requiredLocalEndpoint = .hostPort(host: "127.0.0.1", port: port)
        return try NWListener(using: parameters)
      #else
        return try NWListener(using: parameters, on: port)
      #endif
    }
    if let desiredHost, !desiredHost.isEmpty {
      parameters.requiredLocalEndpoint = .hostPort(host: NWEndpoint.Host(desiredHost), port: 0)
    }
    return try NWListener(using: parameters)
  }
}
