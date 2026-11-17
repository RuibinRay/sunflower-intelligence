// finance-company-valuation.js — the Company Valuation Studio page: site chrome, then the studio.
import { initSite } from '../core/site.js?v=36';
import { $ } from '../core/dom.js?v=36';
import { initStudio } from '../valuation/studio.js?v=36';
initSite();
initStudio($('#cv-root'));
