(() => {
  'use strict';
  const STORAGE_KEY = 'hacksbot.configuration.v1';
  const form = document.getElementById('configForm');
  const preview = document.getElementById('jsonPreview');
  const status = document.getElementById('formStatus');
  const badge = document.getElementById('validationBadge');
  const fields = ['botName','role','goal','instructions','restrictions','context','success','riskLevel'];
  let currentConfig = null;
  let validated = false;

  const value = (id) => document.getElementById(id).value.trim();
  const lines = (text) => text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const getConfig = () => ({
    schemaVersion: '1.0.0',
    product: 'HacksBot AI',
    phase: 'ai-configuration',
    bot: { name: value('botName'), role: value('role') },
    mission: { primaryGoal: value('goal'), successCriteria: value('success') },
    instructions: lines(value('instructions')),
    restrictions: lines(value('restrictions')),
    contextToPreserve: value('context'),
    executionPolicy: {
      selectedMode: value('riskLevel'),
      phaseEnforcedMode: 'plan_only',
      requiresExplicitApprovalForExternalActions: true,
      note: 'Phase 1 stores a proposed policy only; it does not execute actions.'
    },
    workflowPlan: [
      { id: 'understand', title: 'Understand the request', purpose: 'Interpret the mission and relevant context', status: 'planned' },
      { id: 'guardrails', title: 'Check boundaries', purpose: 'Identify restrictions, risk, and approval needs', status: 'planned' },
      { id: 'prepare', title: 'Prepare a solution', purpose: 'Propose reviewable steps without executing them', status: 'planned' },
      { id: 'verify', title: 'Verify the outcome', purpose: 'Compare observed evidence against success criteria', status: 'planned' }
    ],
    generatedAt: new Date().toISOString()
  });
  function validate(config) {
    const errors = [];
    if (!config.bot.name) errors.push('Add a bot name.');
    if (!config.mission.primaryGoal) errors.push('Describe the primary goal.');
    if (!config.instructions.length) errors.push('Add at least one instruction so the bot has guidance.');
    if (!config.restrictions.length) errors.push('Add at least one restriction to define a boundary.');
    if (!config.mission.successCriteria) errors.push('Define how success should be checked.');
    if (config.instructions.length > 100 || config.restrictions.length > 100) errors.push('Keep instructions and restrictions to 100 lines or fewer.');
    return errors;
  }
  function render(config, errors = null) {
    currentConfig = config;
    preview.textContent = JSON.stringify(config, null, 2);
    validated = Array.isArray(errors) && errors.length === 0;
    badge.textContent = errors === null ? 'DRAFT PREVIEW' : validated ? 'VALID CONFIG' : 'NEEDS REVIEW';
    badge.className = 'validation-badge' + (errors === null ? '' : validated ? ' valid' : ' invalid');
    if (errors && errors.length) status.textContent = errors.join(' ');
    else if (errors) status.textContent = 'Configuration validated. Workflow is a plan only; no actions were executed.';
    return errors;
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const config = getConfig();
    const errors = validate(config);
    render(config, errors);
    if (errors.length) document.getElementById('goal').focus();
  });
  document.getElementById('saveConfig').addEventListener('click', () => {
    const config = getConfig();
    const errors = validate(config);
    render(config, errors);
    if (errors.length) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      status.textContent = 'Saved in this browser only. No server upload and no actions executed.';
    } catch (_) {
      status.textContent = 'Could not save in this browser. Export the JSON file to keep a copy.';
    }
  });
  document.getElementById('copyJson').addEventListener('click', async () => {
    if (!currentConfig) currentConfig = getConfig();
    const text = JSON.stringify(currentConfig, null, 2);
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Configuration JSON copied. No actions executed.';
    } catch (_) {
      status.textContent = 'Clipboard access is unavailable here. Select the JSON preview and copy it manually.';
    }
  });
  document.getElementById('downloadJson').addEventListener('click', () => {
    if (!currentConfig) currentConfig = getConfig();
    const blob = new Blob([JSON.stringify(currentConfig, null, 2) + '\n'], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (currentConfig.bot?.name || 'hacksbot-config').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.json';
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    status.textContent = 'Configuration exported to a JSON file. No actions executed.';
  });
  document.getElementById('newConfig').addEventListener('click', () => {
    if (!window.confirm('Start a new configuration? Unsaved form edits will be cleared.')) return;
    form.reset();
    document.getElementById('botName').value = 'My HacksBot';
    document.getElementById('role').value = 'You are a careful, helpful assistant that follows the user\'s stated goal and explains uncertainty.';
    document.getElementById('instructions').value = 'Clarify missing requirements before making assumptions.\nBreak complex work into reviewable steps.\nReport what is known, what is uncertain, and what remains unfinished.';
    document.getElementById('restrictions').value = 'Never claim an action succeeded without checking its result.\nNever expose secrets, credentials, or private data.\nNever execute external actions without explicit authorization.';
    document.getElementById('success').value = 'The result matches the stated goal, respects every restriction, and includes a clear completion report.';
    currentConfig = null; validated = false;
    preview.textContent = 'Submit the form to validate and preview your bot configuration.';
    badge.textContent = 'NOT VALIDATED'; badge.className = 'validation-badge';
    status.textContent = 'New draft ready. Nothing has been executed.';
  });
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const config = JSON.parse(saved);
      const set = (id, v) => { if (typeof v === 'string') document.getElementById(id).value = v; };
      set('botName', config.bot?.name); set('role', config.bot?.role); set('goal', config.mission?.primaryGoal);
      set('instructions', Array.isArray(config.instructions) ? config.instructions.join('\n') : '');
      set('restrictions', Array.isArray(config.restrictions) ? config.restrictions.join('\n') : '');
      set('context', config.contextToPreserve); set('success', config.mission?.successCriteria);
      set('riskLevel', config.executionPolicy?.selectedMode);
      render(config, null);
      status.textContent = 'Restored the last saved browser draft. Nothing has been executed.';
    }
  } catch (_) { status.textContent = 'A saved draft could not be read. You can continue with a new configuration.'; }
  if (!currentConfig) currentConfig = getConfig();
})();
