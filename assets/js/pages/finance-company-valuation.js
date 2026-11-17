// finance-company-valuation.js — the Company Valuation Studio page: site chrome, then the studio.
import { initSite } from '../core/site.js?v=32';
import { $ } from '../core/dom.js?v=32';
import { initStudio } from '../valuation/studio.js?v=32';
initSite();
initStudio($('#cv-root'));
