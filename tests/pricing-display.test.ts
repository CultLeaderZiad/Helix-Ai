import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { GCC_PLAN_DISPLAY, REGIONAL_PRICING_CONFIGS, planDisplay } from '../lib/pricing/tiers.ts'

describe('pricing display map', () => {
  it('keeps the AED prices and uses the section 8 taglines', () => {
    const plans = REGIONAL_PRICING_CONFIGS.gcc_enterprise.plans
    const byId = Object.fromEntries(plans.map(plan => [plan.id, plan]))
    assert.equal(byId['starter-gcc'].prices.AED, 1800)
    assert.equal(byId['starter-gcc'].setupFee.AED, 4500)
    assert.equal(byId['growth-gcc'].prices.AED, 4600)
    assert.equal(byId['growth-gcc'].setupFee.AED, 7500)
    assert.equal(byId['growth-gcc'].featured, true)
    assert.equal(byId['scale-gcc'].prices.AED, 10200)
    assert.equal(byId['scale-gcc'].setupFee.AED, 15000)

    assert.equal(planDisplay(byId['starter-gcc'], 'en').taglineShort, 'Single location, phone and WhatsApp.')
    assert.equal(planDisplay(byId['growth-gcc'], 'en').tagline, 'Missed-call triage, voice and WhatsApp working together.')
    assert.equal(planDisplay(byId['growth-gcc'], 'ar').tagline, 'فرز المكالمات الفائتة والصوت وواتساب معاً.')
    assert.equal(planDisplay(byId['scale-gcc'], 'ar').tagline, 'للمجموعات التي تدير عدة فروع وعلامات تجارية.')
    assert.equal(GCC_PLAN_DISPLAY['starter-gcc'].en.home?.[0], 'Up to 1,500 conversations a month')
    assert.equal(planDisplay(byId['starter-gcc'], 'en').features[2], 'Official WhatsApp Business connection')
  })

  it('does not render the raw catalogue tagline on the marketing views', () => {
    const home = readFileSync('components/marketing/home-view.tsx', 'utf8')
    const pricing = readFileSync('components/marketing/pricing-view.tsx', 'utf8')
    assert.match(home, /planDisplay/)
    assert.match(pricing, /planDisplay/)
    assert.doesNotMatch(home, /plan\.tagline/)
    assert.doesNotMatch(pricing, /plan\.tagline/)
    assert.doesNotMatch(home, /Meta Verified/)
    assert.doesNotMatch(pricing, /<Check /)
  })
})
