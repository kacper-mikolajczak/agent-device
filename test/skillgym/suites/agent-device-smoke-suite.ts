import { assert, type TestCase } from 'skillgym';

type SessionReport = Parameters<typeof assert.skills.has>[0];

const SKILL = /agent-device\/SKILL\.md$/;
const BOOTSTRAP = /agent-device\/references\/bootstrap-install\.md$/;
const EXPLORATION = /agent-device\/references\/exploration\.md$/;
const APP_SOURCE = /(?:^|\/)examples\/test-app\//;
const REPO_SOURCE = /(?:^|\/)src\//;
const COMMAND_DOCS = /website\/docs\/docs\/commands\.md$/;
const SUITE_FILE = /test\/skillgym\/suites\/agent-device-smoke-suite\.ts$/;

const BASE_INSTRUCTIONS = `
You are benchmarking agent-device command planning for a known fixture app.

Do not read project source files or project docs.
Do not inspect examples/test-app, src/, README.md, or website/docs.
Use only the app contract provided in this prompt and your existing agent-device knowledge.
If you need command syntax, rely on known agent-device usage patterns instead of reading repository code.
Output only the requested commands, one per line, with no explanation.
`.trim();

function buildPrompt(options: { contract: string[]; task: string }) {
  const contractLines = options.contract.map((line) => `- ${line}`).join('\n');
  return `${BASE_INSTRUCTIONS}\n\nApp contract:\n${contractLines}\n\nTask:\n${options.task}`;
}

function observedReads(report: SessionReport) {
  return report.files?.observedReads ?? [];
}

function hasRead(report: SessionReport, matcher: RegExp) {
  return observedReads(report).some((entry) => matcher.test(entry));
}

function assertAgentDeviceEvidence(
  report: SessionReport,
  options?: {
    requireBootstrap?: boolean;
    requireExploration?: boolean;
    requireSkillDetection?: boolean;
  },
) {
  const hasSkillRead = hasRead(report, SKILL);
  const hasBootstrapRead = hasRead(report, BOOTSTRAP);
  const hasExplorationRead = hasRead(report, EXPLORATION);
  const hasAnyAgentDeviceRead =
    hasSkillRead || hasBootstrapRead || hasExplorationRead;
  const hasDetectedSkills = (report.detectedSkills?.length ?? 0) > 0;

  if (hasDetectedSkills) {
    assert.skills.has(report, 'agent-device');
  }

  if (options?.requireBootstrap && hasAnyAgentDeviceRead) {
    assert.fileReads.includes(report, BOOTSTRAP);
  }

  if (options?.requireExploration && hasAnyAgentDeviceRead) {
    assert.fileReads.includes(report, EXPLORATION);
  }

  if (options?.requireSkillDetection && hasDetectedSkills) {
    assert.skills.has(report, 'agent-device');
  }
}

function assertReads(report: SessionReport, matcher: string | RegExp) {
  assert.fileReads.includes(report, matcher);
}

function assertNoProjectSourceReads(report: SessionReport) {
  assert.fileReads.notIncludes(report, APP_SOURCE);
  assert.fileReads.notIncludes(report, REPO_SOURCE);
  assert.fileReads.notIncludes(report, COMMAND_DOCS);
}

function commandPattern(command: string) {
  return new RegExp(`(?:^|\\n)(?:agent-device\\s+)?${command}(?:\\s|$)`, 'i');
}

function assertOutputs(
  report: SessionReport,
  matchers: Array<string | RegExp>,
) {
  for (const matcher of matchers) {
    assert.output.includes(report, matcher);
  }
}

function makeCase(options: {
  id: string;
  contract: string[];
  task: string;
  reads?: Array<string | RegExp>;
  outputs?: Array<string | RegExp>;
  requireBootstrap?: boolean;
  requireExploration?: boolean;
  requireSkillDetection?: boolean;
}): TestCase {
  return {
    id: options.id,
    prompt: buildPrompt({ contract: options.contract, task: options.task }),
    assert(report) {
      assertAgentDeviceEvidence(report, {
        requireBootstrap: options.requireBootstrap,
        requireExploration: options.requireExploration,
        requireSkillDetection: options.requireSkillDetection,
      });
      assertNoProjectSourceReads(report);
      assert.fileReads.notIncludes(report, SUITE_FILE);
      options.reads?.forEach((matcher) => assertReads(report, matcher));
      options.outputs?.length
        ? assertOutputs(report, options.outputs)
        : assert.output.notEmpty(report);
    },
  };
}

