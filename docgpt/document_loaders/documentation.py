"""Loader that loads GitBook."""
from typing import Any, List, Optional
from urllib.parse import urlparse
from langchain.docstore.document import Document
from langchain.document_loaders.web_base import WebBaseLoader


class DocumentationLoader(WebBaseLoader):
    """Load Docusaurus data.

    1. load from either a single page, or
    2. load all (relative) paths in the navbar.
    """

    def __init__(self, web_page: str, load_all_paths: bool = False, skip_paths: str = None):
        """Initialize with web page and whether to load all paths."""
        super().__init__(web_page)
        self.load_all_paths = load_all_paths
        self.skip_paths = skip_paths

    def load(self) -> List[Document]:
        """Fetch text from one single Docusaurus page."""
        if self.load_all_paths:
            soup_info = self.scrape()
            relative_paths = self._get_paths(soup_info)
            documents = []
            # If hosted in site like github pages, there will be sub folders and we just need url and scheme to make this work
            u = urlparse(self.web_path)
            self.web_path = u.scheme + "://" + u.netloc
            for path in relative_paths:
                if not self._is_skipped(path):
                    url = self.web_path + path
                    print(f"Fetching text from {url}")
                    soup_info = self._scrape(url)
                    documents.append(self._get_document(soup_info, url))
            return documents
        else:
            soup_info = self.scrape()
            return [self._get_document(soup_info, self.web_path)]

    def _is_skipped(self, path: str):
        if not self.skip_paths or self.skip_paths == "":
            return False
        skipped = False
        for skip_path in self.skip_paths.split(','):
            if skip_path.endswith('*') and path.startswith(skip_path[:-1]) or path == skip_path:
                skipped = True
                break
        
        return skipped

    def _get_document(self, soup: Any, custom_url: Optional[str] = None) -> Document:
        """Fetch content from page and return Document."""
        page_content_raw = soup.find("body")
        content = page_content_raw.get_text(separator="\n").strip()
        title_if_exists = page_content_raw.find("h1")
        title = title_if_exists.text if title_if_exists else ""
        metadata = {
            "source": custom_url if custom_url else self.web_path,
            "title": title,
        }
        return Document(page_content=content, metadata=metadata)

    def _get_paths(self, soup: Any) -> List[str]:
        """Fetch all relative paths in the navbar."""
        links = soup.findAll("a")
        if not links or len(links) == 0:
            return []

        final_links = []
        link_map = {}
        for link in links:
            if link.get("href")[0] == "/" and not link_map.get(link.get("href")):
                link_map[link.get("href")] = True
                final_links.append(link.get("href"))
        # only return relative links
        return final_links
