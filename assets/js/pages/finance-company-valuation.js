// finance-company-valuation.js — the Company Valuation Studio page: site chrome, then the studio.
import { initSite } from '../core/site.js?v=35';
import { $ } from '../core/dom.js?v=35';
import { initStudio } from '../valuation/studio.js?v=35';
initSite();
initStudio($('#cv-root'));
