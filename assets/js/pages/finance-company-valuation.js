// finance-company-valuation.js — the Company Valuation Studio page: site chrome, then the studio.
import { initSite } from '../core/site.js?v=27';
import { $ } from '../core/dom.js?v=27';
import { initStudio } from '../valuation/studio.js?v=27';
initSite();
initStudio($('#cv-root'));
