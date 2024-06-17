from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# Initialize the WebDriver
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)

try:
    # Open the page
    driver.get('https://api.antisniper.net')

    # Wait for the dynamically loaded content to appear
    following_section = WebDriverWait(driver, 30).until(
        EC.presence_of_element_located((By.ID, "following"))
    )
                    
    # Extract following names
    following_users = following_section.find_elements(By.TAG_NAME, 'a')
    for user in following_users:
        if 'fw-bold' in user.get_attribute('class'):
            print(user.text)

finally:
    # Clean up: close the browser window
    driver.quit()
