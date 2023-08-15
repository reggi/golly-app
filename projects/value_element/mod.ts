export abstract class ValueElement extends HTMLElement {
  abstract render (): void
  static formAssociated = true;
  static get observedAttributes () {
    return ['value', 'schema']
  }
  #value = ''
  get value () {
    return this.#value
  }
  set value (newValue) {
    this.#value = newValue
    this.internals.setFormValue(newValue)
  }
  internals: ElementInternals
  constructor () {
    super()
    this.internals = this.attachInternals();
  }
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    ValueElement.observedAttributes.map(v => {
      if (name === v && oldValue !== newValue) this.render()
    })
  }
  connectedCallback() {
    this.render()
  }
}