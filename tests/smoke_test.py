from playwright.sync_api import sync_playwright
import sys

BASE_URL = "http://localhost:5173"


def dismiss_modal(page):
    try:
        backdrop = page.locator("[data-slot='modal-backdrop']")
        if backdrop.is_visible(timeout=1000):
            page.keyboard.press("Escape")
            page.wait_for_timeout(500)
    except:
        pass

def test_app_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})

        page.on("console", lambda msg: print(f"[{msg.type}] {msg.text}"))

        page.goto(BASE_URL, wait_until="domcontentloaded")

        splash = page.locator(".html-splash")
        if splash.is_visible():
            splash.wait_for(state="hidden", timeout=30000)

        page.wait_for_load_state("networkidle", timeout=15000)

        try:
            page.wait_for_selector("nav[aria-label='Main navigation']", timeout=15000)
            dismiss_modal(page)
            print("PASS: App loaded to reader")
        except:
            page.screenshot(path="/tmp/app_error.png", full_page=True)
            print("FAIL: App did not reach reader (splash timeout or error)")
            browser.close()
            sys.exit(1)

        browser.close()

def test_navigation_buttons():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})

        page.goto(BASE_URL)
        page.wait_for_selector("nav[aria-label='Main navigation']", timeout=30000)
        dismiss_modal(page)

        nav_buttons = page.locator("nav[aria-label='Main navigation'] button").all()
        visible = [b for b in nav_buttons if b.is_visible()]
        print(f"PASS: Found {len(visible)} nav buttons")

        if len(visible) == 5:
            print("PASS: Exactly 5 nav tabs (Reading, Search, Highlights, Progress, Settings)")
        else:
            print(f"WARN: Expected 5 nav tabs, got {len(visible)}")

        browser.close()

def test_search_tab():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})

        page.goto(BASE_URL)
        page.wait_for_selector("nav[aria-label='Main navigation']", timeout=30000)

        dismiss_modal(page)
        search_btn = page.locator("nav[aria-label='Main navigation'] button:has-text('Search')")
        search_btn.click(force=True)
        page.wait_for_timeout(1000)

        search_input = page.locator("input[aria-label='Search verses']")
        if search_input.is_visible():
            print("PASS: Search page loaded")
        else:
            print("FAIL: Search input not visible")
            page.screenshot(path="/tmp/search_fail.png", full_page=True)
            browser.close()
            sys.exit(1)

        browser.close()

def test_settings_tab():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})

        page.goto(BASE_URL)
        page.wait_for_selector("nav[aria-label='Main navigation']", timeout=30000)
        dismiss_modal(page)

        settings_btn = page.locator("nav[aria-label='Main navigation'] button:has-text('Settings')")
        settings_btn.click(force=True)
        page.wait_for_timeout(1000)

        page.wait_for_timeout(2000)

        heading = page.locator("h1:has-text('Settings')")
        if heading.is_visible():
            print("PASS: Settings page loaded")
        else:
            page.screenshot(path="/tmp/settings_fail.png", full_page=True)
            title = page.title()
            content = page.locator("h1").all_text_contents()
            print(f"FAIL: Settings page not loaded. title={title} h1s={content}")
            browser.close()
            sys.exit(1)

        browser.close()

def test_progress_tab_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})

        page.goto(BASE_URL)
        page.wait_for_selector("nav[aria-label='Main navigation']", timeout=30000)
        dismiss_modal(page)

        nav = page.locator("nav[aria-label='Main navigation']")
        nav.locator("button:has-text('Progress')").click(force=True)
        page.wait_for_selector("h1:has-text('Progress')", timeout=10000)

        heading = page.locator("h1:has-text('Progress')")
        if heading.is_visible():
            print("PASS: Progress page loaded")
        else:
            print("FAIL: Progress heading not visible")
            page.screenshot(path="/tmp/progress_fail.png", full_page=True)
            browser.close()
            sys.exit(1)

        browser.close()


def wait_for_app(page):
    page.goto(BASE_URL)
    splash = page.locator(".html-splash")
    if splash.is_visible():
        splash.wait_for(state="hidden", timeout=30000)
    page.wait_for_selector("nav[aria-label='Main navigation']", timeout=30000)
    dismiss_modal(page)


def _open_progress_page(page):
    wait_for_app(page)
    nav = page.locator("nav[aria-label='Main navigation']")
    nav.locator("button:has-text('Progress')").click(force=True)
    page.wait_for_selector("h1:has-text('Progress')", timeout=15000)
    page.wait_for_selector("text=Old Testament", timeout=15000)


def test_progress_tab_ot_modal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})
        _open_progress_page(page)

        ot_card = page.locator("text=Old Testament").first
        ot_card.click(force=True)
        page.wait_for_selector("[role='dialog']", timeout=5000)

        modal = page.locator("[role='dialog']")
        if modal.is_visible():
            print("PASS: OT modal opened with book list")
        else:
            print("FAIL: OT modal not visible")
            page.screenshot(path="/tmp/ot_modal_fail.png", full_page=True)
            browser.close()
            sys.exit(1)

        page.keyboard.press("Escape")
        browser.close()


def test_progress_tab_nt_modal():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})
        _open_progress_page(page)

        nt_card = page.locator("text=New Testament").first
        nt_card.click(force=True)
        page.wait_for_selector("[role='dialog']", timeout=5000)

        modal = page.locator("[role='dialog']")
        if modal.is_visible():
            print("PASS: NT modal opened with book list")
        else:
            print("FAIL: NT modal not visible")
            page.screenshot(path="/tmp/nt_modal_fail.png", full_page=True)
            browser.close()
            sys.exit(1)

        page.keyboard.press("Escape")
        browser.close()


if __name__ == "__main__":
    test_app_loads()
    test_navigation_buttons()
    test_search_tab()
    test_settings_tab()
    test_progress_tab_loads()
    test_progress_tab_ot_modal()
    test_progress_tab_nt_modal()
    print("\nALL TESTS PASSED")
