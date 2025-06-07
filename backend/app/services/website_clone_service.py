import os
from typing import Dict, Any
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup
import google.generativeai as genai
from dotenv import load_dotenv
import json
import re

load_dotenv()

class WebsiteCloneService:
    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError(
                "GOOGLE_API_KEY not found in environment variables. "
                "Please create a .env file with your Google API key. "
                "Get your API key from: https://makersuite.google.com/app/apikey"
            )
        
        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
        except Exception as e:
            raise ValueError(
                f"Failed to initialize Google AI: {str(e)}. "
                "Please make sure your API key is valid and has access to the Gemini API."
            )
        
    async def _scrape_website(self, url: str) -> Dict[str, Any]:
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            page = await browser.new_page()
            
            # Set viewport size
            await page.set_viewport_size({"width": 1920, "height": 1080})
            
            # Navigate to the URL
            await page.goto(url, wait_until="networkidle")
            
            # Get the page content
            content = await page.content()
            
            # Get all computed styles
            styles = await page.evaluate("""() => {
                const styles = {};
                const elements = document.querySelectorAll('*');
                elements.forEach(el => {
                    const computedStyle = window.getComputedStyle(el);
                    const rect = el.getBoundingClientRect();
                    const id = el.id ? `#${el.id}` : '';
                    const classes = Array.from(el.classList).map(c => `.${c}`).join('');
                    const selector = `${el.tagName.toLowerCase()}${id}${classes}`;
                    
                    styles[selector] = {
                        color: computedStyle.color,
                        backgroundColor: computedStyle.backgroundColor,
                        fontSize: computedStyle.fontSize,
                        fontFamily: computedStyle.fontFamily,
                        padding: computedStyle.padding,
                        margin: computedStyle.margin,
                        position: computedStyle.position,
                        display: computedStyle.display,
                        width: rect.width,
                        height: rect.height,
                        border: computedStyle.border,
                        borderRadius: computedStyle.borderRadius,
                        boxShadow: computedStyle.boxShadow,
                        textAlign: computedStyle.textAlign,
                        lineHeight: computedStyle.lineHeight,
                        fontWeight: computedStyle.fontWeight,
                        textDecoration: computedStyle.textDecoration,
                        opacity: computedStyle.opacity,
                        transform: computedStyle.transform,
                        transition: computedStyle.transition,
                        zIndex: computedStyle.zIndex,
                        flex: computedStyle.flex,
                        grid: computedStyle.grid,
                        gap: computedStyle.gap,
                        alignItems: computedStyle.alignItems,
                        justifyContent: computedStyle.justifyContent
                    };
                });
                return styles;
            }""")
            
            # Get all images
            images = await page.evaluate("""() => {
                const images = [];
                document.querySelectorAll('img').forEach(img => {
                    images.push({
                        src: img.src,
                        alt: img.alt,
                        width: img.width,
                        height: img.height,
                        style: window.getComputedStyle(img).cssText
                    });
                });
                return images;
            }""")
            
            # Get all fonts
            fonts = await page.evaluate("""() => {
                const fonts = new Set();
                document.querySelectorAll('*').forEach(el => {
                    const font = window.getComputedStyle(el).fontFamily;
                    fonts.add(font);
                });
                return Array.from(fonts);
            }""")
            
            # Get meta information
            meta = await page.evaluate("""() => {
                const meta = {};
                document.querySelectorAll('meta').forEach(m => {
                    if (m.name) meta[m.name] = m.content;
                    if (m.property) meta[m.property] = m.content;
                });
                return meta;
            }""")
            
            # Take a screenshot
            screenshot = await page.screenshot(type="jpeg", quality=80)
            
            await browser.close()
            
            return {
                "html": content,
                "styles": styles,
                "images": images,
                "fonts": fonts,
                "meta": meta,
                "screenshot": screenshot
            }
    
    def _create_clone_prompt(self, scraped_data: Dict[str, Any]) -> str:
        soup = BeautifulSoup(scraped_data["html"], 'html.parser')
        
        # Extract key design elements
        styles = scraped_data["styles"]
        images = scraped_data["images"]
        fonts = scraped_data["fonts"]
        meta = scraped_data["meta"]
        
        # Clean up the HTML
        for script in soup.find_all('script'):
            script.decompose()
        for style in soup.find_all('style'):
            style.decompose()
        
        prompt = f"""You are an expert web developer tasked with cloning a website. Here is the design context:

HTML Structure:
{soup.prettify()}

Computed Styles:
{json.dumps(styles, indent=2)}

Images:
{json.dumps(images, indent=2)}

Fonts:
{json.dumps(fonts, indent=2)}

Meta Information:
{json.dumps(meta, indent=2)}

Please create a clean, semantic HTML clone of this website that matches its visual appearance as closely as possible. 
Focus on:
1. Maintaining the same visual hierarchy
2. Using similar colors, fonts, and spacing
3. Preserving the layout structure
4. Including necessary CSS styles inline or in a style tag
5. Making the clone responsive
6. Preserving all images and their styling
7. Maintaining accessibility features
8. Keeping the same meta information

Return only the HTML code with embedded CSS, no explanations or markdown formatting."""

        return prompt

    async def clone_website(self, url: str) -> Dict[str, str]:
        try:
            # Scrape the website
            scraped_data = await self._scrape_website(url)
            
            # Create the prompt
            prompt = self._create_clone_prompt(scraped_data)
            
            # Generate the clone using Gemini
            response = self.model.generate_content(
                contents=[{
                    "parts": [{"text": prompt}]
                }]
            )
            
            # Extract HTML from the response
            html = response.text
            # Remove markdown code block if present
            html = re.sub(r'^```html\n|^```\n|```$', '', html, flags=re.MULTILINE)
            
            return {
                "html": html,
                "original_html": scraped_data["html"]
            }
        except Exception as e:
            raise Exception(f"Failed to clone website: {str(e)}") 