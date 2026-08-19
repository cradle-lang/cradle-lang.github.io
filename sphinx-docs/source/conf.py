# Configuration file for the Sphinx documentation builder.

# -- Project information

project = 'CRADLE'
copyright = '2026, Curiosity. All rights reserved'
author = 'Curiosity'
html_title = 'CRADLE Documentation'
html_show_sphinx = False

release = 'Development'
version = 'Development'

# -- General configuration

from pygments.lexers.special import TextLexer
from sphinx.highlighting import lexers

extensions = [
    'sphinx.ext.duration',
    'sphinx.ext.doctest',
    'sphinx.ext.autodoc',
    'sphinx.ext.autosummary',
    'myst_parser',
    'sphinx_markdown_tables',
    'sphinx_design',
    'sphinx_copybutton',
]

# CRADLE examples use a dedicated fence name even though syntax highlighting
# is intentionally neutral until a project lexer is available.
lexers['CRADLE'] = TextLexer()
lexers['cradle'] = TextLexer()

templates_path = ['_templates']

html_static_path = ['_static']

html_favicon = '_static/cradle-favicon.svg'
html_baseurl = 'https://cradle-website.readthedocs.io/en/latest/'

html_context = {
    'site_description': (
        'Documentation for CRADLE, a declarative and debuggable Cyber '
        'Experimentation As Code language for high-level, static descriptions '
        'of computing infrastructure.'
    ),
    'site_name': 'CRADLE Documentation',
}

html_additional_pages = {
    '404': '404.html',
}

html_css_files = [
    'custom.css',
]

html_js_files = [
    'sidebar-toggle.js',
]

# -- Options for HTML output

html_theme = 'furo'
html_theme_options = {
    'top_of_page_buttons': [],
    'light_css_variables': {
        'color-brand-primary': '#155E75',
        'color-brand-content': '#0E7490',
        'color-sidebar-background': '#F7FAFC',
        'color-sidebar-background-border': '#E2E8F0',
        'color-sidebar-link-text': '#334155',
        'color-sidebar-link-text--top-level': '#164E63',
        'color-sidebar-caption-text': '#475569',
        'color-api-name': '#A21CAF',
        'font-stack': 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'font-stack--monospace': '"SFMono-Regular", Consolas, "Liberation Mono", monospace',
    },
    'dark_css_variables': {
        'color-brand-primary': '#67E8F9',
        'color-brand-content': '#22D3EE',
        'color-sidebar-background': '#0B1220',
        'color-sidebar-background-border': '#1E293B',
        'color-sidebar-link-text': '#CBD5E1',
        'color-sidebar-link-text--top-level': '#A5F3FC',
        'color-sidebar-caption-text': '#94A3B8',
        'color-api-name': '#F0ABFC',
    },
}
# -- Options for EPUB output
epub_show_urls = 'footnote'

# -- Options for pdf output
latex_engine = 'xelatex'
latex_use_xindy = False
latex_elements = {
    'preamble': '\\usepackage[UTF8]{ctex}\n',
}
