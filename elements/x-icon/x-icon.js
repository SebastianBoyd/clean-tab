'use strict';

class XIconElement extends HTMLElement {
  static register() {
    this.$tmpl = document.currentScript.ownerDocument.querySelector('template');
    document.registerElement('x-icon', this);
  }

  createdCallback() {
    let tmplRoot = document.importNode(XIconElement.$tmpl.content, true);
    this.createShadowRoot().appendChild(tmplRoot);

    this.$icons = this.shadowRoot.querySelector('#icons').content;

    this._updateIcon();
  }

  attributeChangedCallback(attrName) {
    switch (attrName) {
      case 'icon':
        this._updateIcon();
        break;
    }
  }

  get icon() {
    return this.getAttribute('icon') || '';
  }

  set icon(icon) {
    this.setAttribute('icon', icon);
    this._updateIcon();
  }

  get large() {
    return this.hasAttribute('large');
  }

  set large(large) {
    if (large) {
      this.setAttribute('large', '');
    } else {
      this.removeAttribute('large');
    }
  }

  get button() {
    return this.hasAttribute('large');
  }

  set button(button) {
    if (button) {
      this.setAttribute('button', '');
    } else {
      this.removeAttribute('button');
    }
  }

  _updateIcon() {
    let $currentSVG = this.shadowRoot.querySelector('svg');

    if (!$currentSVG || $currentSVG.id !== this.icon) {
      if ($currentSVG) {
        this.shadowRoot.removeChild($currentSVG);
      }

      if (this.icon) {
        let $newSVG = this.$icons.querySelector(`svg#${this.icon}`);
        if ($newSVG) {
          this.shadowRoot.appendChild(document.importNode($newSVG, true));
        }
      }
    }
  }
}

XIconElement.register();
