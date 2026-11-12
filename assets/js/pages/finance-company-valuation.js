// finance-company-valuation.js — the Company Valuation Studio page: site chrome, then the studio.
import { initSite } from '../core/site.js?v=31';
import { $ } from '../core/dom.js?v=31';
import { initStudio } from '../valuation/studio.js?v=31';
initSite();
initStudio($('#cv-root'));
