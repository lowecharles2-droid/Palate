from playwright.sync_api import sync_playwright
from pathlib import Path
import json, re, sys, traceback

ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'public/index.html').read_text()
html=re.sub(r'<link rel="stylesheet"[^>]+>','',html)
html=re.sub(r'<link rel="icon"[^>]+>','',html)
html=re.sub(r'<script src="/search-core.js\?v=1.3.1"></script>\s*<script src="/app.js\?v=1.3.1"></script>','',html)
restaurants=json.loads((ROOT/'data/restaurants.json').read_text())

class Suite:
    def __init__(self):
        self.checks=0
    def ok(self,cond,msg):
        self.checks+=1
        if not cond: raise AssertionError(msg)

suite=Suite()

def setup_page(browser, viewport=None, storage=None, no_dialog=False):
    page=browser.new_page(viewport=viewport or {'width':1280,'height':900}); page.set_default_timeout(4000)
    logs=[]
    page.on('console',lambda m: logs.append((m.type,m.text)))
    page.on('pageerror',lambda e: logs.append(('pageerror',str(e))))
    page.set_content(html,wait_until='domcontentloaded')
    page.add_style_tag(path=str(ROOT/'public/styles.css'))
    initial=storage or {}
    page.evaluate("""({data,initial,noDialog}) => {
      const store = {...initial};
      Object.defineProperty(window, 'localStorage', { value: {
        getItem:k=>Object.prototype.hasOwnProperty.call(store,k)?store[k]:null,
        setItem:(k,v)=>{store[k]=String(v)}, removeItem:k=>delete store[k],
        clear:()=>Object.keys(store).forEach(k=>delete store[k]), key:i=>Object.keys(store)[i]||null,
        get length(){return Object.keys(store).length}, _store:store
      }, configurable:true});
      Object.defineProperty(window, 'isSecureContext', { value: true, configurable:true });
      Object.defineProperty(navigator, 'geolocation', {value:{getCurrentPosition:(ok)=>ok({coords:{latitude:32.82,longitude:-117.16}})}, configurable:true});
      Object.defineProperty(navigator, 'share', {value: async payload=>{window.__shared=payload}, configurable:true});
      window.fetch = async () => ({ok:true,json:async()=>({restaurants:data,meta:{count:data.length,verifiedThrough:'2026-07-06'}})});
      if (noDialog && window.HTMLDialogElement) {
        HTMLDialogElement.prototype.showModal = undefined;
        HTMLDialogElement.prototype.close = undefined;
      }
    }""",{'data':restaurants,'initial':initial,'noDialog':no_dialog})
    page.add_script_tag(path=str(ROOT/'public/search-core.js'))
    page.add_script_tag(path=str(ROOT/'public/app.js'))
    page.wait_for_timeout(700)
    return page,logs

def modal_open(page,sel):
    return page.locator(sel).evaluate('(e)=>Boolean(e.open || e.classList.contains("modal-fallback-open"))')

