"""Validate generated Hugo pages, including case-sensitive asset paths on Windows.

Run `hugo --minify` followed by `python scripts/check_site.py`.
Uses only the Python standard library; also runs before GitHub Pages deployment.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse
import sys
import re
import xml.etree.ElementTree as ET

PUBLIC = Path(__file__).resolve().parents[1] / 'public'
CONTENT = PUBLIC.parent / 'content'
ORIGIN = 'https://biobridgechem.co.uk'

class Page(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.links, self.ids, self.errors = [], set(), []
        self.h1 = 0
        self.description = self.canonical = self.title = False
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'h1':
            self.h1 += 1
        if tag == 'title':
            self.title = True
        if tag == 'meta' and attrs.get('name') == 'description':
            self.description = bool(attrs.get('content'))
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href', '').startswith(ORIGIN + '/')
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                self.errors.append('Duplicate id: ' + attrs['id'])
            self.ids.add(attrs['id'])
        if tag == 'img' and 'alt' not in attrs:
            self.errors.append('Image is missing alt text')
        for key in ('href', 'src'):
            if attrs.get(key):
                self.links.append(attrs[key])

def main():
    files = {f.relative_to(PUBLIC).as_posix(): f for f in PUBLIC.rglob('*') if f.is_file()}
    pages = {name: Page(path.read_text(encoding='utf-8')) for name, path in files.items() if name.endswith('.html')}
    errors = []
    if not pages:
        errors.append('No HTML files found; build with Hugo first.')
    for name, page in pages.items():
        errors.extend(f'{name}: {e}' for e in page.errors)
        if page.h1 != 1:
            errors.append(f'{name}: Expected one h1, found {page.h1}')
        if not all((page.description, page.canonical, page.title)):
            errors.append(f'{name}: Missing title, description or canonical HTTPS URL')
        page_url = ORIGIN + '/' + name.removesuffix('index.html')
        for link in page.links:
            url = urlparse(urljoin(page_url, link))
            if url.netloc != urlparse(ORIGIN).netloc or url.scheme not in ('http', 'https'):
                continue
            target = unquote(url.path).lstrip('/')
            if not target or target.endswith('/'):
                target += 'index.html'
            if target not in files:
                errors.append(f'{name}: Broken local link or incorrect filename case: {link}')
            elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
                errors.append(f'{name}: Missing anchor: {link}')
    for required in ('index.html', 'about/index.html', 'event/index.html', 'partnership/index.html', 'contact/index.html', '404.html'):
        if required not in pages:
            errors.append('Missing required page: ' + required)
    about = files.get('about/index.html')
    archive = files.get('event/index.html')
    expected_profiles = len(re.findall(r'^  - name:', (CONTENT / 'about/_index.md').read_text(encoding='utf-8'), re.M))
    expected_events = sum(bool(re.search(r'^date:', p.read_text(encoding='utf-8-sig'), re.M)) and not re.search(r'^draft: true', p.read_text(encoding='utf-8-sig'), re.M) for p in (CONTENT / 'event').rglob('*.md'))
    if about and about.read_text(encoding='utf-8').count('class=team-card') + about.read_text(encoding='utf-8').count('class="team-card"') != expected_profiles:
        errors.append(f'Expected {expected_profiles} team and alumni profiles on About page')
    if archive:
        source = archive.read_text(encoding='utf-8')
        count = source.count('data-event-card')
        if count != expected_events:
            errors.append(f'Expected {expected_events} events, found {count}')
    feed = ET.parse(PUBLIC / 'event/index.xml')
    if len(feed.findall('./channel/item')) != expected_events:
        errors.append('Seminar RSS feed is missing events')
    if errors:
        print('\n'.join(errors))
        return 1
    print(f'PASS: {len(pages)} HTML pages; local links, assets, anchors, metadata, {expected_profiles} team profiles and {expected_events} events verified.')
    return 0

if __name__ == '__main__':
    sys.exit(main())
