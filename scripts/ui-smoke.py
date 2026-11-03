"""Start Vite on 127.0.0.1:5178, install Python Playwright + Chromium, then run.
Optional environment: SAO_CHROMIUM, SAO_CHROMIUM_LIBS.
"""
from playwright.sync_api import sync_playwright
from pathlib import Path
import json,os,re
root=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    options={'headless':True,'args':['--no-sandbox']}
    if os.environ.get('SAO_CHROMIUM'): options['executable_path']=os.environ['SAO_CHROMIUM']
    if os.environ.get('SAO_CHROMIUM_LIBS'): options['env']={**os.environ,'LD_LIBRARY_PATH':os.environ['SAO_CHROMIUM_LIBS']}
    browser=p.chromium.launch(**options)
    page=browser.new_page(viewport={'width':1440,'height':1150})
    page.set_default_timeout(12000)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    def click(name):page.get_by_role('button',name=name,exact=True).click()
    def close():click('Đóng bảng')
    def clock():return page.locator('.clock').inner_text()
    def fixture(js):
        page.evaluate("async()=>{const e=await import('/src/engine.ts');const save=await import('/src/saves.ts');"+js+";await save.saveSlot('auto',s);}")
        page.reload(wait_until='networkidle')
    page.goto('http://127.0.0.1:5178/',wait_until='networkidle')
    page.get_by_role('heading',name='Làng Đèn Cuối',exact=True).wait_for()
    assert page.get_by_text('Thể lực · STA',exact=True).is_visible()
    assert page.get_by_role('button',name='Công cụ phát triển',exact=True).count()==0
    page.screenshot(path=str(root/'artifacts/desktop-v2.png'),full_page=True)
    click('⌁ Khám phá khu vực')
    before=clock();page.wait_for_timeout(2200);assert clock()==before
    click(re.compile('Đường tro trắng · 30 phút · dấu chân và tiếng gió'))
    page.wait_for_timeout(2200);assert '28 / 30' in page.locator('.ongoing').inner_text()
    page.locator('.quick-nav button').nth(0).click()
    before=clock();page.wait_for_timeout(2200);assert clock()==before
    close()
    page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))")
    page.wait_for_timeout(2200);assert clock()==before
    page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))")
    page.wait_for_timeout(2200);assert '26 / 30' in page.locator('.ongoing').inner_text()
    click('Ⅱ Tạm dừng');click('▣ Lưu game')
    page.get_by_role('button',name='Lưu',exact=True).first.click()
    page.wait_for_timeout(600);assert 'Đã lưu vào ô 1.' in page.locator('.toast').inner_text()
    close();page.reload(wait_until='networkidle')
    assert '26 / 30' in page.locator('.ongoing').inner_text()
    page.get_by_role('button',name='▶ Tiếp tục',exact=True).wait_for()
    click('× Hủy hoạt động');click('Luyện tập chỉ số')
    page.get_by_role('button',name='Bắt đầu 30 phút',exact=True).first.click()
    page.get_by_role('heading',name=re.compile('Luyện STR')).wait_for()
    click('Ⅱ Tạm dừng');click('× Hủy hoạt động')
    page.locator('.quick-nav button').nth(1).click()
    assert page.locator('.skill-grid .skill').count()==12
    assert page.get_by_text('MỞ Ở CẤP 4',exact=False).count()>0
    close();page.get_by_role('button',name=re.compile('Danh hiệu:')).click()
    assert page.get_by_role('heading',name=re.compile('Bạn của thương hội')).is_visible()
    close()
    fixture("let s=e.createGame(55);s.location='grove';s.visited.push('grove');s.sta=2;s=e.reduce(s,{type:'farm',config:{...e.defaultFarm,stopEmpty:false}})")
    click('▶ Tiếp tục');page.wait_for_timeout(1200)
    page.get_by_text(re.compile('Đang nghỉ an toàn')).wait_for()
    page.screenshot(path=str(root/'artifacts/farm-v2.png'),full_page=True)
    click('× Hủy hoạt động')
    fixture("const s=e.createGame(33);s.location='bell';s.visited.push('bell');e.beginBattle(s,'boss1',true)")
    before=clock();page.wait_for_timeout(2200);assert clock()==before
    click('◇ Phòng thủ · hồi 0,6 STA');assert clock()!=before
    page.get_by_role('button',name=re.compile('Nước STA')).wait_for()
    page.screenshot(path=str(root/'artifacts/battle-v2.png'),full_page=True)
    page.set_viewport_size({'width':390,'height':844})
    page.screenshot(path=str(root/'artifacts/mobile-v2.png'),full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    click('Nhân vật');assert page.get_by_text('Thể lực · STA',exact=True).is_visible()
    click('Thế giới');assert page.get_by_role('heading',name=re.compile('BẢN ĐỒ TẦNG')).is_visible()
    assert not errors,errors
    report={'browser':'Chromium','viewports':['1440x1150','390x844'],'checks':['STA visible','debug absent by default','choice pause','2 travel ticks before pause and 2 after','inventory pause','hidden tab pause without catch-up','manual save','reload paused travel','training','12 skills with level gates','titles','safe farm rest and ETA','turn menu and 1 minute per round','responsive tabs','no overflow','no JS exceptions'],'errors':errors}
    (root/'artifacts/ui-v2.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False,indent=2));browser.close()
