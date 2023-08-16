function resolveURL(src: string) {
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src; // Absolute URL
  }
  return new URL(src, window.location.href).toString();
}

class JsonRequest extends HTMLElement {
  connectedCallback () {
    const src = this.getAttribute('src')
    const forAttribute = this.getAttribute('for')
    const attribute = this.getAttribute('attribute')

    if (src && forAttribute && attribute) {
      const url = new URL(resolveURL(src))
      fetch(url)
        .then((response) => response.json())
        .then((json) => {
          const match = document.querySelector(`[name="${forAttribute}"]`)
          if (match) {
            match.setAttribute(attribute, JSON.stringify(json))
          }
        })
        .catch((error) => {
          console.error('There was a problem fetching the json');
        });
    }
  }
}

customElements.define('json-request', JsonRequest);