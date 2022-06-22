const template = document.createElement('template');
template.innerHTML = /* html*/`
<style>
    :host {
        display: flex;
        font-family: var(--details-font, sans-serif);
        flex-direction: column;
    }
</style>
<slot name="text"></slot>
<a href="javascript:void(0)" part="detail-toggle">more details...</a>
<slot name="details"></slot>
`;

/** web component that offers optional details to the user */
export class MoreDetails extends HTMLElement {
  /** create component and declare members for slots */
  private _detailToggle!: HTMLAnchorElement;
  private _textSlot!: HTMLSlotElement;
  private _detailsSlot!: HTMLSlotElement;
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.shadowRoot!.appendChild(template.content.cloneNode(true));

    this._detailToggle = this.shadowRoot!.querySelector('a')!;
    this._textSlot = this.shadowRoot!.querySelector('slot[name=text]')!;
    this._detailsSlot = this.shadowRoot!.querySelector('slot[name=details]')!;
  }

  /** hide or show elements based on the updated attribute */
  attributeChangedCallback() {
    this._updateHiddenState();
    // since there are only two possible states, this logic isn't needed
    // const value = this.hasAttribute('toggled');
    // (() => value ? this._show() : this._hide())();
  }

  /** add event listeners when element is attached to DOM */
  connectedCallback() {
    this._detailToggle.addEventListener('click', () => this._onClick());
    this._detailsSlot.addEventListener('slotchange', () => this._slotChange());
  }

  /** clean up and remove listeners */
  disconnectedCallback() {
    this._detailToggle.removeEventListener(
        'click', () => this._onClick(),
    );
    this._detailsSlot.removeEventListener(
        'slotchange', () => this._slotChange(),
    );
  }

  /**
   * return an array of all elements in details slot
   * @return {Array<HTMLElement>} detailElements
   */
  _allDetails() {
    return Array.from(this.querySelectorAll('*[slot=details]')) as Array<HTMLElement>;
  }

  /** automatically hide or show elements when slotted */
  _slotChange() {
    this._updateHiddenState();
  }

  /** swap toggled state */
  _onClick() {
    this.toggled = !(this.toggled);
  }

  /**
   * reflect property state in attribute and vice-versa
   * @param {Boolean} value
   */
  set toggled(value) {
    value = Boolean(value);
    if (value) {
      this.setAttribute('toggled', '');
    } else {
      this.removeAttribute('toggled');
    }
  }

  /**
   * List of attributes that will fire attributeChangedCallback
   * @return {Array} attributeList
   */
  static get observedAttributes() {
    return ['toggled'];
  }

  /**
   * Return toggled state
   * @return {Boolean} toggled
   */
  get toggled() {
    return this.hasAttribute('toggled');
  }

  /** set all detail slot elements to be visible and update text */
  _show() {
    const detailElements = this._allDetails();
    detailElements.forEach((el) => el.hidden = false);
    this._detailToggle.textContent = 'fewer details...';
  }

  /** set all detail slot elements to be hidden and update text */
  _hide() {
    const detailElements = this._allDetails();
    detailElements.forEach((el) => el.hidden = true);
    this._detailToggle.textContent = 'more details...';
  }

  /** update the hidden state of all detail slot elements */
  _updateHiddenState() {
    const detailElements = this._allDetails();
    detailElements.forEach((el) => el.hidden = this.toggled ? false : true);
    this._detailToggle.textContent = (
      this.toggled ? 'fewer details...' : 'more details...'
    );
  }
}

customElements.define('more-details', MoreDetails);
