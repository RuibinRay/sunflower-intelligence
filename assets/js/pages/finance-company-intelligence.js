// finance-company-intelligence.js — the Company Intelligence page: site chrome, then the import and dashboard workspace.
import { initSite } from '../core/site.js?v=37';
import { $ } from '../core/dom.js?v=37';
import { initIntel } from '../intel/app.js?v=37';
initSite();
initIntel($('#ci-root'));
