// finance-company-valuation.js — the Company Valuation Studio page: site chrome, then the studio.
import { initSite } from '../core/site.js?v=33';
import { $ } from '../core/dom.js?v=33';
import { initStudio } from '../valuation/studio.js?v=33';
initSite();
initStudio($('#cv-root'));
