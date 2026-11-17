// finance-company-intelligence.js — the Company Intelligence page: site chrome, then the import and dashboard workspace.
import { initSite } from '../core/site.js?v=34';
import { $ } from '../core/dom.js?v=34';
import { initIntel } from '../intel/app.js?v=34';
initSite();
initIntel($('#ci-root'));
