// finance-company-valuation.js — the Company Valuation Studio page: site chrome, then the studio.
import { initSite } from '../core/site.js?v=30';
import { $ } from '../core/dom.js?v=30';
import { initStudio } from '../valuation/studio.js?v=30';
initSite();
initStudio($('#cv-root'));
