const optionTemplate = document.createElement('template');
optionTemplate.innerHTML = /* html */ `
<style>
  :host {
    display: inline-block;
    background: gray;
    padding: 0.5em;
    cursor: pointer;
    user-select: none;
  }
</style>
<slot></slot>
`;

export class BasicOption extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.appendChild(optionTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'option');
    }
    if (!this.hasAttribute('slot')) {
      this.setAttribute('slot', 'menu-items');
    }
    if (!this.hasAttribute('tabindex')) {
      this.setAttribute('tabindex', '-1');
    }
  }
}

customElements.define('basic-option', BasicOption);

const dropdownTemplate = document.createElement('template');
dropdownTemplate.innerHTML = /* html */ `
<style>
  :host {
    display: block;
  }
</style>
<div class=menu-container>
<div class=option-container>
<slot name=menu-items></slot>
</div>
</div>
`;



export class BasicDropdown extends HTMLElement {
  /**
   * @return attributeList: Array
   */
  static get observedAttributes() {
    return ['expanded'];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.appendChild(dropdownTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    const initialOption = this.selectedOption;
    this.addEventListener('click', event => {
      this._onClick(event);
    });
    this.addEventListener('keydown', event => {
      this._onKeyDown(event);
    })
  }

  get selectedOption(): HTMLElement {
    return this.querySelector('[aria-selected=true]') as HTMLElement;
  }

  get firstOption(): HTMLElement {
    return this.querySelector('[role=option]:first-of-type') as HTMLElement;
  }

  get lastOption(): HTMLElement {
    return this.querySelector('[role=option]:last-of-type') as HTMLElement;
  }

  _previousOption(node: HTMLElement) {
    let previous = node.previousElementSibling as HTMLElement;
    while (previous) {
      if (previous.getAttribute('role') === 'option') {
        return previous;
      }
      previous = previous.previousElementSibling as HTMLElement;
    }
    return null;
  }

  _nextOption(node: HTMLElement): HTMLElement | null {
    let next = node.nextElementSibling as HTMLElement;
    while (next) {
      if (next.getAttribute('role') === 'option') {
        return next;
      }
      next = next.nextElementSibling as HTMLElement;
    }
    return null;
  }

  selectPreviousOption() {
    const selectedOption = this.querySelector(
      '[aria-selected=true]'
    ) as HTMLElement;
    if (selectedOption === this.firstOption) {
      this._selectOption(this.lastOption);
    } else {
      const previousOption = this._previousOption(
        selectedOption
      ) as HTMLElement;
      this._selectOption(previousOption);
    }
  }

  selectNextOption() {
    const selectedOption = this.querySelector(
      '[aria-selected=true]'
    ) as HTMLElement;
    if (selectedOption === this.lastOption) {
      this._selectOption(this.firstOption);
    } else {
      const nextOption = this._nextOption(selectedOption) as HTMLElement;
      this._selectOption(nextOption);
    }
  }

  _selectOption(node: HTMLElement) {
    this._ensureDeselectAll();
    node.setAttribute('aria-selected', 'true');
    node.setAttribute('tabindex', '0');
    node.focus();
    console.log(document.activeElement?.textContent);
  }

  _ensureDeselectAll() {
    const options = this.querySelectorAll('[role=option]');
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      option.removeAttribute('aria-selected');
      option.setAttribute('tabindex', '-1');
    }
  }

  _onClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;
    if (targetElement.getAttribute('role') === 'option') {
      this._selectOption(targetElement);
    }
  }

  _onKeyDown(event: KeyboardEvent) {
    const targetElement = event.target as HTMLElement;
    switch (event.key) {
      case 'ArrowUp':
      case 'Up':
      case 'ArrowLeft':
      case 'Left':
        event.preventDefault();
        this.selectPreviousOption();
        break;
      case 'ArrowDown':
      case 'Down':
      case 'ArrowRight':
      case 'Right':
        event.preventDefault();
        this.selectNextOption();
        break;
    }
  }
}

customElements.define('basic-dropdown', BasicDropdown);
