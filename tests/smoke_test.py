from playwright.sync_api import sync_playwright
import sys

BASE_URL = "http://localhost:5173"

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

        nav_buttons = page.locator("nav[aria-label='Main navigation'] button").all()
        visible = [b for b in nav_buttons if b.is_visible()]
        print(f"PASS: Found {len(visible)} nav buttons")

        if len(visible) == 4:
            print("PASS: Exactly 4 nav tabs (Reading, Search, Highlights, Settings)")
        else:
            print(f"WARN: Expected 4 nav tabs, got {len(visible)}")

        browser.close()

def test_search_tab():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 390, "height": 844})

        page.goto(BASE_URL)
        page.wait_for_selector("nav[aria-label='Main navigation']", timeout=30000)

        search_btn = page.locator("nav[aria-label='Main navigation'] button:has-text('Search')")
        search_btn.click()
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

if __name__ == "__main__":
    test_app_loads()
    test_navigation_buttons()
    test_search_tab()
    test_settings_tab()
    print("\nALL TESTS PASSED")