def no_errors(logs,label):
    bad=[x for x in logs if x[0]=='pageerror' or (x[0]=='error' and 'favicon' not in x[1].lower())]
    suite.ok(not bad,f'{label} console errors: {bad}')

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])

    # Main desktop flow
    page,logs=setup_page(browser)
    suite.ok(page.evaluate('window.PalateVersion')=='1.3.1','version marker missing')
    suite.ok(modal_open(page,'#onboardingModal'),'onboarding did not open on first visit')
    suite.ok(page.locator('#resultCount').inner_text().startswith('84'),'directory did not load')
    page.locator('#onboardingCuisines input[value="Chinese"]').check()
    page.locator('#onboardingDietary input[value="High protein"]').check()
    page.locator('#onboardingBudget').select_option('$$')
    page.locator('#onboardingPriority').select_option('hidden')
    page.locator('#onboardingForm button[type="submit"]').click()
    page.wait_for_timeout(300)
    suite.ok(not modal_open(page,'#onboardingModal'),'onboarding did not close after submit')
    suite.ok(page.locator('#priceLimit').input_value()=='$$','onboarding budget not applied')
    suite.ok(page.evaluate("localStorage.getItem('palate_onboarding_complete_v3')")=='true','onboarding completion not stored')
    page.locator('#profileNav').click()
    suite.ok(modal_open(page,'#onboardingModal'),'Preferences button did not reopen onboarding')
    suite.ok(page.locator('#onboardingCuisines input[value="Chinese"]').is_checked(),'onboarding cuisine did not persist')
    page.locator('#skipOnboarding').click()

    # Group mode apply/clear
    page.locator('#groupNav').click()
    suite.ok(modal_open(page,'#groupModal'),'Group mode modal did not open')
    page.locator('#groupCuisines input[value="Indian"]').check()
    page.locator('#groupDietary input[value="Vegetarian options"]').check()
    page.locator('#groupBudget').select_option('$$')
    page.locator('#groupDistance').select_option('12')
    page.locator('#groupForm button[type="submit"]').click()
    page.wait_for_timeout(200)
    suite.ok(not modal_open(page,'#groupModal'),'Group mode modal did not close')
    suite.ok(page.locator('#groupNav').inner_text()=='Group: On','Group mode status did not update')
    suite.ok(page.locator('[data-filter-type="group"]').count()==1,'Group active filter missing')
    group_ids=page.locator('.details-button').evaluate_all('(els)=>els.map(el=>el.dataset.id)')
    suite.ok(len(group_ids)>0,'Group mode returned no usable options')
    by_id={item['id']:item for item in restaurants}
    for rid in group_ids:
        item=by_id[rid]
        suite.ok('Indian' in item.get('categories',[]),f'Group result {item["name"]} missed cuisine requirement')
        suite.ok('Vegetarian options' in item.get('categories',[]),f'Group result {item["name"]} missed dietary requirement')
        suite.ok(item.get('price') in ['$', '$$'],f'Group result {item["name"]} exceeded budget')
        suite.ok(float(item.get('distanceMiles',999))<=12,f'Group result {item["name"]} exceeded distance')
    suite.ok(json.loads(page.evaluate("localStorage.getItem('palate_group_mode_v3')"))['active'] is True,'Group mode not stored')
    page.locator('#groupNav').click()
    suite.ok(modal_open(page,'#groupModal'),'Group modal did not reopen')
    suite.ok(page.locator('#groupCuisines input[value="Indian"]').is_checked(),'Group selection did not persist in UI')
    page.locator('#clearGroupMode').click()
    suite.ok(page.locator('#groupNav').inner_text()=='Group mode','Group clear did not update status')

    # Location presets, modal and current location
    page.locator('#locationNav').click()
    suite.ok(modal_open(page,'#locationModal'),'Location modal did not open')
    page.locator('#modalLocationSelect').select_option('convoy')
    page.locator('#locationForm button[type="submit"]').click()
    page.wait_for_timeout(100)
    suite.ok(not modal_open(page,'#locationModal'),'Location modal did not close')
    suite.ok('Convoy' in page.locator('#locationNav').inner_text(),'Location nav did not update')
    suite.ok('Convoy' in page.locator('#locationSummary').inner_text(),'Location summary did not update')
    page.locator('#keywordSearch').fill('Spicy City'); page.wait_for_timeout(100)
    convoy_distance=float(page.locator('.restaurant-card .card-meta').first.inner_text().split('~')[1].split(' mi')[0])
    page.locator('#keywordSearch').fill('')
    page.locator('#locationSelect').select_option('la-jolla')
    page.wait_for_timeout(100)
    page.locator('#keywordSearch').fill('Spicy City'); page.wait_for_timeout(100)
    la_jolla_distance=float(page.locator('.restaurant-card .card-meta').first.inner_text().split('~')[1].split(' mi')[0])
    suite.ok(la_jolla_distance>convoy_distance,'Location change did not recalculate restaurant distance')
    page.locator('#keywordSearch').fill('')
    page.wait_for_timeout(100)
    suite.ok('La Jolla' in page.locator('#locationNav').inner_text(),'Main location select did not apply')
    page.locator('#locationNav').click()
    page.locator('#modalLocationSelect').select_option('custom')
    suite.ok(page.locator('#customLocationWrap').is_visible(),'Custom location field did not appear')
    page.locator('#customLocationInput').fill('Mira Mesa')
    page.locator('#locationForm button[type="submit"]').click()
    suite.ok('Mira Mesa' in page.locator('#locationNav').inner_text(),'Custom location did not apply')
    page.locator('#locationNav').click()
    page.locator('#modalLocationSelect').select_option('current')
    page.locator('#locationForm button[type="submit"]').click()
    page.wait_for_timeout(100)
    suite.ok('your location' in page.locator('#locationNav').inner_text().lower(),'Current location did not apply')

    # Search, filter, sort
    page.locator('#smartPrompt').fill('authentic Chinese')
    page.locator('#runSmartSearch').click()
    page.wait_for_timeout(250)
    first_name=page.locator('.restaurant-card h3').first.inner_text()
    suite.ok(first_name!='Panda Express','Authentic Chinese still ranks Panda Express first')
    suite.ok(page.locator('#smartExplanation').inner_text().lower().find('chinese')>=0,'Smart search explanation not updated')
    page.locator('#keywordSearch').fill('Sushi Ota')
    page.wait_for_timeout(100)
    suite.ok(page.locator('.restaurant-card h3').first.inner_text()=='Sushi Ota','Exact restaurant search failed')
    page.locator('#keywordSearch').fill('')
    page.locator('#sortBy').select_option('distance')
    page.wait_for_timeout(100)
    dists=[float(x.inner_text().split('~')[1].split(' mi')[0]) for x in page.locator('.restaurant-card .card-meta').all()[:8]]
    suite.ok(dists==sorted(dists),'Distance sort not ascending')
    # category chip
    vegan=page.locator('[data-category="Vegan options"]')
    suite.ok(vegan.count()==1,'Vegan category chip missing')
    page.locator('details.filter-group').filter(has_text='All categories').locator('summary').click()
    vegan.click(); page.wait_for_timeout(100)
    suite.ok(page.locator('[data-filter-type="category"]').count()==1,'Category filter did not activate')
    page.locator('#resetFilters').click(); page.wait_for_timeout(250)
    suite.ok(page.locator('#resultCount').inner_text().startswith('84'),'Reset did not restore results')
    page.locator('#locationSelect').select_option('ucsd'); page.wait_for_timeout(80)
    page.locator('#priceLimit').select_option('$'); page.locator('#distanceLimit').select_option('3'); page.wait_for_timeout(120)
    constrained_cards=page.locator('.restaurant-card')
    suite.ok(constrained_cards.count()>0,'Price and distance filters returned no testable results')
    for meta in constrained_cards.locator('.card-meta').all_inner_texts()[:8]:
        suite.ok(' · $ · ' in meta,'Price filter allowed a restaurant above $')
        dist=float(meta.split('~')[1].split(' mi')[0]); suite.ok(dist<=3.1,'Distance filter allowed a restaurant beyond 3 miles')
    page.locator('#resetFilters').click(); page.wait_for_timeout(250)

    # Restaurant card feedback, save, detail, share, report
    card=page.locator('.restaurant-card').first
    card_name=card.locator('h3').inner_text()
    card.locator('[data-helpful-id]').click(); page.wait_for_timeout(80)
    suite.ok('Helpful' in card.locator('[data-helpful-id]').inner_text(),'Helpful feedback failed')
    card.locator('[data-save-id]').click(); page.wait_for_timeout(100)
    suite.ok(page.locator('#savedNavCount').inner_text()=='1','Save count did not update')
    page.locator('#savedNav').click()
    suite.ok(modal_open(page,'#savedModal'),'Saved modal did not open')
    suite.ok(card_name in page.locator('#savedContent').inner_text(),'Saved restaurant missing')
    page.locator('#closeSaved').click()
    # Detail
    page.locator('.restaurant-card .details-button').first.click()
    suite.ok(modal_open(page,'#detailModal'),'Detail modal did not open')
    suite.ok(page.locator('#detailName').inner_text()==card_name,'Detail restaurant mismatch')
    page.locator('#detailShare').click(); page.wait_for_timeout(100)
    suite.ok(page.evaluate('Boolean(window.__shared && window.__shared.title)'),'Share did not run')
    page.locator('#detailReport').click()
    suite.ok(modal_open(page,'#reportModal'),'Report modal did not open')
    page.locator('#reportType').select_option(label='Hours are incorrect')
    page.locator('#reportNote').fill('Test correction')
    page.locator('#reportForm button[type="submit"]').click()
    suite.ok(not modal_open(page,'#reportModal'),'Report modal did not close')
    reports=page.evaluate('window.PalateAnalytics.reports()')
    suite.ok(len(reports)==1 and reports[0]['type']=='Hours are incorrect','Report not recorded')
    page.locator('#savedNav').click(); suite.ok(modal_open(page,'#savedModal'),'Saved modal failed to reopen')
    page.locator('.saved-remove').click(); page.wait_for_timeout(100)
    suite.ok(page.locator('#savedNavCount').inner_text()=='0','Removing a saved restaurant did not update count')
    page.locator('#closeSaved').click()
    # Hide recommendation
    before=int(page.locator('#resultCount').inner_text().split()[0])
    page.locator('.restaurant-card [data-hide-id]').first.click(); page.wait_for_timeout(100)
    after=int(page.locator('#resultCount').inner_text().split()[0])
    suite.ok(after==before-1,'Not for me did not hide restaurant')
    suite.ok(page.locator('[data-filter-type="hidden"]').count()==1,'Hidden filter indicator missing')

    # Zero results and recovery
    page.locator('#keywordSearch').fill('zzzz-no-real-restaurant')
    page.wait_for_timeout(100)
    suite.ok(page.locator('#relaxFilters').count()==1,'No-results recovery missing')
    page.locator('#emptyReset').click(); page.wait_for_timeout(250)
    suite.ok(page.locator('#resultCount').inner_text().startswith('84'),'Empty-state reset failed')

    # Analytics surfaced
    summary=page.evaluate('window.PalateAnalytics.summary()')
    for event in ['app_open','onboarding_complete','group_mode','location_change','save','share','report_listing']:
        suite.ok(summary.get(event,0)>=1,f'Analytics missing {event}')
    no_errors(logs,'desktop flow')
    page.close()

    # Mobile visibility and interactions
    page,logs=setup_page(browser,{'width':390,'height':844},{'palate_onboarding_complete_v3':'true'})
    suite.ok(page.locator('#groupNav').is_visible(),'Group mode hidden on mobile')
    suite.ok(page.locator('#locationNav').is_visible(),'Location hidden on mobile')
    suite.ok(page.locator('#profileNav').is_visible(),'Preferences hidden on mobile')
    page.locator('#groupNav').click(); suite.ok(modal_open(page,'#groupModal'),'Group modal failed on mobile')
    page.locator('#closeGroup').click()
    page.locator('#locationNav').click(); suite.ok(modal_open(page,'#locationModal'),'Location modal failed on mobile')
    page.locator('#closeLocation').click()
    page.locator('#profileNav').click(); suite.ok(modal_open(page,'#onboardingModal'),'Preferences modal failed on mobile')
    no_errors(logs,'mobile flow')
    page.close()

    # Dialog fallback (older/in-app browsers)
    page,logs=setup_page(browser,storage={'palate_onboarding_complete_v3':'true'},no_dialog=True)
    page.locator('#groupNav').click()
    suite.ok(modal_open(page,'#groupModal'),'Fallback group modal did not open')
    suite.ok(page.locator('.modal-fallback-overlay').count()==1,'Fallback overlay missing')
    page.locator('#closeGroup').click()
    suite.ok(not modal_open(page,'#groupModal'),'Fallback group modal did not close')
    page.locator('#locationNav').click(); suite.ok(modal_open(page,'#locationModal'),'Fallback location modal did not open')
    no_errors(logs,'fallback flow')
    page.close()

    # Stored state restoration and no onboarding repeat
    stored={
      'palate_onboarding_complete_v3':'true',
      'palate_location_v2':json.dumps({'key':'convoy','label':'Convoy / Kearny Mesa','lat':32.8194,'lng':-117.1549,'source':'preset'}),
      'palate_group_mode_v3':json.dumps({'active':True,'cuisines':['Korean'],'dietary':[],'budget':'$$','distance':8}),
      'palate_saved_v2':json.dumps([restaurants[0]['id']])
    }
    page,logs=setup_page(browser,storage=stored)
    suite.ok(not modal_open(page,'#onboardingModal'),'Onboarding repeated after completion')
    suite.ok('Convoy' in page.locator('#locationNav').inner_text(),'Stored location not restored')
    suite.ok(page.locator('#groupNav').inner_text()=='Group: On','Stored group mode not restored')
    suite.ok(page.locator('#savedNavCount').inner_text()=='1','Stored saved list not restored')
    no_errors(logs,'persistence flow')
    page.close()

    browser.close()

print(f'PASS: {suite.checks} browser feature assertions')