const suite: TestCase[] = [
  makeCase({
    id: 'open-and-snapshot',
    contract: [
      'App name: Agent Device Tester',
      'Platform: iOS',
      'Launch context: Expo Go',
    ],
    task: 'Plan the commands to open Agent Device Tester in Expo Go on iOS, take a snapshot -i, then close.',
    outputs: [commandPattern('open'), /snapshot -i/i, commandPattern('close')],
  }),
  makeCase({
    id: 'home-dismiss-notice',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Home tab',
      'testID=dismiss-notice',
      'visible text: Release notice',
    ],
    task: 'Assume Agent Device Tester is already open on the Home tab. Plan the commands to dismiss the Release notice using the dismiss-notice testID, verify it is gone with diff snapshot -i, then close.',
    outputs: [/dismiss-notice/i, /diff snapshot -i/i, commandPattern('close')],
  }),
  makeCase({
    id: 'home-confirm-alert',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Home tab',
      'testID=home-open-modal',
      'Opening it shows a native confirmation alert',
    ],
    task: 'Assume Agent Device Tester is already open on the Home tab. Plan the commands to open the confirmation alert and dismiss it using alert wait + alert dismiss.',
    outputs: [
      /home-open-modal/i,
      commandPattern('alert wait'),
      commandPattern('alert dismiss'),
    ],
  }),
  makeCase({
    id: 'home-refresh-metrics',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Home tab',
      'testID=refresh-metrics',
      'visible loading text: Refreshing metrics...',
    ],
    task: 'Assume Agent Device Tester is already open on Home. Plan the commands to tap Refresh metrics, wait for "Refreshing metrics..." to appear, then verify the loading state is gone.',
    outputs: [
      /refresh-metrics/i,
      commandPattern('wait'),
      /Refreshing metrics/i,
    ],
  }),
  makeCase({
    id: 'home-toggle-online',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Home tab',
      'testID=toggle-online',
      'visible badge text after disabling: Offline',
    ],
    task: 'Assume Agent Device Tester is open on Home. Plan the commands to toggle Lab online off and verify the Offline badge is visible.',
    outputs: [/toggle-online/i, /Offline/i],
  }),
  makeCase({
    id: 'catalog-search-debounce',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Catalog tab',
      'testID=catalog-search',
      'Search should respect debounce timing',
    ],
    task: 'Assume Agent Device Tester is on the Catalog tab. Plan the commands to fill the search field with "tart" using --delay-ms to respect the debounce, then wait for results to update.',
    outputs: [/catalog-search/i, /--delay-ms/i, commandPattern('wait')],
  }),
  makeCase({
    id: 'catalog-filter-bakery',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Catalog tab',
      'category chip: category-bakery',
      'visible product after filtering: Berry Tart',
    ],
    task: 'Assume Agent Device Tester is on the Catalog tab. Plan the commands to select the Bakery category and verify Berry Tart is visible.',
    outputs: [/category-bakery/i, /Berry Tart/i],
  }),
  makeCase({
    id: 'catalog-favorite-toggle',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Catalog tab',
      'testID=favorite-citrus-kit',
      'label after toggling favorite: Saved',
    ],
    task: 'Assume Agent Device Tester is on the Catalog tab. Plan the commands to toggle favorite for Citrus Starter Kit and verify the label changes to Saved.',
    outputs: [/favorite-citrus-kit/i, /Saved/i],
  }),
  makeCase({
    id: 'catalog-add-to-cart',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Catalog tab',
      'testID=add-pepper-mix',
      'visible text after add: In cart: 1',
    ],
    task: 'Assume Agent Device Tester is on the Catalog tab. Plan the commands to add Pepper Mix to the cart and verify the card shows In cart: 1.',
    outputs: [/add-pepper-mix/i, /In cart: 1/i],
  }),
  makeCase({
    id: 'catalog-scroll-footer',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Catalog tab',
      'testID=catalog-footer',
      'footer visible text: Seasonal footer target',
    ],
    task: 'Assume Agent Device Tester is on the Catalog tab. Plan the commands to scroll into view the Seasonal footer target card using scrollintoview.',
    outputs: [/scrollintoview/i, /catalog-footer/i],
  }),
  makeCase({
    id: 'product-open-details',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Catalog tab',
      'testID=details-citrus-kit',
      'Product detail screen has testID=product-title',
    ],
    task: 'Assume Agent Device Tester is on the Catalog tab. Plan the commands to open Citrus Starter Kit details and verify the product title is visible.',
    outputs: [/details-citrus-kit/i, /product-title/i],
  }),
  makeCase({
    id: 'product-quantity',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: product detail',
      'testID=quantity-increase',
      'testID=quantity-decrease',
      'testID=quantity-value',
    ],
    task: 'Assume Agent Device Tester is already on a product detail screen. Plan the commands to increase quantity once, decrease it once, and get the quantity value.',
    outputs: [/quantity-increase/i, /quantity-decrease/i, /quantity-value/i],
  }),
  makeCase({
    id: 'product-note-append',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: product detail',
      'testID=product-note',
      'Use append semantics rather than replacement',
    ],
    task: 'Assume Agent Device Tester is already on a product detail screen. Plan the commands to append "Handle with care" to the product note using press + type (not fill).',
    outputs: [/product-note/i, /press/i, /type/i],
  }),
  makeCase({
    id: 'product-save-to-cart',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: product detail',
      'testID=product-save',
      'toast text after saving: Cart updated',
    ],
    task: 'Assume Agent Device Tester is already on a product detail screen. Plan the commands to press Save to cart and verify the Cart updated toast appears.',
    outputs: [/product-save/i, /Cart updated/i],
  }),
  makeCase({
    id: 'form-validation-errors',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Checkout form tab',
      'testID=submit-order',
      'validation errors card uses testID=form-errors',
    ],
    task: 'Assume Agent Device Tester is on the Checkout form tab. Plan the commands to submit with empty fields and verify the validation errors card is visible.',
    outputs: [/submit-order/i, /form-errors/i],
  }),
  makeCase({
    id: 'form-success-submit',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Checkout form tab',
      'testID=field-name',
      'testID=field-email',
      'testID=checkbox-agree',
      'success card uses testID=form-success',
    ],
    task: 'Assume Agent Device Tester is on the Checkout form tab. Plan the commands to fill name and email, check order confirmation, submit, and verify the Order summary card is visible.',
    outputs: [
      /field-name/i,
      /field-email/i,
      /checkbox-agree/i,
      /form-success/i,
    ],
  }),
  makeCase({
    id: 'form-keyboard-dismiss',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Checkout form tab',
      'testID=field-name',
      'keyboard can be dismissed after focusing the field',
    ],
    task: 'Assume Agent Device Tester is on the Checkout form tab. Plan the commands to focus the Full name field and dismiss the keyboard using keyboard dismiss.',
    outputs: [/field-name/i, /keyboard dismiss/i],
  }),
  makeCase({
    id: 'form-reset',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Checkout form tab',
      'testID=reset-form',
      'toast text after reset: Form cleared',
    ],
    task: 'Assume Agent Device Tester is on the Checkout form tab. Plan the commands to press Reset form and verify the Form cleared toast appears.',
    outputs: [/reset-form/i, /Form cleared/i],
  }),
  makeCase({
    id: 'settings-toggle-preferences',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Settings tab',
      'testID=toggle-notifications',
      'testID=toggle-reduced-motion',
    ],
    task: 'Assume Agent Device Tester is on the Settings tab. Plan the commands to toggle Push notifications and Reduced motion.',
    outputs: [/toggle-notifications/i, /toggle-reduced-motion/i],
  }),
  makeCase({
    id: 'settings-diagnostics-error',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Settings tab',
      'testID=load-diagnostics',
      'error panel uses testID=diagnostics-error',
    ],
    task: 'Assume Agent Device Tester is on the Settings tab. Plan the commands to load diagnostics, wait for the error state, and verify the diagnostics error panel is visible.',
    outputs: [/load-diagnostics/i, /diagnostics-error/i],
  }),
  makeCase({
    id: 'settings-diagnostics-retry',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Settings tab',
      'testID=load-diagnostics',
      'testID=retry-diagnostics',
      'ready state uses testID=diagnostics-ready',
    ],
    task: 'Assume Agent Device Tester is on the Settings tab. Plan the commands to load diagnostics, wait for the error state, retry diagnostics, then verify the Ready badge is visible.',
    outputs: [/load-diagnostics/i, /retry-diagnostics/i, /diagnostics-ready/i],
  }),
  makeCase({
    id: 'settings-reset-alert',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Settings tab',
      'testID=reset-lab',
      'native alert title: Reset Agent Device Tester?',
    ],
    task: 'Assume Agent Device Tester is on the Settings tab. Plan the commands to trigger Reset lab state, then accept the native alert using alert wait + alert accept.',
    outputs: [
      /reset-lab/i,
      commandPattern('alert wait'),
      commandPattern('alert accept'),
    ],
  }),
  makeCase({
    id: 'home-accessibility-audit',
    contract: [
      'App name: Agent Device Tester',
      'Current screen: Home tab',
      'Compare visible UI with the accessibility tree',
    ],
    task: 'Assume Agent Device Tester is on Home. Plan the commands to capture a screenshot and a snapshot to compare visible UI vs accessibility tree.',
    outputs: [/screenshot/i, /snapshot/i],
  }),
];

export default suite;
